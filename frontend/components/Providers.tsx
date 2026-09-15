'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CubeProvider } from '@/context/CubeContext';
import { SocketProvider } from '@/context/SocketContext';

export function Providers({ children }: { children: React.ReactNode }) {
    // Wake the backend as soon as the site opens, so a sleeping free-tier
    // server is already booting while the user reads the page or signs in.
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7777'}/health`).catch(() => {});
    }, []);

    return (
        <AuthProvider>
            <SocketProvider>
                <CubeProvider>
                    {children}
                </CubeProvider>
            </SocketProvider>
        </AuthProvider>
    );
}
