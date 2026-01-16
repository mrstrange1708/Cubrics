"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, Loader2, User, Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);

    const [passwordCriteria, setPasswordCriteria] = useState({
        minLength: false,
        hasNumber: false,
        hasSpecial: false,
        hasUpper: false,
        hasLower: false,
        hasMatched: false,
    });

    useEffect(() => {
        const pwd = formData.password;
        setPasswordCriteria({
            minLength: pwd.length >= 8,
            hasNumber: /\d/.test(pwd),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
            hasUpper: /[A-Z]/.test(pwd),
            hasLower: /[a-z]/.test(pwd),
            hasMatched: pwd === formData.confirmPassword && formData.confirmPassword !== "",
        });
    }, [formData.password, formData.confirmPassword]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
    const criteriaMetCount = Object.values(passwordCriteria).filter(Boolean).length;
    const totalCriteria = Object.keys(passwordCriteria).length;

    const getStrengthColor = () => {
        const percentage = (criteriaMetCount / totalCriteria) * 100;
        if (percentage < 33) return "from-red-500 to-red-400";
        if (percentage < 66) return "from-yellow-500 to-orange-400";
        return "from-green-500 to-emerald-400";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPasswordValid) {
            toast.error("Please meet all password requirements.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/signup", {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            });
            toast.success("Account created successfully!");
            setTimeout(() => router.push("/auth/signin"), 1500);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center py-12">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient Orbs */}
                <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-pulse" />
                <div className="absolute top-0 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-pulse delay-1000" />
                <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-600 rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-pulse delay-500" />

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
                        Join CubeX
                    </h1>
                    <p className="text-neutral-500 text-sm mt-2">
                        Create your account and start solving
                    </p>
                </motion.div>

                {/* Signup Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative"
                >
                    {/* Card Glow */}
                    <div className="absolute -inset-px bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-pink-500/50 rounded-2xl blur-sm opacity-50" />

                    {/* Card Content */}
                    <div className="relative bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Username Input */}
                            <div className="space-y-2">
                                <label htmlFor="username" className="text-sm font-medium text-neutral-300">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                                        placeholder="Choose a username"
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

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
                                        className="w-full pl-12 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
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
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full pl-12 pr-12 py-3.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Password Strength Bar */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(criteriaMetCount / totalCriteria) * 100}%` }}
                                                className={cn("h-full rounded-full bg-gradient-to-r", getStrengthColor())}
                                            />
                                        </div>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            {criteriaMetCount}/{totalCriteria} requirements met
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-300">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div className="bg-black/30 rounded-xl p-4 space-y-2">
                                <p className="text-xs font-medium text-neutral-400 mb-3">Password Requirements</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <RequirementItem met={passwordCriteria.minLength} text="8+ characters" />
                                    <RequirementItem met={passwordCriteria.hasUpper} text="Uppercase" />
                                    <RequirementItem met={passwordCriteria.hasLower} text="Lowercase" />
                                    <RequirementItem met={passwordCriteria.hasNumber} text="Number" />
                                    <RequirementItem met={passwordCriteria.hasSpecial} text="Special char" />
                                    <RequirementItem met={passwordCriteria.hasMatched} text="Passwords match" />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !isPasswordValid}
                                className={cn(
                                    "w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200",
                                    loading || !isPasswordValid
                                        ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                                )}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* Sign In Link */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-sm text-neutral-400 mt-6"
                >
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                        Sign in
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <div className={cn("flex items-center gap-2 text-xs transition-colors", met ? "text-green-400" : "text-neutral-600")}>
            {met ? (
                <Check size={12} className="text-green-400" />
            ) : (
                <div className="w-3 h-3 rounded-full border border-neutral-600" />
            )}
            <span>{text}</span>
        </div>
    );
}
