import Link from "next/link";
import { ChevronLeft, LucideIcon } from "lucide-react";

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    backHref?: string;
    action?: {
        href: string;
        label: string;
        icon?: LucideIcon;
    };
    children?: React.ReactNode;
}

export default function PageHeader({ title, description, icon: Icon, backHref, action, children }: PageHeaderProps) {
    return (
        <div className="relative overflow-hidden bg-white backdrop-blur-xl border-b border-slate-200 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        {backHref && (
                            <Link
                                href={backHref}
                                className="mt-1 p-2 rounded-xl bg-white hover:bg-slate-50 text-gray-600 hover:text-indigo-400 border border-slate-200 transition-all shadow-inner"
                            >
                                <ChevronLeft size={20} />
                            </Link>
                        )}
                        <div>
                            <div className="flex items-center gap-3">
                                {Icon && (
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl text-white shadow-lg shadow-indigo-500/20 border border-slate-200 flex items-center justify-center">
                                        <Icon size={20} />
                                    </div>
                                )}
                                <h1 className="text-3xl font-extrabold text-black tracking-tight">
                                    {title}
                                </h1>
                            </div>
                            {description && (
                                <p className="mt-2 text-gray-700 font-medium">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                        {children}
                        {action && (
                            <Link
                                href={action.href}
                                className="bg-gradient-to-r w-full sm:w-auto from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-bold tracking-wide shadow-lg shadow-indigo-500/30 border border-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                {action.icon && <action.icon size={18} />}
                                {action.label}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
