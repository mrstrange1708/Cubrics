"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import CircularTimer from './CircularTimer';
import { Play, Square, RotateCcw } from 'lucide-react';

interface TimerProps {
    onStart?: () => void;
    onStop?: (time: number) => void;
    onReset?: () => void;
    className?: string;
    isScrambled?: boolean;
    percentile?: number | null;
}

type TimerState = 'IDLE' | 'HOLDING' | 'READY' | 'RUNNING' | 'STOPPED';

export default function Timer({ onStart, onStop, onReset, className, isScrambled = false, percentile }: TimerProps) {
    const [time, setTime] = useState(0);
    const [state, setState] = useState<TimerState>('IDLE');

    // Refs for mutable values accessed in stable listeners
    const stateRef = useRef<TimerState>('IDLE');
    const onStartRef = useRef(onStart);
    const onStopRef = useRef(onStop);
    const onResetRef = useRef(onReset);

    // Animation Refs
    const requestRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const holdStartRef = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Sync Props/State to Refs
    useEffect(() => { stateRef.current = state; }, [state]);
    useEffect(() => { onStartRef.current = onStart; }, [onStart]);
    useEffect(() => { onStopRef.current = onStop; }, [onStop]);
    useEffect(() => { onResetRef.current = onReset; }, [onReset]);

    // Animation Loop (Stable)
    const animate = useCallback(() => {
        const now = performance.now();
        setTime(now - startTimeRef.current);
        requestRef.current = requestAnimationFrame(animate);
    }, []);

    // --- Button Control Methods ---
    const handleStartButton = useCallback(() => {
        if (stateRef.current === 'IDLE' || stateRef.current === 'STOPPED') {
            // Reset if stopped, then start
            setTime(0);
            startTimeRef.current = performance.now();
            setState('RUNNING');
            requestRef.current = requestAnimationFrame(animate);
            if (onStartRef.current) onStartRef.current();
        }
    }, [animate]);

    const handleStopButton = useCallback(() => {
        if (stateRef.current === 'RUNNING') {
            cancelAnimationFrame(requestRef.current);
            const finalTime = performance.now() - startTimeRef.current;
            setTime(finalTime);
            setState('STOPPED');
            if (onStopRef.current) onStopRef.current(finalTime);
        }
    }, []);

    const handleResetButton = useCallback(() => {
        cancelAnimationFrame(requestRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setTime(0);
        setState('IDLE');
        if (onResetRef.current) onResetRef.current();
    }, []);

    // --- Keyboard Listeners (Stable, attached once) ---
    useEffect(() => {
        const handleDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (e.repeat) return;

                const currentState = stateRef.current;

                if (currentState === 'RUNNING') {
                    // Stop Logic
                    cancelAnimationFrame(requestRef.current);
                    const finalTime = performance.now() - startTimeRef.current;
                    setTime(finalTime);
                    setState('STOPPED');
                    if (onStopRef.current) onStopRef.current(finalTime);
                } else if (currentState === 'IDLE' || currentState === 'STOPPED') {
                    // Start Hold Logic
                    setState('HOLDING');
                    holdStartRef.current = Date.now();

                    timeoutRef.current = setTimeout(() => {
                        setState('READY');
                    }, 300);
                }
            }
        };

        const handleUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                const currentState = stateRef.current;

                if (currentState === 'READY') {
                    // Start Logic
                    setTime(0);
                    startTimeRef.current = performance.now();
                    setState('RUNNING');
                    requestRef.current = requestAnimationFrame(animate);
                    if (onStartRef.current) onStartRef.current();
                } else if (currentState === 'HOLDING') {
                    // Released too early (Reset)
                    setState('IDLE');
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                }
            }
        };

        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);

        return () => {
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
            cancelAnimationFrame(requestRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [animate]);

    // Button states
    const canStart = state === 'IDLE' || state === 'STOPPED';
    const canStop = state === 'RUNNING';
    const canReset = state === 'STOPPED' || (state !== 'IDLE' && time > 0);

    return (
        <div className={cn("flex flex-col items-center justify-center select-none gap-8", className)}>
            <CircularTimer time={time} state={state} percentile={percentile} />

            {/* Button Controls */}
            <div className="flex items-center gap-4">
                {/* Start Button */}
                {canStart && (
                    <button
                        onClick={handleStartButton}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-full font-bold tracking-wider uppercase text-sm transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 active:scale-95"
                    >
                        <Play size={18} fill="currentColor" />
                        Start
                    </button>
                )}

                {/* Stop Button */}
                {canStop && (
                    <button
                        onClick={handleStopButton}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white rounded-full font-bold tracking-wider uppercase text-sm transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105 active:scale-95 animate-pulse"
                    >
                        <Square size={18} fill="currentColor" />
                        Stop
                    </button>
                )}

                {/* Reset Button */}
                {canReset && !canStop && (
                    <button
                        onClick={handleResetButton}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white rounded-full font-bold tracking-wider uppercase text-sm transition-all duration-300"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                )}
            </div>

            {/* Keyboard hint */}
            <div className="text-xs text-neutral-600 font-medium tracking-widest uppercase">
                {state === 'IDLE' && 'or hold space to start'}
                {state === 'HOLDING' && 'keep holding...'}
                {state === 'READY' && 'release to start!'}
                {state === 'RUNNING' && 'press space to stop'}
            </div>
        </div>
    );
}
