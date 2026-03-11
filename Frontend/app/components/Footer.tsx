"use client";

import { usePathname } from 'next/navigation';
import { Github, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    const pathname = usePathname();

    // Hide footer completely on the login page since it's a fullscreen design
    if (pathname === '/' || pathname === '/login') return null;

    return (
        <footer className="w-full bg-white shrink-0 mt-auto border-t border-slate-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">

                {/* Social links / Circles resembling the image */}
                <div className="flex items-center justify-center gap-6 mb-8">
                    <Link href="#" className="flex items-center justify-center w-12 h-12 rounded-full border border-slate-200 text-slate-300 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-300 bg-white">
                        <Twitter size={18} strokeWidth={1.5} />
                    </Link>
                    <Link href="#" className="flex items-center justify-center w-12 h-12 rounded-full border border-slate-200 text-slate-300 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-300 bg-white">
                        <Github size={18} strokeWidth={1.5} />
                    </Link>
                    <Link href="#" className="flex items-center justify-center w-12 h-12 rounded-full border border-slate-200 text-slate-300 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-300 bg-white">
                        <Linkedin size={18} strokeWidth={1.5} />
                    </Link>
                </div>

                <div className="flex flex-col items-center justify-center w-full max-w-2xl border-t border-slate-100 pt-6">
                    <p className="text-center text-[11px] font-medium text-gray-700 tracking-widest uppercase">
                        &copy; {new Date().getFullYear()} Enterprise Governance. All rights reserved.
                    </p>

                    <div className="flex items-center justify-center gap-4 mt-4 text-[11px] font-medium text-gray-700 tracking-widest uppercase">
                        <Link href="#" className="hover:text-gray-700 transition-colors">Privacy</Link>
                        <span className="w-1 h-1 rounded-full bg-slate-200/50"></span>
                        <Link href="#" className="hover:text-gray-700 transition-colors">Terms</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}
