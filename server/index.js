const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// 1. Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { initRedis, isRedisAvailable } = require('./config/redis');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');

const app = express();

// Middleware
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching origin
      if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, or customizable in production
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: 'connected',
      redis: isRedisAvailable() ? 'connected (cache active)' : 'disconnected (cache bypassed, falling back to MongoDB)',
    },
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

// Start Server Sequence
const startServer = async () => {
  try {
    // 2. Connect to MongoDB
    await connectDB();

    // 3. Connect to Redis (resilient: app continues if Redis fails)
    await initRedis();

    const listenOnPort = (portToTry) => {
      const server = app.listen(portToTry, () => {
        console.log(`Server running on port ${portToTry}`);
        console.log(`Cache status: ${isRedisAvailable() ? 'ACTIVE (Redis)' : 'BYPASS (Direct MongoDB)'}`);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[Server Warning] Port ${portToTry} is in use, trying port ${portToTry + 1}...`);
          listenOnPort(portToTry + 1);
        } else {
          console.error(`[Server Error] ${err.message}`);
          process.exit(1);
        }
      });
    };

    listenOnPort(Number(PORT));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
