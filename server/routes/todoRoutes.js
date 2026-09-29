const express = require('express');
const router = express.Router();
const {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  toggleComplete,
  deleteTodo,
  getDashboardStats,
} = require('../controllers/todoController');
const { protect } = require('../middleware/authMiddleware');

// All Todo routes require authentication
router.use(protect);

// Dashboard statistics
router.get('/stats/dashboard', getDashboardStats);

// Todo CRUD operations
router.route('/')
  .get(getTodos)
  .post(createTodo);

router.route('/:id')
  .get(getTodoById)
  .put(updateTodo)
  .delete(deleteTodo);

// Toggle or update completion status
router.patch('/:id/complete', toggleComplete);

module.exports = router;
