"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
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

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

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
            router.push("/explore");
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

            {/* Back Button */}
            <button
                onClick={() => router.push('/')}
                className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 text-sm text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
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

                {/* Login Card with MagicCard */}
                <Card className="w-full border-none p-0 shadow-none bg-transparent">
                    <MagicCard
                        gradientColor="#262626"
                        gradientFrom="#3b82f6"
                        gradientTo="#8b5cf6"
                        className="p-0 rounded-2xl"
                    >
                        <CardHeader className="border-b border-white/10 p-6 pb-4">
                            <CardTitle className="text-xl">Welcome Back</CardTitle>
                            <CardDescription>
                                Enter your credentials to access your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-4">
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
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                            <Link
                                                href="/auth/forgot-password"
                                                className="text-xs text-blue-400 hover:text-blue-300"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-none mt-2"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign In"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="border-t border-white/10 p-6 pt-4">
                            <p className="text-center text-sm text-neutral-400 w-full">
                                Don't have an account?{" "}
                                <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                                    Sign up
                                </Link>
                            </p>
                        </CardFooter>
                    </MagicCard>

                </Card>
            </div>
        </div>
    );
}
