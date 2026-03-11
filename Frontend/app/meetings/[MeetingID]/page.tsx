import { prisma } from "@/lib/prisma";
import React from "react";
import PageHeader from "../../components/PageHeader";
import Section from "../../components/Section";
import Card from "../../components/Card";
import { Calendar, Clock, FileText, Link as LinkIcon, FileEdit, AlertCircle, CheckCircle, Info } from "lucide-react";
import MeetingMinutesClient from "./MeetingMinutesClient";
import MeetingAgendaClient from "./MeetingAgendaClient";
import MeetingDecisionsClient from "./MeetingDecisionsClient";
import MeetingActionItemsClient from "./MeetingActionItemsClient";
import { requireUser } from "@/lib/session";

async function DetailMeeting({ params }: { params: Promise<{ MeetingID: string }> }) {
    const { MeetingID } = await params;

    const session = await requireUser();
    const canEdit = session.role === 'admin' || session.role === 'meeting_convener';

    const data = await prisma.meetings.findFirst({
        where: { MeetingID: Number(MeetingID) },
        include: {
            meetingtype: true,
            meetingminutes: true,
            meetingagenda: {
                orderBy: {
                    OrderSeq: 'asc'
                }
            },
            minuteshistory: {
                orderBy: {
                    Created: 'desc'
                }
            },
            decision: {
                orderBy: {
                    Created: 'desc'
                }
            },
            actionitem: {
                orderBy: {
                    Created: 'desc'
                },
                include: {
                    staff: true
                }
            }
        }
    });

    const staffs = await prisma.staff.findMany({ select: { StaffID: true, StaffName: true } });
    const staffMap = new Map(staffs.map(s => [s.StaffID, s.StaffName]));

    const mappedHistory = data?.minuteshistory.map((h: any) => ({
        HistoryID: h.HistoryID,
        Content: h.Content,
        Created: h.Created,
        EditedBy: h.EditedBy,
        EditorName: staffMap.get(h.EditedBy) || "Unknown User"
    })) || [];

    if (!data) {
        return (
            <div className="bg-pattern min-h-screen">
                <PageHeader title="Session Not Found" icon={AlertCircle} backHref="/meetings" />
                <Section>
                    <Card>
                        <div className="text-center py-12">
                            <p className="text-gray-600 font-medium text-lg">The requested meeting record could not be retrieved from the repository.</p>
                        </div>
                    </Card>
                </Section>
            </div>
        );
    }

    return (
        <div className="bg-pattern min-h-screen pb-12">
            <PageHeader
                title="Meeting Details"
                description="Comprehensive overview of session parameters and governance status."
                icon={Calendar}
                backHref="/meetings"
                action={{
                    href: `/meetings/edit/${data.MeetingID}`,
                    label: "Edit Session",
                    icon: FileEdit
                }}
            />

            <Section>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Status & Quick Info */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="text-center">
                            <div className={`mx-auto w-20 h-20 rounded-[2rem] flex items-center justify-center mb-4 shadow-xl ${data.IsCancelled ? 'bg-amber-100 text-amber-700 shadow-amber-50' : 'bg-green-100 text-green-600 shadow-green-500/10'}`}>
                                {data.IsCancelled ? <AlertCircle size={40} /> : <CheckCircle size={40} />}
                            </div>
                            <h2 className="text-xl font-bold text-black  uppercase tracking-tight">
                                {data.IsCancelled ? 'Cancelled' : 'Active'}
                            </h2>
                            <p className="text-sm text-gray-600 font-medium tracking-wide">Governance Status</p>

                            <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">Meeting Target</p>
                                    <p className="font-bold text-indigo-600 line-clamp-2">{data.meetingtype?.MeetingTypeName || "Unclassified"}</p>
                                </div>
                            </div>
                        </Card>

                        {data.IsCancelled && (
                            <Card className="bg-amber-50  border-amber-100 ">
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Revocation Logs</p>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-bold text-gray-700">Timestamp</p>
                                            <p className="text-sm font-medium text-rose-700 ">
                                                {data.CancellationDateTime ? new Date(data.CancellationDateTime).toLocaleString() : 'Not documented'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-700">Reasoning</p>
                                            <p className="text-sm text-gray-800  italic">
                                                "{data.CancellationReason || 'No descriptive reasoning provided.'}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Detailed Info */}
                    <div className="md:col-span-2 space-y-6">
                        <Card title="Session Framework">
                            <div className="grid grid-cols-1 gap-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-2xl bg-indigo-50  text-indigo-600 text-indigo-400">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Scheduled Timeline</p>
                                        <p className="text-lg font-bold text-black ">
                                            {new Date(data.MeetingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                        <p className="text-indigo-600 text-indigo-400 font-medium">
                                            {new Date(data.MeetingDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-2xl bg-indigo-50  text-indigo-600 text-indigo-400">
                                        <Info size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Classification</p>
                                        <p className="text-lg font-medium text-black ">
                                            {data.meetingtype?.MeetingTypeName || "Unclassified Session"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-2xl bg-indigo-50  text-indigo-600 text-indigo-400">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Agenda Description</p>
                                        <p className="text-lg text-gray-800  leading-relaxed">
                                            {data.MeetingDescription || "Zero descriptive data provided for this session."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-2xl bg-indigo-50  text-indigo-600 text-indigo-400">
                                        <LinkIcon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Resource Repository</p>
                                        {data.DocumentPath ? (
                                            <p className="text-lg font-mono text-indigo-600 text-indigo-400 break-all">{data.DocumentPath}</p>
                                        ) : (
                                            <p className="text-lg text-gray-700 italic">No external resources mapped.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Meeting Agenda */}
                        <MeetingAgendaClient
                            meetingID={data.MeetingID}
                            agendas={data.meetingagenda || []}
                            canEdit={canEdit}
                        />

                        {/* Meeting Decisions */}
                        <MeetingDecisionsClient
                            meetingID={data.MeetingID}
                            decisions={data.decision || []}
                            canEdit={canEdit}
                        />

                        {/* Meeting Action Items */}
                        <MeetingActionItemsClient
                            meetingID={data.MeetingID}
                            actionItems={data.actionitem || []}
                            staffMembers={staffs || []}
                            canEdit={canEdit}
                        />

                        {/* Meeting Minutes */}
                        <MeetingMinutesClient
                            meetingID={data.MeetingID}
                            initialNotes={data.meetingminutes[0]?.Notes || null}
                            historyLogs={mappedHistory}
                            canEdit={canEdit}
                        />
                    </div>
                </div>
            </Section>
        </div>
    );
}

export default DetailMeeting;
