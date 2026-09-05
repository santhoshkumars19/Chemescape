const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// CORS Configuration (robust env based)
const rawFrontendUrl = process.env.FRONTEND_URL || '';
const configuredOrigins = rawFrontendUrl
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const defaultDevOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : defaultDevOrigins;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, health checks, or non-browser tools (e.g. Postman, curl)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');

    // Allow wildcard if configured
    if (configuredOrigins.includes('*')) {
      return callback(null, true);
    }

    // 1. Direct match with configured origins
    if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 2. Allow any Vercel, Netlify, or Render deployment domain
    if (
      /\.vercel\.app$/i.test(cleanOrigin) ||
      /\.netlify\.app$/i.test(cleanOrigin) ||
      /\.onrender\.com$/i.test(cleanOrigin)
    ) {
      return callback(null, true);
    }

    // 3. Allow localhost / 127.0.0.1 development origins
    if (cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    console.warn(`[CORS Blocked] Origin: ${origin}. Configured FRONTEND_URL: ${process.env.FRONTEND_URL}`);
    callback(new Error('CORS policy error: Origin not permitted'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// JSON & URL-encoded Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware (Development)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes Prefix (/api)
app.use('/api', apiRoutes);

// 404 Not Found Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
