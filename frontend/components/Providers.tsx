'use client';

import { AuthProvider } from '@/context/AuthContext';
import { CubeProvider } from '@/context/CubeContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <CubeProvider>
                {children}
            </CubeProvider>
        </AuthProvider>
    );
}
