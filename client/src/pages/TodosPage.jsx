import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, Search, SlidersHorizontal, X } from 'lucide-react';
import { todosAPI } from '../services/api';
import TodoCard from '../components/TodoCard';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'dueDate',   label: 'Due Date' },
  { value: 'priority',  label: 'Priority' },
  { value: 'title',     label: 'Title' },
];

const TodosPage = ({ toast }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [todos, setTodos] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Derive filters from URL search params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const priority = searchParams.get('priority') || 'all';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) next.delete(k);
      else next.set(k, v);
    });
    // Reset to page 1 on filter/search changes (not page itself)
    if (!('page' in updates)) next.set('page', '1');
    setSearchParams(next);
  };

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await todosAPI.getAll({ page, limit, search, status, priority, sortBy, sortOrder });
      setTodos(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error('Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, priority, sortBy, sortOrder]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const handleToggleComplete = async (id, completed) => {
    try {
      const res = await todosAPI.toggleComplete(id, completed);
      setTodos((prev) => prev.map((t) => (t._id === id ? res.data : t)));
      toast.success(completed ? 'Todo marked as complete!' : 'Todo marked as pending');
    } catch (err) {
      toast.error('Failed to update todo');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await todosAPI.delete(deleteTarget._id);
      toast.success('Todo deleted successfully');
      setDeleteTarget(null);
      fetchTodos();
    } catch (err) {
      toast.error('Failed to delete todo');
    }
  };

  const clearSearch = () => updateParams({ search: '' });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Todos</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${pagination.total} todo${pagination.total !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <Link to="/todos/add" className="btn btn-primary">
          <PlusCircle size={16} /> New Todo
        </Link>
      </div>

      {/* Search + Filter bar */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Search todos…"
            value={search}
            onChange={(e) => updateParams({ search: e.target.value })}
          />
          {search && (
            <button className="search-clear" onClick={clearSearch}><X size={14} /></button>
          )}
        </div>

        <button className={`btn btn-ghost ${showFilters ? 'btn-active' : ''}`} onClick={() => setShowFilters((v) => !v)}>
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select className="form-select" value={status} onChange={(e) => updateParams({ status: e.target.value })}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Priority</label>
            <select className="form-select" value={priority} onChange={(e) => updateParams({ priority: e.target.value })}>
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select className="form-select" value={sortBy} onChange={(e) => updateParams({ sortBy: e.target.value })}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Order</label>
            <select className="form-select" value={sortOrder} onChange={(e) => updateParams({ sortOrder: e.target.value })}>
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Per Page</label>
            <select className="form-select" value={limit} onChange={(e) => updateParams({ limit: e.target.value })}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={() => {
            setSearchParams({});
            setShowFilters(false);
          }}>Reset All</button>
        </div>
      )}

      {/* Todo list */}
      {loading ? (
        <div className="page-loader"><div className="spinner-large" /></div>
      ) : todos.length === 0 ? (
        <div className="empty-state">
          <Search size={48} className="empty-state-icon" />
          <p>No todos found.</p>
          {(search || status !== 'all' || priority !== 'all') && (
            <button className="btn btn-ghost" onClick={() => setSearchParams({})}>Clear filters</button>
          )}
          <Link to="/todos/add" className="btn btn-primary">Create your first todo</Link>
        </div>
      ) : (
        <div className="todo-list">
          {todos.map((todo) => (
            <TodoCard
              key={todo._id}
              todo={todo}
              onDelete={setDeleteTarget}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => updateParams({ page: p })}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Todo"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default TodosPage;
