import { prisma } from "@/lib/prisma";
import React from "react";
import { updateMeetingType } from "@/app/actions/updateMeetingType";
import PageHeader from "@/app/components/PageHeader";
import Section from "@/app/components/Section";
import Card from "@/app/components/Card";
import { Layers, Type, MessageSquare, Save, FileEdit } from "lucide-react";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

async function EditMeetingType({ params }: { params: Promise<{ MeetingTypeID: string }> }) {
    const session = await requireUser();
    const role = session.role;

    if (role !== 'admin' && role !== 'meeting_convener') {
        redirect("/unauthorized");
    }

    const { MeetingTypeID } = await params;
    const data = await prisma.meetingtype.findFirst({
        where: {
            MeetingTypeID: Number(MeetingTypeID),
        },
    });

    if (!data) {
        redirect("/meetingtype");
    }

    return (
        <div className="bg-pattern min-h-screen pb-12">
            <PageHeader
                title="Modify Classification"
                description={`Updating organizational schema for category #${MeetingTypeID}.`}
                icon={FileEdit}
                backHref="/meetingtype"
            />

            <Section>
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <form action={updateMeetingType} className="space-y-8">
                            <input
                                type="hidden"
                                name="MeetingTypeID"
                                defaultValue={data.MeetingTypeID.toString()}
                            />

                            <div className="space-y-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                                        <Type size={16} className="text-indigo-500" />
                                        Classification Label
                                    </label>
                                    <input
                                        type="text"
                                        name="MeetingTypeName"
                                        defaultValue={data.MeetingTypeName}
                                        placeholder="e.g., Strategic Review"
                                        className="input-field uppercase tracking-tight font-bold"
                                        required
                                    />
                                    <p className="text-xs text-gray-600">Renaming this will update all historical meetings associated with this classification.</p>
                                </div>

                                {/* Remarks Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                                        <MessageSquare size={16} className="text-indigo-500" />
                                        Administrative Directives
                                    </label>
                                    <textarea
                                        name="Remarks"
                                        defaultValue={data.Remarks || ""}
                                        placeholder="Updated directives or scope..."
                                        className="input-field min-h-[120px] py-4 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-200">
                                <button
                                    type="submit"
                                    className="w-full btn-primary py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/20"
                                >
                                    <Save size={20} />
                                    Commit Schema Updates
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            </Section>
        </div>
    );
}

export default EditMeetingType;
