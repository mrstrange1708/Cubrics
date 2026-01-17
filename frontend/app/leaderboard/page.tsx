'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';
import { Medal, Trophy, User, Users, Globe, Crown, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { leaderboardApi, LeaderboardUser, UserRankData } from '@/api/leaderboard.api';
import { friendsApi, FriendWithTimes } from '@/api/friends.api';
import { timerApi, TimerRecord } from '@/api/timer.api';
import ProtectedRoute from '@/components/ProtectedRoute';

type TabType = 'myBest' | 'friends' | 'global';

function LeaderboardPageContent() {
    const [activeTab, setActiveTab] = useState<TabType>('global');
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [friendsData, setFriendsData] = useState<FriendWithTimes[]>([]);
    const [myTimes, setMyTimes] = useState<TimerRecord[]>([]);
    const [userRankData, setUserRankData] = useState<UserRankData | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // World Record
    const WORLD_RECORD = 3130; // 3.13s in ms

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = localStorage.getItem('Cubrics_user_id');
                setCurrentUserId(userId);

                // Fetch Global Leaderboard
                const data = await leaderboardApi.getGlobalLeaderboard(100);
                setLeaderboard(data);

                if (userId) {
                    // Fetch User Rank
                    const rankData = await leaderboardApi.getUserRank(userId);
                    setUserRankData(rankData);

                    // Fetch User's Times
                    const times = await timerApi.getUserHistory(userId, 50);
                    setMyTimes(times);

                    // Fetch Friends Data
                    try {
                        const friends = await friendsApi.getFriendsWithTimes(userId);
                        setFriendsData(friends);
                    } catch {
                        // No friends yet
                        setFriendsData([]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor(ms % 1000);
        if (minutes > 0) return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
        return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return <Medal className="w-6 h-6 text-yellow-500" fill="currentColor" />;
        if (index === 1) return <Medal className="w-6 h-6 text-gray-300" fill="currentColor" />;
        if (index === 2) return <Medal className="w-6 h-6 text-amber-600" fill="currentColor" />;
        return <span className="font-mono text-neutral-500 text-lg">#{index + 1}</span>;
    };

    const getPercentileLabel = (percentile: number) => {
        if (percentile <= 0.1) return { label: "LEGENDARY", color: "text-yellow-400", bg: "from-yellow-500/20 to-orange-500/20" };
        if (percentile <= 1) return { label: "ELITE", color: "text-purple-400", bg: "from-purple-500/20 to-pink-500/20" };
        if (percentile <= 5) return { label: "AMAZING", color: "text-blue-400", bg: "from-blue-500/20 to-cyan-500/20" };
        if (percentile <= 10) return { label: "GREAT", color: "text-green-400", bg: "from-green-500/20 to-emerald-500/20" };
        if (percentile <= 20) return { label: "NICE", color: "text-blue-400", bg: "from-blue-500/10 to-purple-500/10" };
        return { label: "KEEP GOING", color: "text-neutral-400", bg: "from-neutral-500/10 to-neutral-500/10" };
    };

    const tabs = [
        { id: 'myBest' as TabType, label: 'My Best', icon: Target },
        { id: 'friends' as TabType, label: 'Friends', icon: Users },
        { id: 'global' as TabType, label: 'Global Records', icon: Globe },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
            <Navbar />

            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
                <BackgroundRippleEffect />
            </div>

            <main className="relative z-10 container mx-auto px-4 py-24 max-w-5xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500 mb-2">
                            Leaderboard
                        </h1>
                        <p className="text-neutral-400 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            {userRankData?.totalPlayers || leaderboard.length} Cubers Competing
                        </p>
                    </div>

                    {/* World Record Banner */}
                    <div className="mt-4 md:mt-0 flex items-center gap-3 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        <div className="text-sm">
                            <span className="text-neutral-400">World Record: </span>
                            <span className="font-mono font-bold text-yellow-400">3.134s</span>
                            <span className="text-neutral-500 ml-2">Yusheng Du</span>
                        </div>
                    </div>
                </div>

                {/* User's Rank Card */}
                {userRankData && userRankData.rank && currentUserId && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-8 p-[1px] rounded-xl bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-blue-500/50"
                    >
                        <div className="bg-[#121212] rounded-xl p-5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                                {/* Rank & Percentile */}
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Your Rank</span>
                                        <span className="text-3xl font-black text-white">#{userRankData.rank}</span>
                                    </div>
                                    <div className="h-12 w-[1px] bg-white/10" />
                                    <div className="flex flex-col items-center">
                                        <div className={cn("px-4 py-1.5 rounded-full bg-gradient-to-r border", getPercentileLabel(userRankData.percentile).bg, "border-white/10")}>
                                            <span className={cn("font-bold text-sm", getPercentileLabel(userRankData.percentile).color)}>
                                                TOP {userRankData.percentile < 1 ? userRankData.percentile.toFixed(1) : Math.round(userRankData.percentile)}%
                                            </span>
                                        </div>
                                        <span className="text-xs text-neutral-500 mt-1">{getPercentileLabel(userRankData.percentile).label}</span>
                                    </div>
                                </div>

                                {/* Best Time & Stats */}
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <div className="text-xs text-neutral-500 uppercase mb-1">Best Time</div>
                                        <div className="text-2xl font-mono font-bold text-green-400">
                                            {userRankData.bestSolve ? formatTime(userRankData.bestSolve) : '--'}
                                        </div>
                                    </div>
                                    {userRankData.bestSolve && (
                                        <div className="text-center">
                                            <div className="text-xs text-neutral-500 uppercase mb-1">vs WR</div>
                                            <div className="text-lg font-mono text-neutral-400">
                                                +{((userRankData.bestSolve - WORLD_RECORD) / 1000).toFixed(3)}s
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                activeTab === tab.id
                                    ? "bg-white/10 text-white shadow-lg"
                                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {/* My Best Tab */}
                    {activeTab === 'myBest' && (
                        <motion.div
                            key="myBest"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-black/40">
                                <div className="col-span-2 text-center">#</div>
                                <div className="col-span-6">Time</div>
                                <div className="col-span-4 text-right">Date</div>
                            </div>

                            {myTimes.length === 0 && (
                                <div className="p-16 text-center">
                                    <Clock size={48} className="mx-auto text-neutral-600 mb-4" />
                                    <div className="text-neutral-400 font-medium">No solves yet</div>
                                    <div className="text-sm text-neutral-600 mt-1">Go to the timer and start solving!</div>
                                </div>
                            )}

                            {[...myTimes].sort((a, b) => a.time - b.time).slice(0, 20).map((record, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    key={record.id}
                                    className={cn(
                                        "grid grid-cols-12 gap-4 p-4 items-center border-b border-white/5 transition-colors hover:bg-white/5",
                                        index === 0 && "bg-green-500/5"
                                    )}
                                >
                                    <div className="col-span-2 flex justify-center">{getRankIcon(index)}</div>
                                    <div className="col-span-6 font-mono font-bold text-lg text-white">
                                        {formatTime(record.time)}
                                        {index === 0 && <span className="ml-2 text-xs text-green-400 font-sans">PB!</span>}
                                    </div>
                                    <div className="col-span-4 text-right text-neutral-500 text-sm">
                                        {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '-'}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Friends Tab */}
                    {activeTab === 'friends' && (
                        <motion.div
                            key="friends"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-black/40">
                                <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                                <div className="col-span-6 md:col-span-5">Friend</div>
                                <div className="col-span-4 md:col-span-3 text-right">Best Time</div>
                                <div className="hidden md:block md:col-span-3 text-right">Solves</div>
                            </div>

                            {friendsData.length === 0 && (
                                <div className="p-16 text-center">
                                    <Users size={48} className="mx-auto text-neutral-600 mb-4" />
                                    <div className="text-neutral-400 font-medium">No friends yet</div>
                                    <div className="text-sm text-neutral-600 mt-1">Add friends to see their times here!</div>
                                </div>
                            )}

                            {friendsData
                                .filter(f => f.bestSolve)
                                .sort((a, b) => (a.bestSolve || 0) - (b.bestSolve || 0))
                                .map((friend, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={friend.id}
                                        className="grid grid-cols-12 gap-4 p-4 items-center border-b border-white/5 transition-colors hover:bg-white/5"
                                    >
                                        <div className="col-span-2 md:col-span-1 flex justify-center">{getRankIcon(index)}</div>
                                        <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                                index < 3 ? "bg-white/10 text-white" : "bg-[#222] text-neutral-400"
                                            )}>
                                                {friend.avatar ? <img src={friend.avatar} alt="" className="w-full h-full rounded-full" /> : friend.username[0].toUpperCase()}
                                            </div>
                                            <span className="font-medium text-neutral-200 truncate">{friend.username}</span>
                                        </div>
                                        <div className="col-span-4 md:col-span-3 text-right font-mono font-bold text-lg text-white">
                                            {friend.bestSolve ? formatTime(friend.bestSolve) : '--'}
                                        </div>
                                        <div className="hidden md:block md:col-span-3 text-right text-neutral-500 font-mono">
                                            {friend.totalSolves}
                                        </div>
                                    </motion.div>
                                ))}
                        </motion.div>
                    )}

                    {/* Global Records Tab */}
                    {activeTab === 'global' && (
                        <motion.div
                            key="global"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-black/40">
                                <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                                <div className="col-span-6 md:col-span-5">Cuber</div>
                                <div className="col-span-4 md:col-span-3 text-right">Time</div>
                                <div className="hidden md:block md:col-span-3 text-right">Solves</div>
                            </div>

                            {isLoading && (
                                <div className="p-12 flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            )}

                            {!isLoading && leaderboard.map((user, index) => {
                                const isMe = user.id === currentUserId;
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        key={user.id}
                                        className={cn(
                                            "grid grid-cols-12 gap-4 p-4 items-center border-b border-white/5 transition-colors",
                                            isMe ? "bg-blue-500/10 hover:bg-blue-500/20" : "hover:bg-white/5"
                                        )}
                                    >
                                        <div className="col-span-2 md:col-span-1 flex justify-center items-center">
                                            {getRankIcon(index)}
                                        </div>
                                        <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                                index < 3 ? "bg-white/10 text-white" : "bg-[#222] text-neutral-400"
                                            )}>
                                                {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full" /> : user.username[0].toUpperCase()}
                                            </div>
                                            <span className={cn("font-medium truncate", isMe ? "text-blue-400" : "text-neutral-200")}>
                                                {user.username} {isMe && "(You)"}
                                            </span>
                                        </div>
                                        <div className="col-span-4 md:col-span-3 text-right font-mono font-bold text-lg text-white">
                                            {formatTime(user.bestSolve)}
                                        </div>
                                        <div className="hidden md:block md:col-span-3 text-right text-neutral-500 font-mono">
                                            {user.totalSolves}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default function LeaderboardPage() {
    return (
        <ProtectedRoute>
            <LeaderboardPageContent />
        </ProtectedRoute>
    );
}
