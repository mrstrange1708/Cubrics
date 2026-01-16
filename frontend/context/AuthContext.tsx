'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check for existing auth on mount
    useEffect(() => {
        const checkAuth = () => {
            try {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (token && storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);

                    // Also set cubex_user_id for legacy compatibility
                    localStorage.setItem('cubex_user_id', parsedUser.id);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                // Clear potentially corrupted data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = useCallback((token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('cubex_user_id', userData.id);
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cubex_user_id');
        setUser(null);
        router.push('/auth/signin');
    }, [router]);

    const updateUser = useCallback((userData: User) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    }, []);

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
