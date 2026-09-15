'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    read: boolean;
    createdAt: string;
    sender?: {
        id: string;
        username: string;
        avatar: string | null;
    };
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: string[];
    sendMessage: (receiverId: string, content: string) => void;
    setTyping: (receiverId: string, isTyping: boolean) => void;
    typingUsers: Map<string, boolean>;
    lastMessage: Message | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7777';

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());
    const [lastMessage, setLastMessage] = useState<Message | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Create socket connection (server authenticates with the JWT)
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            auth: { token: localStorage.getItem('token') },
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);

            // Announce user is online
            newSocket.emit('user-online');

            // Request online users
            newSocket.emit('get-online-users');
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('online-users', (users: string[]) => {
            setOnlineUsers(users);
        });

        newSocket.on('user-status-change', (data: { userId: string; status: string }) => {
            setOnlineUsers(prev => {
                if (data.status === 'online') {
                    return prev.includes(data.userId) ? prev : [...prev, data.userId];
                } else {
                    return prev.filter(id => id !== data.userId);
                }
            });
        });

        newSocket.on('receive-message', (message: Message) => {
            setLastMessage(message);
        });

        newSocket.on('message-sent', (message: Message) => {
            setLastMessage(message);
        });

        newSocket.on('user-typing', (data: { userId: string; isTyping: boolean }) => {
            setTypingUsers(prev => {
                const newMap = new Map(prev);
                if (data.isTyping) {
                    newMap.set(data.userId, true);
                } else {
                    newMap.delete(data.userId);
                }
                return newMap;
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
        // Reconnect only when the logged-in account changes, not on profile edits
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user?.id]);

    const sendMessage = useCallback((receiverId: string, content: string) => {
        if (socket && user) {
            socket.emit('send-message', {
                receiverId,
                content
            });
        }
    }, [socket, user]);

    const setTyping = useCallback((receiverId: string, isTyping: boolean) => {
        if (socket && user) {
            socket.emit('typing', {
                receiverId,
                isTyping
            });
        }
    }, [socket, user]);

    const value = {
        socket,
        isConnected,
        onlineUsers,
        sendMessage,
        setTyping,
        typingUsers,
        lastMessage
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}

export default SocketContext;
