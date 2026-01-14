const express = require('express');
const leaderboardService = require('../services/leaderboard.service');
const router = express.Router();

router.get('/global', async (req, res) => {
    try {
        const { limit } = req.query;
        const leaderboard = await leaderboardService.getGlobalLeaderboard(limit);
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/percentile/:userId', async (req, res) => {
    try {
        const data = await leaderboardService.getUserRankAndPercentile(req.params.userId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
