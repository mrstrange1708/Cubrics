import api from '@/lib/api';

export interface FriendRequest {
    id: string;
    senderId: string;
    receiverId: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    sender?: {
        id: string;
        username: string;
        avatar: string | null;
    };
    receiver?: {
        id: string;
        username: string;
        avatar: string | null;
    };
}

export interface Friend {
    id: string;
    username: string;
    avatar: string | null;
    bestSolve: number | null;
    totalSolves: number;
}

export interface FriendWithTimes extends Friend {
    times: {
        id: string;
        time: number;
        createdAt: string;
    }[];
}

export const friendsApi = {
    // Get user's friends
    getFriends: async (userId: string): Promise<Friend[]> => {
        const response = await api.get<Friend[]>(`/friends/${userId}`);
        return response.data;
    },

    // Get friends with their times (for leaderboard)
    getFriendsWithTimes: async (userId: string): Promise<FriendWithTimes[]> => {
        const response = await api.get<FriendWithTimes[]>(`/friends/${userId}/times`);
        return response.data;
    },

    // Send friend request
    sendFriendRequest: async (senderId: string, receiverId: string): Promise<FriendRequest> => {
        const response = await api.post<FriendRequest>('/friends/request', { senderId, receiverId });
        return response.data;
    },

    // Accept friend request
    acceptFriendRequest: async (requestId: string): Promise<void> => {
        await api.post(`/friends/request/${requestId}/accept`);
    },

    // Reject friend request
    rejectFriendRequest: async (requestId: string): Promise<void> => {
        await api.post(`/friends/request/${requestId}/reject`);
    },

    // Get pending friend requests
    getPendingRequests: async (userId: string): Promise<FriendRequest[]> => {
        const response = await api.get<FriendRequest[]>(`/friends/${userId}/requests`);
        return response.data;
    },

    // Get friend recommendations
    getRecommendations: async (userId: string): Promise<Friend[]> => {
        const response = await api.get<Friend[]>(`/friends/${userId}/recommendations`);
        return response.data;
    },

    // Remove friend
    removeFriend: async (userId: string, friendId: string): Promise<void> => {
        await api.delete(`/friends/${userId}/${friendId}`);
    }
};
