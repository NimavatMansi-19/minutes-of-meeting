import { saveMeetingType } from "@/app/actions/saveMeetingType";
import React from "react";
import PageHeader from "../../components/PageHeader";
import Section from "../../components/Section";
import Card from "../../components/Card";
import { Layers, Type, MessageSquare, Save, Plus } from "lucide-react";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

async function AddMeetingType() {
    const session = await requireUser();
    const role = session.role;

    if (role !== 'admin' && role !== 'meeting_convener') {
        redirect("/unauthorized");
    }

    return (
        <div className="bg-pattern min-h-screen pb-12">
            <PageHeader
                title="Define Classification"
                description="Register a new meeting category to standardize organizational workflows."
                icon={Plus}
                backHref="/meetingtype"
            />

            <Section>
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <form action={saveMeetingType} className="space-y-8">
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
                                        placeholder="e.g., Strategic Review, Tactical Sync"
                                        className="input-field uppercase tracking-tight font-bold"
                                        required
                                    />
                                    <p className="text-xs text-gray-600">This label will be used as the primary identifier for meetings under this category.</p>
                                </div>

                                {/* Remarks Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                                        <MessageSquare size={16} className="text-indigo-500" />
                                        Administrative Directives
                                    </label>
                                    <textarea
                                        name="Remarks"
                                        placeholder="Define the scope or specific requirements for this classification..."
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
                                    Formalize Classification
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            </Section>
        </div>
    );
}

export default AddMeetingType;
