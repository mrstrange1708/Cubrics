const express = require('express');
const postsService = require('../services/posts.service');
const router = express.Router();

// POST /posts - Create a new post
router.post('/', async (req, res) => {
    try {
        const { userId, content, timerRecordId } = req.body;
        if (!userId || !content) {
            return res.status(400).json({ error: "userId and content required" });
        }
        const post = await postsService.createPost(userId, content, timerRecordId);
        res.json(post);
    } catch (error) {
        console.error("Create Post Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /posts/feed - Get feed posts
router.get('/feed', async (req, res) => {
    try {
        const { userId, limit, offset, friendsOnly } = req.query;
        const posts = await postsService.getFeed(
            userId,
            limit || 20,
            offset || 0,
            friendsOnly === 'true'
        );
        res.json(posts);
    } catch (error) {
        console.error("Get Feed Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /posts/:postId - Get single post
router.get('/:postId', async (req, res) => {
    try {
        const post = await postsService.getPost(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        console.error("Get Post Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /posts/:postId/like - Like/unlike a post
router.post('/:postId/like', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "userId required" });
        }
        const result = await postsService.likePost(req.params.postId, userId);
        res.json(result);
    } catch (error) {
        console.error("Like Post Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /posts/:postId/comment - Add comment
router.post('/:postId/comment', async (req, res) => {
    try {
        const { userId, content } = req.body;
        if (!userId || !content) {
            return res.status(400).json({ error: "userId and content required" });
        }
        const comment = await postsService.addComment(req.params.postId, userId, content);
        res.json(comment);
    } catch (error) {
        console.error("Add Comment Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /posts/:postId - Delete a post
router.delete('/:postId', async (req, res) => {
    try {
        const { userId } = req.body;
        await postsService.deletePost(req.params.postId, userId);
        res.json({ success: true });
    } catch (error) {
        console.error("Delete Post Error:", error);
        res.status(400).json({ error: error.message });
    }
});

// DELETE /posts/comment/:commentId - Delete a comment
router.delete('/comment/:commentId', async (req, res) => {
    try {
        const { userId } = req.body;
        await postsService.deleteComment(req.params.commentId, userId);
        res.json({ success: true });
    } catch (error) {
        console.error("Delete Comment Error:", error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
