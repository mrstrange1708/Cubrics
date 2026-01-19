'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';
import {
    Heart, MessageCircle, Share2, Send, Image, Video, FileText,
    MoreHorizontal, Trophy, Users, UserPlus, MessageSquare, X,
    Sparkles, TrendingUp, Check, UserMinus, Search, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { postsApi, Post } from '@/api/posts.api';
import { friendsApi, Friend, FriendRequest } from '@/api/friends.api';
import { leaderboardApi } from '@/api/leaderboard.api';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

const POSTS_PER_PAGE = 5;

function ExplorePageContent() {
    const router = useRouter();
    const { user } = useAuth();
    const { onlineUsers } = useSocket();

    const [posts, setPosts] = useState<Post[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
    const [recommendations, setRecommendations] = useState<Friend[]>([]);
    const [userStats, setUserStats] = useState<{ rank: number; totalPlayers: number; bestSolve: number | null; percentile: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Lazy loading state
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [prefetchedPosts, setPrefetchedPosts] = useState<Post[]>([]);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // Post creation
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [showComposer, setShowComposer] = useState(false);

    // Friend request
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Friend[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchData(user.id);
        }
    }, [user?.id]);

    // Prefetch next batch of posts
    const prefetchNextBatch = useCallback(async (currentOffset: number) => {
        if (!user?.id || !hasMore) return;
        try {
            const nextBatch = await postsApi.getFeed(user.id, POSTS_PER_PAGE, currentOffset + POSTS_PER_PAGE, false);
            setPrefetchedPosts(nextBatch);
        } catch (error) {
            console.error("Prefetch failed:", error);
        }
    }, [user?.id, hasMore]);

    // Load more posts (infinite scroll)
    const loadMorePosts = useCallback(async () => {
        if (!user?.id || isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        try {
            const newOffset = offset + POSTS_PER_PAGE;

            // Use prefetched posts if available
            if (prefetchedPosts.length > 0) {
                setPosts(prev => [...prev, ...prefetchedPosts]);
                setOffset(newOffset);
                setHasMore(prefetchedPosts.length === POSTS_PER_PAGE);
                setPrefetchedPosts([]);
                // Prefetch next batch
                prefetchNextBatch(newOffset);
            } else {
                // Fetch new posts
                const morePosts = await postsApi.getFeed(user.id, POSTS_PER_PAGE, newOffset, false);
                if (morePosts.length > 0) {
                    setPosts(prev => [...prev, ...morePosts]);
                    setOffset(newOffset);
                    setHasMore(morePosts.length === POSTS_PER_PAGE);
                    // Prefetch next batch
                    prefetchNextBatch(newOffset);
                } else {
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error("Failed to load more posts:", error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [user?.id, offset, isLoadingMore, hasMore, prefetchedPosts, prefetchNextBatch]);

    // Setup IntersectionObserver for infinite scroll
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
                    loadMorePosts();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [hasMore, isLoadingMore, isLoading, loadMorePosts]);

    const fetchData = async (userId: string) => {
        setIsLoading(true);
        // Reset lazy loading state
        setOffset(0);
        setHasMore(true);
        setPrefetchedPosts([]);

        try {
            // Fetch initial batch of posts (smaller for faster load)
            const feedData = await postsApi.getFeed(userId, POSTS_PER_PAGE, 0, false);
            setPosts(feedData);
            setHasMore(feedData.length === POSTS_PER_PAGE);

            // Prefetch next batch immediately
            if (feedData.length === POSTS_PER_PAGE) {
                prefetchNextBatch(0);
            }

            // Fetch friends
            try {
                const friendsData = await friendsApi.getFriends(userId);
                setFriends(friendsData);
            } catch { setFriends([]); }

            // Fetch pending requests (received)
            try {
                const requests = await friendsApi.getPendingRequests(userId);
                setPendingRequests(requests);
            } catch { setPendingRequests([]); }

            // Fetch recommendations
            try {
                const recsData = await friendsApi.getRecommendations(userId);
                setRecommendations(recsData);
            } catch { setRecommendations([]); }

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
        if (!newPostContent.trim() || !user?.id) return;

        setIsPosting(true);
        try {
            const newPost = await postsApi.createPost(user.id, newPostContent);
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
        if (!user?.id) return;
        try {
            const result = await postsApi.likePost(postId, user.id);
            setPosts(prev => prev.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        likes: result.liked
                            ? [...post.likes, { userId: user.id }]
                            : post.likes.filter(l => l.userId !== user.id),
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
        if (!user?.id) return;
        try {
            await friendsApi.sendFriendRequest(user.id, friendId);
            setRecommendations(prev => prev.filter(r => r.id !== friendId));
            setSearchResults(prev => prev.filter(r => r.id !== friendId));
            toast.success('Friend request sent!');
        } catch (error) {
            console.error("Failed to send request:", error);
            toast.error('Failed to send request');
        }
    };

    const handleAcceptRequest = async (requestId: string) => {
        try {
            await friendsApi.acceptFriendRequest(requestId);
            const accepted = pendingRequests.find(r => r.id === requestId);
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
            if (accepted?.sender) {
                setFriends(prev => [...prev, {
                    id: accepted.sender!.id,
                    username: accepted.sender!.username,
                    avatar: accepted.sender!.avatar,
                    bestSolve: null,
                    totalSolves: 0
                }]);
            }
            toast.success('Friend request accepted!');
        } catch (error) {
            console.error("Failed to accept request:", error);
            toast.error('Failed to accept request');
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            await friendsApi.rejectFriendRequest(requestId);
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
            toast.success('Request rejected');
        } catch (error) {
            console.error("Failed to reject request:", error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim() || !user?.id) return;
        setIsSearching(true);
        try {
            const results = await friendsApi.getRecommendations(user.id);
            // Filter by search query
            const filtered = results.filter(u =>
                u.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(filtered);
        } catch (error) {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const openChat = (friendId: string) => {
        router.push(`/chat?userId=${friendId}`);
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

    const isOnline = (userId: string) => onlineUsers.includes(userId);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
            <Navbar />

            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
                <BackgroundRippleEffect />
            </div>

            <main className="relative z-10 container mx-auto py-24 px-4">
                {/* Mobile Quick Actions - Shown only on mobile */}
                <div className="lg:hidden space-y-4 mb-6">
                    {/* Horizontal scroll for quick actions */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {/* Add Friends */}
                        <div className="flex-shrink-0 bg-[#111] border border-white/5 rounded-xl p-3 min-w-[200px]">
                            <div className="flex items-center gap-2 mb-2">
                                <UserPlus size={14} className="text-blue-400" />
                                <span className="text-xs font-bold">Add Friends</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Username..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="flex-1 px-2 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none min-w-0"
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="px-2 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                                >
                                    <Search size={12} />
                                </button>
                            </div>
                        </div>

                        {/* Friend Requests Badge */}
                        {pendingRequests.length > 0 && (
                            <div className="flex-shrink-0 bg-[#111] border border-orange-500/20 rounded-xl p-3 min-w-[160px]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users size={14} className="text-orange-400" />
                                    <span className="text-xs font-bold">Requests</span>
                                    <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-[10px]">
                                        {pendingRequests.length}
                                    </span>
                                </div>
                                <div className="flex -space-x-2">
                                    {pendingRequests.slice(0, 3).map(req => (
                                        <div key={req.id} className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold border-2 border-[#111]">
                                            {req.sender?.username[0].toUpperCase()}
                                        </div>
                                    ))}
                                    {pendingRequests.length > 3 && (
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border-2 border-[#111]">
                                            +{pendingRequests.length - 3}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Messages Button */}
                        <button
                            onClick={() => router.push('/chat')}
                            className="flex-shrink-0 bg-[#111] border border-white/5 rounded-xl p-3 min-w-[140px] text-left hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare size={14} className="text-green-400" />
                                <span className="text-xs font-bold">Messages</span>
                            </div>
                            <div className="flex -space-x-2">
                                {friends.slice(0, 3).map(friend => (
                                    <div key={friend.id} className="relative">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold border-2 border-[#111]">
                                            {friend.username[0].toUpperCase()}
                                        </div>
                                        {isOnline(friend.id) && (
                                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[#111]" />
                                        )}
                                    </div>
                                ))}
                                {friends.length > 3 && (
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border-2 border-[#111]">
                                        +{friends.length - 3}
                                    </div>
                                )}
                            </div>
                        </button>

                        {/* Suggestions */}
                        {recommendations.length > 0 && (
                            <div className="flex-shrink-0 bg-[#111] border border-white/5 rounded-xl p-3 min-w-[160px]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles size={14} className="text-purple-400" />
                                    <span className="text-xs font-bold">Suggestions</span>
                                </div>
                                <div className="flex gap-1">
                                    {recommendations.slice(0, 2).map(rec => (
                                        <button
                                            key={rec.id}
                                            onClick={() => handleSendFriendRequest(rec.id)}
                                            className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[8px] font-bold">
                                                {rec.username[0].toUpperCase()}
                                            </div>
                                            <span className="text-[10px] truncate max-w-[50px]">{rec.username}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Search Results */}
                    {searchResults.length > 0 && (
                        <div className="bg-[#111] border border-white/5 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Search size={14} className="text-blue-400" />
                                <span className="text-xs font-bold">Search Results</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto">
                                {searchResults.map(result => (
                                    <button
                                        key={result.id}
                                        onClick={() => handleSendFriendRequest(result.id)}
                                        className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
                                            {result.username[0].toUpperCase()}
                                        </div>
                                        <span className="text-sm">{result.username}</span>
                                        <UserPlus size={14} className="text-blue-400" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mobile Pending Requests Expanded */}
                    {pendingRequests.length > 0 && (
                        <div className="bg-[#111] border border-orange-500/20 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Users size={14} className="text-orange-400" />
                                <span className="text-xs font-bold">Pending Requests</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto">
                                {pendingRequests.map(request => (
                                    <div key={request.id} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold">
                                            {request.sender?.username[0].toUpperCase()}
                                        </div>
                                        <span className="text-sm">{request.sender?.username}</span>
                                        <button
                                            onClick={() => handleAcceptRequest(request.id)}
                                            className="p-1 bg-green-600 hover:bg-green-500 rounded-full"
                                        >
                                            <Check size={12} />
                                        </button>
                                        <button
                                            onClick={() => handleRejectRequest(request.id)}
                                            className="p-1 bg-red-600 hover:bg-red-500 rounded-full"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">

                    {/* Left Sidebar - Friend Requests & Send Request */}
                    <aside className="lg:col-span-3 hidden lg:block">
                        <div className="sticky top-24 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
                            {/* Send Friend Request */}
                            <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
                                <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
                                    <UserPlus size={16} className="text-blue-400" />
                                    Add Friends
                                </h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search username..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="flex-1 px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder-neutral-500 focus:border-blue-500/50 focus:outline-none"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={isSearching}
                                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {searchResults.map(result => (
                                            <div key={result.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
                                                    {result.username[0].toUpperCase()}
                                                </div>
                                                <span className="flex-1 text-sm truncate">{result.username}</span>
                                                <button
                                                    onClick={() => handleSendFriendRequest(result.id)}
                                                    className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-full"
                                                >
                                                    <UserPlus size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pending Friend Requests */}
                            <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
                                <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
                                    <Users size={16} className="text-orange-400" />
                                    Friend Requests
                                    {pendingRequests.length > 0 && (
                                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                                            {pendingRequests.length}
                                        </span>
                                    )}
                                </h3>

                                {pendingRequests.length === 0 ? (
                                    <p className="text-neutral-500 text-sm">No pending requests</p>
                                ) : (
                                    <div className="space-y-2">
                                        {pendingRequests.map(request => (
                                            <div key={request.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-sm font-bold">
                                                    {request.sender?.username[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{request.sender?.username}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleAcceptRequest(request.id)}
                                                        className="p-1.5 bg-green-600 hover:bg-green-500 rounded-full"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectRequest(request.id)}
                                                        className="p-1.5 bg-red-600 hover:bg-red-500 rounded-full"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Suggestions */}
                            {recommendations.length > 0 && (
                                <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
                                    <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
                                        <Sparkles size={16} className="text-purple-400" />
                                        Suggestions
                                    </h3>
                                    <div className="space-y-2">
                                        {recommendations.slice(0, 5).map(rec => (
                                            <div key={rec.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                                                    {rec.username[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{rec.username}</p>
                                                    {rec.bestSolve && (
                                                        <p className="text-xs text-neutral-500">Best: {formatTime(rec.bestSolve)}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleSendFriendRequest(rec.id)}
                                                    className="p-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-full"
                                                >
                                                    <UserPlus size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Feed */}
                    <div className="lg:col-span-6 space-y-6">
                        {/* Post Composer */}
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
                            <div
                                className="flex items-center gap-4 cursor-pointer"
                                onClick={() => setShowComposer(true)}
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-lg font-bold">
                                    {user?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-white/10 rounded-full px-5 py-3 text-neutral-400 text-sm transition-colors">
                                    Share your thoughts...
                                </div>
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
                                            <textarea
                                                value={newPostContent}
                                                onChange={(e) => setNewPostContent(e.target.value)}
                                                placeholder="What do you want to talk about?"
                                                className="w-full bg-transparent border-none outline-none resize-none text-white placeholder-neutral-500 text-lg min-h-[150px]"
                                                autoFocus
                                            />
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
                                    className={cn(
                                        "group bg-gradient-to-b from-[#151515] to-[#0f0f0f] border border-white/[0.08] rounded-3xl overflow-hidden transition-all duration-300",
                                        "hover:border-white/[0.15] hover:shadow-xl hover:shadow-black/50",
                                        post.isPinned && "border-blue-500/30 bg-gradient-to-b from-blue-950/20 to-[#0f0f0f] shadow-[0_0_30px_rgba(59,130,246,0.08)]"
                                    )}
                                >
                                    {/* Post Header */}
                                    <div className="flex items-start justify-between p-4">
                                        <div
                                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => router.push(`/profile/${post.user.id}`)}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-[2px]">
                                                <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center text-lg font-bold">
                                                    {post.user.username[0].toUpperCase()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <div className="font-medium hover:text-blue-400 transition-colors">{post.user.username}</div>
                                                    {post.isPinned && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                            <Sparkles size={10} />
                                                            Pinned
                                                        </span>
                                                    )}
                                                </div>
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
                                    </div>

                                    {/* Post Content */}
                                    <div className="px-5 pb-5">
                                        <p className="text-neutral-100 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                    </div>

                                    {/* Post Stats */}
                                    <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-xs">
                                        <span className="text-neutral-400">
                                            <span className="text-white font-medium">{post._count.likes}</span> likes
                                        </span>
                                        <span className="text-neutral-400">
                                            <span className="text-white font-medium">{post._count.comments}</span> comments
                                        </span>
                                    </div>

                                    {/* Post Actions */}
                                    <div className="px-4 py-3 border-t border-white/5 flex items-center justify-around">
                                        <button
                                            onClick={() => handleLikePost(post.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
                                                post.likes.some(l => l.userId === user?.id)
                                                    ? "text-red-400 bg-red-500/10"
                                                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <Heart size={18} fill={post.likes.some(l => l.userId === user?.id) ? "currentColor" : "none"} />
                                            Like
                                        </button>
                                        <button className="flex items-center gap-2 px-5 py-2.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl font-medium text-sm transition-all duration-200">
                                            <MessageCircle size={18} />
                                            Comment
                                        </button>
                                        <button className="flex items-center gap-2 px-5 py-2.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl font-medium text-sm transition-all duration-200">
                                            <Share2 size={18} />
                                            Share
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}

                        {/* Load More Sentinel & Loading Indicator */}
                        {!isLoading && posts.length > 0 && (
                            <div
                                ref={loadMoreRef}
                                className="flex justify-center py-8"
                            >
                                {isLoadingMore ? (
                                    <div className="flex items-center gap-3 text-neutral-400">
                                        <Loader2 size={20} className="animate-spin" />
                                        <span className="text-sm">Loading more posts...</span>
                                    </div>
                                ) : hasMore ? (
                                    <div className="text-neutral-600 text-sm">Scroll for more</div>
                                ) : (
                                    <div className="text-neutral-500 text-sm flex items-center gap-2">
                                        <Sparkles size={16} />
                                        You've seen all posts
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - Friends & Messages */}
                    <aside className="lg:col-span-3 hidden lg:block">
                        <div className="sticky top-24 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pl-2">
                            {/* Friends / Messages */}
                            <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        <MessageSquare size={16} className="text-green-400" />
                                        Messages
                                    </h3>
                                    <button
                                        onClick={() => router.push('/chat')}
                                        className="text-xs text-blue-400 hover:text-blue-300"
                                    >
                                        See all
                                    </button>
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
                                                onClick={() => openChat(friend.id)}
                                                className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                                            >
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
                                                        {friend.username[0].toUpperCase()}
                                                    </div>
                                                    {isOnline(friend.id) && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111]" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate">{friend.username}</div>
                                                    <div className="text-xs text-neutral-500">
                                                        {isOnline(friend.id) ? 'Online' : 'Offline'}
                                                    </div>
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
                        </div>
                    </aside>

                </div>
            </main>
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
