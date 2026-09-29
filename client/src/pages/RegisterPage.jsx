import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuthContext';

const RegisterPage = ({ toast }) => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-brand">
          <CheckCheck size={36} className="auth-brand-icon" />
          <h1 className="auth-brand-name">TodoPro</h1>
        </div>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Start organising your tasks today</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name" className="form-label">Full Name</label>
            <input id="reg-name" className="form-input" type="text" name="name" placeholder="John Doe"
              value={form.name} onChange={handleChange} required minLength={2} />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email</label>
            <input id="reg-email" className="form-input" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required autoComplete="email" />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">Password</label>
            <div className="input-with-icon">
              <input id="reg-password" className="form-input" type={showPwd ? 'text' : 'password'}
                name="password" placeholder="Min 6 characters"
                value={form.password} onChange={handleChange} required minLength={6} />
              <button type="button" className="input-eye" onClick={() => setShowPwd((v) => !v)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
            <input id="reg-confirm" className="form-input" type="password" name="confirmPassword"
              placeholder="Repeat password"
              value={form.confirmPassword} onChange={handleChange} required minLength={6} />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>

      <div className="auth-side">
        <div className="auth-side-content">
          <h2>Join thousands of productive people.</h2>
          <ul className="auth-features">
            {['Free to use, no credit card', 'Redis-powered fast responses', 'Secure JWT authentication', 'Search, filter & sort todos'].map((f) => (
              <li key={f}><CheckCheck size={16} /><span>{f}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
