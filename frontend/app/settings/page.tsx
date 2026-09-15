'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';
import {
    Settings, User, FileText, Trash2, Save, ArrowLeft, AlertTriangle,
    Check, X, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { userApi, UserProfile } from '@/api/user.api';
import { Post, postsApi } from '@/api/posts.api';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

function SettingsPageContent() {
    const router = useRouter();
    const { user, updateUser } = useAuth();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Delete confirmation
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user?.id]);

    useEffect(() => {
        if (profile) {
            setHasChanges(
                username !== profile.username ||
                bio !== (profile.bio || '')
            );
        }
    }, [username, bio, profile]);

    const fetchData = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const [profileData, postsData] = await Promise.all([
                userApi.getProfile(user.id),
                userApi.getUserPosts(user.id),
            ]);
            setProfile(profileData);
            setUsername(profileData.username);
            setBio(profileData.bio || '');
            setPosts(postsData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user?.id || !hasChanges) return;

        setIsSaving(true);
        try {
            const updated = await userApi.updateProfile(user.id, { username, bio });
            setProfile(prev => prev ? { ...prev, ...updated } : null);

            // Update auth context
            if (updateUser) {
                updateUser({ ...user, username: updated.username });
            }

            toast.success('Profile updated!');
            setHasChanges(false);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update profile';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!user?.id) return;

        setIsDeleting(true);
        try {
            await postsApi.deletePost(postId, user.id);
            setPosts(prev => prev.filter(p => p.id !== postId));
            setDeleteConfirmId(null);
            toast.success('Post deleted');
        } catch (error) {
            console.error("Failed to delete post:", error);
            toast.error('Failed to delete post');
        } finally {
            setIsDeleting(false);
        }
    };

    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white">
                <Navbar />
                <main className="container mx-auto py-24 px-4 max-w-2xl" aria-busy="true" aria-label="Loading settings">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Skeleton className="w-9 h-9 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    {/* Edit profile form */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-6 space-y-4">
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-11 w-full rounded-xl" />
                    </div>
                    {/* Posts list */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-3">
                        <Skeleton className="h-6 w-28 mb-2" />
                        {[0, 1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
            <Navbar />

            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
                <BackgroundRippleEffect />
            </div>

            <main className="relative z-10 container mx-auto py-24 px-4 max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Settings size={24} className="text-blue-500" />
                            Settings
                        </h1>
                        <p className="text-sm text-neutral-500">Manage your profile and posts</p>
                    </div>
                </div>

                {/* Edit Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-6"
                >
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                        <User size={18} className="text-blue-400" />
                        Edit Profile
                    </h2>

                    <div className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-blue-500/50 focus:outline-none transition-colors"
                                placeholder="Enter username"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">
                                Bio
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-blue-500/50 focus:outline-none transition-colors resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSaveProfile}
                            disabled={!hasChanges || isSaving}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
                                hasChanges
                                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                                    : "bg-white/10 text-neutral-500 cursor-not-allowed"
                            )}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Manage Posts Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#111] border border-white/5 rounded-2xl p-6"
                >
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                        <FileText size={18} className="text-blue-400" />
                        Manage Posts
                        <span className="ml-auto px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                            {posts.length}
                        </span>
                    </h2>

                    {posts.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500">
                            <FileText size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No posts to manage</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {posts.map(post => (
                                <div
                                    key={post.id}
                                    className="bg-black/30 border border-white/5 rounded-xl p-4"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-neutral-200 line-clamp-2">
                                                {post.content}
                                            </p>
                                            <p className="text-xs text-neutral-500 mt-2">
                                                {timeAgo(post.createdAt)} • {post._count.likes} likes • {post._count.comments} comments
                                            </p>
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {deleteConfirmId === post.id ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <button
                                                        onClick={() => handleDeletePost(post.id)}
                                                        disabled={isDeleting}
                                                        className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                                                    >
                                                        {isDeleting ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <Check size={16} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(null)}
                                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </motion.div>
                                            ) : (
                                                <motion.button
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    onClick={() => setDeleteConfirmId(post.id)}
                                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </motion.button>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Danger Zone (for future) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 p-4 border border-red-500/20 rounded-2xl bg-red-500/5"
                >
                    <div className="flex items-center gap-3 text-red-400">
                        <AlertTriangle size={20} />
                        <div>
                            <p className="font-medium">Danger Zone</p>
                            <p className="text-sm text-red-400/70">Account deletion coming soon</p>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <SettingsPageContent />
        </ProtectedRoute>
    );
}
