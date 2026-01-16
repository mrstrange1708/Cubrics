"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Zap, Crown, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface CircularTimerProps {
    time: number; // milliseconds
    state: 'IDLE' | 'HOLDING' | 'READY' | 'RUNNING' | 'STOPPED';
    percentile?: number | null;
    className?: string;
}

const getPercentileMessage = (percentile: number): { message: string; icon: React.ReactNode; gradient: string } => {
    if (percentile <= 0.1) {
        return {
            message: "LEGENDARY!",
            icon: <Crown size={16} className="text-yellow-400" />,
            gradient: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
        };
    } else if (percentile <= 1) {
        return {
            message: "ELITE CUBER!",
            icon: <Zap size={16} className="text-purple-400" />,
            gradient: "from-purple-500/20 to-pink-500/20 border-purple-500/30"
        };
    } else if (percentile <= 5) {
        return {
            message: "AMAZING!",
            icon: <Star size={16} className="text-blue-400" />,
            gradient: "from-blue-500/20 to-cyan-500/20 border-blue-500/30"
        };
    } else if (percentile <= 10) {
        return {
            message: "GREAT!",
            icon: <Trophy size={16} className="text-green-400" />,
            gradient: "from-green-500/20 to-emerald-500/20 border-green-500/30"
        };
    } else if (percentile <= 20) {
        return {
            message: "NICE!",
            icon: <Trophy size={16} className="text-blue-400" />,
            gradient: "from-blue-500/10 to-purple-500/10 border-blue-500/20"
        };
    }
    return {
        message: "KEEP GOING!",
        icon: <Trophy size={16} className="text-neutral-400" />,
        gradient: "from-neutral-500/10 to-neutral-500/10 border-neutral-500/20"
    };
};

export default function CircularTimer({ time, state, percentile, className }: CircularTimerProps) {
    // WR Target: 3.13s (3130ms)
    // Scale: 10s full circle for visual impact
    const maxTime = 10000;
    const wrTime = 3130;

    // Progress calculation (loops every 10s)
    const progress = ((time % maxTime) / maxTime) * 100;
    const wrProgress = (wrTime / maxTime) * 100;

    const radius = 140;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Time Formatting
    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor(ms % 1000);

        if (minutes > 0) {
            return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
        }
        return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
    };

    // Color Logic
    const getStrokeColor = () => {
        switch (state) {
            case 'IDLE': return 'stroke-white/10';
            case 'HOLDING': return 'stroke-red-500';
            case 'READY': return 'stroke-green-500';
            case 'RUNNING':
                return time < wrTime ? 'stroke-blue-500' : 'stroke-blue-400/50';
            case 'STOPPED':
                return time < wrTime ? 'stroke-yellow-400' : 'stroke-white/20';
            default: return 'stroke-white';
        }
    };

    const percentileData = percentile ? getPercentileMessage(percentile) : null;

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            {/* SVG Ring */}
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90"
            >
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background Ring */}
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="text-white/5"
                />

                {/* WR Marker */}
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke + 4}
                    strokeDasharray={`${1} ${circumference}`}
                    strokeDashoffset={circumference - (wrProgress / 100) * circumference}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="text-yellow-500/50"
                />

                {/* Progress Ring */}
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{
                        strokeDashoffset,
                        filter: state === 'RUNNING' || state === 'READY' ? 'url(#glow)' : 'none'
                    }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className={cn("transition-colors duration-200", getStrokeColor())}
                />
            </svg>

            {/* Time Display (Centered) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center mb-15">
                {/* Ranking Badge (Top) - Enhanced */}
                <div className="h-24 flex flex-col items-center justify-center mb-2">
                    {state === 'STOPPED' && percentile && percentileData && (
                        <motion.div
                            initial={{ y: 20, opacity: 0, scale: 0.8 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                            className="relative flex flex-col items-center gap-2"
                        >
                            {/* Glow effect */}
                            <div className="absolute -inset-8 bg-blue-500/10 blur-2xl rounded-full" />

                            {/* Top percentage badge */}
                            <div className={cn(
                                "bg-gradient-to-br border px-5 py-2 rounded-2xl flex items-center gap-2 shadow-xl",
                                percentileData.gradient
                            )}>
                                {percentileData.icon}
                                <span className="text-white font-black text-lg tracking-tight">
                                    TOP {percentile < 1 ? percentile.toFixed(1) : Math.round(percentile)}%
                                </span>
                            </div>

                            {/* Motivational message */}
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-xs font-bold tracking-[0.3em] text-neutral-400"
                            >
                                {percentileData.message}
                            </motion.span>
                        </motion.div>
                    )}
                </div>

                <div className={cn("text-6xl md:text-7xl font-mono font-black tracking-tighter transition-all duration-100 tabular-nums",
                    state === 'READY' ? 'text-green-500 scale-105' :
                        state === 'HOLDING' ? 'text-red-500' :
                            state === 'STOPPED' && time < wrTime ? 'text-yellow-400' :
                                'text-white'
                )}>
                    {formatTime(time)}
                </div>

                {/* World Record Comparison */}
                {state === 'STOPPED' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-2 flex items-center gap-2 text-xs text-neutral-500"
                    >
                        <span>WR: 3.134s</span>
                        {time < wrTime ? (
                            <span className="text-yellow-400 font-bold">🏆 NEW WR!</span>
                        ) : (
                            <span className="text-neutral-600">
                                (+{((time - wrTime) / 1000).toFixed(3)}s)
                            </span>
                        )}
                    </motion.div>
                )}

                {/* Subtext (Bottom) */}
                <div className={cn("mt-4 h-8 text-sm font-bold tracking-widest text-neutral-500 uppercase flex flex-col items-center justify-start")}>
                    {state === 'IDLE' && <span className="animate-pulse">Ready to Solve</span>}
                    {state === 'HOLDING' && <span className="text-red-500">Wait...</span>}
                    {state === 'READY' && <span className="text-green-500 animate-bounce">RELEASE!</span>}
                    {state === 'RUNNING' && (
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-blue-400/50 text-[10px]">SOLVING...</span>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
