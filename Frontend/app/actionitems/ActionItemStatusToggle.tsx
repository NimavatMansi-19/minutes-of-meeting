"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { toggleActionItemStatus } from "@/app/actions/toggleActionItemStatus";

export default function ActionItemStatusToggle({ id, initialStatus, canEdit }: { id: number, initialStatus: string, canEdit: boolean }) {
    const [status, setStatus] = useState(initialStatus);
    const [isLoading, setIsLoading] = useState(false);

    const isCompleted = status === "Completed";

    const handleToggle = async () => {
        if (!canEdit || isLoading) return;

        setIsLoading(true);
        const newStatus = isCompleted ? "Pending" : "Completed";

        try {
            await toggleActionItemStatus(id, newStatus);
            setStatus(newStatus);
        } catch (error) {
            console.error("Failed to toggle status", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={!canEdit || isLoading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${isCompleted
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                } ${(!canEdit || isLoading) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            {status}
        </button>
    );
}
