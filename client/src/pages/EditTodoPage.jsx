import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { todosAPI } from '../services/api';

const priorityOptions = [
  { value: 'low',    label: '🟢 Low' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'high',   label: '🔴 High' },
];

const formatDateInput = (d) => {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
};

const EditTodoPage = ({ toast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await todosAPI.getOne(id);
        const t = res.data;
        setForm({
          title: t.title,
          description: t.description || '',
          priority: t.priority,
          dueDate: formatDateInput(t.dueDate),
          completed: t.completed,
        });
      } catch (err) {
        toast.error('Failed to load todo');
        navigate('/todos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors((err) => ({ ...err, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.trim().length > 150) e.title = 'Title max 150 chars';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      await todosAPI.update(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate: form.dueDate || null,
        completed: form.completed,
      });
      toast.success('Todo updated successfully!');
      navigate(`/todos/${id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update todo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner-large" /></div>;
  if (!form) return null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to={`/todos/${id}`} className="back-link"><ArrowLeft size={16} /> Back to Todo</Link>
          <h1 className="page-title">Edit Todo</h1>
        </div>
      </div>

      <div className="form-card">
        <form className="todo-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-title" className="form-label">Title <span className="required">*</span></label>
            <input id="edit-title" className={`form-input ${errors.title ? 'form-input--error' : ''}`}
              type="text" name="title" placeholder="Todo title" value={form.title}
              onChange={handleChange} maxLength={150} required />
            {errors.title && <span className="form-error">{errors.title}</span>}
            <span className="form-hint">{form.title.length}/150</span>
          </div>

          <div className="form-group">
            <label htmlFor="edit-description" className="form-label">Description</label>
            <textarea id="edit-description" className="form-textarea" name="description"
              placeholder="Description (optional)" value={form.description}
              onChange={handleChange} rows={4} maxLength={1000} />
            <span className="form-hint">{form.description.length}/1000</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-priority" className="form-label">Priority</label>
              <select id="edit-priority" className="form-select" name="priority"
                value={form.priority} onChange={handleChange}>
                {priorityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-dueDate" className="form-label">Due Date</label>
              <input id="edit-dueDate" className="form-input" type="date" name="dueDate"
                value={form.dueDate} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" name="completed" checked={form.completed} onChange={handleChange} />
              <span>Mark as completed</span>
            </label>
          </div>

          <div className="form-actions">
            <Link to={`/todos/${id}`} className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTodoPage;
