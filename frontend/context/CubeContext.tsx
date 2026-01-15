'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CubeState, FaceKey } from '@/components/solver/CubeNet';
import { Phase, cubeApi } from '@/api/cube.api';
import { CubeColor } from '@/components/solver/ColorPicker';
import { toast } from 'react-toastify';

interface CubeContextType {
    cubeState: CubeState;
    solutionPhases: Phase[];
    isSolving: boolean;
    error: string | null;
    selectedColor: CubeColor;
    setCubeState: (state: CubeState) => void;
    updateSticker: (face: FaceKey, index: number, color: CubeColor) => void;
    setSelectedColor: (color: CubeColor) => void;
    resetCube: () => void;
    solve: () => Promise<boolean>;
    scramble: () => Promise<void>;
}

const initialCubeState: CubeState = {
    U: Array(9).fill('white'),
    L: Array(9).fill('orange'),
    F: Array(9).fill('green'),
    R: Array(9).fill('red'),
    B: Array(9).fill('blue'),
    D: Array(9).fill('yellow'),
};

const CubeContext = createContext<CubeContextType | undefined>(undefined);

export function CubeProvider({ children }: { children: ReactNode }) {
    const [cubeState, setCubeState] = useState<CubeState>(initialCubeState);
    const [solutionPhases, setSolutionPhases] = useState<Phase[]>([]);
    const [isSolving, setIsSolving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<CubeColor>('white');

    const updateSticker = useCallback((face: FaceKey, index: number, color: CubeColor) => {
        setCubeState(prev => ({
            ...prev,
            [face]: prev[face].map((c, i) => i === index ? color : c)
        }));
    }, []);

    const resetCube = useCallback(() => {
        setCubeState(initialCubeState);
        setError(null);
        setSolutionPhases([]);
    }, []);

    const solve = useCallback(async () => {
        setIsSolving(true);
        setError(null);
        try {
            const data = await cubeApi.solveCube(cubeState);

            if (data.message && data.message.includes('already solved')) {
                setIsSolving(false);
                toast.success(data.message);
                return false; // Don't redirect if already solved
            }

            if (!data.valid || data.error) {
                const errorMsg = data.error || 'Failed to solve cube';
                setError(errorMsg);
                toast.error(errorMsg);
                setIsSolving(false);
                return false;
            }

            setSolutionPhases(data.phases);

            // Keep loading for animation
            await new Promise(resolve => setTimeout(resolve, 3500));
            setIsSolving(false);
            return true;
        } catch (err: any) {
            setIsSolving(false);
            const errorMessage = err.error || err.message || 'An error occurred while solving the cube';
            setError(errorMessage);
            toast.error(errorMessage);
            return false;
        }
    }, [cubeState]); // data depends on current cubeState

    const scramble = useCallback(async () => {
        setIsSolving(true);
        try {
            const data = await cubeApi.scrambleCube();
            setCubeState(data.stickers);
            setError(null);
            setSolutionPhases([]);
            toast.info("Cube Scrambled!");
        } catch (err: any) {
            toast.error("Scramble failed");
        } finally {
            setIsSolving(false);
        }
    }, []);

    return (
        <CubeContext.Provider value={{
            cubeState,
            solutionPhases,
            isSolving,
            error,
            selectedColor,
            setCubeState,
            updateSticker,
            setSelectedColor,
            resetCube,
            solve,
            scramble
        }}>
            {children}
        </CubeContext.Provider>
    );
}

export function useCube() {
    const context = useContext(CubeContext);
    if (context === undefined) {
        throw new Error('useCube must be used within a CubeProvider');
    }
    return context;
}
