import React from "react";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/app/components/PageHeader";
import Section from "@/app/components/Section";
import Card from "@/app/components/Card";
import { CheckSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { requireUser } from "@/lib/session";
import Link from "next/link";
import ActionItemStatusToggle from "@/app/actionitems/ActionItemStatusToggle"; // Client component for toggling

export default async function ActionItemsPage() {
    const session = await requireUser();
    const isAdminOrConvener = session.role === 'admin' || session.role === 'meeting_convener';

    // Fetch action items
    const actionItems = await prisma.actionitem.findMany({
        where: isAdminOrConvener ? undefined : { AssignedTo: session.StaffID },
        include: {
            meetings: {
                select: {
                    MeetingDescription: true,
                    meetingtype: {
                        select: { MeetingTypeName: true }
                    }
                }
            },
            staff: {
                select: { StaffName: true }
            }
        },
        orderBy: {
            DueDate: 'asc'
        }
    });

    const pendingCount = actionItems.filter(item => item.Status !== 'Completed').length;
    const completedCount = actionItems.filter(item => item.Status === 'Completed').length;

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            <PageHeader
                title="Action Items"
                description="Manage and track your assigned tasks and responsibilities."
                icon={CheckSquare}
            />

            <Section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-white hover:shadow-md transition-shadow border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <CheckSquare size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Items</p>
                                <p className="text-3xl font-black text-slate-800">{actionItems.length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-white hover:shadow-md transition-shadow border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                                <Clock size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pending</p>
                                <p className="text-3xl font-black text-slate-800">{pendingCount}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-white hover:shadow-md transition-shadow border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <CheckCircle2 size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Completed</p>
                                <p className="text-3xl font-black text-slate-800">{completedCount}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest w-[180px]">Status</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Task Details</th>
                                    {isAdminOrConvener && <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Assignee</th>}
                                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Due Date</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Related Meeting</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {actionItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                                                <CheckSquare size={24} className="text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 font-medium">No action items found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    actionItems.map((item) => (
                                        <tr key={item.ActionItemID} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <ActionItemStatusToggle
                                                    id={item.ActionItemID}
                                                    initialStatus={item.Status}
                                                    canEdit={isAdminOrConvener || item.AssignedTo === session.StaffID}
                                                />
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className={`font-bold text-sm sm:text-base ${item.Status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{item.Title}</p>
                                            </td>
                                            {isAdminOrConvener && (
                                                <td className="px-6 py-5">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 shadow-sm">
                                                        <span className="text-xs font-bold text-slate-700">{item.staff?.StaffName || "Unknown Staff"}</span>
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-5">
                                                {item.DueDate ? (
                                                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md ${item.Status !== 'Completed' && new Date(item.DueDate) < new Date()
                                                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                                                        }`}>
                                                        {item.Status !== 'Completed' && new Date(item.DueDate) < new Date() && <AlertCircle size={14} />}
                                                        {new Date(item.DueDate).toLocaleDateString()}
                                                    </div>
                                                ) : <span className="text-slate-400 text-xs font-bold px-2 py-1 bg-slate-50 rounded-md border border-slate-100">Not set</span>}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Link href={`/meetings/${item.MeetingID}`} className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors inline-block max-w-[200px] truncate">
                                                    {item.meetings?.meetingtype?.MeetingTypeName || "Meeting"}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Section>
        </div>
    );
}
