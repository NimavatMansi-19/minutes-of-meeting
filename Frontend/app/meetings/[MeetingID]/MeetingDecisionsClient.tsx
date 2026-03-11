"use client";

import React, { useState } from "react";
import { Loader2, Scale, Plus, Check, Trash2, Edit2, X, AlertCircle } from "lucide-react";
import Card from "../../components/Card";
import { addDecision, updateDecision, deleteDecision, toggleDecisionStatus } from "@/app/actions/meetingDecisions";

interface Decision {
    DecisionID: number;
    MeetingID: number;
    Title: string;
    Description: string | null;
    Status: string;
}

interface MeetingDecisionsClientProps {
    meetingID: number;
    decisions: Decision[];
    canEdit: boolean;
}

export default function MeetingDecisionsClient({ meetingID, decisions, canEdit }: MeetingDecisionsClientProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingID, setEditingID] = useState<number | null>(null);
    const [loadingID, setLoadingID] = useState<number | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!title.trim()) return;

        setLoadingID(-1);
        const formData = new FormData();
        formData.append("MeetingID", meetingID.toString());
        formData.append("Title", title);
        if (description) formData.append("Description", description);

        try {
            await addDecision(formData);
            setTitle("");
            setDescription("");
            setIsAdding(false);
        } catch (err: any) {
            setError(err.message || "Failed to add decision");
        } finally {
            setLoadingID(null);
        }
    };

    const handleUpdate = async (e: React.FormEvent, decisionID: number) => {
        e.preventDefault();
        setError("");

        setLoadingID(decisionID);
        const formData = new FormData();
        formData.append("DecisionID", decisionID.toString());
        formData.append("Title", title);
        if (description) formData.append("Description", description);

        try {
            await updateDecision(formData);
            setEditingID(null);
        } catch (err: any) {
            setError(err.message || "Failed to update decision");
        } finally {
            setLoadingID(null);
        }
    };

    const startEditing = (decision: Decision) => {
        setEditingID(decision.DecisionID);
        setTitle(decision.Title);
        setDescription(decision.Description || "");
        setIsAdding(false);
        setError("");
    };

    const cancelEditing = () => {
        setEditingID(null);
        setTitle("");
        setDescription("");
        setError("");
    };

    const handleAction = async (action: () => Promise<any>, id: number) => {
        setLoadingID(id);
        setError("");
        try {
            await action();
        } catch (err: any) {
            setError(err.message || "Action failed");
        } finally {
            setLoadingID(null);
        }
    };

    return (
        <Card title="Decision Register" className="mt-8">
            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600 text-sm font-medium flex items-center gap-2">
                    <Scale size={16} />
                    {decisions.length} recorded {decisions.length === 1 ? 'decision' : 'decisions'}
                </p>
                {canEdit && !isAdding && !editingID && (
                    <button
                        onClick={() => { setIsAdding(true); setTitle(""); setDescription(""); setError(""); }}
                        className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-colors border border-emerald-200 text-sm"
                    >
                        <Plus size={14} strokeWidth={2.5} /> Record Decision
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 font-medium">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            <div className="space-y-3 relative">
                {decisions.length === 0 && !isAdding && (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
                        <Scale size={32} className="mb-3 text-slate-300" />
                        <p className="font-medium">No decisions recorded for this session.</p>
                    </div>
                )}

                {decisions.map((decision) => {
                    const isEditingThis = editingID === decision.DecisionID;
                    const isLoadingThis = loadingID === decision.DecisionID;

                    if (isEditingThis) {
                        return (
                            <form key={decision.DecisionID} onSubmit={(e) => handleUpdate(e, decision.DecisionID)} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-inner">
                                <div>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Decision Title"
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Context and details regarding this decision"
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-1">
                                    <button type="button" onClick={cancelEditing} className="px-3 py-1.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-white shadow-sm">Cancel</button>
                                    <button type="submit" disabled={isLoadingThis} className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 border border-emerald-700 rounded-lg hover:bg-emerald-700 flex items-center gap-1 shadow-sm disabled:opacity-70">
                                        {isLoadingThis ? <Loader2 size={12} className="animate-spin" /> : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        );
                    }

                    return (
                        <div key={decision.DecisionID} className={`flex items-start gap-4 p-4 rounded-xl border transition-all shadow-sm hover:shadow-md ${decision.Status === 'Archived' ? 'opacity-70 border-slate-200 bg-slate-50' : 'border-emerald-100 bg-white'}`}>
                            {canEdit ? (
                                <button
                                    onClick={() => handleAction(() => toggleDecisionStatus(decision.DecisionID, decision.Status === 'Archived' ? 'Active' : 'Archived'), decision.DecisionID)}
                                    disabled={isLoadingThis}
                                    className={`mt-1 text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-full border transition-colors ${decision.Status === 'Archived' ? 'bg-slate-200 border-slate-300 text-slate-500' : 'bg-emerald-100 border-emerald-200 text-emerald-700'}`}
                                >
                                    {isLoadingThis ? <Loader2 size={10} className="animate-spin inline mr-1" /> : null}
                                    {decision.Status}
                                </button>
                            ) : (
                                <span className={`mt-1 text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-full border ${decision.Status === 'Archived' ? 'bg-slate-200 border-slate-300 text-slate-500' : 'bg-emerald-100 border-emerald-200 text-emerald-700'}`}>
                                    {decision.Status}
                                </span>
                            )}

                            <div className="flex-1 min-w-0">
                                <h4 className={`text-base font-bold tracking-tight text-gray-900 ${decision.Status === 'Archived' ? 'text-gray-500' : ''}`}>{decision.Title}</h4>
                                {decision.Description && (
                                    <p className={`mt-1 text-sm ${decision.Status === 'Archived' ? 'text-gray-400' : 'text-gray-600'}`}>{decision.Description}</p>
                                )}
                            </div>

                            {canEdit && (
                                <div className="flex flex-col gap-1 items-center shrink-0 border-l border-slate-100 pl-3">
                                    <div className="flex gap-2 h-full items-center justify-center">
                                        <button onClick={() => startEditing(decision)} disabled={isLoadingThis} className="text-slate-400 hover:text-emerald-600 transition-colors">
                                            <Edit2 size={15} />
                                        </button>
                                        <button onClick={() => handleAction(() => deleteDecision(decision.DecisionID), decision.DecisionID)} disabled={isLoadingThis} className="text-slate-400 hover:text-rose-600 transition-colors">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {isAdding && canEdit && (
                    <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-inner">
                        <div className="flex items-center justify-between mb-1">
                            <h5 className="text-xs font-bold uppercase tracking-widest text-emerald-600">Document New Decision</h5>
                            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-700">
                                <X size={16} />
                            </button>
                        </div>
                        <div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g. Approved Q3 Marketing Budget"
                                required
                                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                            />
                        </div>
                        <div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Details and reasoning regarding this decision (optional)"
                                rows={2}
                                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                        </div>
                        <div className="flex justify-end pt-1">
                            <button type="submit" disabled={loadingID === -1} className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 border border-emerald-700 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm disabled:opacity-70">
                                {loadingID === -1 ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                Finalize Decision
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Card>
    );
}
