import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MoveRight } from "lucide-react";

const Navbar = () => {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6">
            <nav className="flex items-center justify-between px-6 py-3 w-[90%] max-w-5xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-8 h-8 overflow-hidden rounded-lg">
                        <Image
                            src="/logo.png"
                            alt="CubeX Logo"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">CubeX</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
                    <Link href="/solver" className="hover:text-white transition-colors hover:scale-105 transform">Solver</Link>
                    <Link href="/timer" className="hover:text-white transition-colors hover:scale-105 transform">Timer</Link>
                    <Link href="/learn" className="hover:text-white transition-colors hover:scale-105 transform">Learn</Link>
                    <Link href="/leaderboard" className="hover:text-white transition-colors hover:scale-105 transform">Leaderboard</Link>
                </div>

                <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95">
                    Start <MoveRight size={14} />
                </button>
            </nav>
        </div>
    );
};

export default Navbar;
