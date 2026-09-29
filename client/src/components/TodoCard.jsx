import { useNavigate } from 'react-router-dom';
import { Calendar, Edit2, Trash2, Eye, CheckCircle, Circle } from 'lucide-react';
import { PriorityBadge, StatusBadge } from './Badges';

const formatDate = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const isOverdue = (dueDate, completed) => {
  if (!dueDate || completed) return false;
  return new Date(dueDate) < new Date();
};

const TodoCard = ({ todo, onDelete, onToggleComplete }) => {
  const navigate = useNavigate();

  return (
    <div className={`todo-card ${todo.completed ? 'todo-card--completed' : ''} ${isOverdue(todo.dueDate, todo.completed) ? 'todo-card--overdue' : ''}`}>
      {/* Priority stripe */}
      <div className={`todo-card-stripe todo-card-stripe--${todo.priority}`} />

      <div className="todo-card-body">
        <div className="todo-card-header">
          <button
            className="todo-complete-btn"
            onClick={() => onToggleComplete(todo._id, !todo.completed)}
            title={todo.completed ? 'Mark as pending' : 'Mark as complete'}
          >
            {todo.completed
              ? <CheckCircle size={22} className="icon-green" />
              : <Circle size={22} className="icon-muted" />
            }
          </button>

          <div className="todo-card-title-group">
            <h3 className={`todo-card-title ${todo.completed ? 'todo-card-title--done' : ''}`}>
              {todo.title}
            </h3>
            <div className="todo-card-badges">
              <PriorityBadge priority={todo.priority} />
              <StatusBadge completed={todo.completed} />
            </div>
          </div>
        </div>

        {todo.description && (
          <p className="todo-card-desc">{todo.description}</p>
        )}

        <div className="todo-card-meta">
          {todo.dueDate && (
            <span className={`todo-card-due ${isOverdue(todo.dueDate, todo.completed) ? 'todo-card-due--overdue' : ''}`}>
              <Calendar size={13} />
              {isOverdue(todo.dueDate, todo.completed) ? 'Overdue: ' : 'Due: '}
              {formatDate(todo.dueDate)}
            </span>
          )}
          <span className="todo-card-created">
            Created {formatDate(todo.createdAt)}
          </span>
        </div>
      </div>

      <div className="todo-card-actions">
        <button className="btn-icon btn-icon--view" onClick={() => navigate(`/todos/${todo._id}`)} title="View">
          <Eye size={16} />
        </button>
        <button className="btn-icon btn-icon--edit" onClick={() => navigate(`/todos/${todo._id}/edit`)} title="Edit">
          <Edit2 size={16} />
        </button>
        <button className="btn-icon btn-icon--delete" onClick={() => onDelete(todo)} title="Delete">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TodoCard;
