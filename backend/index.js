// Load env before any module reads process.env at require time (e.g. JWT_SECRET)
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');

// Import Socket
const { initializeSocket } = require('./src/socket');

// Import Routes
const authRoutes = require('./src/routes/auth.routes');
const solverRoutes = require('./src/routes/solver.routes');
const timerRoutes = require('./src/routes/timer.routes');
const leaderboardRoutes = require('./src/routes/leaderboard.routes');
const friendsRoutes = require('./src/routes/friends.routes');
const postsRoutes = require('./src/routes/posts.routes');
const messagesRoutes = require('./src/routes/messages.routes');
const userRoutes = require('./src/routes/user.routes');

// Import Middleware
const { authMiddleware, optionalAuthMiddleware } = require('./src/middleware/auth.middleware');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io accessible in routes
app.set('io', io);

const PORT = process.env.PORT || 7777;

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================
app.use('/auth', authRoutes);

// Health check (public)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', port: PORT, msg: 'CubeSolver Backend is running', websocket: 'enabled', timestamp: new Date().toISOString() });
});

// Solver routes (public for demo, can be protected later)
app.use('/', solverRoutes);

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

// Timer routes - require auth
app.use('/timer', authMiddleware, timerRoutes);

// Leaderboard user-specific routes - require auth
app.use('/leaderboard', optionalAuthMiddleware, leaderboardRoutes);

// Friends routes - require auth
app.use('/friends', authMiddleware, friendsRoutes);

// Posts routes - require auth
app.use('/posts', authMiddleware, postsRoutes);

// Messages routes - require auth
app.use('/messages', authMiddleware, messagesRoutes);

// User routes - require auth
app.use('/users', authMiddleware, userRoutes);

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Use server.listen instead of app.listen for Socket.IO
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`WebSocket server is ready`);

    // Build solver tables after the port is bound so the host sees the service
    // as up immediately after a cold start; the first /solve stays fast.
    require('./src/services/solver/Tables').init();
    console.log('[Startup] Solver tables ready ✅');
});
