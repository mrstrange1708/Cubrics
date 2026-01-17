import api from '@/lib/api';

export interface PostUser {
    id: string;
    username: string;
    avatar: string | null;
    bestSolve?: number | null;
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: string;
    user: PostUser;
}

export interface Post {
    id: string;
    userId: string;
    content: string;
    timerRecordId: string | null;
    createdAt: string;
    updatedAt: string;
    user: PostUser;
    comments: Comment[];
    likes: { userId: string }[];
    _count: {
        likes: number;
        comments: number;
    };
    isPinned?: boolean;
}

export const postsApi = {
    // Create a new post
    createPost: async (userId: string, content: string, timerRecordId?: string): Promise<Post> => {
        const response = await api.post<Post>('/posts', { userId, content, timerRecordId });
        return response.data;
    },

    // Get feed
    getFeed: async (userId?: string, limit = 20, offset = 0, friendsOnly = false): Promise<Post[]> => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());
        if (friendsOnly) params.append('friendsOnly', 'true');

        const response = await api.get<Post[]>(`/posts/feed?${params.toString()}`);
        return response.data;
    },

    // Get single post
    getPost: async (postId: string): Promise<Post> => {
        const response = await api.get<Post>(`/posts/${postId}`);
        return response.data;
    },

    // Like/unlike a post
    likePost: async (postId: string, userId: string): Promise<{ liked: boolean }> => {
        const response = await api.post<{ liked: boolean }>(`/posts/${postId}/like`, { userId });
        return response.data;
    },

    // Add comment
    addComment: async (postId: string, userId: string, content: string): Promise<Comment> => {
        const response = await api.post<Comment>(`/posts/${postId}/comment`, { userId, content });
        return response.data;
    },

    // Delete post
    deletePost: async (postId: string, userId: string): Promise<void> => {
        await api.delete(`/posts/${postId}`, { data: { userId } });
    }
};
