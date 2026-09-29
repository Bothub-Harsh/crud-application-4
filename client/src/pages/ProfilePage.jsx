import { useAuth } from '../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, LogOut } from 'lucide-react';

const ProfilePage = ({ toast }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out.');
    navigate('/login');
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-large">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>

        <div className="profile-info">
          <div className="profile-field">
            <User size={18} className="profile-field-icon" />
            <div>
              <span className="profile-field-label">Full Name</span>
              <span className="profile-field-value">{user?.name}</span>
            </div>
          </div>

          <div className="profile-field">
            <Mail size={18} className="profile-field-icon" />
            <div>
              <span className="profile-field-label">Email Address</span>
              <span className="profile-field-value">{user?.email}</span>
            </div>
          </div>

          <div className="profile-field">
            <Calendar size={18} className="profile-field-icon" />
            <div>
              <span className="profile-field-label">Member Since</span>
              <span className="profile-field-value">{formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn btn-danger btn-full" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
