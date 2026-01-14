"use client";

import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Timer from "@/components/timer/Timer";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { generateScramble } from "@/lib/scramble";
import { RefreshCw, History, Trash2 } from "lucide-react";

export default function TimerPage() {
    const [scramble, setScramble] = useState("");
    const [history, setHistory] = useState<{ time: number, scramble: string, date: Date }[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setScramble(generateScramble());
    }, []);

    const handleNewScramble = () => {
        setScramble(generateScramble());
    };

    const handleStop = (time: number) => {
        setHistory(prev => [{ time, scramble, date: new Date() }, ...prev]);
        handleNewScramble();
    };

    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);
        if (minutes > 0) return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
        return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
    };

    if (!isClient) return null; // Prevent hydration mismatch

    return (
        <div className="relative min-h-screen w-full bg-black text-white overflow-hidden flex flex-col">
            <Navbar />

            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <BackgroundRippleEffect rows={35} cols={70} cellSize={50} />
            </div>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
                {/* Scramble Display */}
                <div className="w-full max-w-4xl text-center mb-12 select-text cursor-pointer group" onClick={handleNewScramble}>
                    <div className="text-2xl md:text-3xl lg:text-4xl font-mono font-bold tracking-wider text-neutral-300 group-hover:text-blue-400 transition-colors">
                        {scramble}
                    </div>
                    <div className="text-sm text-neutral-600 mt-2 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <RefreshCw size={14} /> Click to refresh
                    </div>
                </div>

                {/* Timer */}
                <div className="mb-20">
                    <Timer onStop={handleStop} className="scale-125" />
                </div>

                {/* Session Stats (Simple) */}
                <div className="absolute bottom-8 right-8 w-64 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-4 hidden md:block">
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-400">
                            <History size={16} /> Session
                        </div>
                        <button onClick={() => setHistory([])} className="text-neutral-600 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {history.map((solve, i) => (
                            <div key={i} className="flex justify-between text-sm hover:bg-white/5 p-1 rounded">
                                <span className="text-neutral-500 font-mono">{(history.length - i).toString().padStart(2, '0')}</span>
                                <span className="font-mono font-bold text-white">{formatTime(solve.time)}</span>
                            </div>
                        ))}
                        {history.length === 0 && <div className="text-xs text-neutral-600 text-center py-4">No solves yet</div>}
                    </div>
                </div>
            </main>
        </div>
    );
}
