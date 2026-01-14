"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TimerProps {
    onStart?: () => void;
    onStop?: (time: number) => void;
    className?: string;
    isScrambled?: boolean;
}

type TimerState = 'IDLE' | 'HOLDING' | 'READY' | 'RUNNING' | 'STOPPED';

export default function Timer({ onStart, onStop, className, isScrambled = false }: TimerProps) {
    const [time, setTime] = useState(0);
    const [state, setState] = useState<TimerState>('IDLE');
    const requestRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const holdStartRef = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Format time as mm:ss.ms
    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10); // Show 2 digits

        if (minutes > 0) {
            return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
        }
        return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
    };

    const animate = useCallback(() => {
        const now = performance.now();
        setTime(now - startTimeRef.current);
        requestRef.current = requestAnimationFrame(animate);
    }, []);

    const startTimer = useCallback(() => {
        startTimeRef.current = performance.now();
        setState('RUNNING');
        requestRef.current = requestAnimationFrame(animate);
        onStart?.();
    }, [animate, onStart]);

    const stopTimer = useCallback(() => {
        if (state === 'RUNNING') {
            cancelAnimationFrame(requestRef.current);
            const finalTime = performance.now() - startTimeRef.current;
            setTime(finalTime);
            setState('STOPPED');
            onStop?.(finalTime);
        }
    }, [state, onStop]);

    // Handle Spacebar Logic
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.code === 'Space') {
            e.preventDefault(); // Prevent scrolling

            if (state === 'RUNNING') {
                stopTimer();
            } else if (state === 'IDLE' || state === 'STOPPED') {
                if (state !== 'HOLDING' && state !== 'READY') {
                    setState('HOLDING');
                    holdStartRef.current = Date.now();

                    // Wait 300ms to become READY (Competition standard)
                    timeoutRef.current = setTimeout(() => {
                        setState('READY');
                    }, 300);
                }
            }
        }
    }, [state, stopTimer]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (e.code === 'Space') {
            if (state === 'READY') {
                startTimer();
            } else if (state === 'HOLDING') {
                // Released too early
                setState('IDLE');
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            } else if (state === 'STOPPED') {
                // Just stopped, wait for next press
                // Optional: Auto reset to IDLE after delay or manual reset?
                // For now, spaceup on stopped does nothing, next spacedown resets
                setState('IDLE');
            }
        }
    }, [state, startTimer]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(requestRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [handleKeyDown, handleKeyUp]);

    // Color states
    const getTimerColor = () => {
        switch (state) {
            case 'IDLE': return 'text-white';
            case 'HOLDING': return 'text-red-500'; // Not ready yet
            case 'READY': return 'text-green-500'; // Ready to start
            case 'RUNNING': return 'text-white';
            case 'STOPPED': return 'text-white';
            default: return 'text-white';
        }
    };

    return (
        <div className={cn("flex flex-col items-center justify-center select-none", className)}>
            <div className={cn("text-8xl md:text-9xl font-black font-mono tracking-tighter transition-colors duration-100", getTimerColor())}>
                {formatTime(time)}
            </div>

            <div className="h-8 mt-4 text-neutral-500 font-medium text-sm uppercase tracking-widest">
                {state === 'IDLE' && "Hold SPACE to start"}
                {state === 'HOLDING' && "Hold..."}
                {state === 'READY' && "Release to Solve!"}
                {state === 'RUNNING' && "Solving..."}
                {state === 'STOPPED' && "Press SPACE to reset"}
            </div>
        </div>
    );
}
