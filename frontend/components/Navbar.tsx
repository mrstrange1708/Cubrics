'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MoveRight, LogOut, User, ChevronDown, Settings, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Close mobile menu on route change or resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navLinks = [
        { href: "/solver", label: "Solver" },
        { href: "/timer", label: "Timer" },
        { href: "/explore", label: "Explore" },
        { href: "/learn", label: "Learn" },
        { href: "/leaderboard", label: "Leaderboard" },
    ];

    return (
        <>
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

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="hover:text-white transition-colors hover:scale-105 transform">
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side container for auth and mobile toggle */}
                    <div className="flex items-center gap-3">
                        {/* Desktop Auth - Start button for non-authenticated */}
                        {!isAuthenticated && (
                            <Link href="/auth/signin" className="hidden md:block">
                                <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95">
                                    Sign In <MoveRight size={14} />
                                </button>
                            </Link>
                        )}

                        {/* Desktop Auth - User profile for authenticated */}
                        {isAuthenticated && user && (
                            <div className="relative hidden md:block">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
                                >
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-white">{user.username}</span>
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
                        )}

                        {/* Mobile Menu Toggle - Always at the end */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                            aria-label="Toggle mobile menu"
                        >
                            <AnimatePresence mode="wait">
                                {mobileMenuOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <X size={20} className="text-white" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Menu size={20} className="text-white" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed inset-0 z-40 md:hidden"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
                            className="absolute top-20 left-4 right-4 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            {/* Navigation Links */}
                            <div className="py-4 px-2">
                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + index * 0.05 }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-4 px-4 py-3 text-neutral-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                                        >
                                            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-lg font-medium">{link.label}</span>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Auth Section */}
                            <div className="border-t border-white/10 p-4">
                                {isAuthenticated && user ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 px-4 py-2 text-neutral-400">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{user.username}</p>
                                                <p className="text-xs text-neutral-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <Link
                                            href="/profile"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-neutral-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                        >
                                            <User size={18} />
                                            Profile
                                        </Link>
                                        <Link
                                            href="/settings"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-neutral-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                        >
                                            <Settings size={18} />
                                            Settings
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                logout();
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                                        >
                                            <LogOut size={18} />
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        href="/auth/signin"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block"
                                    >
                                        <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white text-black text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-all">
                                            Sign In to Cubrics <MoveRight size={16} />
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
