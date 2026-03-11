import React from "react";
import { prisma } from "../../lib/prisma";
import { requireUser } from "@/lib/session";
import Link from "next/link";
import deleteMeeting from "../actions/deleteMeeting";
import DeleteUserBtn from "../ui/DeleteUserBtn";
import PageHeader from "../components/PageHeader";
import Section from "../components/Section";
import Card from "../components/Card";
import SearchBar from "../components/SearchBar";
import { Calendar, Plus, FileEdit, Eye, Hash, Clock, FileText, CheckCircle2, XCircle } from "lucide-react";

async function MeetingList(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const session = await requireUser();
    const role = session.role;
    const isAdminOrConvener = role === 'admin' || role === 'meeting_convener';

    const searchParams = await props.searchParams;
    const q = searchParams?.q || "";

    let where: any = {};
    if (role === 'meeting_convener') {
        const staffId = Number(session?.StaffID) || -1;
        where.OR = [
            { CreatedBy: staffId },
            {
                meetingmember: {
                    some: { StaffID: staffId }
                }
            },
            {
                MeetingDate: { gte: new Date() },
                CreatedBy: 0
            },
            {
                MeetingDate: { gte: new Date() },
                CreatedBy: null
            }
        ];
    } else if (role === 'staff') {
        const staffId = Number(session?.StaffID) || -1;
        where.OR = [
            {
                meetingmember: {
                    some: { StaffID: staffId }
                }
            },
            {
                MeetingDate: { gte: new Date() },
                CreatedBy: 0
            },
            {
                MeetingDate: { gte: new Date() },
                CreatedBy: null
            }
        ];
    }

    if (q) {
        const queryFilter: any = {
            OR: [
                { MeetingDescription: { contains: q } },
                { meetingtype: { MeetingTypeName: { contains: q } } }
            ]
        };
        const numQ = parseInt(q);
        if (!isNaN(numQ)) {
            queryFilter.OR.push({ MeetingID: numQ });
        }

        if (where.OR) {
            where.AND = [
                { OR: where.OR },
                queryFilter
            ];
            delete where.OR;
        } else {
            where.OR = queryFilter.OR;
        }
    }

    const data = await prisma.meetings.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        include: {
            meetingtype: true
        },
        orderBy: { MeetingDate: 'desc' }
    });

    return (
        <div className="bg-pattern min-h-screen pb-12">
            <PageHeader
                title="Meeting Records"
                description="Browse and manage all scheduled and historical meetings."
                icon={Calendar}
                backHref="/dashboard"
                action={isAdminOrConvener ? {
                    href: "/meetings/add",
                    label: "Schedule Meeting",
                    icon: Plus
                } : undefined}
            >
                <SearchBar placeholder="Search meetings..." />
            </PageHeader>

            <Section>
                <Card noPadding>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-slate-200">
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-gray-700">
                                        <div className="flex items-center gap-2"><Hash size={14} /> ID</div>
                                    </th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-gray-700">
                                        <div className="flex items-center gap-2"><Clock size={14} /> Date & Time</div>
                                    </th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-gray-700">
                                        <div className="flex items-center gap-2"><FileText size={14} /> Type & Description</div>
                                    </th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-gray-700 text-center">Status</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-12 text-center text-gray-700 font-medium">
                                            No meetings found in the repository.
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item: any) => (
                                        <tr key={item.MeetingID} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-5">
                                                <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-gray-700">
                                                    {item.MeetingID}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-black">
                                                        {new Date(item.MeetingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(item.MeetingDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-black uppercase tracking-tight">
                                                        {item.meetingtype?.MeetingTypeName || "General Application"}
                                                    </span>
                                                    <span className="font-medium text-gray-700 line-clamp-1">
                                                        {item.MeetingDescription || "No description provided"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${item.IsCancelled
                                                    ? 'bg-amber-100 text-amber-900 font-bold/10 text-amber-600 border border-amber-200 shadow-inner'
                                                    : 'bg-sky-50 text-sky-500 border border-sky-200 shadow-inner'
                                                    }`}>
                                                    {item.IsCancelled ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                                                    {item.IsCancelled ? 'Cancelled' : 'Scheduled'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center justify-end gap-2 transition-opacity">
                                                    <Link
                                                        href={`/meetings/${item.MeetingID}`}
                                                        title="View Details"
                                                        className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-gray-600 hover:text-indigo-400 group-hover:text-indigo-400 transition-all shadow-sm"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>
                                                    {isAdminOrConvener && (
                                                        <>
                                                            <Link
                                                                href={`/meetings/edit/${item.MeetingID}`}
                                                                title="Edit Meeting"
                                                                className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-gray-600 hover:text-sky-500 group-hover:text-sky-500 transition-all shadow-sm"
                                                            >
                                                                <FileEdit size={18} />
                                                            </Link>
                                                            <DeleteUserBtn id={item.MeetingID} deleteFn={deleteMeeting} />
                                                        </>
                                                    )}
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

export default MeetingList;
