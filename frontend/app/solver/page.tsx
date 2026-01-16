'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Grid3X3, Camera, ArrowRight } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function SolverPageContent() {
    return (
        <div className="min-h-screen bg-black/95 text-foreground flex flex-col items-center relative overflow-hidden">
            <Navbar />

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black/0 to-black/0 pointer-events-none" />

            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl px-6 py-20 z-10">
                <div className="text-center space-y-4 mb-16">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                        Choose Input Method
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-xl mx-auto">
                        Select how you want to input your cube's state to get the solution.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 w-full">
                    {/* Manual Input Card */}
                    <Link href="/solver/manual" className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative h-full bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:-translate-y-1 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                                <Grid3X3 className="w-8 h-8 text-blue-400 group-hover:text-blue-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Manual Input</h3>
                            <p className="text-neutral-400 mb-8 flex-1">
                                Manually paint the colors of your cube onto a 2D net. Best for precision.
                            </p>
                            <div className="flex items-center text-blue-400 font-semibold group-hover:text-blue-300">
                                Start Manual Input <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Camera Scan Card */}
                    <Link href="/solver/scan" className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative h-full bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:-translate-y-1 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                                <Camera className="w-8 h-8 text-purple-400 group-hover:text-purple-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Camera Scan</h3>
                            <p className="text-neutral-400 mb-8 flex-1">
                                Use your device's camera to scan each face of the cube automatically.
                            </p>
                            <div className="flex items-center text-purple-400 font-semibold group-hover:text-purple-300">
                                Start Scan <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function SolverSelectionPage() {
    return (
        <ProtectedRoute>
            <SolverPageContent />
        </ProtectedRoute>
    );
}
