'use client';

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MoveRight, LogOut, User, ChevronDown, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <div className="fixed top-[-10px] left-0 right-0 z-50 flex justify-center pt-6">
            <nav className="flex items-center justify-between px-6 py-3 w-[90%] max-w-5xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-8 h-8 overflow-hidden rounded-lg">
                        <Image
                            src="/logo.png"
                            alt="Cubrics Logo"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">Cubrics</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
                    <Link href="/solver" className="hover:text-white transition-colors hover:scale-105 transform">Solver</Link>
                    <Link href="/timer" className="hover:text-white transition-colors hover:scale-105 transform">Timer</Link>
                    <Link href="/explore" className="hover:text-white transition-colors hover:scale-105 transform">Explore</Link>
                    <Link href="/learn" className="hover:text-white transition-colors hover:scale-105 transform">Learn</Link>
                    <Link href="/leaderboard" className="hover:text-white transition-colors hover:scale-105 transform">Leaderboard</Link>
                </div>

                {/* Auth Section */}
                {isAuthenticated && user ? (
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
                        >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                {user.username[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-white hidden sm:block">{user.username}</span>
                            <ChevronDown size={14} className={cn("text-neutral-400 transition-transform", showDropdown && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {showDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                                >
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-white/5">
                                        <p className="font-medium text-white">{user.username}</p>
                                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1">
                                        <Link
                                            href="/profile"
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            <User size={16} />
                                            Profile
                                        </Link>
                                        <Link
                                            href="/settings"
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            <Settings size={16} />
                                            Settings
                                        </Link>
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-white/5 p-2">
                                        <button
                                            onClick={() => {
                                                setShowDropdown(false);
                                                logout();
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <Link href="/auth/signin">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95">
                            Start <MoveRight size={14} />
                        </button>
                    </Link>
                )}
            </nav>
        </div>
    );
};

export default Navbar;
