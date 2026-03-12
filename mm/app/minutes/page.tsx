import React from "react";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/app/components/PageHeader";
import Section from "@/app/components/Section";
import Card from "@/app/components/Card";
import { FileText, Calendar, ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import Link from "next/link";

export default async function GlobalMinutesPage() {
    await requireUser();

    // Fetch past meetings for minutes review
    const meetings = await prisma.meetings.findMany({
        where: {
            MeetingDate: {
                lte: new Date() // Past or today
            },
            IsCancelled: false
        },
        include: {
            meetingtype: true,
            _count: {
                select: { meetingminutes: true }
            }
        },
        orderBy: {
            MeetingDate: 'desc'
        }
    });

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            <PageHeader
                title="Meeting Minutes"
                description="Review recorded minutes and transcripts from past sessions."
                icon={FileText}
            />

            <Section>
                <div className="max-w-4xl">
                    <Card title="Meeting Transcripts" className="bg-white">
                        <div className="space-y-4">
                            {meetings.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                                    <p className="text-slate-500 font-medium">No past meetings available.</p>
                                </div>
                            ) : (
                                meetings.map(meeting => (
                                    <div key={meeting.MeetingID} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 bg-slate-50/50 hover:bg-white transition-all group">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white border border-slate-200 rounded-xl text-teal-600 shadow-sm">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{meeting.meetingtype?.MeetingTypeName || "General Session"}</h3>
                                                <div className="flex items-center gap-3 mt-1.5 text-sm font-medium text-slate-500">
                                                    <span>{new Date(meeting.MeetingDate).toLocaleDateString()}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span className={`${meeting._count.meetingminutes > 0 ? "text-emerald-600" : "text-amber-500"}`}>
                                                        {meeting._count.meetingminutes > 0 ? "Minutes Recorded" : "Pending Minutes"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/meetings/${meeting.MeetingID}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors text-sm shrink-0"
                                        >
                                            {meeting._count.meetingminutes > 0 ? "Read Minutes" : "Write Minutes"} <ChevronRight size={16} />
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </Section>
        </div>
    );
}
