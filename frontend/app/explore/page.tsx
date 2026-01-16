'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';
import {
    Heart, MessageCircle, Share2, Send, Image, Video, FileText,
    MoreHorizontal, Trophy, Users, UserPlus, MessageSquare, X,
    Sparkles, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { postsApi, Post } from '@/api/posts.api';
import { friendsApi, Friend } from '@/api/friends.api';
import { messagesApi, Conversation, Message } from '@/api/messages.api';
import { leaderboardApi } from '@/api/leaderboard.api';
import { toast } from 'react-toastify';
import ProtectedRoute from '@/components/ProtectedRoute';

function ExplorePageContent() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [recommendations, setRecommendations] = useState<Friend[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [userId, setUserId] = useState<string>('');
    const [userStats, setUserStats] = useState<{ rank: number; totalPlayers: number; bestSolve: number | null; percentile: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Post creation
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [showComposer, setShowComposer] = useState(false);

    // Chat
    const [selectedChat, setSelectedChat] = useState<Friend | null>(null);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const id = localStorage.getItem('cubex_user_id');
        if (id) {
            setUserId(id);
            fetchData(id);
        }
    }, []);

    const fetchData = async (userId: string) => {
        setIsLoading(true);
        try {
            // Fetch feed
            const feedData = await postsApi.getFeed(userId, 20, 0, false);
            setPosts(feedData);

            // Fetch friends
            try {
                const friendsData = await friendsApi.getFriends(userId);
                setFriends(friendsData);
            } catch { setFriends([]); }

            // Fetch recommendations
            try {
                const recsData = await friendsApi.getRecommendations(userId);
                setRecommendations(recsData);
            } catch { setRecommendations([]); }

            // Fetch conversations
            try {
                const convData = await messagesApi.getConversations(userId);
                setConversations(convData);
            } catch { setConversations([]); }

            // Fetch user stats
            try {
                const rankData = await leaderboardApi.getUserRank(userId);
                setUserStats({
                    rank: rankData.rank,
                    totalPlayers: rankData.totalPlayers,
                    bestSolve: rankData.bestSolve,
                    percentile: rankData.percentile
                });
            } catch { setUserStats(null); }

        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() || !userId) return;

        setIsPosting(true);
        try {
            const newPost = await postsApi.createPost(userId, newPostContent);
            setPosts(prev => [newPost, ...prev]);
            setNewPostContent('');
            setShowComposer(false);
            toast.success('Post created!');
        } catch (error) {
            console.error("Failed to create post:", error);
            toast.error('Failed to create post');
        } finally {
            setIsPosting(false);
        }
    };

    const handleLikePost = async (postId: string) => {
        try {
            const result = await postsApi.likePost(postId, userId);
            setPosts(prev => prev.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        likes: result.liked
                            ? [...post.likes, { userId }]
                            : post.likes.filter(l => l.userId !== userId),
                        _count: {
                            ...post._count,
                            likes: result.liked ? post._count.likes + 1 : post._count.likes - 1
                        }
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error("Failed to like post:", error);
        }
    };

    const handleSendFriendRequest = async (friendId: string) => {
        try {
            await friendsApi.sendFriendRequest(userId, friendId);
            setRecommendations(prev => prev.filter(r => r.id !== friendId));
            toast.success('Friend request sent!');
        } catch (error) {
            console.error("Failed to send request:", error);
            toast.error('Failed to send request');
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        try {
            const msg = await messagesApi.sendMessage(userId, selectedChat.id, newMessage);
            setChatMessages(prev => [...prev, msg]);
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const openChat = async (friend: Friend) => {
        setSelectedChat(friend);
        try {
            const messages = await messagesApi.getConversation(userId, friend.id);
            setChatMessages(messages);
            await messagesApi.markAsRead(friend.id, userId);
        } catch {
            setChatMessages([]);
        }
    };

    const formatTime = (ms: number) => {
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor(ms % 1000);
        return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
    };

    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
            <Navbar />

            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
                <BackgroundRippleEffect />
            </div>

            <main className="relative z-10 container mx-auto py-24 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">

                    {/* Left Sidebar - Profile */}
                    <aside className="lg:col-span-3 space-y-4">
                        {/* Profile Card */}
                        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                            {/* Banner */}
                            <div className="h-16 bg-gradient-to-r from-blue-600 to-purple-600" />

                            {/* Avatar & Info */}
                            <div className="px-4 pb-4 -mt-8">
                                <div className="w-16 h-16 rounded-full bg-[#222] border-4 border-[#111] flex items-center justify-center text-2xl font-bold text-blue-400 mb-2">
                                    {userId ? userId[0].toUpperCase() : 'U'}
                                </div>
                                <h3 className="font-bold text-lg">Cuber</h3>
                                <p className="text-sm text-neutral-500">Speedcubing enthusiast</p>

                                {userStats && (
                                    <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-center text-xs">
                                        <div>
                                            <div className="text-neutral-500">Rank</div>
                                            <div className="font-bold text-white">#{userStats.rank || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-neutral-500">Top %</div>
                                            <div className="font-bold text-green-400">{userStats.percentile || '-'}%</div>
                                        </div>
                                        <div>
                                            <div className="text-neutral-500">Best</div>
                                            <div className="font-mono font-bold text-blue-400">
                                                {userStats.bestSolve ? formatTime(userStats.bestSolve) : '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-neutral-500">Friends</div>
                                            <div className="font-bold text-white">{friends.length}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-400">Profile viewers</span>
                                <span className="text-blue-400 font-bold">{Math.floor(Math.random() * 100) + 10}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-400">Post impressions</span>
                                <span className="text-blue-400 font-bold">{Math.floor(Math.random() * 500) + 50}</span>
                            </div>
                        </div>
                    </aside>

                    {/* Main Feed */}
                    <div className="lg:col-span-6 space-y-4">
                        {/* Post Composer */}
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
                            <div
                                className="flex items-center gap-4 cursor-pointer"
                                onClick={() => setShowComposer(true)}
                            >
                                <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center text-blue-400 font-bold">
                                    {userId ? userId[0].toUpperCase() : 'U'}
                                </div>
                                <div className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-white/10 rounded-full px-5 py-3 text-neutral-400 text-sm transition-colors">
                                    Share your thoughts...
                                </div>
                            </div>

                            {/* Post Type Buttons */}
                            <div className="flex items-center justify-around mt-4 pt-3 border-t border-white/5">
                                <button className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                    <Video size={20} className="text-green-500" />
                                    Video
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                    <Image size={20} className="text-blue-500" />
                                    Photo
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                    <FileText size={20} className="text-orange-500" />
                                    Article
                                </button>
                            </div>
                        </div>

                        {/* Composer Modal */}
                        <AnimatePresence>
                            {showComposer && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                                    onClick={() => setShowComposer(false)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.95, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.95, y: 20 }}
                                        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                                            <h3 className="font-bold text-lg">Create a post</h3>
                                            <button
                                                onClick={() => setShowComposer(false)}
                                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-start gap-3 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center text-blue-400 font-bold">
                                                    {userId ? userId[0].toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-medium">Cuber</div>
                                                    <div className="text-xs text-neutral-500">Post to Everyone</div>
                                                </div>
                                            </div>

                                            <textarea
                                                value={newPostContent}
                                                onChange={(e) => setNewPostContent(e.target.value)}
                                                placeholder="What do you want to talk about?"
                                                className="w-full bg-transparent border-none outline-none resize-none text-white placeholder-neutral-500 text-lg min-h-[150px]"
                                                autoFocus
                                            />

                                            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                                    <Image size={20} className="text-blue-400" />
                                                </button>
                                                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                                    <Video size={20} className="text-green-400" />
                                                </button>
                                                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                                    <Sparkles size={20} className="text-purple-400" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-4 border-t border-white/5">
                                            <button
                                                onClick={handleCreatePost}
                                                disabled={!newPostContent.trim() || isPosting}
                                                className={cn(
                                                    "w-full py-3 rounded-full font-bold transition-all",
                                                    newPostContent.trim()
                                                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                                                        : "bg-white/10 text-neutral-500 cursor-not-allowed"
                                                )}
                                            >
                                                {isPosting ? 'Posting...' : 'Post'}
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Feed Sort */}
                        <div className="flex items-center justify-between text-sm px-2">
                            <div className="h-px flex-1 bg-white/10" />
                            <span className="px-4 text-neutral-500">Sort by: <span className="text-white">Top</span></span>
                        </div>

                        {/* Posts */}
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
                                <Sparkles size={48} className="mx-auto text-neutral-600 mb-4" />
                                <div className="text-neutral-400 font-medium">No posts yet</div>
                                <div className="text-sm text-neutral-600 mt-1">Be the first to share something!</div>
                            </div>
                        ) : (
                            posts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden"
                                >
                                    {/* Post Header */}
                                    <div className="flex items-start justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center text-lg font-bold text-blue-400">
                                                {post.user.avatar ? (
                                                    <img src={post.user.avatar} alt="" className="w-full h-full rounded-full" />
                                                ) : (
                                                    post.user.username[0].toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">{post.user.username}</div>
                                                <div className="text-xs text-neutral-500 flex items-center gap-2">
                                                    {timeAgo(post.createdAt)}
                                                    {post.user.bestSolve && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-blue-400 flex items-center gap-1">
                                                                <Trophy size={10} />
                                                                {formatTime(post.user.bestSolve)}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                            <MoreHorizontal size={20} className="text-neutral-400" />
                                        </button>
                                    </div>

                                    {/* Post Content */}
                                    <div className="px-4 pb-4">
                                        <p className="text-neutral-200 whitespace-pre-wrap">{post.content}</p>
                                    </div>

                                    {/* Post Stats */}
                                    <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-xs text-neutral-500">
                                        <span>{post._count.likes} likes</span>
                                        <span>{post._count.comments} comments</span>
                                    </div>

                                    {/* Post Actions */}
                                    <div className="px-4 py-2 border-t border-white/5 flex items-center justify-around">
                                        <button
                                            onClick={() => handleLikePost(post.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                                                post.likes.some(l => l.userId === userId)
                                                    ? "text-red-400"
                                                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <Heart size={18} fill={post.likes.some(l => l.userId === userId) ? "currentColor" : "none"} />
                                            Like
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                            <MessageCircle size={18} />
                                            Comment
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                            <Share2 size={18} />
                                            Share
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Right Sidebar - Friends & Chat */}
                    <aside className="lg:col-span-3 space-y-4">
                        {/* Friend Recommendations */}
                        {recommendations.length > 0 && (
                            <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        <UserPlus size={16} className="text-blue-400" />
                                        Add Friends
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    {recommendations.slice(0, 3).map((rec) => (
                                        <div key={rec.id} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-sm font-bold text-blue-400">
                                                {rec.avatar ? (
                                                    <img src={rec.avatar} alt="" className="w-full h-full rounded-full" />
                                                ) : (
                                                    rec.username[0].toUpperCase()
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">{rec.username}</div>
                                                {rec.bestSolve && (
                                                    <div className="text-xs text-neutral-500">
                                                        Best: {formatTime(rec.bestSolve)}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleSendFriendRequest(rec.id)}
                                                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-full transition-colors"
                                            >
                                                <UserPlus size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Friends / Messages */}
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm flex items-center gap-2">
                                    <MessageSquare size={16} className="text-green-400" />
                                    Messaging
                                </h3>
                            </div>

                            {friends.length === 0 ? (
                                <div className="text-center py-6 text-neutral-500 text-sm">
                                    <Users size={32} className="mx-auto mb-2 opacity-50" />
                                    Add friends to start chatting
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {friends.slice(0, 5).map((friend) => (
                                        <button
                                            key={friend.id}
                                            onClick={() => openChat(friend)}
                                            className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-sm font-bold text-blue-400">
                                                {friend.avatar ? (
                                                    <img src={friend.avatar} alt="" className="w-full h-full rounded-full" />
                                                ) : (
                                                    friend.username[0].toUpperCase()
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">{friend.username}</div>
                                                <div className="text-xs text-neutral-500">Click to chat</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Trending */}
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
                            <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
                                <TrendingUp size={16} className="text-orange-400" />
                                Cubing News
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer">
                                    <div className="font-medium">New 3x3 Record?</div>
                                    <div className="text-xs text-neutral-500">Trending in #speedcubing</div>
                                </div>
                                <div className="hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer">
                                    <div className="font-medium">Competition Updates</div>
                                    <div className="text-xs text-neutral-500">5.2k cubers talking</div>
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            </main>

            {/* Chat Modal */}
            <AnimatePresence>
                {selectedChat && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-4 right-4 w-80 bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
                    >
                        {/* Chat Header */}
                        <div className="flex items-center justify-between p-3 border-b border-white/5 bg-[#0a0a0a]">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-xs font-bold text-blue-400">
                                    {selectedChat.username[0].toUpperCase()}
                                </div>
                                <span className="font-medium text-sm">{selectedChat.username}</span>
                            </div>
                            <button
                                onClick={() => setSelectedChat(null)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="h-64 overflow-y-auto p-3 space-y-2">
                            {chatMessages.length === 0 ? (
                                <div className="text-center text-neutral-500 text-sm py-8">
                                    Start a conversation!
                                </div>
                            ) : (
                                chatMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "max-w-[80%] p-2 rounded-xl text-sm",
                                            msg.senderId === userId
                                                ? "ml-auto bg-blue-500 text-white"
                                                : "bg-white/10 text-white"
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-3 border-t border-white/5 flex items-center gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500/50"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 rounded-full transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ExplorePage() {
    return (
        <ProtectedRoute>
            <ExplorePageContent />
        </ProtectedRoute>
    );
}
