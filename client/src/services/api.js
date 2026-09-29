const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Centralized fetch helper with auth token injection
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('todo_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// ── Auth API ──────────────────────────────────────────────
export const authAPI = {
  register: (body) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  me: () => request('/auth/me'),
};

// ── Todos API ─────────────────────────────────────────────
export const todosAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null))
    ).toString();
    return request(`/todos${qs ? `?${qs}` : ''}`);
  },

  getOne: (id) => request(`/todos/${id}`),

  create: (body) =>
    request('/todos', { method: 'POST', body: JSON.stringify(body) }),

  update: (id, body) =>
    request(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  toggleComplete: (id, completed) =>
    request(`/todos/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    }),

  delete: (id) => request(`/todos/${id}`, { method: 'DELETE' }),

  getDashboardStats: () => request('/todos/stats/dashboard'),
};

export default request;
