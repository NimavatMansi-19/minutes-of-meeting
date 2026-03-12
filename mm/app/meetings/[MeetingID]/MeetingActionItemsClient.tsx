"use client";

import React, { useState } from "react";
import { Loader2, ListTodo, Plus, Check, Trash2, Edit2, X, AlertCircle } from "lucide-react";
import Card from "../../components/Card";
import { saveActionItem } from "@/app/actions/saveActionItem";
import { deleteActionItem } from "@/app/actions/deleteActionItem";

interface ActionItem {
    ActionItemID: number;
    MeetingID: number;
    AssignedTo: number;
    Title: string;
    DueDate: Date | null;
    Status: string;
    staff?: {
        StaffID: number;
        StaffName: string;
    };
}

interface Staff {
    StaffID: number;
    StaffName: string;
}

interface MeetingActionItemsClientProps {
    meetingID: number;
    actionItems: ActionItem[];
    staffMembers: Staff[];
    canEdit: boolean;
}

export default function MeetingActionItemsClient({ meetingID, actionItems, staffMembers, canEdit }: MeetingActionItemsClientProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingID, setEditingID] = useState<number | null>(null);
    const [loadingID, setLoadingID] = useState<number | null>(null);
    const [title, setTitle] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [status, setStatus] = useState("Pending");
    const [error, setError] = useState("");

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!title.trim() || !assignedTo) return;

        setLoadingID(-1);
        const formData = new FormData();
        formData.append("MeetingID", meetingID.toString());
        formData.append("Title", title);
        formData.append("AssignedTo", assignedTo);
        if (dueDate) formData.append("DueDate", dueDate);
        formData.append("Status", status);

        try {
            await saveActionItem(formData);
            setTitle("");
            setAssignedTo("");
            setDueDate("");
            setStatus("Pending");
            setIsAdding(false);
        } catch (err: any) {
            setError(err.message || "Failed to add action item");
        } finally {
            setLoadingID(null);
        }
    };

    const handleUpdate = async (e: React.FormEvent, actionItemID: number) => {
        e.preventDefault();
        setError("");

        setLoadingID(actionItemID);
        const formData = new FormData();
        formData.append("ActionItemID", actionItemID.toString());
        formData.append("MeetingID", meetingID.toString());
        formData.append("Title", title);
        formData.append("AssignedTo", assignedTo);
        if (dueDate) formData.append("DueDate", dueDate);
        formData.append("Status", status);

        try {
            await saveActionItem(formData);
            setEditingID(null);
        } catch (err: any) {
            setError(err.message || "Failed to update action item");
        } finally {
            setLoadingID(null);
        }
    };

    const startEditing = (item: ActionItem) => {
        setEditingID(item.ActionItemID);
        setTitle(item.Title);
        setAssignedTo(item.AssignedTo.toString());
        setDueDate(item.DueDate ? new Date(item.DueDate).toISOString().split('T')[0] : "");
        setStatus(item.Status);
        setIsAdding(false);
        setError("");
    };

    const cancelEditing = () => {
        setEditingID(null);
        setTitle("");
        setAssignedTo("");
        setDueDate("");
        setStatus("Pending");
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
        <Card title="Action Items" className="mt-8">
            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600 text-sm font-medium flex items-center gap-2">
                    <ListTodo size={16} />
                    {actionItems.length} assigned task{actionItems.length !== 1 && 's'}
                </p>
                {canEdit && !isAdding && !editingID && (
                    <button
                        onClick={() => { setIsAdding(true); setTitle(""); setAssignedTo(""); setDueDate(""); setStatus("Pending"); setError(""); }}
                        className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 font-bold transition-colors border border-orange-200 text-sm"
                    >
                        <Plus size={14} strokeWidth={2.5} /> Assign Task
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 font-medium">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            <div className="space-y-3 relative">
                {actionItems.length === 0 && !isAdding && (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
                        <ListTodo size={32} className="mb-3 text-slate-300" />
                        <p className="font-medium">No action items assigned for this session.</p>
                    </div>
                )}

                {actionItems.map((item) => {
                    const isEditingThis = editingID === item.ActionItemID;
                    const isLoadingThis = loadingID === item.ActionItemID;

                    if (isEditingThis) {
                        return (
                            <form key={item.ActionItemID} onSubmit={(e) => handleUpdate(e, item.ActionItemID)} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-inner">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Task Description</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="What needs to be done?"
                                            required
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Assign To</label>
                                        <select
                                            value={assignedTo}
                                            onChange={(e) => setAssignedTo(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white font-medium"
                                        >
                                            <option value="" disabled>Select Staff Member</option>
                                            {staffMembers.map(staff => (
                                                <option key={staff.StaffID} value={staff.StaffID}>{staff.StaffName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Due Date</label>
                                            <input
                                                type="date"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Status</label>
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-1 border-t border-slate-200 mt-3 pt-3">
                                    <button type="button" onClick={cancelEditing} className="px-3 py-1.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-white shadow-sm">Cancel</button>
                                    <button type="submit" disabled={isLoadingThis} className="px-3 py-1.5 text-xs font-bold text-white bg-orange-600 border border-orange-700 rounded-lg hover:bg-orange-700 flex items-center gap-1 shadow-sm disabled:opacity-70">
                                        {isLoadingThis ? <Loader2 size={12} className="animate-spin" /> : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        );
                    }

                    return (
                        <div key={item.ActionItemID} className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-xl border transition-all shadow-sm hover:shadow-md ${item.Status === 'Completed' ? 'opacity-70 border-slate-200 bg-slate-50' : 'border-orange-100 bg-white'}`}>

                            <div className="flex-1 min-w-0 w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full border ${item.Status === 'Completed' ? 'bg-slate-200 border-slate-300 text-slate-500' : item.Status === 'In Progress' ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-orange-100 border-orange-200 text-orange-700'}`}>
                                        {item.Status}
                                    </span>
                                    {item.DueDate && (
                                        <span className="text-[10px] font-bold text-gray-400">
                                            Due: {new Date(item.DueDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <h4 className={`text-base font-bold tracking-tight text-gray-900 ${item.Status === 'Completed' ? 'text-gray-500 line-through' : ''}`}>{item.Title}</h4>
                                <p className="mt-1 text-sm text-gray-600 font-medium">
                                    Assigned to: <span className="font-bold text-indigo-600">{item.staff?.StaffName || 'Unknown User'}</span>
                                </p>
                            </div>

                            {canEdit && (
                                <div className="flex flex-row sm:flex-col gap-1 items-center shrink-0 sm:border-l border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 sm:pl-3 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                                    <div className="flex gap-2 items-center justify-center">
                                        <button onClick={() => startEditing(item)} disabled={isLoadingThis} className="p-1 px-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors flex items-center gap-1 text-xs font-bold">
                                            <Edit2 size={14} /> Edit
                                        </button>
                                        <button onClick={() => handleAction(() => deleteActionItem(item.ActionItemID, meetingID), item.ActionItemID)} disabled={isLoadingThis} className="p-1 px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors flex items-center gap-1 text-xs font-bold">
                                            <Trash2 size={14} /> Delete
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
                            <h5 className="text-xs font-bold uppercase tracking-widest text-orange-600">Assign New Task</h5>
                            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-700">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Task Description <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="E.g. Review financial report"
                                    required
                                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Assign To <span className="text-rose-500">*</span></label>
                                <select
                                    value={assignedTo}
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                    required
                                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white font-medium"
                                >
                                    <option value="" disabled>Select Staff Member</option>
                                    {staffMembers.map(staff => (
                                        <option key={staff.StaffID} value={staff.StaffID}>{staff.StaffName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
                                />
                            </div>
                            <input type="hidden" value="Pending" />
                        </div>
                        <div className="flex justify-end pt-2 border-t border-slate-200 mt-2">
                            <button type="submit" disabled={loadingID === -1} className="px-4 py-2 text-xs font-bold text-white bg-orange-600 border border-orange-700 rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-sm disabled:opacity-70">
                                {loadingID === -1 ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                Assign Task
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Card>
    );
}
