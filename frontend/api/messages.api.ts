import api from '@/lib/api';

export interface MessageUser {
    id: string;
    username: string;
    avatar: string | null;
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    read: boolean;
    createdAt: string;
    sender?: MessageUser;
    receiver?: MessageUser;
}

export interface Conversation {
    user: MessageUser;
    lastMessage: Message;
    unreadCount: number;
}

export const messagesApi = {
    // Send a message
    sendMessage: async (senderId: string, receiverId: string, content: string): Promise<Message> => {
        const response = await api.post<Message>('/messages', { senderId, receiverId, content });
        return response.data;
    },

    // Get all conversations
    getConversations: async (userId: string): Promise<Conversation[]> => {
        const response = await api.get<Conversation[]>(`/messages/conversations/${userId}`);
        return response.data;
    },

    // Get conversation with a specific user
    getConversation: async (userId: string, otherUserId: string, limit = 50): Promise<Message[]> => {
        const response = await api.get<Message[]>(`/messages/${userId}/${otherUserId}?limit=${limit}`);
        return response.data;
    },

    // Mark messages as read
    markAsRead: async (senderId: string, receiverId: string): Promise<void> => {
        await api.post('/messages/read', { senderId, receiverId });
    },

    // Get unread count
    getUnreadCount: async (userId: string): Promise<number> => {
        const response = await api.get<{ count: number }>(`/messages/unread/${userId}`);
        return response.data.count;
    }
};
