import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Section from "@/app/components/Section";
import PageHeader from "@/app/components/PageHeader";
import Card from "@/app/components/Card";
import BackButton from "@/app/components/BackButton";
import Link from "next/link";
import { User, Mail, Phone, Calendar, Clock, UserCheck, UserX, BarChart3, ChevronRight } from "lucide-react";

export default async function StaffProfilePage() {
    const session = await requireUser();

    if (!session.StaffID) {
        redirect("/dashboard");
    }

    // Fetch staff data including meetingmember relations to compute personal attendance
    const staffData = await prisma.staff.findUnique({
        where: { StaffID: session.StaffID },
        include: {
            meetingmember: {
                include: {
                    meetings: {
                        include: {
                            meetingtype: true
                        }
                    }
                },
                orderBy: {
                    meetings: {
                        MeetingDate: 'desc'
                    }
                }
            }
        }
    });

    if (!staffData) {
        redirect("/dashboard");
    }

    const totalInvites = staffData.meetingmember.length;
    const attendedSessions = staffData.meetingmember.filter(m => m.IsPresent).length;
    const absentSessions = totalInvites - attendedSessions;
    const attendanceRate = totalInvites > 0 ? Math.round((attendedSessions / totalInvites) * 100) : 0;

    return (
        <div className="min-h-full pb-20 bg-slate-50/50">
            <Section className="pt-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <BackButton href="/dashboard" />
                </div>

                <PageHeader
                    title="My Profile"
                    description="View your personal information, attendance statistics, and meeting history."
                    icon={User}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                    {/* Left Column - Personal Info */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="text-center">
                            <div className="mx-auto w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white mb-4 shadow-xl shadow-indigo-500/20">
                                <User size={48} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight line-clamp-1">{staffData.StaffName}</h2>
                            <p className="text-sm text-gray-600 font-medium capitalize mt-1">{(session.role || 'staff').replace('_', ' ')}</p>

                            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-4 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                                        <Mail size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                                        <p className="text-sm font-medium text-gray-800">{staffData.EmailAddress || "Not set"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                                        <Phone size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Contact</p>
                                        <p className="text-sm font-medium text-gray-800">{staffData.MobileNo || "Not set"}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Personal Attendance Stats */}
                        <Card title="Attendance Performance">
                            <div className="flex items-center gap-4 mb-6 mt-2">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <BarChart3 size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-end mb-1">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Overall Present Rate</p>
                                        <p className="text-lg font-bold text-indigo-700">{attendanceRate}%</p>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${attendanceRate >= 80 ? 'bg-green-500' :
                                                attendanceRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                                }`}
                                            style={{ width: `${attendanceRate}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 text-center">
                                    <UserCheck size={20} className="text-green-600 mx-auto mb-2" />
                                    <p className="text-2xl font-black text-green-700">{attendedSessions}</p>
                                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">Attended</p>
                                </div>
                                <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 text-center">
                                    <UserX size={20} className="text-rose-600 mx-auto mb-2" />
                                    <p className="text-2xl font-black text-rose-700">{absentSessions}</p>
                                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1">Absent</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Meeting History */}
                    <div className="md:col-span-2 space-y-6">
                        <Card title="Meeting History & Invites">
                            <div className="space-y-4">
                                {totalInvites === 0 ? (
                                    <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
                                        <p className="font-medium">You have not been assigned to any meetings yet.</p>
                                    </div>
                                ) : (
                                    staffData.meetingmember.map((member) => (
                                        <div key={member.MeetingMemberID} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50 transition-colors group">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 p-2 rounded-lg border shadow-sm ${member.IsPresent
                                                    ? 'bg-green-50 border-green-200 text-green-600'
                                                    : 'bg-rose-50 border-rose-200 text-rose-600'
                                                    }`}>
                                                    {member.IsPresent ? <UserCheck size={18} /> : <UserX size={18} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                        {member.meetings.meetingtype?.MeetingTypeName || "General Meeting"}
                                                        {member.IsPresent ? (
                                                            <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full uppercase tracking-widest">Present</span>
                                                        ) : (
                                                            <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full uppercase tracking-widest">Absent</span>
                                                        )}
                                                    </h4>
                                                    <div className="mt-1 flex items-center gap-3 text-sm font-medium text-slate-500">
                                                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {new Date(member.meetings.MeetingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {new Date(member.meetings.MeetingDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/meetings/${member.MeetingID}`}
                                                className="shrink-0 inline-flex items-center gap-1 px-4 py-2 sm:px-3 sm:py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                                            >
                                                View Details <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </Section>
        </div>
    );
}
