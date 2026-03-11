"use client";

import React, { useState } from "react";
import { updateMeeting } from "@/app/actions/updateMeeting";
import Card from "@/app/components/Card";
import { Calendar, Clock, FileText, Link as LinkIcon, Save, Type, AlertCircle, RefreshCw } from "lucide-react";

type Props = {
    meeting: any;
    meetingTypes: any[];
};

export default function EditMeetingForm({ meeting, meetingTypes }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatDateForInput = (date: any) => {
        if (!date) return "";
        const d = new Date(date);
        return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 16);
    };

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            await updateMeeting(formData);
        } catch (e: any) {
            if (e.message !== "NEXT_REDIRECT" && !e.message?.includes("NEXT_REDIRECT")) {
                alert(e.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <form action={handleSubmit} className="space-y-8">
                <input
                    type="hidden"
                    name="MeetingID"
                    defaultValue={meeting?.MeetingID?.toString() ?? ""}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Date Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                            <Clock size={16} className="text-indigo-500" />
                            Meeting Schedule
                        </label>
                        <input
                            type="datetime-local"
                            name="MeetingDate"
                            defaultValue={formatDateForInput(meeting?.MeetingDate)}
                            className="input-field"
                            required
                        />
                    </div>

                    {/* Type Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                            <Type size={16} className="text-indigo-500" />
                            Classification
                        </label>
                        <select
                            name="MeetingTypeID"
                            defaultValue={meeting?.MeetingTypeID ?? ""}
                            className="input-field appearance-none cursor-pointer"
                            required
                        >
                            <option value="">Select Classification</option>
                            {meetingTypes.map((type) => (
                                <option key={type.MeetingTypeID} value={type.MeetingTypeID}>
                                    {type.MeetingTypeName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description Input */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                            <FileText size={16} className="text-indigo-500" />
                            Agenda Description
                        </label>
                        <input
                            type="text"
                            name="MeetingDescription"
                            defaultValue={meeting?.MeetingDescription ?? ""}
                            placeholder="Primary focus of the session"
                            className="input-field"
                        />
                    </div>

                    {/* Document Path Input */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                            <LinkIcon size={16} className="text-indigo-500" />
                            Resource File
                            {meeting?.DocumentPath && (
                                <span className="ml-2 text-xs text-slate-500 font-normal">
                                    (Currently: <a href={meeting.DocumentPath} target="_blank" rel="noopener noreferrer" className="text-indigo-500 underline">View File</a>)
                                </span>
                            )}
                        </label>
                        <input
                            type="file"
                            name="DocumentPath"
                            className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer p-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty to keep your existing document.</p>
                    </div>

                    {/* Status Checkbox */}
                    <div className="md:col-span-2 p-4 rounded-2xl bg-white border border-slate-200 group transition-all hover:border-amber-600/50">
                        <label className="flex items-center gap-4 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="IsCancelled"
                                    defaultChecked={meeting?.IsCancelled ?? false}
                                    className="peer sr-only"
                                />
                                <div className="w-11 h-6 bg-slate-200/50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 :ring-indigo-800 rounded-full peer  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-amber-100 text-amber-900 font-bold"></div>
                            </div>
                            <div>
                                <p className="font-bold text-black  flex items-center gap-2">
                                    <AlertCircle size={16} className="text-amber-600" />
                                    Mark as Cancelled
                                </p>
                                <p className="text-xs text-gray-600">Toggling this will flag the session as inactive across all dashboards.</p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-200">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <>
                                <RefreshCw className="animate-spin" size={20} />
                                Processing Updates...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Commit Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Card>
    );
}
