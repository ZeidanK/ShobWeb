/**
 * Event Monitoring System - Backend Server
 * 
 * This is the main Express.js application server for the Event Monitoring MVP.
 * It provides RESTful APIs for authentication, camera management, event handling,
 * and user management, along with real-time WebSocket communication.
 * 
 * Features:
 * - RESTful API endpoints for all core functionality
 * - Real-time WebSocket communication via Socket.IO
 * - JWT-based authentication and authorization
 * - Rate limiting and security middleware
 * - MongoDB database integration
 * - Comprehensive error handling
 * - Request logging and monitoring
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Import database connection utility
import { connectDB } from './utils/database';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

// Import route handlers
import authRoutes from './routes/auth';
import cameraRoutes from './routes/cameras';
import eventRoutes from './routes/events';
import userRoutes from './routes/users';
import aiDetectionRoutes from './routes/aiDetections';
import mobileRoutes from './routes/mobile';

// Load environment variables from .env file
dotenv.config();

// Create Express application instance
const app = express();

// Create HTTP server for both Express and Socket.IO
const server = createServer(app);

// Initialize Socket.IO for real-time communication
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB database
connectDB();

/**
 * Rate Limiting Configuration
 * Protects against DoS attacks and abuse by limiting request frequency
 */
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),     // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,  // Return rate limit info in headers
  legacyHeaders: false,   // Disable legacy headers
});

/**
 * Security and Performance Middleware Stack
 */
app.use(helmet());         // Security headers protection
app.use(cors({             // Cross-Origin Resource Sharing configuration
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true        // Allow credentials (cookies, authorization headers)
}));
app.use(compression());    // Gzip compression for responses
app.use(morgan('combined')); // HTTP request logging in Apache format
app.use(limiter);          // Apply rate limiting
app.use(express.json({ limit: '10mb' }));                        // Parse JSON bodies (10MB limit)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));  // Parse URL-encoded bodies

/**
 * Health Check Endpoint
 * Provides a simple endpoint to check if the service is running
 * Used by load balancers and monitoring systems
 */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'event-monitoring-backend',
    version: process.env.npm_package_version || '1.0.0'
  });
});

/**
 * API Route Handlers
 * Mount all API routes under their respective prefixes
 */
app.use('/api/auth', authRoutes);           // Authentication and authorization routes
app.use('/api/cameras', cameraRoutes);      // Camera management routes  
app.use('/api/events', eventRoutes);        // Event management routes
app.use('/api/users', userRoutes);          // User management routes
app.use('/api/detections', aiDetectionRoutes); // AI detection management routes
app.use('/api/mobile', mobileRoutes);            // Mobile app integration routes

/**
 * Socket.IO Real-Time Communication Setup
 * Handles WebSocket connections for real-time features like:
 * - Live event notifications
 * - Real-time camera status updates  
 * - Live video stream coordination
 */
io.on('connection', (socket) => {
  console.log(`🔌 WebSocket client connected: ${socket.id}`);

  // Handle joining specific rooms for targeted updates
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`📡 Client ${socket.id} joined room: ${room}`);
  });

  // Handle leaving rooms
  socket.on('leave-room', (room) => {
    socket.leave(room);
    console.log(`📴 Client ${socket.id} left room: ${room}`);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`❌ WebSocket client disconnected: ${socket.id}`);
  });
});

/**
 * Make Socket.IO instance accessible to other modules
 * This allows controllers and services to emit real-time updates
 */
app.set('io', io);

/**
 * Error Handling Middleware
 * Must be registered after all routes and middleware
 * Catches and processes any unhandled errors
 */
app.use(errorHandler);

/**
 * 404 Not Found Handler
 * Catches all requests to undefined routes
 * Must be the last middleware
 */
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl 
  });
});

/**
 * Server Configuration and Startup
 */
const PORT = process.env.PORT || 5000;

// Start the HTTP server with Socket.IO support
server.listen(PORT, () => {
  console.log('🚀 Event Monitoring System Backend Started');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`⚡ WebSocket server ready for real-time connections`);
  console.log(`🗄️ MongoDB connection: ${process.env.NODE_ENV === 'production' ? 'Production DB' : 'Development DB'}`);
});

/**
 * Export Socket.IO instance for use in other modules
 * This allows other parts of the application to emit real-time events
 */
export { io };