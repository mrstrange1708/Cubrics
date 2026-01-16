"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await authApi.signin(formData);
            login(data.token, data.user);
            toast.success("Welcome back!");
            router.push("/");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient Orbs */}
                <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-pulse" />
                <div className="absolute top-0 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-pulse delay-1000" />
                <div className="absolute -bottom-40 left-20 w-80 h-80 bg-cyan-600 rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-pulse delay-500" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md px-6"
            >
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center mb-8"
                >
                    <div className="relative w-16 h-16 mb-4">
                        <Image
                            src="/icon.svg"
                            alt="CubeX Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                        Welcome Back
                    </h1>
                    <p className="text-neutral-500 text-sm mt-2">
                        Sign in to continue your cubing journey
                    </p>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative"
                >
                    {/* Card Glow */}
                    <div className="absolute -inset-px bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-cyan-500/50 rounded-2xl blur-sm opacity-50" />

                    {/* Card Content */}
                    <div className="relative bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-neutral-300">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-neutral-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-white/20 bg-black/50 text-blue-500 focus:ring-blue-500/20 cursor-pointer"
                                    />
                                    <span className="text-sm text-neutral-400">Remember me</span>
                                </label>
                                <Link href="/auth/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={cn(
                                    "w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200",
                                    loading
                                        ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                                )}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-xs text-neutral-500">OR</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        {/* Social Login (Placeholder) */}
                        <button className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            Continue with Magic Link
                        </button>
                    </div>
                </motion.div>

                {/* Sign Up Link */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-sm text-neutral-400 mt-6"
                >
                    Don't have an account?{" "}
                    <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Create one
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
}
