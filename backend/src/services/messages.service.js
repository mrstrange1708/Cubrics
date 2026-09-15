const prisma = require('../lib/prisma');

class MessagesService {
    /**
     * Send a message
     */
    async sendMessage(senderId, receiverId, content) {
        return await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content
            },
            include: {
                sender: {
                    select: { id: true, username: true, avatar: true }
                },
                receiver: {
                    select: { id: true, username: true, avatar: true }
                }
            }
        });
    }

    /**
     * Get conversation between two users
     */
    async getConversation(userId1, userId2, limit = 50) {
        return await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 }
                ]
            },
            orderBy: { createdAt: 'asc' },
            take: Number(limit),
            include: {
                sender: {
                    select: { id: true, username: true, avatar: true }
                }
            }
        });
    }

    /**
     * Get all conversations for a user (latest message from each)
     */
    async getConversations(userId) {
        // Latest sent, latest received, and unread counts: 3 queries in parallel
        const [sentMessages, receivedMessages, unreadGroups] = await Promise.all([
            prisma.message.findMany({
                where: { senderId: userId },
                distinct: ['receiverId'],
                orderBy: { createdAt: 'desc' },
                include: {
                    receiver: {
                        select: { id: true, username: true, avatar: true }
                    }
                }
            }),
            prisma.message.findMany({
                where: { receiverId: userId },
                distinct: ['senderId'],
                orderBy: { createdAt: 'desc' },
                include: {
                    sender: {
                        select: { id: true, username: true, avatar: true }
                    }
                }
            }),
            prisma.message.groupBy({
                by: ['senderId'],
                where: { receiverId: userId, read: false },
                _count: { _all: true }
            })
        ]);

        const unreadBySender = new Map(unreadGroups.map(g => [g.senderId, g._count._all]));

        // Combine and deduplicate
        const conversations = new Map();

        for (const msg of sentMessages) {
            conversations.set(msg.receiverId, {
                user: msg.receiver,
                lastMessage: msg,
                unreadCount: unreadBySender.get(msg.receiverId) || 0
            });
        }

        for (const msg of receivedMessages) {
            if (!conversations.has(msg.senderId) ||
                new Date(msg.createdAt) > new Date(conversations.get(msg.senderId).lastMessage.createdAt)) {
                conversations.set(msg.senderId, {
                    user: msg.sender,
                    lastMessage: msg,
                    unreadCount: unreadBySender.get(msg.senderId) || 0
                });
            }
        }

        return Array.from(conversations.values()).sort((a, b) =>
            new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
        );
    }

    /**
     * Mark messages as read
     */
    async markAsRead(senderId, receiverId) {
        await prisma.message.updateMany({
            where: {
                senderId,
                receiverId,
                read: false
            },
            data: { read: true }
        });
    }

    /**
     * Get unread message count
     */
    async getUnreadCount(userId) {
        return await prisma.message.count({
            where: {
                receiverId: userId,
                read: false
            }
        });
    }
}

module.exports = new MessagesService();
