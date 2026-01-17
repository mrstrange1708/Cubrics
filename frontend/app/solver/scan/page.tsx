'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar'
import { ScanNet, ScanCubeState, FaceKey } from '@/components/solver/ScanNet';
import { CubeColor } from '@/components/solver/ColorPicker';
import { useCube } from '@/context/CubeContext';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';
import { ColorTuner } from '@/components/solver/ColorTuner';
import { ColorReferences, DEFAULT_COLOR_REFERENCES, sampleColorsFromCanvas, drawGridOverlay } from '@/lib/colorDetection';
import {
    Camera, Check, RotateCcw, ArrowRight, Sparkles,
    ChevronLeft, ChevronRight, Edit3, AlertCircle, Pipette, FlipHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';

// Face scanning order for guided flow
const FACE_ORDER: FaceKey[] = ['U', 'F', 'R', 'B', 'L', 'D'];

const FACE_INSTRUCTIONS: Record<FaceKey, string> = {
    U: 'Hold the cube with WHITE center facing you',
    F: 'Rotate cube to show the GREEN face',
    R: 'Rotate right to show the RED face',
    B: 'Rotate right to show the BLUE face',
    L: 'Rotate right to show the ORANGE face',
    D: 'Tilt cube forward to show YELLOW face',
};

function createEmptyScanState(): ScanCubeState {
    return {
        U: Array(9).fill(null),
        D: Array(9).fill(null),
        F: Array(9).fill(null),
        B: Array(9).fill(null),
        L: Array(9).fill(null),
        R: Array(9).fill(null),
    };
}

function ScanPageContent() {
    const router = useRouter();
    const { setCubeState } = useCube();

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);

    // Camera state
    const [isLoading, setIsLoading] = useState(true);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isMirrored, setIsMirrored] = useState(true);
    const [isCapturing, setIsCapturing] = useState(false);
    const [previewColors, setPreviewColors] = useState<CubeColor[]>([]);

    // Calibration state
    const [activeTab, setActiveTab] = useState<'tune' | 'scan' | 'manual'>('tune');
    const [colorReferences, setColorReferences] = useState<ColorReferences>(DEFAULT_COLOR_REFERENCES);
    const [isCalibrated, setIsCalibrated] = useState(false);

    // Scan state
    const [scanState, setScanState] = useState<ScanCubeState>(createEmptyScanState());
    const [selectedFace, setSelectedFace] = useState<FaceKey>('U');

    // Count completed faces
    const completedFaces = FACE_ORDER.filter(face =>
        scanState[face].every(c => c !== null)
    );
    const isAllComplete = completedFaces.length === 6;

    // Initialize camera
    React.useEffect(() => {
        let stream: MediaStream | null = null;
        let isMounted = true;

        const initCamera = async () => {
            try {
                setIsLoading(true);
                setCameraError(null);

                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    }
                });

                if (videoRef.current && isMounted) {
                    videoRef.current.srcObject = stream;

                    videoRef.current.onloadedmetadata = () => {
                        if (isMounted && videoRef.current) {
                            videoRef.current.play()
                                .then(() => {
                                    if (isMounted) {
                                        setIsLoading(false);
                                        setCameraError(null);
                                    }
                                })
                                .catch(err => {
                                    console.error('Video play error:', err);
                                    if (isMounted) {
                                        setCameraError('Failed to start video stream');
                                        setIsLoading(false);
                                    }
                                });
                        }
                    };
                }
            } catch (err) {
                console.error('Camera error:', err);
                if (isMounted) {
                    setCameraError('Unable to access camera. Please grant permissions and refresh.');
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
    React.useEffect(() => {
        if (activeTab !== 'scan') return;

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
    }, [activeTab]);

    // Real-time color preview
    React.useEffect(() => {
        if (activeTab !== 'scan') return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        const updatePreview = () => {
            if (video.videoWidth === 0 || video.videoHeight === 0) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            if (isMirrored) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            ctx.drawImage(video, 0, 0);
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            const colors = sampleColorsFromCanvas(canvas, ctx, 3, 15, colorReferences);
            setPreviewColors(colors);
        };

        const interval = setInterval(updatePreview, 200);
        return () => clearInterval(interval);
    }, [isMirrored, activeTab, colorReferences]);

    // Handle calibration complete
    const handleCalibrationComplete = useCallback((references: ColorReferences) => {
        setColorReferences(references);
        setIsCalibrated(true);
        setActiveTab('scan');
        toast.success('Colors calibrated! Ready to scan.');
    }, []);

    // Handle face capture
    const handleCapture = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || video.videoWidth === 0) return;

        setIsCapturing(true);

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (isMirrored) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const colors = sampleColorsFromCanvas(canvas, ctx, 3, 15, colorReferences);

        setScanState(prev => ({
            ...prev,
            [selectedFace]: colors
        }));

        toast.success(`${selectedFace} face captured!`);

        // Auto-advance to next face
        const currentIndex = FACE_ORDER.indexOf(selectedFace);
        if (currentIndex < FACE_ORDER.length - 1) {
            setTimeout(() => {
                setSelectedFace(FACE_ORDER[currentIndex + 1]);
            }, 500);
        }

        setTimeout(() => setIsCapturing(false), 300);
    }, [isMirrored, selectedFace, colorReferences]);

    // Spacebar shortcut
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && activeTab === 'scan' && !isLoading && !cameraError) {
                e.preventDefault();
                handleCapture();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleCapture, isLoading, cameraError, activeTab]);

    // Navigate faces
    const goToPrevFace = () => {
        const currentIndex = FACE_ORDER.indexOf(selectedFace);
        if (currentIndex > 0) {
            setSelectedFace(FACE_ORDER[currentIndex - 1]);
        }
    };

    const goToNextFace = () => {
        const currentIndex = FACE_ORDER.indexOf(selectedFace);
        if (currentIndex < FACE_ORDER.length - 1) {
            setSelectedFace(FACE_ORDER[currentIndex + 1]);
        }
    };

    // Clear all scans
    const handleClear = () => {
        setScanState(createEmptyScanState());
        setSelectedFace('U');
        toast.info('All faces cleared');
    };

    // Validate and proceed
    const handleValidate = () => {
        if (!isAllComplete) {
            toast.error('Please scan all 6 faces before validating');
            return;
        }

        const cubeState = {
            U: scanState.U as CubeColor[],
            D: scanState.D as CubeColor[],
            F: scanState.F as CubeColor[],
            B: scanState.B as CubeColor[],
            L: scanState.L as CubeColor[],
            R: scanState.R as CubeColor[],
        };

        // Validate center pieces
        const centers = [
            cubeState.U[4], cubeState.D[4], cubeState.F[4],
            cubeState.B[4], cubeState.L[4], cubeState.R[4]
        ];
        const uniqueCenters = new Set(centers);
        if (uniqueCenters.size !== 6) {
            toast.error('Invalid cube: Each face must have a unique center color');
            return;
        }

        // Validate color count (9 of each)
        const colorCounts: Record<CubeColor, number> = {
            white: 0, yellow: 0, red: 0, orange: 0, blue: 0, green: 0
        };
        Object.values(cubeState).forEach(face => {
            face.forEach(color => {
                colorCounts[color]++;
            });
        });
        const invalidColor = Object.entries(colorCounts).find(([_, count]) => count !== 9);
        if (invalidColor) {
            toast.error(`Invalid cube: Expected 9 ${invalidColor[0]} stickers, found ${invalidColor[1]}`);
            return;
        }

        setCubeState(cubeState);
        toast.success('Cube validated! Proceeding to solver...');
        router.push('/solver/manual');
    };

    const currentFaceIndex = FACE_ORDER.indexOf(selectedFace);

    // Color preview box colors
    const colorToBg: Record<CubeColor, string> = {
        white: 'bg-white',
        yellow: 'bg-yellow-400',
        red: 'bg-red-600',
        orange: 'bg-orange-500',
        blue: 'bg-blue-600',
        green: 'bg-green-600',
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
            <Navbar />

            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
                <BackgroundRippleEffect />
            </div>

            <main className="relative z-10 container mx-auto py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
                            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                                Scan Your Cube
                            </span>
                        </h1>
                        <p className="text-neutral-400 max-w-lg mx-auto">
                            {activeTab === 'tune'
                                ? 'First, calibrate the colors by sampling each face center'
                                : 'Capture each face of your Rubik\'s Cube'
                            }
                        </p>
                    </div>

                    {/* Progress indicator */}
                    {activeTab === 'scan' && (
                        <div className="flex justify-center mb-8">
                            <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2">
                                {FACE_ORDER.map((face) => (
                                    <button
                                        key={face}
                                        onClick={() => setSelectedFace(face)}
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                            selectedFace === face
                                                ? "bg-blue-500 text-white scale-110"
                                                : scanState[face].every(c => c !== null)
                                                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                                    : "bg-white/10 text-neutral-500"
                                        )}
                                    >
                                        {scanState[face].every(c => c !== null) ? (
                                            <Check size={14} />
                                        ) : (
                                            face
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main content */}
                    <div className="grid lg:grid-cols-2 gap-8 items-start">
                        {/* Left: Camera */}
                        <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
                            {/* Tabs */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setActiveTab('tune')}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                                        activeTab === 'tune'
                                            ? "bg-purple-500 text-white"
                                            : isCalibrated
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-white/5 text-neutral-400 hover:text-white"
                                    )}
                                >
                                    <Pipette size={16} />
                                    Tune Colors
                                    {isCalibrated && <Check size={14} />}
                                </button>
                                <button
                                    onClick={() => setActiveTab('scan')}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                                        activeTab === 'scan'
                                            ? "bg-blue-500 text-white"
                                            : "bg-white/5 text-neutral-400 hover:text-white"
                                    )}
                                >
                                    <Camera size={16} />
                                    Scanning Faces
                                </button>
                                <button
                                    onClick={() => setActiveTab('manual')}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                                        activeTab === 'manual'
                                            ? "bg-orange-500 text-white"
                                            : "bg-white/5 text-neutral-400 hover:text-white"
                                    )}
                                >
                                    <Edit3 size={16} />
                                    Manual Edit
                                </button>
                            </div>

                            {/* Camera feed (shared between tune and scan) */}
                            {(activeTab === 'tune' || activeTab === 'scan') && (
                                <div className={cn(
                                    "relative rounded-2xl overflow-hidden bg-black border-2 transition-all duration-300 mb-4",
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

                                    {cameraError && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 p-6">
                                            <div className="text-center space-y-3 max-w-xs">
                                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                                                <p className="text-red-400 text-sm">{cameraError}</p>
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
                                            "w-full aspect-[4/3] object-cover",
                                            isMirrored && "scale-x-[-1]"
                                        )}
                                    />

                                    {/* Grid overlay (only for scan mode) */}
                                    {activeTab === 'scan' && (
                                        <canvas
                                            ref={overlayRef}
                                            className={cn(
                                                "absolute inset-0 w-full h-full pointer-events-none",
                                                isMirrored && "scale-x-[-1]"
                                            )}
                                        />
                                    )}

                                    {/* Crosshair (only for tune mode) */}
                                    {activeTab === 'tune' && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-16 h-16 border-2 border-white/50 rounded-lg flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Hidden canvas for processing */}
                                    <canvas ref={canvasRef} className="hidden" />

                                    {/* Live color preview (only for scan mode) */}
                                    {activeTab === 'scan' && previewColors.length === 9 && !isLoading && !cameraError && (
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
                            )}

                            {/* Tab content */}
                            {activeTab === 'tune' && (
                                <ColorTuner
                                    onCalibrationComplete={handleCalibrationComplete}
                                    videoRef={videoRef}
                                />
                            )}

                            {activeTab === 'scan' && (
                                <>
                                    {/* Face instruction */}
                                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                        <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                                            <Sparkles size={16} />
                                            Scanning: <span className="font-bold">{selectedFace} Face</span>
                                        </div>
                                        <p className="text-neutral-400 text-sm mt-1">
                                            {FACE_INSTRUCTIONS[selectedFace]}
                                        </p>
                                    </div>

                                    {/* Instructions */}
                                    <p className="text-sm text-neutral-400 text-center mb-4">
                                        Align your cube and press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono">Space</kbd> or click <strong>Capture Face</strong>
                                    </p>

                                    {/* Controls */}
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={isMirrored}
                                                onChange={() => setIsMirrored(!isMirrored)}
                                                className="w-4 h-4 rounded accent-blue-500"
                                            />
                                            <FlipHorizontal size={16} />
                                            Mirror
                                        </label>

                                        <button
                                            onClick={handleCapture}
                                            disabled={isLoading || !!cameraError}
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

                                    {/* Face navigation */}
                                    <div className="flex justify-between items-center">
                                        <button
                                            onClick={goToPrevFace}
                                            disabled={currentFaceIndex === 0}
                                            className="flex items-center gap-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={16} />
                                            Previous
                                        </button>

                                        <span className="text-neutral-500 text-sm">
                                            Face {currentFaceIndex + 1} of 6
                                        </span>

                                        <button
                                            onClick={goToNextFace}
                                            disabled={currentFaceIndex === 5}
                                            className="flex items-center gap-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            Next
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </>
                            )}

                            {activeTab === 'manual' && (
                                <div className="text-center py-12">
                                    <Edit3 size={48} className="mx-auto text-neutral-600 mb-4" />
                                    <p className="text-neutral-400 mb-4">
                                        Need to make corrections? Use the manual editor.
                                    </p>
                                    <button
                                        onClick={() => router.push('/solver/manual')}
                                        className="px-6 py-3 bg-orange-600 hover:bg-orange-500 rounded-full font-semibold"
                                    >
                                        Open Manual Editor
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right: Cube net preview */}
                        <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Scanned Faces
                                </h3>
                                <span className={cn(
                                    "text-sm font-medium px-3 py-1 rounded-full",
                                    isAllComplete
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-orange-500/20 text-orange-400"
                                )}>
                                    {completedFaces.length}/6 Complete
                                </span>
                            </div>

                            {/* Mirror indicator */}
                            {isMirrored && (
                                <div className="text-xs text-neutral-500 mb-4 flex items-center gap-1">
                                    <FlipHorizontal size={12} />
                                    Mirror is ON
                                </div>
                            )}

                            {/* Net visualization */}
                            <ScanNet
                                cubeState={scanState}
                                selectedFace={selectedFace}
                                onFaceSelect={setSelectedFace}
                            />

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleClear}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors"
                                >
                                    <RotateCcw size={18} />
                                    Clear
                                </button>
                                <button
                                    onClick={handleValidate}
                                    disabled={!isAllComplete}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all",
                                        isAllComplete
                                            ? "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/25"
                                            : "bg-white/10 text-neutral-500 cursor-not-allowed"
                                    )}
                                >
                                    Validate
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ScanPage() {
    return (
        <ProtectedRoute>
            <ScanPageContent />
        </ProtectedRoute>
    );
}
