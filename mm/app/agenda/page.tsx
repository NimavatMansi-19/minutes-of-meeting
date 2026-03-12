import React from "react";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/app/components/PageHeader";
import Section from "@/app/components/Section";
import Card from "@/app/components/Card";
import { ListTodo, Calendar, ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import Link from "next/link";

export default async function GlobalAgendaPage() {
    await requireUser();

    // Fetch upcoming meetings to manage their agenda
    const meetings = await prisma.meetings.findMany({
        where: {
            MeetingDate: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)) // Future or today
            },
            IsCancelled: false
        },
        include: {
            meetingtype: true,
            _count: {
                select: { meetingagenda: true }
            }
        },
        orderBy: {
            MeetingDate: 'asc'
        }
    });

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            <PageHeader
                title="Agenda Overview"
                description="Manage and review agendas for upcoming scheduled sessions."
                icon={ListTodo}
            />

            <Section>
                <div className="max-w-4xl">
                    <Card title="Upcoming Sessions" className="bg-white">
                        <div className="space-y-4">
                            {meetings.length === 0 ? (
                                <div className="text-center py-12">
                                    <ListTodo size={48} className="mx-auto text-slate-200 mb-4" />
                                    <p className="text-slate-500 font-medium">No upcoming meetings to manage.</p>
                                </div>
                            ) : (
                                meetings.map(meeting => (
                                    <div key={meeting.MeetingID} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 bg-slate-50/50 hover:bg-white transition-all group">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white border border-slate-200 rounded-xl text-indigo-600 shadow-sm">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{meeting.meetingtype?.MeetingTypeName || "General Session"}</h3>
                                                <div className="flex items-center gap-3 mt-1.5 text-sm font-medium text-slate-500">
                                                    <span>{new Date(meeting.MeetingDate).toLocaleDateString()}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span className="text-indigo-600">{meeting._count.meetingagenda} Agenda Items</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/meetings/${meeting.MeetingID}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-600 hover:text-white transition-colors text-sm shrink-0"
                                        >
                                            View Agenda <ChevronRight size={16} />
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
