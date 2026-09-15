'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';
import {
    Trophy, Users, Heart, FileText, Clock, Settings, MessageCircle,
    UserPlus, UserMinus, Share2, ArrowLeft, Sparkles, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { userApi, UserProfile } from '@/api/user.api';
import { Post } from '@/api/posts.api';
import { Friend } from '@/api/friends.api';
import { friendsApi } from '@/api/friends.api';
import { leaderboardApi } from '@/api/leaderboard.api';
import { postsApi } from '@/api/posts.api';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { Skeleton, PostSkeleton } from '@/components/ui/skeleton';

type Tab = 'posts' | 'liked' | 'friends';

function ProfilePageContent() {
    const params = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const { onlineUsers } = useSocket();
    const userId = params.userId as string;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [likedPosts, setLikedPosts] = useState<Post[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [userRank, setUserRank] = useState<{ rank: number; percentile: number; totalPlayers: number } | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('posts');
    const [isLoading, setIsLoading] = useState(true);
    const [isFriend, setIsFriend] = useState(false);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);

    const isOwnProfile = currentUser?.id === userId;

    useEffect(() => {
        if (userId) {
            fetchProfileData();
        }
    }, [userId]);

    const fetchProfileData = async () => {
        setIsLoading(true);
        try {
            // All requests are independent: run them in parallel.
            // Friendship status and rank are optional and never fail the page.
            const [profileData, postsData, likedData, friendsData] = await Promise.all([
                userApi.getProfile(userId),
                userApi.getUserPosts(userId),
                userApi.getLikedPosts(userId),
                userApi.getUserFriends(userId),
                currentUser?.id && currentUser.id !== userId
                    ? friendsApi.getFriends(currentUser.id)
                        .then(myFriends => setIsFriend(myFriends.some(f => f.id === userId)))
                        .catch(() => setIsFriend(false))
                    : null,
                leaderboardApi.getUserRank(userId)
                    .then(setUserRank)
                    .catch(() => setUserRank(null)),
            ]);
            setProfile(profileData);
            setPosts(postsData);
            setLikedPosts(likedData);
            setFriends(friendsData);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendFriendRequest = async () => {
        if (!currentUser?.id) return;
        try {
            await friendsApi.sendFriendRequest(currentUser.id, userId);
            setHasPendingRequest(true);
            toast.success('Friend request sent!');
        } catch (error) {
            toast.error('Failed to send request');
        }
    };

    const handleRemoveFriend = async () => {
        if (!currentUser?.id) return;
        try {
            await friendsApi.removeFriend(currentUser.id, userId);
            setIsFriend(false);
            toast.success('Friend removed');
        } catch (error) {
            toast.error('Failed to remove friend');
        }
    };

    const handleLikePost = async (postId: string) => {
        if (!currentUser?.id) return;
        try {
            const result = await postsApi.likePost(postId, currentUser.id);
            const updatePostLike = (post: Post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        likes: result.liked
                            ? [...post.likes, { userId: currentUser.id }]
                            : post.likes.filter(l => l.userId !== currentUser.id),
                        _count: {
                            ...post._count,
                            likes: result.liked ? post._count.likes + 1 : post._count.likes - 1
                        }
                    };
                }
                return post;
            };
            setPosts(prev => prev.map(updatePostLike));
            setLikedPosts(prev => prev.map(updatePostLike));
        } catch (error) {
            console.error("Failed to like post:", error);
        }
    };

    const formatTime = (ms: number) => {
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor(ms % 1000);
        return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
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

    const isOnline = (id: string) => onlineUsers.includes(id);

    const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
        { id: 'posts', label: 'Posts', icon: <FileText size={16} />, count: posts.length },
        { id: 'liked', label: 'Liked', icon: <Heart size={16} />, count: likedPosts.length },
        { id: 'friends', label: 'Friends', icon: <Users size={16} />, count: friends.length },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white">
                <Navbar />
                <main className="container mx-auto py-24 px-4 max-w-4xl" aria-busy="true" aria-label="Loading profile">
                    {/* Header */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <Skeleton className="w-24 h-24 rounded-full shrink-0" />
                            <div className="flex-1 w-full flex flex-col items-center sm:items-start gap-3">
                                <Skeleton className="h-7 w-40" />
                                <Skeleton className="h-4 w-64 max-w-full" />
                                <div className="flex gap-3 mt-2">
                                    <Skeleton className="h-8 w-28 rounded-full" />
                                    <Skeleton className="h-8 w-24 rounded-full" />
                                    <Skeleton className="h-8 w-24 rounded-full" />
                                </div>
                                <Skeleton className="h-10 w-32 rounded-lg mt-2" />
                            </div>
                        </div>
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        {[0, 1, 2].map(i => <Skeleton key={i} className="h-11 w-28 rounded-xl" />)}
                    </div>
                    {/* Posts */}
                    <div className="space-y-4">
                        <PostSkeleton />
                        <PostSkeleton />
                    </div>
                </main>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-screen">
                    <Sparkles size={48} className="text-neutral-600 mb-4" />
                    <p className="text-neutral-400">User not found</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={16} /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
            <Navbar />

            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
                <BackgroundRippleEffect />
            </div>

            <main className="relative z-10 container mx-auto py-24 px-4 max-w-4xl">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-6"
                >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-500/20">
                                {profile.username[0].toUpperCase()}
                            </div>
                            {isOnline(userId) && (
                                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#111]" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold">{profile.username}</h1>
                            {profile.bio && (
                                <p className="text-neutral-400 mt-1">{profile.bio}</p>
                            )}

                            {/* Stats Row */}
                            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                                {profile.bestSolve && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                        <Trophy size={14} className="text-blue-400" />
                                        <span className="text-sm font-medium text-blue-300">Best: {formatTime(profile.bestSolve)}</span>
                                    </div>
                                )}
                                {userRank && userRank.percentile != null && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
                                        <TrendingUp size={14} className="text-purple-400" />
                                        <span className="text-sm font-medium text-purple-300">Top {userRank.percentile.toFixed(1)}%</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                                    <Clock size={14} className="text-neutral-400" />
                                    <span className="text-sm text-neutral-300">{profile.totalSolves} solves</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                                {isOwnProfile ? (
                                    <button
                                        onClick={() => router.push('/settings')}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                                    >
                                        <Settings size={16} /> Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        {isFriend ? (
                                            <>
                                                <button
                                                    onClick={() => router.push(`/chat?userId=${userId}`)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                                                >
                                                    <MessageCircle size={16} /> Message
                                                </button>
                                                <button
                                                    onClick={handleRemoveFriend}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                                                >
                                                    <UserMinus size={16} /> Remove
                                                </button>
                                            </>
                                        ) : hasPendingRequest ? (
                                            <button
                                                disabled
                                                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-neutral-400 rounded-lg cursor-not-allowed"
                                            >
                                                <Clock size={16} /> Pending
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleSendFriendRequest}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                                            >
                                                <UserPlus size={16} /> Add Friend
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-blue-600 text-white"
                                    : "bg-[#111] border border-white/5 text-neutral-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs",
                                activeTab === tab.id ? "bg-white/20" : "bg-white/10"
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'posts' && (
                        <motion.div
                            key="posts"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {posts.length === 0 ? (
                                <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
                                    <FileText size={48} className="mx-auto text-neutral-600 mb-4" />
                                    <p className="text-neutral-400">No posts yet</p>
                                </div>
                            ) : (
                                posts.map(post => (
                                    <div key={post.id} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                                        <div className="flex items-start justify-between p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold">
                                                    {post.user.username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{post.user.username}</div>
                                                    <div className="text-xs text-neutral-500">{timeAgo(post.createdAt)}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-4 pb-4">
                                            <p className="text-neutral-200 whitespace-pre-wrap">{post.content}</p>
                                        </div>
                                        <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4">
                                            <button
                                                onClick={() => handleLikePost(post.id)}
                                                className={cn(
                                                    "flex items-center gap-2 text-sm transition-colors",
                                                    post.likes.some(l => l.userId === currentUser?.id)
                                                        ? "text-red-400"
                                                        : "text-neutral-400 hover:text-white"
                                                )}
                                            >
                                                <Heart size={16} fill={post.likes.some(l => l.userId === currentUser?.id) ? "currentColor" : "none"} />
                                                {post._count.likes}
                                            </button>
                                            <span className="text-sm text-neutral-500">
                                                <MessageCircle size={16} className="inline mr-1" />
                                                {post._count.comments}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'liked' && (
                        <motion.div
                            key="liked"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {likedPosts.length === 0 ? (
                                <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
                                    <Heart size={48} className="mx-auto text-neutral-600 mb-4" />
                                    <p className="text-neutral-400">No liked posts yet</p>
                                </div>
                            ) : (
                                likedPosts.map(post => (
                                    <div key={post.id} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                                        <div className="flex items-start justify-between p-4">
                                            <div
                                                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => router.push(`/profile/${post.user.id}`)}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold">
                                                    {post.user.username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{post.user.username}</div>
                                                    <div className="text-xs text-neutral-500">{timeAgo(post.createdAt)}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-4 pb-4">
                                            <p className="text-neutral-200 whitespace-pre-wrap">{post.content}</p>
                                        </div>
                                        <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4">
                                            <button
                                                onClick={() => handleLikePost(post.id)}
                                                className={cn(
                                                    "flex items-center gap-2 text-sm transition-colors",
                                                    post.likes.some(l => l.userId === currentUser?.id)
                                                        ? "text-red-400"
                                                        : "text-neutral-400 hover:text-white"
                                                )}
                                            >
                                                <Heart size={16} fill={post.likes.some(l => l.userId === currentUser?.id) ? "currentColor" : "none"} />
                                                {post._count.likes}
                                            </button>
                                            <span className="text-sm text-neutral-500">
                                                <MessageCircle size={16} className="inline mr-1" />
                                                {post._count.comments}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'friends' && (
                        <motion.div
                            key="friends"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {friends.length === 0 ? (
                                <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
                                    <Users size={48} className="mx-auto text-neutral-600 mb-4" />
                                    <p className="text-neutral-400">No friends yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {friends.map(friend => (
                                        <div
                                            key={friend.id}
                                            onClick={() => router.push(`/profile/${friend.id}`)}
                                            className="bg-[#111] border border-white/5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                                        >
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-lg font-bold">
                                                    {friend.username[0].toUpperCase()}
                                                </div>
                                                {isOnline(friend.id) && (
                                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#111]" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{friend.username}</p>
                                                {friend.bestSolve && (
                                                    <p className="text-xs text-blue-400 flex items-center gap-1 mt-0.5">
                                                        <Trophy size={10} />
                                                        {formatTime(friend.bestSolve)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default function ProfileUserPage() {
    return (
        <ProtectedRoute>
            <ProfilePageContent />
        </ProtectedRoute>
    );
}
