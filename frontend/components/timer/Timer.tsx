"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import CircularTimer from './CircularTimer';

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
                setState('HOLDING');
                holdStartRef.current = Date.now();

                // Wait 300ms to become READY
                timeoutRef.current = setTimeout(() => {
                    setState('READY');
                }, 300);
            }
        }
    }, [state, stopTimer]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (e.code === 'Space') {
            if (state === 'READY') {
                startTimer();
            } else if (state === 'HOLDING') {
                setState('IDLE');
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            } else if (state === 'STOPPED') {
                setState('IDLE');
                setTime(0);
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

    return (
        <div className={cn("flex flex-col items-center justify-center select-none", className)}>
            <CircularTimer time={time} state={state} />
        </div>
    );
}
