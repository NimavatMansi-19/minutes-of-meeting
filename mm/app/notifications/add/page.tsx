import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Section from "@/app/components/Section";
import PageHeader from "@/app/components/PageHeader";
import Card from "@/app/components/Card";
import BackButton from "@/app/components/BackButton";
import { Send, BellPlus, User as UserIcon } from "lucide-react";
import { sendManualNotification } from "@/app/actions/notifications";
import { prisma } from "@/lib/prisma";

export default async function AddNotification() {
    const session = await requireUser();
    if (session.role !== 'admin' && session.role !== 'meeting_convener') {
        redirect("/unauthorized");
    }

    const allStaff = await prisma.staff.findMany({
        orderBy: { StaffName: 'asc' }
    });

    return (
        <div className="min-h-full pb-20 bg-slate-50/50">
            <Section className="pt-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <BackButton href="/dashboard" />
                </div>

                <PageHeader
                    title="Send System Alert"
                    description="Manually dispatch notifications directly to staff member dashboards."
                />

                <div className="max-w-3xl">
                    <Card>
                        <form action={sendManualNotification} className="space-y-6">

                            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 flex gap-4 text-indigo-800">
                                <BellPlus className="shrink-0 mt-1" size={24} />
                                <div>
                                    <h3 className="font-bold mb-1">Alert Broadcasting System</h3>
                                    <p className="text-sm">Use this tool to inform members about critical agenda updates, immediate schedule changes, or general non-meeting-specific announcements.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="TargetID" className="block text-sm font-bold text-gray-700 tracking-wide uppercase">
                                    Recipient <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <UserIcon size={18} />
                                    </div>
                                    <select
                                        id="TargetID"
                                        name="TargetID"
                                        required
                                        className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-shadow appearance-none font-medium shadow-sm hover:border-slate-300 transition-colors"
                                    >
                                        <option value="ALL">Broadcast to All Users</option>
                                        <optgroup label="Specific Staff Members">
                                            {allStaff.map(staff => (
                                                <option key={staff.StaffID} value={staff.StaffID}>
                                                    {staff.StaffName} {staff.EmailAddress ? `(${staff.EmailAddress})` : ''}
                                                </option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">Select a specific user or broadcast to everyone</p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="Message" className="block text-sm font-bold text-gray-700 tracking-wide uppercase">
                                    Notification Message <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    id="Message"
                                    name="Message"
                                    rows={4}
                                    placeholder="Type your message here..."
                                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium transition-colors"
                                    required
                                />
                                <p className="text-xs text-gray-500 font-medium pt-1">Messages are limited to 250 characters.</p>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-8">
                                <button
                                    type="submit"
                                    className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-md text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:shadow-lg active:scale-95 gap-2"
                                >
                                    <Send size={18} />
                                    Dispatch Alert
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            </Section>
        </div>
    );
}
