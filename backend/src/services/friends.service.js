const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class FriendsService {
    /**
     * Get all friends for a user
     */
    async getFriends(userId) {
        const friendships = await prisma.friendship.findMany({
            where: { userId },
            include: {
                user: false
            }
        });

        // Get friend user details
        const friendIds = friendships.map(f => f.friendId);

        return await prisma.user.findMany({
            where: { id: { in: friendIds } },
            select: {
                id: true,
                username: true,
                avatar: true,
                bestSolve: true,
                totalSolves: true
            }
        });
    }

    /**
     * Get friends with their recent times (for leaderboard)
     */
    async getFriendsWithTimes(userId) {
        const friends = await this.getFriends(userId);

        const friendsWithTimes = await Promise.all(
            friends.map(async (friend) => {
                const times = await prisma.timerRecord.findMany({
                    where: { userId: friend.id },
                    orderBy: { time: 'asc' },
                    take: 5,
                    select: {
                        id: true,
                        time: true,
                        createdAt: true
                    }
                });
                return { ...friend, times };
            })
        );

        return friendsWithTimes;
    }

    /**
     * Send a friend request
     */
    async sendFriendRequest(senderId, receiverId) {
        // Check if already friends
        const existingFriendship = await prisma.friendship.findUnique({
            where: {
                userId_friendId: { userId: senderId, friendId: receiverId }
            }
        });

        if (existingFriendship) {
            throw new Error('Already friends');
        }

        // Check if request already exists
        const existingRequest = await prisma.friendRequest.findUnique({
            where: {
                senderId_receiverId: { senderId, receiverId }
            }
        });

        if (existingRequest) {
            throw new Error('Friend request already sent');
        }

        return await prisma.friendRequest.create({
            data: { senderId, receiverId },
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
     * Accept a friend request
     */
    async acceptFriendRequest(requestId) {
        const request = await prisma.friendRequest.findUnique({
            where: { id: requestId }
        });

        if (!request || request.status !== 'pending') {
            throw new Error('Invalid request');
        }

        // Transaction: Update request + Create bidirectional friendships
        await prisma.$transaction([
            prisma.friendRequest.update({
                where: { id: requestId },
                data: { status: 'accepted' }
            }),
            prisma.friendship.create({
                data: { userId: request.senderId, friendId: request.receiverId }
            }),
            prisma.friendship.create({
                data: { userId: request.receiverId, friendId: request.senderId }
            })
        ]);
    }

    /**
     * Reject a friend request
     */
    async rejectFriendRequest(requestId) {
        await prisma.friendRequest.update({
            where: { id: requestId },
            data: { status: 'rejected' }
        });
    }

    /**
     * Get pending friend requests for a user
     */
    async getPendingRequests(userId) {
        return await prisma.friendRequest.findMany({
            where: {
                receiverId: userId,
                status: 'pending'
            },
            include: {
                sender: {
                    select: { id: true, username: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get friend recommendations (users with similar solve times)
     */
    async getRecommendations(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { bestSolve: true }
        });

        // Get existing friends
        const friendships = await prisma.friendship.findMany({
            where: { userId },
            select: { friendId: true }
        });
        const friendIds = friendships.map(f => f.friendId);

        // Get pending requests
        const pendingRequests = await prisma.friendRequest.findMany({
            where: {
                OR: [
                    { senderId: userId, status: 'pending' },
                    { receiverId: userId, status: 'pending' }
                ]
            }
        });
        const pendingUserIds = pendingRequests.map(r =>
            r.senderId === userId ? r.receiverId : r.senderId
        );

        const excludeIds = [userId, ...friendIds, ...pendingUserIds];

        // Find users with similar times (or random if no times)
        if (user?.bestSolve) {
            const range = 5000; // 5 second range
            return await prisma.user.findMany({
                where: {
                    id: { notIn: excludeIds },
                    bestSolve: {
                        gte: user.bestSolve - range,
                        lte: user.bestSolve + range
                    }
                },
                take: 10,
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    bestSolve: true,
                    totalSolves: true
                },
                orderBy: { totalSolves: 'desc' }
            });
        }

        // Return random users if no solve times
        return await prisma.user.findMany({
            where: { id: { notIn: excludeIds } },
            take: 10,
            select: {
                id: true,
                username: true,
                avatar: true,
                bestSolve: true,
                totalSolves: true
            },
            orderBy: { totalSolves: 'desc' }
        });
    }

    /**
     * Remove a friend
     */
    async removeFriend(userId, friendId) {
        await prisma.$transaction([
            prisma.friendship.delete({
                where: { userId_friendId: { userId, friendId } }
            }),
            prisma.friendship.delete({
                where: { userId_friendId: { userId: friendId, friendId: userId } }
            })
        ]);
    }
}

module.exports = new FriendsService();
