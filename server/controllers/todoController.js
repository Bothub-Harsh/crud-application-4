const Todo = require('../models/Todo');
const RedisService = require('../services/redisService');

/**
 * @desc    Create a new Todo
 * @route   POST /api/todos
 * @access  Private
 */
const createTodo = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Todo title is required',
      });
    }

    if (title.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Todo title cannot exceed 150 characters',
      });
    }

    const validPriorities = ['low', 'medium', 'high'];
    const chosenPriority = priority ? priority.toLowerCase() : 'medium';
    if (!validPriorities.includes(chosenPriority)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be either low, medium, or high',
      });
    }

    let parsedDueDate = null;
    if (dueDate) {
      const d = new Date(dueDate);
      if (isNaN(d.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid due date format',
        });
      }
      parsedDueDate = d;
    }

    // 1. Save to MongoDB
    const todo = await Todo.create({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: chosenPriority,
      dueDate: parsedDueDate,
      completed: false,
    });

    console.log('Todo created');

    // 2. Invalidate user's Todo-list cache and dashboard stats
    await RedisService.invalidateUserTodosCache(req.userId);

    // 3. Return created Todo
    return res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all Todos for authenticated user (with pagination, search, filter, sort, and Redis caching)
 * @route   GET /api/todos
 * @access  Private
 */
const getTodos = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = req.query.search ? req.query.search.trim() : '';
    const status = req.query.status || 'all'; // 'all', 'completed', 'pending'
    const priority = req.query.priority || 'all'; // 'all', 'low', 'medium', 'high'
    const sortBy = ['createdAt', 'dueDate', 'priority', 'title'].includes(req.query.sortBy)
      ? req.query.sortBy
      : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Cache key incorporates all query parameters to prevent cache collisions
    const cacheKey = `todos:user:${req.userId}:p${page}:l${limit}:s${search}:st${status}:pr${priority}:sb${sortBy}:so${sortOrder}`;

    // 1. Check Redis Cache
    const cachedResponse = await RedisService.get(cacheKey);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }

    // 2. Cache MISS -> Query MongoDB
    const filter = { userId: req.user._id };

    // Search filter (title or description)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status === 'completed') {
      filter.completed = true;
    } else if (status === 'pending') {
      filter.completed = false;
    }

    // Priority filter
    if (['low', 'medium', 'high'].includes(priority)) {
      filter.priority = priority;
    }

    // Sorting definition
    const sortObj = {};
    if (sortBy === 'priority') {
      // In MongoDB, enum sorting can be handled or direct
      sortObj.priority = sortOrder;
      sortObj.createdAt = -1;
    } else {
      sortObj[sortBy] = sortOrder;
    }

    const skip = (page - 1) * limit;

    const [total, todos] = await Promise.all([
      Todo.countDocuments(filter),
      Todo.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const responsePayload = {
      success: true,
      data: todos,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    // 3. Store result in Redis
    await RedisService.set(cacheKey, responsePayload);

    // 4. Return MongoDB result
    return res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single Todo by ID
 * @route   GET /api/todos/:id
 * @access  Private
 */
const getTodoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `todo:${id}`;

    // 1. Check Redis Cache
    const cachedTodo = await RedisService.get(cacheKey);
    if (cachedTodo) {
      // Ensure cached Todo belongs to authenticated user
      if (cachedTodo.userId.toString() === req.userId) {
        return res.status(200).json({
          success: true,
          data: cachedTodo,
        });
      }
    }

    // 2. Cache MISS -> Query MongoDB
    const todo = await Todo.findOne({ _id: id, userId: req.user._id }).lean();
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
      });
    }

    // 3. Store in Redis
    await RedisService.set(cacheKey, todo);

    return res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Todo by ID
 * @route   PUT /api/todos/:id
 * @access  Private
 */
const updateTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate, completed } = req.body;

    // Find Todo and verify ownership in MongoDB
    const todo = await Todo.findOne({ _id: id, userId: req.user._id });
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found or you do not have permission to modify it',
      });
    }

    if (title !== undefined) {
      if (title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Todo title cannot be empty',
        });
      }
      if (title.trim().length > 150) {
        return res.status(400).json({
          success: false,
          message: 'Todo title cannot exceed 150 characters',
        });
      }
      todo.title = title.trim();
    }

    if (description !== undefined) {
      todo.description = description.trim();
    }

    if (priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high'];
      const p = priority.toLowerCase();
      if (!validPriorities.includes(p)) {
        return res.status(400).json({
          success: false,
          message: 'Priority must be either low, medium, or high',
        });
      }
      todo.priority = p;
    }

    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === '') {
        todo.dueDate = null;
      } else {
        const d = new Date(dueDate);
        if (isNaN(d.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid due date format',
          });
        }
        todo.dueDate = d;
      }
    }

    if (completed !== undefined) {
      todo.completed = Boolean(completed);
    }

    // 1. Update in MongoDB
    const updatedTodo = await todo.save();
    console.log('Todo updated');

    // 2. Invalidate Redis: Todo cache and user Todo lists
    await RedisService.invalidateTodoAndUserCache(id, req.userId);

    // 3. Return updated Todo
    return res.status(200).json({
      success: true,
      message: 'Todo updated successfully',
      data: updatedTodo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle or set Todo completed status
 * @route   PATCH /api/todos/:id/complete
 * @access  Private
 */
const toggleComplete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOne({ _id: id, userId: req.user._id });
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
      });
    }

    // If explicit completed boolean passed in body, use it; otherwise toggle
    if (req.body && req.body.completed !== undefined) {
      todo.completed = Boolean(req.body.completed);
    } else {
      todo.completed = !todo.completed;
    }

    const updatedTodo = await todo.save();
    console.log('Todo updated');

    // Invalidate Redis caches
    await RedisService.invalidateTodoAndUserCache(id, req.userId);

    return res.status(200).json({
      success: true,
      message: `Todo marked as ${updatedTodo.completed ? 'completed' : 'pending'}`,
      data: updatedTodo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete Todo by ID
 * @route   DELETE /api/todos/:id
 * @access  Private
 */
const deleteTodo = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Delete from MongoDB with user ownership check
    const todo = await Todo.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
      });
    }

    console.log('Todo deleted');

    // 2. Invalidate Redis cache for this Todo and user's lists
    await RedisService.invalidateTodoAndUserCache(id, req.userId);

    // 3. Return success response
    return res.status(200).json({
      success: true,
      message: 'Todo deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard metrics calculated from MongoDB
 * @route   GET /api/todos/stats/dashboard
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const cacheKey = `todos:stats:user:${req.userId}`;

    // 1. Check Redis
    const cachedStats = await RedisService.get(cacheKey);
    if (cachedStats) {
      return res.status(200).json({
        success: true,
        data: cachedStats,
      });
    }

    // 2. Query MongoDB for real-time dynamic stats
    const now = new Date();
    const userId = req.user._id;

    const [total, completed, pending, highPriority, overdue] = await Promise.all([
      Todo.countDocuments({ userId }),
      Todo.countDocuments({ userId, completed: true }),
      Todo.countDocuments({ userId, completed: false }),
      Todo.countDocuments({ userId, priority: 'high', completed: false }),
      Todo.countDocuments({
        userId,
        completed: false,
        dueDate: { $ne: null, $lt: now },
      }),
    ]);

    const stats = {
      total,
      completed,
      pending,
      highPriority,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };

    // 3. Store in Redis
    await RedisService.set(cacheKey, stats, 120); // 2 minutes TTL for dashboard stats

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  toggleComplete,
  deleteTodo,
  getDashboardStats,
};
