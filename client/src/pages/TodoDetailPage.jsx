import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, CheckCircle, Circle, Calendar, Clock, Flag } from 'lucide-react';
import { todosAPI } from '../services/api';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import ConfirmDialog from '../components/ConfirmDialog';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : null;

const TodoDetailPage = ({ toast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await todosAPI.getOne(id);
        setTodo(res.data);
      } catch (err) {
        toast.error('Todo not found');
        navigate('/todos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await todosAPI.toggleComplete(id, !todo.completed);
      setTodo(res.data);
      toast.success(res.data.completed ? 'Marked as complete!' : 'Marked as pending');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    try {
      await todosAPI.delete(id);
      toast.success('Todo deleted');
      navigate('/todos');
    } catch {
      toast.error('Failed to delete todo');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner-large" /></div>;
  if (!todo) return null;

  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/todos" className="back-link"><ArrowLeft size={16} /> Back to Todos</Link>
          <h1 className="page-title">Todo Detail</h1>
        </div>
        <div className="btn-group">
          <Link to={`/todos/${id}/edit`} className="btn btn-secondary">
            <Edit2 size={16} /> Edit
          </Link>
          <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="detail-card">
        <div className={`detail-priority-bar detail-priority-bar--${todo.priority}`} />

        <div className="detail-content">
          {/* Title & complete toggle */}
          <div className="detail-title-row">
            <button className="todo-complete-btn" onClick={handleToggle} disabled={toggling}>
              {todo.completed
                ? <CheckCircle size={28} className="icon-green" />
                : <Circle size={28} className="icon-muted" />
              }
            </button>
            <h2 className={`detail-title ${todo.completed ? 'detail-title--done' : ''}`}>{todo.title}</h2>
          </div>

          {/* Badges */}
          <div className="detail-badges">
            <PriorityBadge priority={todo.priority} />
            <StatusBadge completed={todo.completed} />
            {isOverdue && <span className="badge badge-overdue">Overdue</span>}
          </div>

          {/* Description */}
          {todo.description && (
            <div className="detail-description">
              <p>{todo.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="detail-meta">
            {todo.dueDate && (
              <div className="detail-meta-item">
                <Calendar size={16} className="detail-meta-icon" />
                <span>
                  <strong>Due Date:</strong>{' '}
                  <span className={isOverdue ? 'text-danger' : ''}>{formatDate(todo.dueDate)}</span>
                </span>
              </div>
            )}
            <div className="detail-meta-item">
              <Clock size={16} className="detail-meta-icon" />
              <span><strong>Created:</strong> {formatDate(todo.createdAt)}</span>
            </div>
            <div className="detail-meta-item">
              <Clock size={16} className="detail-meta-icon" />
              <span><strong>Last Updated:</strong> {formatDate(todo.updatedAt)}</span>
            </div>
            <div className="detail-meta-item">
              <Flag size={16} className="detail-meta-icon" />
              <span><strong>Priority:</strong> {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}</span>
            </div>
          </div>

          {/* Action button */}
          <button
            className={`btn btn-full ${todo.completed ? 'btn-secondary' : 'btn-success'}`}
            onClick={handleToggle}
            disabled={toggling}
          >
            {toggling
              ? <span className="spinner" />
              : todo.completed
                ? 'Mark as Pending'
                : '✓ Mark as Complete'
            }
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Todo"
        message={`Are you sure you want to permanently delete "${todo.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};

export default TodoDetailPage;
