import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fullpage-loader">
        <div className="spinner-large" />
        <p>Loading...</p>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
