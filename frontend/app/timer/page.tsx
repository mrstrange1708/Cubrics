"use client";

import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Timer from "@/components/timer/Timer";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { History, Trash2, Trophy, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { timerApi } from "@/api/timer.api";
import { leaderboardApi } from "@/api/leaderboard.api";
import { motion, AnimatePresence } from "motion/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

function TimerPageContent() {
    const [history, setHistory] = useState<{ time: number, date: Date }[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isSolving, setIsSolving] = useState(false);
    const [userId, setUserId] = useState<string>("");
    const [lastPercentile, setLastPercentile] = useState<number | null>(null);
    const [userStats, setUserStats] = useState<{ rank: number; totalPlayers: number; bestSolve: number | null } | null>(null);

    useEffect(() => {
        setIsClient(true);

        // Retrieve or Generate Mock ID (In real app, get from Auth Context)
        let id = localStorage.getItem('Cubrics_user_id');
        if (!id) {
            id = 'demo-user-' + Math.random().toString(36).substr(2, 6);
            localStorage.setItem('Cubrics_user_id', id);
        }
        setUserId(id);

        // Fetch initial stats
        const fetchStats = async () => {
            try {
                const rankData = await leaderboardApi.getUserRank(id!);
                if (rankData.rank) {
                    setUserStats({
                        rank: rankData.rank,
                        totalPlayers: rankData.totalPlayers,
                        bestSolve: rankData.bestSolve
                    });
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            }
        };
        fetchStats();
    }, []);

    const handleStart = () => {
        setIsSolving(true);
        setLastPercentile(null);
    };

    const handleStop = async (time: number) => {
        setIsSolving(false);
        const newRecord = { time, date: new Date() };
        setHistory(prev => [newRecord, ...prev]);

        // Backend Integration
        try {
            // 1. Save Timer Record
            if (userId) {
                try {
                    await timerApi.saveTimerRecord({ userId, time: Math.round(time) });
                    toast.success("Time saved!");
                } catch (saveErr) {
                    console.error("Save failed:", saveErr);
                    toast.error("Failed to save record to database");
                }

                // 2. Fetch Percentile
                const rankData = await leaderboardApi.getUserRank(userId);

                if (rankData.percentile) {
                    setLastPercentile(rankData.percentile);
                    setUserStats({
                        rank: rankData.rank,
                        totalPlayers: rankData.totalPlayers,
                        bestSolve: rankData.bestSolve
                    });
                }
            } else {
                console.warn("Solve not saved: userId is missing");
            }

        } catch (error) {
            console.error("Backend Error:", error);
        }
    };

    const handleReset = () => {
        setLastPercentile(null);
    };

    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor(ms % 1000);
        if (minutes > 0) return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
        return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
    };

    if (!isClient) return null;

    return (
        <div className="relative min-h-screen w-full bg-black text-white overflow-hidden flex flex-col">
            <Navbar />

            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <BackgroundRippleEffect rows={35} cols={70} cellSize={50} />
            </div>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">

                {/* Global Rank Banner (Only shown when not solving) */}
                <AnimatePresence>
                    {!isSolving && userStats && userStats.rank && (
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            className="absolute top-24 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl backdrop-blur-sm"
                        >
                            <div className="flex items-center gap-2">
                                <Trophy size={18} className="text-yellow-500" />
                                <span className="text-sm font-medium text-neutral-300">
                                    Global Rank: <span className="text-white font-bold">#{userStats.rank}</span>
                                </span>
                            </div>
                            <div className="h-4 w-px bg-white/20" />
                            <div className="flex items-center gap-2">
                                <TrendingUp size={16} className="text-green-400" />
                                <span className="text-sm text-neutral-400">
                                    Top <span className="text-green-400 font-bold">{Math.ceil((userStats.rank / userStats.totalPlayers) * 100)}%</span> of {userStats.totalPlayers} cubers
                                </span>
                            </div>
                            {userStats.bestSolve && (
                                <>
                                    <div className="h-4 w-px bg-white/20" />
                                    <span className="text-sm text-neutral-400">
                                        Best: <span className="text-white font-mono font-bold">{formatTime(userStats.bestSolve)}</span>
                                    </span>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Timer (Circular) - Now includes buttons internally */}
                <div className="relative group">
                    <Timer
                        onStart={handleStart}
                        onStop={handleStop}
                        onReset={handleReset}
                        className="scale-110 md:scale-125"
                        percentile={lastPercentile}
                    />
                </div>

                {/* Session Stats */}
                <div className={`absolute bottom-8 right-8 w-72 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 hidden md:block transition-all duration-500 ${isSolving ? 'opacity-0 translate-x-4' : 'opacity-100'}`}>
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-400">
                            <History size={16} />
                            Session History
                        </div>
                        <button
                            onClick={() => setHistory([])}
                            className="text-neutral-600 hover:text-red-400 transition-colors p-1 rounded hover:bg-white/5"
                            title="Clear History"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {history.map((solve, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex justify-between text-sm hover:bg-white/5 p-2 rounded-lg transition-colors"
                            >
                                <span className="text-neutral-500 font-mono text-xs">{(history.length - i).toString().padStart(2, '0')}</span>
                                <span className="font-mono font-bold text-white">{formatTime(solve.time)}</span>
                            </motion.div>
                        ))}
                        {history.length === 0 && (
                            <div className="text-xs text-neutral-600 text-center py-8 flex flex-col items-center gap-2">
                                <span className="text-2xl">🎯</span>
                                <span>Start solving to track your times</span>
                            </div>
                        )}
                    </div>

                    {/* Session Stats Summary */}
                    {history.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                                <div className="text-neutral-500 mb-1">Best</div>
                                <div className="font-mono font-bold text-green-400">
                                    {formatTime(Math.min(...history.map(h => h.time)))}
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                                <div className="text-neutral-500 mb-1">Avg</div>
                                <div className="font-mono font-bold text-blue-400">
                                    {formatTime(history.reduce((a, b) => a + b.time, 0) / history.length)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function TimerPage() {
    return (
        <ProtectedRoute>
            <TimerPageContent />
        </ProtectedRoute>
    );
}
