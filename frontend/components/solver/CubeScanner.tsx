'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, FlipHorizontal, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CubeColor } from './ColorPicker';
import { sampleColorsFromCanvas, drawGridOverlay } from '@/lib/colorDetection';

interface CubeScannerProps {
    onCapture: (colors: CubeColor[]) => void;
    isMirrored: boolean;
    onMirrorToggle: () => void;
}

export function CubeScanner({ onCapture, isMirrored, onMirrorToggle }: CubeScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [previewColors, setPreviewColors] = useState<CubeColor[]>([]);

    // Initialize camera
    useEffect(() => {
        let stream: MediaStream | null = null;
        let isMounted = true;

        const initCamera = async () => {
            try {
                setIsLoading(true);
                setError(null);

                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment', // Prefer back camera on mobile
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    }
                });

                if (videoRef.current && isMounted) {
                    videoRef.current.srcObject = stream;

                    // Wait for video to actually start playing
                    videoRef.current.onloadedmetadata = () => {
                        if (isMounted) {
                            videoRef.current?.play()
                                .then(() => {
                                    if (isMounted) {
                                        setIsLoading(false);
                                        setError(null); // Clear any error
                                    }
                                })
                                .catch(err => {
                                    console.error('Video play error:', err);
                                    if (isMounted) {
                                        setError('Failed to start video stream');
                                        setIsLoading(false);
                                    }
                                });
                        }
                    };
                }
            } catch (err) {
                console.error('Camera error:', err);
                if (isMounted) {
                    setError('Unable to access camera. Please grant camera permissions and refresh.');
                    setIsLoading(false);
                }
            }
        };

        initCamera();

        return () => {
            isMounted = false;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Draw grid overlay
    useEffect(() => {
        const drawOverlay = () => {
            const overlay = overlayRef.current;
            const video = videoRef.current;

            if (!overlay || !video || video.videoWidth === 0) return;

            overlay.width = video.videoWidth;
            overlay.height = video.videoHeight;

            const ctx = overlay.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, overlay.width, overlay.height);
            drawGridOverlay(ctx, overlay.width, overlay.height, 3, 'rgba(255, 255, 255, 0.6)');
        };

        const interval = setInterval(drawOverlay, 100);
        return () => clearInterval(interval);
    }, []);

    // Real-time color preview
    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        const updatePreview = () => {
            if (video.videoWidth === 0 || video.videoHeight === 0) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Handle mirroring
            if (isMirrored) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            ctx.drawImage(video, 0, 0);

            // Reset transform for sampling
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            // Sample colors for preview
            const colors = sampleColorsFromCanvas(canvas, ctx, 3, 15);
            setPreviewColors(colors);
        };

        const interval = setInterval(updatePreview, 200);
        return () => clearInterval(interval);
    }, [isMirrored]);

    const handleCapture = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || video.videoWidth === 0) return;

        setIsCapturing(true);

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Handle mirroring
        if (isMirrored) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const colors = sampleColorsFromCanvas(canvas, ctx, 3, 15);
        onCapture(colors);

        setTimeout(() => setIsCapturing(false), 300);
    }, [isMirrored, onCapture]);

    // Spacebar shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !isLoading && !error) {
                e.preventDefault();
                handleCapture();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleCapture, isLoading, error]);

    // Color preview grid
    const colorToBg: Record<CubeColor, string> = {
        white: 'bg-white',
        yellow: 'bg-yellow-400',
        red: 'bg-red-600',
        orange: 'bg-orange-500',
        blue: 'bg-blue-600',
        green: 'bg-green-600',
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Video container */}
            <div className={cn(
                "relative rounded-2xl overflow-hidden bg-black border-2 transition-all duration-300",
                isCapturing ? "border-blue-500 shadow-lg shadow-blue-500/30" : "border-white/10"
            )}>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                        <div className="text-center space-y-3">
                            <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto" />
                            <p className="text-sm text-neutral-400">Starting camera...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 p-6">
                        <div className="text-center space-y-3 max-w-xs">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                            <p className="text-red-400 text-sm">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn(
                        "w-full max-w-md aspect-[4/3] object-cover",
                        isMirrored && "scale-x-[-1]"
                    )}
                />

                {/* Grid overlay */}
                <canvas
                    ref={overlayRef}
                    className={cn(
                        "absolute inset-0 w-full h-full pointer-events-none",
                        isMirrored && "scale-x-[-1]"
                    )}
                />

                {/* Hidden canvas for processing */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Live color preview overlay */}
                {previewColors.length === 9 && !isLoading && !error && (
                    <div className="absolute bottom-3 left-3 grid grid-cols-3 gap-0.5 bg-black/50 p-1 rounded-lg backdrop-blur-sm">
                        {previewColors.map((color, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "w-4 h-4 rounded-sm transition-colors",
                                    colorToBg[color]
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Instructions */}
            <p className="text-sm text-neutral-400 text-center">
                Align your cube and press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono">Space</kbd> or click <strong>Capture Face</strong> to record.
            </p>

            {/* Controls */}
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={isMirrored}
                        onChange={onMirrorToggle}
                        className="w-4 h-4 rounded accent-blue-500"
                    />
                    <FlipHorizontal size={16} />
                    Mirror
                </label>

                <button
                    onClick={handleCapture}
                    disabled={isLoading || !!error}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all",
                        "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        isCapturing && "scale-95"
                    )}
                >
                    <Camera size={18} />
                    Capture Face
                </button>
            </div>
        </div>
    );
}
