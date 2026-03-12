import React from "react";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/app/components/PageHeader";
import Section from "@/app/components/Section";
import Card from "@/app/components/Card";
import { Scale, CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/session";
import Link from "next/link";

export default async function DecisionsPage() {
    await requireUser();

    // Fetch decisions
    const decisions = await prisma.decision.findMany({
        include: {
            meetings: {
                select: {
                    MeetingDate: true,
                    meetingtype: {
                        select: { MeetingTypeName: true }
                    }
                }
            }
        },
        orderBy: {
            Created: 'desc'
        }
    });

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            <PageHeader
                title="Decision Register"
                description="Central repository of all historical decisions and verdicts."
                icon={Scale}
            />

            <Section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="bg-white">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Scale size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500">Total Recorded Decisions</p>
                                <p className="text-2xl font-black text-gray-900">{decisions.length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-white">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500">Active Directives</p>
                                <p className="text-2xl font-black text-gray-900">{decisions.filter(d => d.Status === 'Active').length}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card noPadding className="overflow-hidden border border-slate-200 shadow-sm rounded-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left bg-white">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Decision Title</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Meeting Reference</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date Reached</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {decisions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                                                <Scale size={24} className="text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 font-medium">No decisions documented yet.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    decisions.map((item) => (
                                        <tr key={item.DecisionID} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-sm text-gray-900">{item.Title}</p>
                                                {item.Description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.Description}</p>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/meetings/${item.MeetingID}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors inline-block max-w-[200px] truncate">
                                                    {item.meetings?.meetingtype?.MeetingTypeName || "Unknown Meeting"}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-600">
                                                    {item.meetings?.MeetingDate ? new Date(item.meetings.MeetingDate).toLocaleDateString() : 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.Status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                    {item.Status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </Section>
        </div>
    );
}
