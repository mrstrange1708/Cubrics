'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { useCube } from "@/context/CubeContext";
import Cube3D from '@/components/solver/Cube3D';

function SolutionContent() {
    const { solutionPhases: phases, resetCube } = useCube();
    const router = useRouter();

    const [currentMove, setCurrentMove] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);

    const allMoves = phases?.flatMap(p => p.moves) || [];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && currentMove < allMoves.length - 1) {
            interval = setInterval(() => {
                setCurrentMove(prev => prev + 1);
            }, speed);
        } else if (currentMove >= allMoves.length - 1) {
            setIsPlaying(false);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentMove, allMoves.length, speed]);

    if (!phases || phases.length === 0) {
        return (
            <div className="min-h-screen bg-black/95 text-foreground p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="animate-in fade-in zoom-in duration-500 text-center space-y-6">
                    <h1 className="text-3xl font-black tracking-tighter text-white">No Solution Found</h1>
                    <p className="text-muted-foreground">Please solve a cube first to see the instructions.</p>
                    <Button onClick={() => router.push('/solver/manual')} className="bg-primary hover:bg-primary/90">
                        Go to Solver
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="z-10 w-full max-w-6xl flex flex-col items-center gap-8 pt-20 pb-20 px-6">
            <div className="text-center space-y-4 pt-10">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                    Step-by-Step Solution
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Use the 3D player below to follow the optimal {allMoves.length}-move solution.
                </p>
            </div>

            <div className="w-full grid lg:grid-cols-2 gap-8 items-start">
                {/* 3D Player Column */}
                <div className="space-y-6">
                    <Cube3D
                        moves={allMoves}
                        currentMove={currentMove}
                        initialState={useCube().cubeState}
                        showScramble={false}
                    />

                    {/* Playback Controls */}
                    <div className="bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => { setCurrentMove(-1); setIsPlaying(false); }}
                                className="w-12 h-12 border-white/10 hover:bg-white/5"
                            >
                                <SkipBack className="w-5 h-5 text-white" />
                            </Button>

                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={currentMove <= -1}
                                    onClick={() => setCurrentMove(prev => prev - 1)}
                                    className="w-12 h-12 border-white/10 hover:bg-white/5"
                                >
                                    <SkipBack className="w-5 h-5 text-white transform rotate-180" />
                                </Button>

                                <Button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                >
                                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={currentMove >= allMoves.length - 1}
                                    onClick={() => setCurrentMove(prev => prev + 1)}
                                    className="w-12 h-12 border-white/10 hover:bg-white/5"
                                >
                                    <SkipForward className="w-5 h-5 text-white" />
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    // resetCube(); // Handled by query param on next page
                                    router.push('/solver/manual?reset=true');
                                }}
                                className="w-12 h-12 border-white/10 hover:bg-white/5"
                            >
                                <RotateCcw className="w-5 h-5 text-white " />
                            </Button>
                        </div>

                        {/* Speed Slider Placeholder (Optional) */}
                        <div className="flex items-center gap-4 text-sm text-neutral-400">
                            <span>Speed</span>
                            <input
                                type="range"
                                min="200"
                                max="2000"
                                step="100"
                                value={speed}
                                onChange={(e) => setSpeed(Number(e.target.value))}
                                className="flex-1 accent-primary"
                            />
                            <span>{speed}ms</span>
                        </div>
                    </div>
                </div>

                {/* Move List Column */}
                <div className="h-full flex flex-col gap-6">
                    <div className="bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex-1 shadow-2xl overflow-y-auto max-h-[600px] scrollbar-hide">
                        <div className="mb-6 border-b border-white/5 pb-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Solution Moves</h2>
                            <span className="text-primary font-mono font-bold">{currentMove + 1} / {allMoves.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {allMoves.map((move, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setCurrentMove(i); setIsPlaying(false); }}
                                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black border transition-all ${i === currentMove
                                        ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30'
                                        : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20 hover:bg-white/10'
                                        }`}
                                >
                                    {move}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        onClick={() => router.push('/solver/manual')}
                        className="text-neutral-400 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Edit Colors
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function SolutionPage() {
    return (
        <div className="min-h-screen bg-black/95 text-foreground flex flex-col items-center relative overflow-x-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <Navbar />

            <Suspense fallback={<div className="text-white pt-40">Loading solution...</div>}>
                <SolutionContent />
            </Suspense>
        </div>
    );
}
