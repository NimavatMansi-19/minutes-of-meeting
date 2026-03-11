"use client";

import React, { useState } from "react";
import { saveMeetingMinute } from "../../actions/saveMeetingMinutes";
import { Loader2, FileText, CheckCircle2, FileEdit } from "lucide-react";
import Card from "../../components/Card";

interface MeetingMinutesClientProps {
    meetingID: number;
    initialNotes: string | null;
    canEdit: boolean;
    historyLogs?: any[];
}

export default function MeetingMinutesClient({ meetingID, initialNotes, canEdit, historyLogs }: MeetingMinutesClientProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [notes, setNotes] = useState(initialNotes || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("MeetingID", meetingID.toString());
        formData.append("Notes", notes);

        try {
            await saveMeetingMinute(formData);
            setSuccess(true);
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message || "Failed to save meeting minutes.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!canEdit && !initialNotes) {
        return (
            <Card title="Meeting Minutes">
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                    <FileText size={32} className="mb-4 text-gray-300" />
                    <p>No minutes have been recorded for this session yet.</p>
                </div>
            </Card>
        );
    }

    if (!isEditing) {
        return (
            <Card title="Meeting Minutes">
                <div className="space-y-4">
                    {initialNotes ? (
                        <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-100">
                            {notes}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500 bg-slate-50 rounded-xl border border-slate-100">
                            <FileText size={32} className="mb-4 text-gray-300" />
                            <p>No minutes have been recorded for this session yet.</p>
                        </div>
                    )}

                    {canEdit && (
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold transition-colors border border-indigo-200"
                            >
                                <FileEdit size={16} />
                                {initialNotes ? "Edit Minutes" : "Write Minutes"}
                            </button>
                        </div>
                    )}
                </div>
                {success && !isEditing && (
                    <div className="mt-4 p-4 text-green-700 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 font-medium">
                        <CheckCircle2 size={16} /> Minutes saved securely.
                    </div>
                )}
            </Card>
        );
    }

    return (
        <Card title="Meeting Minutes Editor">
            {error && (
                <div className="mb-4 p-4 text-rose-700 bg-rose-50 border border-rose-200 rounded-xl font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <div className="absolute top-4 left-4 text-indigo-400">
                        <FileText size={20} />
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Document the key points, decisions, and action items discussed during the session..."
                        required
                        rows={8}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 font-medium placeholder:text-gray-400"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => {
                            setIsEditing(false);
                            setNotes(initialNotes || "");
                            setError("");
                        }}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 border border-indigo-500 shadow-indigo-500/30"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                        Save Repository
                    </button>
                </div>
            </form>
        </Card>
    );
}
