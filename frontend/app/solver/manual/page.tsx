'use client';

import { CubeNet } from '@/components/solver/CubeNet';
import { ColorPicker } from '@/components/solver/ColorPicker';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Play, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { MultiStepLoader } from '@/components/ui/multi-step-loader';
import { useCube } from '@/context/CubeContext';
import { FaceKey } from '@/components/solver/CubeNet';

const loadingStates = [
    { text: "Initializing Cubie Model" },
    { text: "Searching for Optimal Solution" },
    { text: "Optimizing Solution Depth" },
    { text: "Loading 3D Visualization" },
];

export default function SolvePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const shouldReset = searchParams.get('reset');

    const {
        cubeState,
        isSolving,
        error,
        selectedColor,
        updateSticker,
        setSelectedColor,
        resetCube,
        solve,
        scramble
    } = useCube();

    const [loaderActive, setLoaderActive] = useState(false);
    const [isWorkDone, setIsWorkDone] = useState(false);

    useEffect(() => {
        if (shouldReset) {
            resetCube();
            router.replace('/solver/manual');
        }
    }, [shouldReset, resetCube, router]);

    const handleStickerClick = (face: FaceKey, index: number) => {
        updateSticker(face, index, selectedColor);
    };

    const handleSolve = async () => {
        setLoaderActive(true);
        setIsWorkDone(false);
        const success = await solve();

        if (success) {
            setIsWorkDone(true);
        } else {
            setLoaderActive(false);
        }
    };

    const onLoaderComplete = () => {
        setLoaderActive(false);
        router.push('/solution');
    };

    return (
        <div className="min-h-screen bg-black/95 text-foreground p-8 flex flex-col items-center justify-center relative overflow-hidden pb-20">
            <MultiStepLoader
                loadingStates={loadingStates}
                loading={loaderActive}
                duration={1500}
                loop={false}
                finished={isWorkDone}
                onAnimationComplete={onLoaderComplete}
            />

            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <Navbar />


            <div className="z-10 w-full max-w-6xl flex flex-col items-center gap-12 pt-20">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                        Cube Solver
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Paint your cube's colors onto the net below. Ensure the orientation matches.
                    </p>
                </div>

                {error && (
                    <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-center animate-in fade-in slide-in-from-top-4 duration-300">
                        <p className="font-bold flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            Configuration Error
                        </p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-16 items-center justify-center w-full">
                    <div className="flex flex-col gap-8 order-2 lg:order-1 min-w-[300px]">
                        <ColorPicker
                            selectedColor={selectedColor}
                            onColorSelect={setSelectedColor}
                        />

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={resetCube}
                                disabled={isSolving}
                                className="border-white/10 hover:bg-white/5 hover:text-white"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={scramble}
                                disabled={isSolving}
                                className="border-white/10 hover:bg-white/5 hover:text-white"
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                Scramble
                            </Button>
                            <Button
                                size="lg"
                                onClick={handleSolve}
                                disabled={isSolving}
                                className="col-span-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Solve
                            </Button>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 scale-110 lg:scale-125 transform origin-center">
                        <CubeNet
                            cubeState={cubeState}
                            onStickerClick={handleStickerClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
