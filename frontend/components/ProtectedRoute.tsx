'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/signin');
        }
    }, [isAuthenticated, isLoading, router]);

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-neutral-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render children if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-neutral-400 text-sm">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
