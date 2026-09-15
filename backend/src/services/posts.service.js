const prisma = require('../lib/prisma');

// Shared post shape for lists. `likes` holds at most the viewer's own like,
// so the client's `likes.some(l => l.userId === me)` check keeps working.
const feedInclude = (viewerId) => ({
    user: {
        select: { id: true, username: true, avatar: true, bestSolve: true }
    },
    likes: {
        where: { userId: viewerId ?? '' },
        select: { userId: true }
    },
    _count: {
        select: { likes: true, comments: true }
    }
});

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
            // Same shape as feed posts so the client can prepend it directly
            include: feedInclude(userId)
        });
    }

    /**
     * Get feed posts (from all users or just friends).
     * Lean payload: the feed UI only needs counts and whether the viewer liked
     * each post, so comments and the full likes list are not loaded.
     */
    async getFeed(viewerId, limit = 20, offset = 0, friendsOnly = false) {
        const PINNED_POST_ID = '1';
        let whereClause = {};

        if (friendsOnly && viewerId) {
            const friendships = await prisma.friendship.findMany({
                where: { userId: viewerId },
                select: { friendId: true }
            });
            const friendIds = friendships.map(f => f.friendId);
            friendIds.push(viewerId); // Include own posts

            whereClause = { userId: { in: friendIds } };
        }

        const include = feedInclude(viewerId);
        const isFirstPage = Number(offset) === 0;

        // Regular posts and the pinned post are independent: query in parallel
        const [posts, pinnedPost] = await Promise.all([
            prisma.post.findMany({
                where: {
                    ...whereClause,
                    id: { not: PINNED_POST_ID }
                },
                orderBy: { createdAt: 'desc' },
                take: Number(limit),
                skip: Number(offset),
                include
            }),
            isFirstPage
                ? prisma.post.findUnique({ where: { id: PINNED_POST_ID }, include })
                : null
        ]);

        if (pinnedPost) {
            // Add a flag to identify it's pinned in the frontend
            return [{ ...pinnedPost, isPinned: true }, ...posts];
        }

        return posts;
    }

    /**
     * Get single post by ID (with all comments)
     */
    async getPost(postId, viewerId) {
        return await prisma.post.findUnique({
            where: { id: postId },
            include: {
                ...feedInclude(viewerId),
                comments: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        user: {
                            select: { id: true, username: true, avatar: true }
                        }
                    }
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
module.exports.feedInclude = feedInclude;
