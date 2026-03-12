import React from "react";
import Link from "next/link";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-200">
                <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8">
                    <AlertTriangle size={48} className="text-red-500" />
                </div>

                <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-4">
                    Access Denied
                </h1>

                <p className="text-gray-600 font-medium mb-8 leading-relaxed">
                    You do not have the required permissions to access this page or perform this action. If you believe this is an error, please contact your administrator.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/dashboard"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <Home size={18} />
                        Return to Dashboard
                    </Link>
                </div>
            </div>

            <div className="mt-12 text-center text-sm text-slate-400 font-medium">
                <p>Error Code: 403 Forbidden</p>
            </div>
        </div>
    );
}
