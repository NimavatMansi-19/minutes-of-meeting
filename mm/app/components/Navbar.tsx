"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getToken, logout, getRoleFromToken } from '@/lib/auth';
import {
    LogOut,
    LogIn,
    Command,
} from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = getToken();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoggedIn(!!token);
        setRole(getRoleFromToken());
    }, [pathname]);

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        window.location.href = '/';
    };

    // Hide navbar completely on the login page since it's a fullscreen design
    if (pathname === '/' || pathname === '/login') return null;

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-[72px]">
                    <div className="flex items-center gap-4 xl:gap-10">
                        {/* Branding (Mobile Only) */}
                        <Link href="/dashboard" className="flex md:hidden items-center gap-2.5 group shrink-0">
                            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-8 h-8 rounded-lg shadow-md border border-indigo-500/10 flex items-center justify-center group-hover:scale-[1.03] transition-transform duration-300">
                                <Command size={18} className="text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-black block">
                                MinutesMaster
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {isLoggedIn ? (
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                {isLoggedIn && <NotificationBell />}
                                <div className="hidden lg:flex flex-col items-end px-3 py-1 bg-transparent">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Role</span>
                                    <span className="text-sm font-bold text-gray-800 leading-none capitalize">{role?.replace('_', ' ') || 'User'}</span>
                                </div>
                                <div className="h-6 w-px bg-slate-200 hidden lg:block mx-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 hover:bg-amber-50 text-gray-600 hover:text-amber-700 transition-colors px-3 py-1.5 rounded-lg text-sm font-semibold shrink-0"
                                >
                                    <LogOut size={16} strokeWidth={2.5} />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/"
                                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
                            >
                                <LogIn size={16} strokeWidth={2.5} />
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
