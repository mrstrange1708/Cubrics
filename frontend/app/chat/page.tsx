'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Send, Search, ArrowLeft, Circle, MoreVertical, Phone, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { friendsApi, Friend } from '@/api/friends.api';
import { messagesApi, Message } from '@/api/messages.api';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import ProtectedRoute from '@/components/ProtectedRoute';

function ChatPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { isConnected, onlineUsers, sendMessage, lastMessage, typingUsers, setTyping } = useSocket();

    const [friends, setFriends] = useState<Friend[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load friends on mount
    useEffect(() => {
        if (user?.id) {
            loadFriends();
        }
    }, [user?.id]);

    // Check URL params for friend to open
    useEffect(() => {
        const friendId = searchParams.get('userId');
        if (friendId && friends.length > 0) {
            const friend = friends.find(f => f.id === friendId);
            if (friend) {
                selectFriend(friend);
            }
        }
    }, [searchParams, friends]);

    // Handle new messages from socket
    useEffect(() => {
        if (lastMessage && selectedFriend) {
            // Check if message is for current conversation
            if (
                (lastMessage.senderId === selectedFriend.id && lastMessage.receiverId === user?.id) ||
                (lastMessage.senderId === user?.id && lastMessage.receiverId === selectedFriend.id)
            ) {
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.some(m => m.id === lastMessage.id)) return prev;
                    return [...prev, lastMessage];
                });
            }
        }
    }, [lastMessage, selectedFriend, user?.id]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadFriends = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const data = await friendsApi.getFriends(user.id);
            setFriends(data);
        } catch (error) {
            console.error('Failed to load friends:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectFriend = async (friend: Friend) => {
        setSelectedFriend(friend);
        if (!user?.id) return;

        try {
            const msgs = await messagesApi.getConversation(user.id, friend.id);
            setMessages(msgs);
            await messagesApi.markAsRead(friend.id, user.id);
        } catch (error) {
            console.error('Failed to load messages:', error);
            setMessages([]);
        }

        inputRef.current?.focus();
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedFriend || !user?.id) return;

        sendMessage(selectedFriend.id, newMessage.trim());
        setNewMessage('');
        setTyping(selectedFriend.id, false);
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        if (selectedFriend) {
            setTyping(selectedFriend.id, e.target.value.length > 0);
        }
    };

    const filteredFriends = friends.filter(f =>
        f.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isOnline = (userId: string) => onlineUsers.includes(userId);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Navbar />

            <main className="pt-24 h-screen">
                <div className="h-[calc(100vh-6rem)] max-w-7xl mx-auto flex">
                    {/* Left Panel - Friends List */}
                    <div className={cn(
                        "w-full md:w-80 border-r border-white/10 flex flex-col bg-[#111]",
                        selectedFriend && "hidden md:flex"
                    )}>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10">
                            <div className="flex items-center gap-3 mb-3">
                                <button
                                    onClick={() => router.push('/explore')}
                                    className="p-2 hover:bg-white/10 rounded-full md:hidden"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <h2 className="text-lg font-bold">Messages</h2>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                <input
                                    type="text"
                                    placeholder="Search friends..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder-neutral-500 focus:border-blue-500/50 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Friends */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-center text-neutral-500 text-sm">Loading...</div>
                            ) : filteredFriends.length === 0 ? (
                                <div className="p-4 text-center text-neutral-500 text-sm">
                                    No friends yet. Add friends from Explore page!
                                </div>
                            ) : (
                                filteredFriends.map(friend => (
                                    <button
                                        key={friend.id}
                                        onClick={() => selectFriend(friend)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors",
                                            selectedFriend?.id === friend.id && "bg-white/10"
                                        )}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-lg font-bold">
                                                {friend.username[0].toUpperCase()}
                                            </div>
                                            {isOnline(friend.id) && (
                                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#111]" />
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="font-medium truncate">{friend.username}</div>
                                            <div className="text-xs text-neutral-500 truncate">
                                                {isOnline(friend.id) ? 'Online' : 'Offline'}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Chat */}
                    <div className={cn(
                        "flex-1 flex flex-col bg-[#0a0a0a]",
                        !selectedFriend && "hidden md:flex"
                    )}>
                        {selectedFriend ? (
                            <>
                                {/* Chat Header */}
                                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#111]">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedFriend(null)}
                                            className="p-2 hover:bg-white/10 rounded-full md:hidden"
                                        >
                                            <ArrowLeft size={20} />
                                        </button>
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold">
                                                {selectedFriend.username[0].toUpperCase()}
                                            </div>
                                            {isOnline(selectedFriend.id) && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111]" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">{selectedFriend.username}</div>
                                            <div className="text-xs text-neutral-500">
                                                {typingUsers.get(selectedFriend.id)
                                                    ? 'Typing...'
                                                    : isOnline(selectedFriend.id) ? 'Online' : 'Offline'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-white/10 rounded-full text-neutral-400">
                                            <Phone size={20} />
                                        </button>
                                        <button className="p-2 hover:bg-white/10 rounded-full text-neutral-400">
                                            <Video size={20} />
                                        </button>
                                        <button className="p-2 hover:bg-white/10 rounded-full text-neutral-400">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex items-center justify-center">
                                            <div className="text-center text-neutral-500">
                                                <p className="text-lg mb-1">No messages yet</p>
                                                <p className="text-sm">Say hello to {selectedFriend.username}!</p>
                                            </div>
                                        </div>
                                    ) : (
                                        messages.map((msg, index) => {
                                            const isOwn = msg.senderId === user?.id;
                                            return (
                                                <motion.div
                                                    key={msg.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                                                >
                                                    <div
                                                        className={cn(
                                                            "max-w-[70%] px-4 py-2 rounded-2xl",
                                                            isOwn
                                                                ? "bg-blue-600 text-white rounded-br-md"
                                                                : "bg-white/10 text-white rounded-bl-md"
                                                        )}
                                                    >
                                                        <p className="text-sm">{msg.content}</p>
                                                        <p className={cn(
                                                            "text-[10px] mt-1",
                                                            isOwn ? "text-blue-200" : "text-neutral-500"
                                                        )}>
                                                            {formatTime(msg.createdAt)}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className="p-4 border-t border-white/10 bg-[#111]">
                                    <div className="flex items-center gap-3">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={handleTyping}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-full text-sm text-white placeholder-neutral-500 focus:border-blue-500/50 focus:outline-none"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                            className="p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-full transition-colors"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
                                <div className="text-center text-neutral-500">
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                        <Send size={32} className="text-neutral-600" />
                                    </div>
                                    <p className="text-lg mb-1">Select a conversation</p>
                                    <p className="text-sm">Choose a friend to start chatting</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ChatPage() {
    return (
        <ProtectedRoute>
            <ChatPageContent />
        </ProtectedRoute>
    );
}
