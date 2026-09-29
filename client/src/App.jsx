import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuthContext';
import useToast from './hooks/useToast';
import ToastContainer from './components/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TodosPage from './pages/TodosPage';
import AddTodoPage from './pages/AddTodoPage';
import EditTodoPage from './pages/EditTodoPage';
import TodoDetailPage from './pages/TodoDetailPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const { toasts, toast, removeToast } = useToast();

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage toast={toast} />} />
          <Route path="/register" element={<RegisterPage toast={toast} />} />

          {/* Protected routes under the Layout wrapper */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage toast={toast} />} />
              <Route path="/todos" element={<TodosPage toast={toast} />} />
              <Route path="/todos/add" element={<AddTodoPage toast={toast} />} />
              <Route path="/todos/:id" element={<TodoDetailPage toast={toast} />} />
              <Route path="/todos/:id/edit" element={<EditTodoPage toast={toast} />} />
              <Route path="/profile" element={<ProfilePage toast={toast} />} />
            </Route>
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Global toast notifications */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
