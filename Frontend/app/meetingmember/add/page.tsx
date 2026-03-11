import { saveMeetingMember } from "@/app/actions/saveMeetingMember";
import React from "react";
import PageHeader from "../../components/PageHeader";
import Section from "../../components/Section";
import Card from "../../components/Card";
import { UserPlus, Hash, User, MessageSquare, CheckCircle, Save, Calendar } from "lucide-react";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

async function AddMeetingMember() {
  const session = await requireUser();
  const role = session.role;

  if (role !== 'admin' && role !== 'meeting_convener') {
    redirect("/unauthorized");
  }

  return (
    <div className="bg-pattern min-h-screen pb-12">
      <PageHeader
        title="Assign Meeting Member"
        description="Link personnel to specific governance sessions and document initial attendance status."
        icon={UserPlus}
        backHref="/meetingmember"
      />

      <Section>
        <div className="max-w-2xl mx-auto">
          <Card>
            <form action={saveMeetingMember} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Meeting ID Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-500" />
                    Session ID
                  </label>
                  <input
                    type="number"
                    name="MeetingID"
                    placeholder="Enter numerical meeting identifier"
                    className="input-field"
                    required
                  />
                </div>

                {/* Staff ID Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                    <User size={16} className="text-indigo-500" />
                    Personnel ID
                  </label>
                  <input
                    type="number"
                    name="StaffID"
                    placeholder="Enter numerical staff identifier"
                    className="input-field"
                    required
                  />
                </div>

                {/* Remarks Input */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                    <MessageSquare size={16} className="text-indigo-500" />
                    Assignment Remarks
                  </label>
                  <input
                    type="text"
                    name="Remarks"
                    placeholder="Optional notes regarding this assignment..."
                    className="input-field"
                  />
                </div>

                {/* Attendance Checkbox */}
                <div className="md:col-span-2 p-4 rounded-2xl bg-white border border-slate-200 group transition-all hover:border-sky-500/50">
                  <label className="flex items-center gap-4 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="IsPresent"
                        className="peer sr-only"
                      />
                      <div className="w-11 h-6 bg-slate-200/50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-400 :ring-emerald-800 rounded-full peer  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-sky-500"></div>
                    </div>
                    <div>
                      <p className="font-bold text-black  flex items-center gap-2">
                        <CheckCircle size={16} className="text-sky-500" />
                        Confirm Attendance
                      </p>
                      <p className="text-xs text-gray-600">Flag this member as 'Present' immediately upon assignment.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <button
                  type="submit"
                  className="w-full btn-primary py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/20"
                >
                  <Save size={20} />
                  Confirm Assignment
                </button>
              </div>
            </form>
          </Card>
        </div>
      </Section>
    </div>
  );
}

export default AddMeetingMember;