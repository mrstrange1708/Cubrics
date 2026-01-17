'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CubeColor } from './ColorPicker';

export type FaceKey = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';

export type ScanCubeState = Record<FaceKey, (CubeColor | null)[]>;

interface ScanNetProps {
    cubeState: ScanCubeState;
    selectedFace: FaceKey | null;
    onFaceSelect: (face: FaceKey) => void;
}

const colorMap: Record<CubeColor, string> = {
    white: 'bg-white',
    yellow: 'bg-yellow-400',
    red: 'bg-red-600',
    orange: 'bg-orange-500',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
};

const faceLabels: Record<FaceKey, string> = {
    U: 'Up',
    D: 'Down',
    F: 'Front',
    B: 'Back',
    L: 'Left',
    R: 'Right',
};

const ScanFaceGrid = ({
    face,
    colors,
    isSelected,
    isComplete,
    onClick
}: {
    face: FaceKey;
    colors: (CubeColor | null)[];
    isSelected: boolean;
    isComplete: boolean;
    onClick: () => void;
}) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative p-1 rounded-lg transition-all duration-300",
                isSelected
                    ? "ring-2 ring-blue-500 bg-blue-500/10 scale-105"
                    : "bg-black/20 hover:bg-white/5",
                isComplete && !isSelected && "ring-2 ring-green-500/50"
            )}
        >
            <div className="grid grid-cols-3 gap-0.5">
                {colors.map((color, idx) => (
                    <div
                        key={`${face}-${idx}`}
                        className={cn(
                            "w-6 h-6 sm:w-7 sm:h-7 rounded-sm transition-all",
                            color ? colorMap[color] : "bg-neutral-800 border border-dashed border-neutral-600",
                            "shadow-sm"
                        )}
                    />
                ))}
            </div>
            {/* Face label */}
            <div className={cn(
                "absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider",
                isSelected ? "text-blue-400" : isComplete ? "text-green-400" : "text-neutral-500"
            )}>
                {faceLabels[face]}
            </div>
        </button>
    );
};

export function ScanNet({ cubeState, selectedFace, onFaceSelect }: ScanNetProps) {
    const isFaceComplete = (face: FaceKey) => cubeState[face].every(c => c !== null);

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div className="text-sm text-neutral-400 mb-2">
                Click a face to select it for scanning
            </div>

            {/* Standard cube net layout */}
            <div className="flex flex-col items-center gap-1">
                {/* Row 1: U (Top) */}
                <div className="grid grid-cols-4 gap-1" style={{ width: 'fit-content' }}>
                    <div className="col-start-2">
                        <ScanFaceGrid
                            face="U"
                            colors={cubeState.U}
                            isSelected={selectedFace === 'U'}
                            isComplete={isFaceComplete('U')}
                            onClick={() => onFaceSelect('U')}
                        />
                    </div>
                </div>

                {/* Row 2: L, F, R, B */}
                <div className="flex gap-1 mt-6">
                    <ScanFaceGrid
                        face="L"
                        colors={cubeState.L}
                        isSelected={selectedFace === 'L'}
                        isComplete={isFaceComplete('L')}
                        onClick={() => onFaceSelect('L')}
                    />
                    <ScanFaceGrid
                        face="F"
                        colors={cubeState.F}
                        isSelected={selectedFace === 'F'}
                        isComplete={isFaceComplete('F')}
                        onClick={() => onFaceSelect('F')}
                    />
                    <ScanFaceGrid
                        face="R"
                        colors={cubeState.R}
                        isSelected={selectedFace === 'R'}
                        isComplete={isFaceComplete('R')}
                        onClick={() => onFaceSelect('R')}
                    />
                    <ScanFaceGrid
                        face="B"
                        colors={cubeState.B}
                        isSelected={selectedFace === 'B'}
                        isComplete={isFaceComplete('B')}
                        onClick={() => onFaceSelect('B')}
                    />
                </div>

                {/* Row 3: D (Bottom) */}
                <div className="grid grid-cols-4 gap-1 mt-6" style={{ width: 'fit-content' }}>
                    <div className="col-start-2">
                        <ScanFaceGrid
                            face="D"
                            colors={cubeState.D}
                            isSelected={selectedFace === 'D'}
                            isComplete={isFaceComplete('D')}
                            onClick={() => onFaceSelect('D')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
