import { prisma } from "@/lib/prisma";
import React from "react";
import PageHeader from "@/app/components/PageHeader";
import Section from "@/app/components/Section";
import Card from "@/app/components/Card";
import { Layers, Type, MessageSquare, Hash, FileEdit, Info } from "lucide-react";

async function DetailMeetingType({ params }: { params: Promise<{ MeetingTypeID: string }> }) {
    const { MeetingTypeID } = await params;
    const data = await prisma.meetingtype.findFirst({
        where: { MeetingTypeID: Number(MeetingTypeID) },
    });

    if (!data) {
        return (
            <div className="bg-pattern min-h-screen">
                <PageHeader title="Schema Not Found" icon={Layers} backHref="/meetingtype" />
                <Section>
                    <Card>
                        <div className="text-center py-12">
                            <p className="text-gray-600 font-medium text-lg">The requested classification schema could not be identified.</p>
                        </div>
                    </Card>
                </Section>
            </div>
        );
    }

    return (
        <div className="bg-pattern min-h-screen pb-12">
            <PageHeader
                title="Classification Details"
                description="Regulatory parameters and administrative directives for this meeting category."
                icon={Layers}
                backHref="/meetingtype"
                action={{
                    href: `/meetingtype/edit/${data.MeetingTypeID}`,
                    label: "Modify Schema",
                    icon: FileEdit
                }}
            />

            <Section>
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <Card className="text-center h-full flex flex-col justify-center">
                                <div className="mx-auto w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white mb-4 shadow-xl shadow-indigo-500/20">
                                    <Type size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-indigo-600 text-indigo-400 tracking-tight uppercase">
                                    {data.MeetingTypeName}
                                </h2>
                                <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mt-2">Active Classification</p>
                            </Card>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <Card title="Structural Directives">
                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-2xl bg-white text-indigo-600 text-indigo-400">
                                            <Hash size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Index ID</p>
                                            <p className="text-lg font-bold text-black ">TYPE-{data.MeetingTypeID}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-2xl bg-white text-indigo-600 text-indigo-400">
                                            <MessageSquare size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Administrative Remarks</p>
                                            <p className="text-lg text-gray-800  leading-relaxed font-medium">
                                                {data.Remarks || "No specific administrative directives documented for this classification schema."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-white backdrop-blur-xl border border-slate-200 shadow-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-slate-50 text-black">
                                        <Info size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">System Integrity</p>
                                        <p className="text-sm text-slate-300">This schema is locked for active governance synchronization. Manual decommissioning requires administrative override.</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
}

export default DetailMeetingType;
