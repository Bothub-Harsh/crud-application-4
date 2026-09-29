import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { todosAPI } from '../services/api';

const priorityOptions = [
  { value: 'low',    label: '🟢 Low' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'high',   label: '🔴 High' },
];

const AddTodoPage = ({ toast }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((err) => ({ ...err, [e.target.name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.trim().length > 150) e.title = 'Title max 150 chars';
    if (!['low', 'medium', 'high'].includes(form.priority)) e.priority = 'Invalid priority';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await todosAPI.create({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate: form.dueDate || null,
      });
      toast.success('Todo created successfully!');
      navigate('/todos');
    } catch (err) {
      toast.error(err.message || 'Failed to create todo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/todos" className="back-link"><ArrowLeft size={16} /> Back to Todos</Link>
          <h1 className="page-title">New Todo</h1>
        </div>
      </div>

      <div className="form-card">
        <form className="todo-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="add-title" className="form-label">Title <span className="required">*</span></label>
            <input
              id="add-title"
              className={`form-input ${errors.title ? 'form-input--error' : ''}`}
              type="text"
              name="title"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={handleChange}
              maxLength={150}
              required
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
            <span className="form-hint">{form.title.length}/150</span>
          </div>

          <div className="form-group">
            <label htmlFor="add-description" className="form-label">Description</label>
            <textarea
              id="add-description"
              className="form-textarea"
              name="description"
              placeholder="Add more details (optional)"
              value={form.description}
              onChange={handleChange}
              rows={4}
              maxLength={1000}
            />
            <span className="form-hint">{form.description.length}/1000</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="add-priority" className="form-label">Priority</label>
              <select
                id="add-priority"
                className="form-select"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                {priorityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="add-dueDate" className="form-label">Due Date</label>
              <input
                id="add-dueDate"
                className="form-input"
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-actions">
            <Link to="/todos" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <><Save size={16} /> Create Todo</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTodoPage;
