"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getToken, getRoleFromToken } from '@/lib/auth';
import {
    LayoutDashboard,
    Calendar,
    ClipboardList,
    Users,
    ListTodo,
    FileText,
    CheckSquare,
    Scale,
    UserCheck,
    BarChart3,
    Command
} from 'lucide-react';

export default function Sidebar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const token = getToken();
        setIsLoggedIn(!!token);
        setRole(getRoleFromToken());
    }, [pathname]);

    if (!isLoggedIn || pathname === '/' || pathname === '/login') return null;

    const isActive = (path: string) => {
        if (path === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(path);
    };

    const navLinks = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
        { href: "/meetings", label: "Meetings", icon: Calendar, show: true },
        { href: "/meetingtype", label: "Meeting Types", icon: ClipboardList, show: role === 'admin' || role === 'meeting_convener' },
        { href: "/staff", label: "Staff", icon: Users, show: role === 'admin' || role === 'meeting_convener' },
        { href: "/agenda", label: "Agenda", icon: ListTodo, show: true },
        { href: "/minutes", label: "Minutes", icon: FileText, show: true },
        { href: "/actionitems", label: "Action Items", icon: CheckSquare, show: true },
        { href: "/decisions", label: "Decision Register", icon: Scale, show: true },
        { href: "/meetingmember", label: "Attendance", icon: UserCheck, show: role === 'admin' || role === 'meeting_convener' },
        { href: "/reports/attendance", label: "Reports", icon: BarChart3, show: role === 'admin' || role === 'meeting_convener' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col shadow-sm hidden md:flex shrink-0">
            <div className="h-[72px] flex items-center px-6 border-b border-slate-100">
                <Link href="/dashboard" className="flex items-center gap-2.5 group">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-8 h-8 rounded-lg shadow-md border border-indigo-500/10 flex items-center justify-center group-hover:scale-[1.03] transition-transform duration-300">
                        <Command size={18} className="text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-black block">
                        MinutesMaster
                    </span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                <div className="mb-4 px-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Menu</p>
                </div>

                {navLinks.map((link) => link.show && (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isActive(link.href)
                                ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50"
                                : "text-gray-600 hover:bg-slate-50 hover:text-black"
                            }`}
                    >
                        <link.icon size={18} className={isActive(link.href) ? "text-indigo-600" : "text-slate-400"} strokeWidth={isActive(link.href) ? 2.5 : 2} />
                        {link.label}
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Enterprise Edition</p>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Secured and encrypted environment.</p>
                </div>
            </div>
        </aside>
    );
}
