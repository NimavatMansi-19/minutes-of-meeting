"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect, Suspense } from "react";

function SearchBarContent({ placeholder = "Search..." }: { placeholder?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [query, setQuery] = useState(searchParams.get("q")?.toString() || "");

    useEffect(() => {
        const handler = setTimeout(() => {
            startTransition(() => {
                const params = new URLSearchParams(searchParams.toString());
                if (query) {
                    params.set("q", query);
                } else {
                    params.delete("q");
                }
                router.replace(`${pathname}?${params.toString()}`);
            });
        }, 300); // Debounce search

        return () => clearTimeout(handler);
    }, [query, pathname, router, searchParams]);

    return (
        <div className="relative w-full sm:w-72 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={18} className={`text-slate-400 group-focus-within:text-indigo-500 transition-colors ${isPending ? "animate-pulse delay-200" : ""}`} />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl leading-5 bg-white/80 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-sm font-medium text-gray-900"
            />
        </div>
    );
}

export default function SearchBar({ placeholder = "Search..." }: { placeholder?: string }) {
    return (
        <Suspense fallback={
            <div className="relative w-full sm:w-72 group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search size={18} className="text-slate-300" />
                </div>
                <input
                    type="text"
                    disabled
                    placeholder="Loading search..."
                    className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl leading-5 bg-slate-50 text-sm"
                />
            </div>
        }>
            <SearchBarContent placeholder={placeholder} />
        </Suspense>
    );
}
