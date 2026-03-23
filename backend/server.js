require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Import routes
const newsRoutes = require('./routes/newsRoutes');
const roomRoutes = require('./routes/roomRoutes');
const agoraRoutes = require('./routes/agoraRoutes');

// Import config
const { testConnection } = require('./config/database');

// Import socket handler
const { initializeSocket } = require('./socket/socketHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/news', newsRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/agora', agoraRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'NewZora API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    name: 'NewZora API',
    version: '1.0.0',
    description: 'News-based discussion platform API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Initialize Socket.IO handlers
initializeSocket(io);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    server.listen(PORT, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════════════╗');
      console.log('║                                                       ║');
      console.log('║   🚀 NewZora Backend Server is running!              ║');
      console.log('║                                                       ║');
      console.log(`║   📡 Server: http://localhost:${PORT}                   ║`);
      console.log(`║   🔌 Socket.IO: Enabled                              ║`);
      console.log('║                                                       ║');
      console.log('║   Endpoints:                                         ║');
      console.log('║   • GET  /api/health                                 ║');
      console.log('║   • GET  /api/news                                   ║');
      console.log('║   • POST /api/rooms/create                          ║');
      console.log('║   • POST /api/rooms/join                             ║');
      console.log('║   • POST /api/rooms/leave                            ║');
      console.log('║   • GET  /api/rooms/:roomId                          ║');
      console.log('║   • GET  /api/agora/token                            ║');
      console.log('║                                                       ║');
      console.log('╚═══════════════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
