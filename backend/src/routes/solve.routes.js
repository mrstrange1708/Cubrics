const express = require('express');
const solveService = require('../services/solve.service');
const router = express.Router();

// POST /solve - Create a new solve
router.post('/', async (req, res) => {
    try {
        const { userId, time, scramble, moveCount } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }
        const solve = await solveService.createSolve(userId, { time, scramble, moveCount });
        res.json(solve);
    } catch (error) {
        console.error("Create Solve Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /solve/user/:userId - Get user solves
router.get('/user/:userId', async (req, res) => {
    try {
        const { limit, offset } = req.query;
        const solves = await solveService.getUserSolves(req.params.userId, limit, offset);
        res.json(solves);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
