'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';
import { Medal, Trophy, User, Clock, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface LeaderboardUser {
    id: string;
    username: string;
    avatar: string | null;
    bestSolve: number;
    totalSolves: number;
}

interface UserRankHelper {
    rank: number;
    totalPlayers: number;
    percentile: number;
    bestSolve: number | null;
}

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [userRankData, setUserRankData] = useState<UserRankHelper | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Current User ID
                const userId = localStorage.getItem('cubex_user_id');
                setCurrentUserId(userId);

                // 2. Fetch Global Leaderboard
                const res = await fetch('http://localhost:7777/leaderboard/global?limit=100');
                const data = await res.json();
                setLeaderboard(data);

                // 3. Fetch User Rank if available
                if (userId) {
                    const rankRes = await fetch(`http://localhost:7777/leaderboard/percentile/${userId}`);
                    const rankData = await rankRes.json();
                    setUserRankData(rankData);
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
        const milliseconds = Math.floor((ms % 1000) / 10);
        if (minutes > 0) return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
        return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return <Medal className="w-6 h-6 text-yellow-500" fill="currentColor" />; // Gold
        if (index === 1) return <Medal className="w-6 h-6 text-gray-300" fill="currentColor" />;   // Silver
        if (index === 2) return <Medal className="w-6 h-6 text-amber-600" fill="currentColor" />;  // Bronze
        return <span className="font-mono text-neutral-500 text-lg">#{index + 1}</span>;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
            <Navbar />

            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
                <BackgroundRippleEffect />
            </div>

            <main className="relative z-10 container mx-auto px-4 py-24 max-w-5xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500 mb-2">
                            Global Ranking
                        </h1>
                        <p className="text-neutral-400 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            Competing against {userRankData?.totalPlayers || leaderboard.length} Cubers
                        </p>
                    </div>
                </div>

                {/* User's Current Rank (Pinned) */}
                {userRankData && userRankData.rank && currentUserId && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-8 p-[1px] rounded-xl bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-blue-500/50"
                    >
                        <div className="bg-[#121212] rounded-xl p-4 flex items-center justify-between relative overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-center gap-6 relative z-10">
                                <div className="flex flex-col items-center justify-center w-16">
                                    <span className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Rank</span>
                                    <span className="text-2xl font-bold text-white">#{userRankData.rank}</span>
                                </div>
                                <div className="h-10 w-[1px] bg-white/10" />
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-blue-400">You</div>
                                        <div className="text-xs text-neutral-400">Top {userRankData.percentile}%</div>
                                    </div>
                                </div>
                            </div>

                            {/* Find User's Best Time locally if not provided by rank endpoint explicitly */}
                            <div className="flex items-center gap-8 relative z-10 px-4">
                                <div className="text-right">
                                    <div className="text-xs text-neutral-500 uppercase mb-1">Best Time</div>
                                    <div className="text-2xl font-mono font-bold text-green-400">
                                        {formatTime(userRankData.bestSolve || 0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}


                {/* Leaderboard Table */}
                <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-black/40">
                        <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                        <div className="col-span-6 md:col-span-5">Cuber</div>
                        <div className="col-span-4 md:col-span-3 text-right">Time</div>
                        <div className="hidden md:block md:col-span-3 text-right">Solves</div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="p-12 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    )}

                    {/* Rows */}
                    {!isLoading && leaderboard.map((user, index) => {
                        const isMe = user.id === currentUserId;
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={user.id}
                                className={cn(
                                    "grid grid-cols-12 gap-4 p-4 items-center border-b border-white/5 transition-colors",
                                    isMe ? "bg-blue-500/10 hover:bg-blue-500/20" : "hover:bg-white/5"
                                )}
                            >
                                {/* Rank */}
                                <div className="col-span-2 md:col-span-1 flex justify-center items-center">
                                    {getRankIcon(index)}
                                </div>

                                {/* User */}
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

                                {/* Time */}
                                <div className="col-span-4 md:col-span-3 text-right font-mono font-bold text-lg text-white">
                                    {formatTime(user.bestSolve)}
                                </div>

                                {/* Solves */}
                                <div className="hidden md:block md:col-span-3 text-right text-neutral-500 font-mono">
                                    {user.totalSolves}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
