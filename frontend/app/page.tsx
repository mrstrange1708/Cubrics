"use client";

import React, { useState, useEffect } from "react";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import Navbar from "@/components/Navbar";
import { Box, Timer, BookText, Trophy, ArrowRight, Sparkles } from "lucide-react";
import Preloader from "@/components/Preloader";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Preloader />;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-start overflow-hidden bg-black text-white px-4">
      <Navbar />

      {/* Background Ripple */}
      <div className="absolute inset-0 z-0 opacity-100 pointer-events-none overflow-hidden [mask-image:linear-gradient(to_bottom,white,transparent)]">
        <BackgroundRippleEffect rows={35} cols={70} cellSize={50} />
      </div>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center mt-40 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          LOGIC-FIRST SOLVER
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent italic">
          SOLVE THE LOGIC.<br />MASTER THE CUBE.
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-neutral-400 mb-10">
          A premium platform build for algorithmic thinking. Solve complex cubes using
          our deterministic logic engine or challenge yourself against the clock.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-2">
            Launch Solver <ArrowRight size={20} />
          </button>
          <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all">
            Join Challenge
          </button>
        </div>

        {/* Features Grid */}
        <div className="mt-32 w-full max-w-7xl px-4">
          <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2 text-left">
            <GridItem
              area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
              icon={<Box className="h-4 w-4 text-blue-500" />}
              title="Logic Solver"
              description="Human-style layer-by-layer solving logic. No brute force, just pure algorithms designed for explainability."
            />

            <GridItem
              area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
              icon={<Timer className="h-4 w-4 text-purple-500" />}
              title="Challenge Mode"
              description="Track your moves and time accurately with our integrated competitive timer and scramble generator."
            />

            <GridItem
              area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
              icon={<BookText className="h-4 w-4 text-emerald-500" />}
              title="Learn Center"
              description="Step-by-step guides explaining the core logic behind every cube rotation and algorithm phase."
            />

            <GridItem
              area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
              icon={<Trophy className="h-4 w-4 text-amber-500" />}
              title="Leaderboards"
              description="Compare your solving speed and logic efficiency with cubers worldwide. Coming soon in Phase 2."
            />

            <GridItem
              area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
              icon={<Sparkles className="h-4 w-4 text-indigo-400" />}
              title="Premium Visuals"
              description="Experience the cube like never before with high-end 3D visualizations and smooth animations."
            />
          </ul>
        </div>
      </main>

      <footer className="relative z-10 mt-40 pb-10 text-neutral-600 text-sm font-mono">
        &copy; {new Date().getFullYear()} CUBEX PLATFORM. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-2xl border border-white/10 p-2 md:rounded-3xl md:p-3 bg-white/[0.01]">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={1.5}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 shadow-[0px_0px_27px_0px_#1A1A1A]">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-white/10 bg-black p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 font-sans text-xl/[1.375rem] font-bold text-white md:text-2xl/[1.875rem]">
                {title}
              </h3>
              <p className="font-sans text-sm/[1.125rem] text-neutral-500 md:text-base/[1.375rem]">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
