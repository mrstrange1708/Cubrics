const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./src/routes/auth.routes');
const solverRoutes = require('./src/routes/solver.routes');
const solveRoutes = require('./src/routes/solve.routes');
const leaderboardRoutes = require('./src/routes/leaderboard.routes');

dotenv.config();
app.use(cors());


const prisma = new PrismaClient();
const PORT = process.env.PORT || 7777;

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/', solverRoutes);
app.use('/solve', solveRoutes);
app.use('/leaderboard', leaderboardRoutes);


app.get('/health', (req, res) => {
    res.json({ status: 'ok', port: PORT, msg: 'CubeSolver Backend is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
