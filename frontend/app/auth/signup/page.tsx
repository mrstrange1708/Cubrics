"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagicCard } from "@/components/ui/magic-card";

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
            toast.success("Account created! Redirecting to login...");
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
                <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-pulse" />
                <div className="absolute top-0 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-pulse delay-1000" />
                <div className="absolute -bottom-40 left-20 w-80 h-80 bg-cyan-600 rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-pulse delay-500" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            {/* Back Button */}
            <button
                onClick={() => router.push('/')}
                className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 text-sm text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all z-20"
            >
                <ArrowLeft size={16} />
                Back
            </button>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-sm px-4">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-14 h-14 mb-4">
                        <Image
                            src="/icon.svg"
                            alt="Cubrics Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Signup Card with MagicCard */}
                <Card className="w-full border-none p-0 shadow-none bg-transparent">
                    <MagicCard
                        gradientColor="#262626"
                        gradientFrom="#3b82f6"
                        gradientTo="#06b6d4"
                        className="p-0 rounded-2xl"
                    >
                        <CardHeader className="border-b border-white/10 p-6 pb-4">
                            <CardTitle className="text-xl">Create Account</CardTitle>
                            <CardDescription>
                                Join Cubrics and start your cubing journey
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            name="username"
                                            type="text"
                                            placeholder="cuber123"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>

                                        {/* Password Strength */}
                                        {formData.password && (
                                            <div className="mt-1">
                                                <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all",
                                                            criteriaMetCount < 3 ? "bg-red-500" :
                                                                criteriaMetCount < 5 ? "bg-yellow-500" : "bg-green-500"
                                                        )}
                                                        style={{ width: `${(criteriaMetCount / totalCriteria) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Password Requirements */}
                                    <div className="bg-black/30 rounded-lg p-3 grid grid-cols-2 gap-1.5">
                                        <RequirementItem met={passwordCriteria.minLength} text="8+ chars" />
                                        <RequirementItem met={passwordCriteria.hasUpper} text="Uppercase" />
                                        <RequirementItem met={passwordCriteria.hasLower} text="Lowercase" />
                                        <RequirementItem met={passwordCriteria.hasNumber} text="Number" />
                                        <RequirementItem met={passwordCriteria.hasSpecial} text="Special" />
                                        <RequirementItem met={passwordCriteria.hasMatched} text="Match" />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-none mt-2"
                                        disabled={loading || !isPasswordValid}
                                    >
                                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Create Account"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="border-t border-white/10 p-6 pt-4">
                            <p className="text-center text-sm text-neutral-400 w-full">
                                Already have an account?{" "}
                                <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300 font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </MagicCard>
                </Card>
            </div>
        </div>
    );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <div className={cn("flex items-center gap-1.5 text-xs transition-colors", met ? "text-green-400" : "text-neutral-600")}>
            {met ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-neutral-600" />}
            <span>{text}</span>
        </div>
    );
}
