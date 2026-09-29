# Production-Style Full-Stack Todo Application

A robust, enterprise-ready full-stack Todo application built with **React 19**, **Vite**, **Express**, **MongoDB**, and **Redis**. Built with performance, resilience, and security in mind—featuring JWT authentication, Redis caching with automatic direct MongoDB fallback, server-side search/filtering/pagination, and a responsive UI.

---

## 🌟 Key Features

- 🔐 **Authentication & Authorization**: Secure JWT-based auth with hashed passwords using `bcryptjs`.
- ⚡ **High-Performance Redis Caching**: Intelligent caching for user tasks with automatic cache invalidation on writes, updates, and deletes.
- 🛡️ **Resilient Backend Fallback**: Seamless operation even if Redis is down—automatically falls back to direct MongoDB queries without throwing errors.
- 📊 **Interactive Dashboard**: Statistics on completed, pending, high priority, and overdue tasks.
- 🔍 **Advanced Task Management**: Search, filter by status (All/Active/Completed), priority (Low/Medium/High), and pagination.
- ⏱️ **Due Dates & Priority Levels**: Color-coded badges for priority levels and intelligent date sorting.
- 👤 **User Profile Management**: View account metadata, total tasks stats, and account registration timestamp.
- 📱 **Responsive Modern UI**: Modern side navigation layout, dark accent palette, smooth micro-interactions, and toast alerts.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linting**: [Oxlint](https://oxc.rs/docs/guide/usage/linter.html)

### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose 8](https://mongoosejs.com/)
- **Cache**: [Redis 4](https://redis.io/) (`redis` client)
- **Security**: `jsonwebtoken` (JWT), `bcryptjs`, CORS middleware
- **Logger**: `morgan`

---

## 📂 Project Structure

```text
CRUD application 4/
├── client/                     # Frontend React + Vite app
│   ├── src/
│   │   ├── components/         # Reusable UI components (TodoCard, Sidebar, ConfirmDialog, etc.)
│   │   ├── hooks/              # Custom React hooks (useAuth, useToast)
│   │   ├── pages/              # Application views (DashboardPage, TodosPage, AddTodoPage, etc.)
│   │   ├── services/           # API integration services (api.js, authService.js, todoService.js)
│   │   ├── App.jsx             # Main Router configuration & layout wrapping
│   │   └── main.jsx            # React root entry point
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend Express API server
│   ├── config/                 # DB & Redis connection scripts (db.js, redis.js)
│   ├── controllers/            # Request handlers (authController.js, todoController.js)
│   ├── middleware/             # Auth check & error handling (authMiddleware.js, errorHandler.js)
│   ├── models/                 # Mongoose models (User.js, Todo.js)
│   ├── routes/                 # Express API routes (authRoutes.js, todoRoutes.js)
│   ├── services/               # Cache service layer (cacheService.js)
│   ├── index.js                # Server entry point
│   └── package.json
├── .env.example                # Sample environment variables configuration
└── README.md                   # Project documentation
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the `server/` directory (or use `.env.example` as a template at the root directory):

```env
# MongoDB Connection URI (Local or MongoDB Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/todo_application

# Redis Connection URL
REDIS_URL=redis://127.0.0.1:6379

# Redis Cache TTL in seconds (default: 300 seconds / 5 minutes)
REDIS_CACHE_TTL=300

# JSON Web Token Secret & Expiration
JWT_SECRET=production_quality_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRES_IN=7d

# Express Server Port
PORT=5000

# Client Application URL for CORS
CLIENT_URL=http://localhost:5173

# Environment
NODE_ENV=development
```

---

## 🚀 Getting Started

### **Prerequisites**
- **Node.js** (v18.x or higher)
- **MongoDB** (Local instance running on `27017` or MongoDB Atlas URI)
- **Redis** *(Optional)* (Local instance running on `6379` or Redis Cloud connection string)

---

### **1. Backend Setup**

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Start the backend development server:

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or `5050` if port 5000 is occupied).

> 💡 **Note on Redis**: If Redis is not running locally, the server logs a warning and automatically switches to direct MongoDB mode without crashing.

---

### **2. Frontend Setup**

Open a new terminal window, navigate to the `client/` directory and install dependencies:

```bash
cd client
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 📡 API Endpoints Reference

### **Health Check**
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check (MongoDB & Redis connection status) |

### **Authentication** (`/api/auth`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Log in and receive JWT token |
| `GET` | `/api/auth/me` | Yes | Get current user profile details |

### **Todos** (`/api/todos`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/todos` | Yes | Get paginated list of todos (supports `page`, `limit`, `search`, `status`, `priority`) |
| `GET` | `/api/todos/stats` | Yes | Fetch dashboard summary stats |
| `GET` | `/api/todos/:id` | Yes | Fetch single todo details |
| `POST` | `/api/todos` | Yes | Create a new todo item |
| `PUT` | `/api/todos/:id` | Yes | Update an existing todo |
| `PATCH` | `/api/todos/:id/toggle` | Yes | Toggle completed status |
| `DELETE` | `/api/todos/:id` | Yes | Delete a todo item |

---

## ⚡ Redis Caching Architecture

1. **Read Requests (`GET /api/todos`)**: Checks Redis for user cache key (`user:<userId>:todos:...`). On cache hit, data is returned instantly without hitting MongoDB. On cache miss, data is fetched from MongoDB, cached in Redis with a TTL of 300s, and returned to the client.
2. **Write / Update / Delete Requests**: Modifying any task immediately clears the cached entries for that user (`user:<userId>:*`), ensuring strict cache consistency.
3. **Resilience**: Every Redis interaction is wrapped with error checks. If connection fails or Redis server stops, the app seamlessly falls back to MongoDB.

---

## 📜 Available Scripts

### Server (`/server`)
- `npm run dev`: Run backend server with `nodemon` (auto-reload on save).
- `npm start`: Run backend server in production mode with standard `node`.

### Client (`/client`)
- `npm run dev`: Launch Vite dev server with hot module replacement (HMR).
- `npm run build`: Build production-ready bundle.
- `npm run lint`: Lint code with Oxlint.
- `npm run preview`: Preview local production build.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
