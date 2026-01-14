"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface CircularTimerProps {
    time: number; // milliseconds
    state: 'IDLE' | 'HOLDING' | 'READY' | 'RUNNING' | 'STOPPED';
    className?: string;
}

export default function CircularTimer({ time, state, className }: CircularTimerProps) {
    // WR Target: 3.13s (3130ms)
    // Scale: 10s full circle for visual impact
    const maxTime = 10000;
    const wrTime = 3130;

    // Progress calculation (0 to 100)
    const progress = Math.min((time / maxTime) * 100, 100);
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
        const milliseconds = Math.floor((ms % 1000) / 10);

        if (minutes > 0) {
            return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
        }
        return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
    };

    // Color Logic
    const getStrokeColor = () => {
        switch (state) {
            case 'IDLE': return 'stroke-white/10';
            case 'HOLDING': return 'stroke-red-500';
            case 'READY': return 'stroke-green-500';
            case 'RUNNING':
                // Dynamic color based on WR?
                return time < wrTime ? 'stroke-blue-500' : 'stroke-orange-500';
            case 'STOPPED':
                return time < wrTime ? 'stroke-yellow-400' : 'stroke-white';
            default: return 'stroke-white';
        }
    };

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            {/* SVG Ring */}
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90 transition-all duration-300"
            >
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
                    style={{ strokeDashoffset }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className={cn("transition-colors duration-100", getStrokeColor())}
                />
            </svg>

            {/* Time Display (Centered) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={cn("text-7xl font-mono font-black tracking-tighter transition-colors duration-100",
                    state === 'READY' ? 'text-green-500' :
                        state === 'HOLDING' ? 'text-red-500' :
                            state === 'STOPPED' && time < wrTime ? 'text-yellow-400' :
                                'text-white'
                )}>
                    {formatTime(time)}
                </div>

                {/* Subtext */}
                <div className="mt-2 text-sm font-medium tracking-widest text-neutral-500 uppercase">
                    {state === 'IDLE' && "Hold Space"}
                    {state === 'HOLDING' && "Wait..."}
                    {state === 'READY' && "RELEASE!"}
                    {state === 'RUNNING' && (time < wrTime ? "GO FOR WR!" : "KEEP GOING")}
                    {state === 'STOPPED' && (time < wrTime ? <span className="flex items-center gap-1 text-yellow-500"><Trophy size={14} /> NEW RECORD?</span> : "Reset")}
                </div>
            </div>

            {/* WR Label absolute positioning */}
            <div className="absolute bottom-10 flex flex-col items-center opacity-40">
                <span className="text-[10px] text-yellow-500 font-bold">WR 3.13</span>
            </div>
        </div>
    );
}
