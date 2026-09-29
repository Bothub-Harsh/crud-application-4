import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFoundPage = () => (
  <div className="notfound-page">
    <div className="notfound-content">
      <AlertCircle size={80} className="notfound-icon" />
      <h1 className="notfound-code">404</h1>
      <h2 className="notfound-title">Page Not Found</h2>
      <p className="notfound-msg">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
    </div>
  </div>
);

export default NotFoundPage;
