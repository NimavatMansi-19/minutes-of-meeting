import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Section from "@/app/components/Section";
import PageHeader from "@/app/components/PageHeader";
import Card from "@/app/components/Card";
import BackButton from "@/app/components/BackButton";
import { UserCheck, UserX, BarChart3 } from "lucide-react";

export default async function AttendanceReportPage() {
    const session = await requireUser();
    if (session.role !== 'admin' && session.role !== 'meeting_convener') {
        redirect("/unauthorized");
    }

    // Fetch all staff and their meeting member records
    const staffMembers = await prisma.staff.findMany({
        orderBy: { StaffName: 'asc' },
        include: {
            meetingmember: true
        }
    });

    const reportData = staffMembers.map(staff => {
        const totalMeetings = staff.meetingmember.length;
        const attended = staff.meetingmember.filter(m => m.IsPresent).length;
        const absent = totalMeetings - attended;
        const attendanceRate = totalMeetings > 0 ? Math.round((attended / totalMeetings) * 100) : 0;

        return {
            ...staff,
            totalMeetings,
            attended,
            absent,
            attendanceRate
        };
    });

    return (
        <div className="min-h-full pb-20 bg-slate-50/50">
            <Section className="pt-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <BackButton href="/dashboard" />
                </div>

                <PageHeader
                    title="Attendance Summary"
                    description="Organization-wide meeting attendance and participation metrics."
                />

                <Card className="mt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div className="flex items-center gap-2 text-gray-700">
                            <BarChart3 size={20} className="text-indigo-500" />
                            <h2 className="text-lg font-bold">Staff Participation Report</h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/50">
                                    <th className="py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-widest rounded-tl-xl whitespace-nowrap">Staff Member</th>
                                    <th className="py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Total Invites</th>
                                    <th className="py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Attended</th>
                                    <th className="py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Absent</th>
                                    <th className="py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-widest rounded-tr-xl whitespace-nowrap">Participation Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reportData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-500 bg-slate-50/30 rounded-b-xl">
                                            No attendance data found.
                                        </td>
                                    </tr>
                                ) : (
                                    reportData.map((staff) => (
                                        <tr key={staff.StaffID} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-5 border-b border-slate-100">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900">{staff.StaffName}</span>
                                                    {staff.EmailAddress && (
                                                        <span className="text-xs text-gray-500 font-medium">{staff.EmailAddress}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-5 border-b border-slate-100 text-gray-700 font-semibold align-middle">
                                                {staff.totalMeetings}
                                            </td>
                                            <td className="py-4 px-5 border-b border-slate-100 align-middle">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-bold text-sm border border-green-200 w-fit cursor-default">
                                                    <UserCheck size={14} />
                                                    {staff.attended}
                                                </div>
                                            </td>
                                            <td className="py-4 px-5 border-b border-slate-100 align-middle">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-sm border border-rose-200 w-fit cursor-default">
                                                    <UserX size={14} />
                                                    {staff.absent}
                                                </div>
                                            </td>
                                            <td className="py-4 px-5 border-b border-slate-100 align-middle">
                                                <div className="flex items-center gap-3 w-48">
                                                    <div className="text-sm font-bold text-gray-700 w-10 shrink-0 text-right">
                                                        {staff.attendanceRate}%
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner overflow-hidden">
                                                        <div
                                                            className={`h-2 rounded-full ${staff.attendanceRate >= 80 ? 'bg-green-500' :
                                                                    staff.attendanceRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                                                }`}
                                                            style={{ width: `${staff.attendanceRate}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
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
