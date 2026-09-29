import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare, Clock, AlertCircle, Flame, PlusCircle, TrendingUp,
} from 'lucide-react';
import { todosAPI } from '../services/api';
import { useAuth } from '../hooks/useAuthContext';

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to || '/todos'} className={`stat-card stat-card--${color}`}>
    <div className="stat-card-icon">
      <Icon size={24} />
    </div>
    <div className="stat-card-info">
      <span className="stat-card-value">{value}</span>
      <span className="stat-card-label">{label}</span>
    </div>
  </Link>
);

const DashboardPage = ({ toast }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTodos, setRecentTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, todosRes] = await Promise.all([
          todosAPI.getDashboardStats(),
          todosAPI.getAll({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        ]);
        setStats(statsRes.data);
        setRecentTodos(todosRes.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner-large" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, <strong>{user?.name}</strong> 👋</p>
        </div>
        <Link to="/todos/add" className="btn btn-primary">
          <PlusCircle size={16} />
          New Todo
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard icon={CheckSquare} label="Total Todos" value={stats?.total ?? 0} color="blue" to="/todos" />
        <StatCard icon={TrendingUp} label="Completed" value={stats?.completed ?? 0} color="green" to="/todos?status=completed" />
        <StatCard icon={Clock} label="Pending" value={stats?.pending ?? 0} color="amber" to="/todos?status=pending" />
        <StatCard icon={Flame} label="High Priority" value={stats?.highPriority ?? 0} color="red" to="/todos?priority=high" />
        <StatCard icon={AlertCircle} label="Overdue" value={stats?.overdue ?? 0} color="purple" to="/todos?status=pending" />
      </div>

      {/* Completion Rate */}
      {stats && (
        <div className="completion-rate-card">
          <div className="completion-rate-header">
            <span className="completion-rate-label">Overall Completion Rate</span>
            <span className="completion-rate-value">{stats.completionRate}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${stats.completionRate}%` }} />
          </div>
        </div>
      )}

      {/* Recent Todos */}
      <div className="recent-section">
        <div className="recent-header">
          <h2 className="section-title">Recent Todos</h2>
          <Link to="/todos" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        {recentTodos.length === 0 ? (
          <div className="empty-state">
            <CheckSquare size={48} className="empty-state-icon" />
            <p>No todos yet. <Link to="/todos/add">Create your first one!</Link></p>
          </div>
        ) : (
          <div className="recent-list">
            {recentTodos.map((todo) => (
              <Link key={todo._id} to={`/todos/${todo._id}`} className="recent-item">
                <div className={`recent-dot recent-dot--${todo.priority}`} />
                <span className={`recent-title ${todo.completed ? 'recent-title--done' : ''}`}>{todo.title}</span>
                <span className={`badge badge-${todo.completed ? 'completed' : 'pending'} badge-sm`}>
                  {todo.completed ? 'Done' : 'Pending'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
