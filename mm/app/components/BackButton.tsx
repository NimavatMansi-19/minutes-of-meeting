'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
    href?: string;
    label?: string;
    className?: string;
}

export default function BackButton({ href, label = 'Back', className = '' }: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        if (href) {
            router.push(href);
        } else {
            router.back();
        }
    };

    return (
        <button
            onClick={handleBack}
            className={`inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700  :text-gray-200 mb-4 ${className}`}
        >
            <svg
                className="mr-1 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
            </svg>
            {label}
        </button>
    );
}
