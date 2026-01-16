const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Import Routes
const authRoutes = require('./src/routes/auth.routes');
const solverRoutes = require('./src/routes/solver.routes');
const timerRoutes = require('./src/routes/timer.routes');
const leaderboardRoutes = require('./src/routes/leaderboard.routes');
const friendsRoutes = require('./src/routes/friends.routes');
const postsRoutes = require('./src/routes/posts.routes');
const messagesRoutes = require('./src/routes/messages.routes');

// Import Middleware
const { authMiddleware, optionalAuthMiddleware } = require('./src/middleware/auth.middleware');

dotenv.config();
app.use(cors());

const prisma = new PrismaClient();
const PORT = process.env.PORT || 7777;

app.use(express.json());

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================
app.use('/auth', authRoutes);

// Health check (public)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', port: PORT, msg: 'CubeSolver Backend is running', timestamp: new Date().toISOString() });
});

// Solver routes (public for demo, can be protected later)
app.use('/', solverRoutes);

// Leaderboard global view (public, but user-specific requires auth)
app.get('/leaderboard/global', async (req, res, next) => {
    // Forward to leaderboard routes without auth
    next();
});

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

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
