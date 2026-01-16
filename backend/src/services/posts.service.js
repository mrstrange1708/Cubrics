const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PostsService {
    /**
     * Create a new post
     */
    async createPost(userId, content, timerRecordId = null) {
        return await prisma.post.create({
            data: {
                userId,
                content,
                timerRecordId
            },
            include: {
                user: {
                    select: { id: true, username: true, avatar: true }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            }
        });
    }

    /**
     * Get feed posts (from all users or just friends)
     */
    async getFeed(userId, limit = 20, offset = 0, friendsOnly = false) {
        let whereClause = {};

        if (friendsOnly && userId) {
            // Get friend IDs
            const friendships = await prisma.friendship.findMany({
                where: { userId },
                select: { friendId: true }
            });
            const friendIds = friendships.map(f => f.friendId);
            friendIds.push(userId); // Include own posts

            whereClause = { userId: { in: friendIds } };
        }

        return await prisma.post.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
            skip: Number(offset),
            include: {
                user: {
                    select: { id: true, username: true, avatar: true, bestSolve: true }
                },
                comments: {
                    take: 3,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { id: true, username: true, avatar: true }
                        }
                    }
                },
                likes: {
                    select: { userId: true }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            }
        });
    }

    /**
     * Get single post by ID
     */
    async getPost(postId) {
        return await prisma.post.findUnique({
            where: { id: postId },
            include: {
                user: {
                    select: { id: true, username: true, avatar: true }
                },
                comments: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        user: {
                            select: { id: true, username: true, avatar: true }
                        }
                    }
                },
                likes: {
                    select: { userId: true }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            }
        });
    }

    /**
     * Like a post
     */
    async likePost(postId, userId) {
        // Check if already liked
        const existingLike = await prisma.like.findUnique({
            where: {
                postId_userId: { postId, userId }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: { id: existingLike.id }
            });
            return { liked: false };
        }

        // Like
        await prisma.like.create({
            data: { postId, userId }
        });
        return { liked: true };
    }

    /**
     * Add a comment
     */
    async addComment(postId, userId, content) {
        return await prisma.comment.create({
            data: {
                postId,
                userId,
                content
            },
            include: {
                user: {
                    select: { id: true, username: true, avatar: true }
                }
            }
        });
    }

    /**
     * Delete a post
     */
    async deletePost(postId, userId) {
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post || post.userId !== userId) {
            throw new Error('Unauthorized');
        }

        await prisma.post.delete({
            where: { id: postId }
        });
    }

    /**
     * Delete a comment
     */
    async deleteComment(commentId, userId) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment || comment.userId !== userId) {
            throw new Error('Unauthorized');
        }

        await prisma.comment.delete({
            where: { id: commentId }
        });
    }
}

module.exports = new PostsService();
