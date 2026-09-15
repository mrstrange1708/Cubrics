const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const prisma = require('./lib/prisma');

// Track online users: { userId: socketId }
const onlineUsers = new Map();

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Authenticate every connection with the same JWT the REST API uses.
    // The user id comes from the token, never from client-sent event data.
    io.use((socket, next) => {
        try {
            const { userId } = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
            socket.userId = userId;
            next();
        } catch {
            next(new Error('Authentication required'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.userId;

        // User joins
        socket.on('user-online', () => {
            onlineUsers.set(userId, socket.id);

            // Broadcast online status to all
            io.emit('user-status-change', {
                userId,
                status: 'online'
            });
        });

        // Send message
        socket.on('send-message', async (data) => {
            const { receiverId, content } = data || {};
            if (!receiverId || !content) {
                socket.emit('message-error', { error: 'receiverId and content required' });
                return;
            }

            try {
                // Save to database
                const message = await prisma.message.create({
                    data: {
                        senderId: userId,
                        receiverId,
                        content
                    },
                    include: {
                        sender: {
                            select: { id: true, username: true, avatar: true }
                        }
                    }
                });

                // Send to receiver if online
                const receiverSocketId = onlineUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive-message', message);
                }

                // Confirm to sender
                socket.emit('message-sent', message);

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('message-error', { error: 'Failed to send message' });
            }
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const { receiverId, isTyping } = data || {};
            const receiverSocketId = onlineUsers.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user-typing', {
                    userId,
                    isTyping
                });
            }
        });

        // Get online users
        socket.on('get-online-users', () => {
            socket.emit('online-users', Array.from(onlineUsers.keys()));
        });

        // Disconnect
        socket.on('disconnect', () => {
            // Only mark offline if this socket is still the user's current one
            // (a newer tab/reconnect may have replaced it)
            if (onlineUsers.get(userId) === socket.id) {
                onlineUsers.delete(userId);

                io.emit('user-status-change', {
                    userId,
                    status: 'offline'
                });
            }
        });
    });

    return io;
}

module.exports = { initializeSocket, onlineUsers };
