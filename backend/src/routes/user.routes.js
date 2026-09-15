const express = require('express');
const userService = require('../services/user.service');
const { requireSelf } = require('../middleware/auth.middleware');
const router = express.Router();

// GET /users/:userId/profile - Get user profile
router.get('/:userId/profile', async (req, res) => {
    try {
        const profile = await userService.getProfile(req.params.userId, req.user.userId);
        res.json(profile);
    } catch (error) {
        console.error("Get Profile Error:", error);
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

// PUT /users/:userId/profile - Update profile
router.put('/:userId/profile', requireSelf(), async (req, res) => {
    try {
        const { username, bio } = req.body;
        const updated = await userService.updateProfile(req.params.userId, { username, bio });
        res.json(updated);
    } catch (error) {
        console.error("Update Profile Error:", error);
        if (error.message === 'Username already taken') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

// GET /users/:userId/posts - Get user's posts
router.get('/:userId/posts', async (req, res) => {
    try {
        const { limit, offset } = req.query;
        const posts = await userService.getUserPosts(req.params.userId, req.user.userId, limit, offset);
        res.json(posts);
    } catch (error) {
        console.error("Get User Posts Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /users/:userId/liked - Get posts liked by user
router.get('/:userId/liked', async (req, res) => {
    try {
        const { limit, offset } = req.query;
        const posts = await userService.getLikedPosts(req.params.userId, req.user.userId, limit, offset);
        res.json(posts);
    } catch (error) {
        console.error("Get Liked Posts Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /users/:userId/friends - Get user's friends
router.get('/:userId/friends', async (req, res) => {
    try {
        const friends = await userService.getUserFriends(req.params.userId);
        res.json(friends);
    } catch (error) {
        console.error("Get User Friends Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
