const express = require('express');
const timerService = require('../services/timer.service');
const router = express.Router();

// POST /timer - Create a new timer record
router.post('/', async (req, res) => {
    try {
        const { userId, time } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }
        const record = await timerService.createTimerRecord(userId, { time });
        res.json(record);
    } catch (error) {
        console.error("Create Timer Record Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /timer/user/:userId - Get user timer records
router.get('/user/:userId', async (req, res) => {
    try {
        const { limit, offset } = req.query;
        const records = await timerService.getUserTimerRecords(req.params.userId, limit, offset);
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
