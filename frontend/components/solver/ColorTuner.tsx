'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CubeColor } from './ColorPicker';
import { rgbToHsv, ColorReferences, DEFAULT_COLOR_REFERENCES } from '@/lib/colorDetection';
import { Pipette, Check, RotateCcw } from 'lucide-react';

interface ColorTunerProps {
    onCalibrationComplete: (references: ColorReferences) => void;
    videoRef: React.RefObject<HTMLVideoElement | null>;
}

const COLOR_ORDER: CubeColor[] = ['white', 'yellow', 'orange', 'red', 'green', 'blue'];

const COLOR_LABELS: Record<CubeColor, string> = {
    white: 'White (U)',
    yellow: 'Yellow (D)',
    orange: 'Orange (L)',
    red: 'Red (R)',
    green: 'Green (F)',
    blue: 'Blue (B)',
};

const COLOR_BG: Record<CubeColor, string> = {
    white: 'bg-white',
    yellow: 'bg-yellow-400',
    orange: 'bg-orange-500',
    red: 'bg-red-600',
    green: 'bg-green-600',
    blue: 'bg-blue-600',
};

export function ColorTuner({ onCalibrationComplete, videoRef }: ColorTunerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentColorIndex, setCurrentColorIndex] = useState(0);
    const [sampledColors, setSampledColors] = useState<Record<CubeColor, { h: number; s: number; v: number } | null>>({
        white: null,
        yellow: null,
        orange: null,
        red: null,
        green: null,
        blue: null,
    });
    const [isSampling, setIsSampling] = useState(false);

    const currentColor = COLOR_ORDER[currentColorIndex];
    const allSampled = Object.values(sampledColors).every(v => v !== null);

    // Sample color from center of video
    const sampleColor = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || video.videoWidth === 0) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);

        // Sample from center region
        const centerX = Math.floor(canvas.width / 2);
        const centerY = Math.floor(canvas.height / 2);
        const sampleSize = 40; // Larger sample for more accuracy

        const imageData = ctx.getImageData(
            centerX - sampleSize / 2,
            centerY - sampleSize / 2,
            sampleSize,
            sampleSize
        );

        let totalR = 0, totalG = 0, totalB = 0;
        const pixelCount = imageData.data.length / 4;

        for (let i = 0; i < imageData.data.length; i += 4) {
            totalR += imageData.data[i];
            totalG += imageData.data[i + 1];
            totalB += imageData.data[i + 2];
        }

        const avgR = totalR / pixelCount;
        const avgG = totalG / pixelCount;
        const avgB = totalB / pixelCount;

        const [h, s, v] = rgbToHsv(avgR, avgG, avgB);

        console.log(`Sampled ${currentColor}: H=${h.toFixed(1)}, S=${s.toFixed(1)}, V=${v.toFixed(1)}`);

        setSampledColors(prev => ({
            ...prev,
            [currentColor]: { h, s, v }
        }));

        setIsSampling(true);
        setTimeout(() => {
            setIsSampling(false);
            // Auto-advance to next color
            if (currentColorIndex < COLOR_ORDER.length - 1) {
                setCurrentColorIndex(prev => prev + 1);
            }
        }, 500);
    }, [currentColor, currentColorIndex, videoRef]);

    // Generate color references from sampled values
    const generateReferences = useCallback((): ColorReferences => {
        const references: ColorReferences = { ...DEFAULT_COLOR_REFERENCES };

        for (const [colorName, sample] of Object.entries(sampledColors)) {
            if (!sample) continue;

            const color = colorName as CubeColor;
            references[color] = {
                h: sample.h,
                s: sample.s,
                v: sample.v
            };
        }

        return references;
    }, [sampledColors]);

    const handleComplete = () => {
        const references = generateReferences();
        console.log('Generated color references:', references);
        onCalibrationComplete(references);
    };

    const handleReset = () => {
        setSampledColors({
            white: null,
            yellow: null,
            orange: null,
            red: null,
            green: null,
            blue: null,
        });
        setCurrentColorIndex(0);
    };

    // Spacebar shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                sampleColor();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [sampleColor]);

    return (
        <div className="space-y-6">
            {/* Hidden canvas for sampling */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Instructions */}
            <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">Calibrate Colors</h3>
                <p className="text-sm text-neutral-400">
                    Point your cube's <strong className="text-white">{COLOR_LABELS[currentColor]}</strong> center at the crosshair and click sample
                </p>
            </div>

            {/* Current color indicator */}
            <div className="flex justify-center">
                <div className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all",
                    COLOR_BG[currentColor],
                    isSampling && "scale-110 ring-4 ring-white/50"
                )}>
                    {sampledColors[currentColor] ? (
                        <Check className="w-8 h-8 text-black/60" />
                    ) : (
                        <Pipette className="w-8 h-8 text-black/40" />
                    )}
                </div>
            </div>

            {/* Color progress */}
            <div className="flex justify-center gap-2">
                {COLOR_ORDER.map((color, idx) => (
                    <button
                        key={color}
                        onClick={() => setCurrentColorIndex(idx)}
                        className={cn(
                            "w-8 h-8 rounded-lg transition-all",
                            COLOR_BG[color],
                            currentColorIndex === idx && "ring-2 ring-white ring-offset-2 ring-offset-black scale-110",
                            sampledColors[color] && "opacity-100",
                            !sampledColors[color] && currentColorIndex !== idx && "opacity-40"
                        )}
                    >
                        {sampledColors[color] && (
                            <Check className="w-4 h-4 mx-auto text-black/60" />
                        )}
                    </button>
                ))}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                >
                    <RotateCcw size={16} />
                    Reset
                </button>

                <button
                    onClick={sampleColor}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all",
                        "bg-blue-600 hover:bg-blue-500 text-white",
                        isSampling && "scale-95"
                    )}
                >
                    <Pipette size={16} />
                    Sample {COLOR_LABELS[currentColor].split(' ')[0]}
                </button>

                {allSampled && (
                    <button
                        onClick={handleComplete}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold text-white transition-all"
                    >
                        <Check size={16} />
                        Done
                    </button>
                )}
            </div>

            {/* Sampled values display */}
            {sampledColors[currentColor] && (
                <div className="text-center text-xs text-neutral-500">
                    HSV: {Math.round(sampledColors[currentColor]!.h)}°, {Math.round(sampledColors[currentColor]!.s)}%, {Math.round(sampledColors[currentColor]!.v)}%
                </div>
            )}

            {/* Skip calibration */}
            <div className="text-center">
                <button
                    onClick={() => onCalibrationComplete(DEFAULT_COLOR_REFERENCES)}
                    className="text-xs text-neutral-500 hover:text-neutral-300 underline"
                >
                    Skip calibration (use defaults)
                </button>
            </div>
        </div>
    );
}
