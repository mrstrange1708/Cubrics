const express = require('express');
const friendsService = require('../services/friends.service');
const router = express.Router();

// GET /friends/:userId - Get user's friends
router.get('/:userId', async (req, res) => {
    try {
        const friends = await friendsService.getFriends(req.params.userId);
        res.json(friends);
    } catch (error) {
        console.error("Get Friends Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /friends/:userId/times - Get friends with their times
router.get('/:userId/times', async (req, res) => {
    try {
        const friends = await friendsService.getFriendsWithTimes(req.params.userId);
        res.json(friends);
    } catch (error) {
        console.error("Get Friends Times Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /friends/request - Send friend request
router.post('/request', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        if (!senderId || !receiverId) {
            return res.status(400).json({ error: "senderId and receiverId required" });
        }
        const request = await friendsService.sendFriendRequest(senderId, receiverId);
        res.json(request);
    } catch (error) {
        console.error("Send Friend Request Error:", error);
        res.status(400).json({ error: error.message });
    }
});

// POST /friends/request/:requestId/accept - Accept friend request
router.post('/request/:requestId/accept', async (req, res) => {
    try {
        await friendsService.acceptFriendRequest(req.params.requestId);
        res.json({ success: true });
    } catch (error) {
        console.error("Accept Friend Request Error:", error);
        res.status(400).json({ error: error.message });
    }
});

// POST /friends/request/:requestId/reject - Reject friend request
router.post('/request/:requestId/reject', async (req, res) => {
    try {
        await friendsService.rejectFriendRequest(req.params.requestId);
        res.json({ success: true });
    } catch (error) {
        console.error("Reject Friend Request Error:", error);
        res.status(400).json({ error: error.message });
    }
});

// GET /friends/:userId/requests - Get pending requests
router.get('/:userId/requests', async (req, res) => {
    try {
        const requests = await friendsService.getPendingRequests(req.params.userId);
        res.json(requests);
    } catch (error) {
        console.error("Get Pending Requests Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /friends/:userId/recommendations - Get friend recommendations
router.get('/:userId/recommendations', async (req, res) => {
    try {
        const recommendations = await friendsService.getRecommendations(req.params.userId);
        res.json(recommendations);
    } catch (error) {
        console.error("Get Recommendations Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /friends/:userId/:friendId - Remove friend
router.delete('/:userId/:friendId', async (req, res) => {
    try {
        await friendsService.removeFriend(req.params.userId, req.params.friendId);
        res.json({ success: true });
    } catch (error) {
        console.error("Remove Friend Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
