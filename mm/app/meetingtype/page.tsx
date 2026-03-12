import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import { prisma } from "../../lib/prisma";
import Link from "next/link";
import deleteMeetingType from "../actions/deleteMeetingType";
import DeleteUserBtn from "../ui/DeleteUserBtn";
import PageHeader from "../components/PageHeader";
import Section from "../components/Section";
import Card from "../components/Card";
import SearchBar from "../components/SearchBar";
import { Layers, Plus, FileEdit, Eye, Hash, MessageSquare, Type } from "lucide-react";

async function MeetingTypeList(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const session = await requireUser();
    const role = session.role;

    if (role !== 'admin' && role !== 'meeting_convener') {
        redirect("/unauthorized");
    }

    const searchParams = await props.searchParams;
    const q = searchParams?.q || "";

    const data = await prisma.meetingtype.findMany({
        where: q ? {
            OR: [
                { MeetingTypeName: { contains: q } },
                { Remarks: { contains: q } }
            ]
        } : undefined
    });

    return (
        <div className="bg-pattern min-h-screen pb-12">
            <PageHeader
                title="Meeting Classifications"
                description="Define and manage categories of governance sessions within the organization."
                icon={Layers}
                backHref="/dashboard"
                action={{
                    href: "/meetingtype/add",
                    label: "Define Type",
                    icon: Plus
                }}
            >
                <SearchBar placeholder="Search classifications..." />
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
                                        <div className="flex items-center gap-2"><Type size={14} /> classification Name</div>
                                    </th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-gray-700">
                                        <div className="flex items-center gap-2"><MessageSquare size={14} /> Regulatory Remarks</div>
                                    </th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center text-gray-700 font-medium">
                                            No classification schemas documented.
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item: any) => (
                                        <tr key={item.MeetingTypeID} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-5">
                                                <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-gray-700">
                                                    {item.MeetingTypeID}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-black uppercase tracking-tight">{item.MeetingTypeName}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-sm text-slate-400 line-clamp-1 italic max-w-md">
                                                    {item.Remarks || "No administrative notes provided."}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center justify-end gap-2 transition-opacity">
                                                    <Link
                                                        href={`/meetingtype/${item.MeetingTypeID}`}
                                                        title="View Details"
                                                        className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-gray-600 hover:text-indigo-400 group-hover:text-indigo-400 transition-all shadow-sm"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>
                                                    <Link
                                                        href={`/meetingtype/edit/${item.MeetingTypeID}`}
                                                        title="Modify Schema"
                                                        className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-gray-600 hover:text-sky-500 group-hover:text-sky-500 transition-all shadow-sm"
                                                    >
                                                        <FileEdit size={18} />
                                                    </Link>
                                                    <DeleteUserBtn id={item.MeetingTypeID} deleteFn={deleteMeetingType} />
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

export default MeetingTypeList;
