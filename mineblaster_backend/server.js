require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/database');
const { initializeFirebase } = require('./config/firebase');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const mineRoutes = require('./routes/mines');
const blastDataRoutes = require('./routes/blastdata');
const predictionRoutes = require('./routes/predictions');

// Initialize Express app
const app = express();

// Initialize Firebase Admin SDK
initializeFirebase();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers with relaxed COOP for OAuth
app.use(morgan('combined')); // Logging
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:3000',
    'https://blastwatcher2429.vercel.app',
    'https://mineblaster869.vercel.app',
    'https://blastwatcher869.vercel.app',
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'BlastWatcher API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
const API_BASE = `/api/${process.env.API_VERSION || 'v1'}`;

app.use(`${API_BASE}/auth`, authRoutes);
app.use(`${API_BASE}/mines`, mineRoutes);
app.use(`${API_BASE}/blastdata`, blastDataRoutes);
app.use(`${API_BASE}/predict`, predictionRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to BlastWatcher API',
    version: '1.0.0',
    documentation: 'API documentation available at /docs',
    endpoints: {
      auth: `${API_BASE}/auth`,
      mines: `${API_BASE}/mines`,
      blastData: `${API_BASE}/blastdata`,
      predictions: `${API_BASE}/predict`
    }
  });
});

// API Documentation (basic)
app.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'BlastWatcher API Documentation',
    version: '1.0.0',
    baseUrl: API_BASE,
    endpoints: {
      authentication: {
        signup: 'POST /auth/signup',
        login: 'POST /auth/login',
        me: 'GET /auth/me',
        logout: 'POST /auth/logout'
      },
      mines: {
        getAll: 'GET /mines',
        getOne: 'GET /mines/:id',
        create: 'POST /mines (Admin only)',
        update: 'PUT /mines/:id (Admin only)',
        delete: 'DELETE /mines/:id (Admin only)'
      },
      blastData: {
        getByMine: 'GET /blastdata/:mineId',
        getOne: 'GET /blastdata/single/:id',
        create: 'POST /blastdata (Data Entry/Admin only)',
        update: 'PUT /blastdata/:id (Data Entry/Admin only)',
        delete: 'DELETE /blastdata/:id (Data Entry/Admin only)'
      },
      predictions: {
        generate: 'POST /predict',
        history: 'GET /predict/history',
        getOne: 'GET /predict/:id',
        delete: 'DELETE /predict/:id'
      }
    },
    userRoles: {
      normal: 'Can access dashboard, predictions, and view data',
      data_entry: 'Can also create and manage blast data',
      admin: 'Full access to all features'
    }
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 BlastWatcher API Server is running!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Port: ${PORT}
📖 API Base: ${API_BASE}
📋 Health Check: http://localhost:${PORT}/health
📚 Documentation: http://localhost:${PORT}/docs
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
