const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
        // Get all unique conversation partners
        const sentMessages = await prisma.message.findMany({
            where: { senderId: userId },
            distinct: ['receiverId'],
            orderBy: { createdAt: 'desc' },
            include: {
                receiver: {
                    select: { id: true, username: true, avatar: true }
                }
            }
        });

        const receivedMessages = await prisma.message.findMany({
            where: { receiverId: userId },
            distinct: ['senderId'],
            orderBy: { createdAt: 'desc' },
            include: {
                sender: {
                    select: { id: true, username: true, avatar: true }
                }
            }
        });

        // Combine and deduplicate
        const conversations = new Map();

        for (const msg of sentMessages) {
            conversations.set(msg.receiverId, {
                user: msg.receiver,
                lastMessage: msg,
                unreadCount: 0
            });
        }

        for (const msg of receivedMessages) {
            if (!conversations.has(msg.senderId) ||
                new Date(msg.createdAt) > new Date(conversations.get(msg.senderId).lastMessage.createdAt)) {
                const unreadCount = await prisma.message.count({
                    where: {
                        senderId: msg.senderId,
                        receiverId: userId,
                        read: false
                    }
                });
                conversations.set(msg.senderId, {
                    user: msg.sender,
                    lastMessage: msg,
                    unreadCount
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
