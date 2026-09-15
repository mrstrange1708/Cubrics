const express = require('express');
const messagesService = require('../services/messages.service');
const { requireSelf } = require('../middleware/auth.middleware');
const router = express.Router();

// POST /messages - Send a message
router.post('/', async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        if (!receiverId || !content) {
            return res.status(400).json({ error: "receiverId and content required" });
        }
        const message = await messagesService.sendMessage(req.user.userId, receiverId, content);
        res.json(message);
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /messages/conversations/:userId - Get all conversations
router.get('/conversations/:userId', requireSelf(), async (req, res) => {
    try {
        const conversations = await messagesService.getConversations(req.params.userId);
        res.json(conversations);
    } catch (error) {
        console.error("Get Conversations Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /messages/:userId/:otherUserId - Get conversation between two users
router.get('/:userId/:otherUserId', requireSelf(), async (req, res) => {
    try {
        const { limit } = req.query;
        const messages = await messagesService.getConversation(
            req.params.userId,
            req.params.otherUserId,
            limit
        );
        res.json(messages);
    } catch (error) {
        console.error("Get Conversation Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /messages/read - Mark messages as read
router.post('/read', async (req, res) => {
    try {
        // Only the receiver marks their incoming messages as read
        const { senderId } = req.body;
        await messagesService.markAsRead(senderId, req.user.userId);
        res.json({ success: true });
    } catch (error) {
        console.error("Mark Read Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /messages/unread/:userId - Get unread count
router.get('/unread/:userId', requireSelf(), async (req, res) => {
    try {
        const count = await messagesService.getUnreadCount(req.params.userId);
        res.json({ count });
    } catch (error) {
        console.error("Get Unread Count Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
