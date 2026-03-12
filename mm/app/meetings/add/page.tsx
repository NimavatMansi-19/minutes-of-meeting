import { saveMeeting } from "@/app/actions/saveMeeting";
import React from "react";
import { prisma } from "@/lib/prisma";
import PageHeader from "../../components/PageHeader";
import Section from "../../components/Section";
import Card from "../../components/Card";
import { Calendar, Clock, FileText, Link as LinkIcon, Save, Type, Users } from "lucide-react";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

async function AddMeeting() {
    const session = await requireUser();
    const role = session.role;

    if (role !== 'admin' && role !== 'meeting_convener') {
        redirect("/unauthorized");
    }

    const meetingTypes = await prisma.meetingtype.findMany();
    const staffList = await prisma.staff.findMany({ orderBy: { StaffName: 'asc' } });

    return (
        <div className="bg-pattern min-h-screen pb-12">
            <PageHeader
                title="Schedule Meeting"
                description="Organize a new governance session and define its parameters."
                icon={Calendar}
                backHref="/meetings"
            />

            <Section>
                <div className="max-w-3xl mx-auto">
                    <Card>
                        <form action={saveMeeting} className="space-y-8">
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
                                        className="input-field appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="">Select Meeting Classification</option>
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
                                        placeholder="Briefly state the primary focus of this meeting"
                                        className="input-field"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                                        <LinkIcon size={16} className="text-indigo-500" />
                                        Resource File
                                    </label>
                                    <input
                                        type="file"
                                        name="DocumentPath"
                                        className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer p-2"
                                    />
                                </div>
                            </div>

                            {/* Staff Selection Input */}
                            <div className="space-y-3 border-t border-slate-200 pt-6">
                                <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    <Users size={16} className="text-indigo-500" />
                                    Invite Staff (Optional)
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl max-h-60 overflow-y-auto">
                                    {staffList.map((staff) => (
                                        <label key={staff.StaffID} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                name="StaffMembers"
                                                value={staff.StaffID}
                                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm font-semibold text-gray-700">{staff.StaffName}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-slate-200">
                                <button
                                    type="reset"
                                    className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-slate-50 transition-all"
                                >
                                    Reset Details
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex items-center gap-2 px-8"
                                >
                                    <Save size={18} />
                                    Publish Schedule
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            </Section>
        </div>
    );
}

export default AddMeeting;
