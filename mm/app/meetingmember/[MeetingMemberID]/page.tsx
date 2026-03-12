import { prisma } from "@/lib/prisma";
import React from "react";
import PageHeader from "@/app/components/PageHeader";
import Section from "@/app/components/Section";
import Card from "@/app/components/Card";
import { User, Calendar, MessageSquare, CheckCircle, XCircle, FileEdit, Hash, Info } from "lucide-react";

async function DetailMeetingMember({ params }: { params: Promise<{ MeetingMemberID: string }> }) {
  const { MeetingMemberID } = await params;
  const data = await prisma.meetingmember.findFirst({
    where: { MeetingMemberID: Number(MeetingMemberID) },
    include: {
      staff: true,
      meetings: {
        include: {
          meetingtype: true
        }
      }
    }
  });

  if (!data) {
    return (
      <div className="bg-pattern min-h-screen">
        <PageHeader title="Record Not Found" icon={User} backHref="/meetingmember" />
        <Section>
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 font-medium text-lg">The requested membership record could not be retrieved.</p>
            </div>
          </Card>
        </Section>
      </div>
    );
  }

  return (
    <div className="bg-pattern min-h-screen pb-12">
      <PageHeader
        title="Membership Profile"
        description="Detailed record of session assignment and documented presence/absence."
        icon={User}
        backHref="/meetingmember"
        action={{
          href: `/meetingmember/edit/${data.MeetingMemberID}`,
          label: "Update Record",
          icon: FileEdit
        }}
      />

      <Section>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Status Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <Card className="text-center">
              <div className={`mx-auto w-20 h-20 rounded-[2rem] flex items-center justify-center mb-4 shadow-xl ${data.IsPresent ? 'bg-sky-500/20 text-sky-500 shadow-sky-500/20 border border-sky-200' : 'bg-white text-gray-600 text-black shadow-slate-500/10'}`}>
                {data.IsPresent ? <CheckCircle size={40} /> : <XCircle size={40} />}
              </div>
              <h2 className="text-xl font-bold text-black  uppercase tracking-tight">
                {data.IsPresent ? 'Present' : 'Absent'}
              </h2>
              <p className="text-sm text-gray-600 font-medium tracking-wide">Presence Status</p>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Index Reference</p>
                <p className="font-bold text-indigo-600">MEM-{data.MeetingMemberID}</p>
              </div>
            </Card>

            <Card className="bg-slate-50 text-black border-none">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">Administrative Info</p>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{data.Remarks || "No specific remarks documented for this membership record."}"
                </p>
              </div>
            </Card>
          </div>

          {/* Core Content */}
          <div className="md:col-span-2 space-y-6">
            <Card title="Personnel Assignment">
              <div className="flex items-center gap-6 p-2">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50  flex items-center justify-center text-indigo-600 font-black text-2xl">
                  {data.staff?.StaffName?.charAt(0) || "P"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black  uppercase tracking-tight">
                    {data.staff?.StaffName || "Unknown Personnel"}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                    <Hash size={14} />
                    <span>Reference ID: {data.StaffID}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Associated Session">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-white text-indigo-600 text-indigo-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Session Identity</p>
                    <p className="text-lg font-bold text-black  leading-tight">
                      {data.meetings?.meetingtype?.MeetingTypeName || "Standard Event"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold bg-indigo-100  text-indigo-600 text-indigo-300 px-2 py-0.5 rounded line-clamp-1">
                        {data.meetings?.MeetingDescription || "Meeting Target"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-white text-indigo-600 text-indigo-400">
                    <Info size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Session Agenda</p>
                    <p className="text-sm text-gray-800  italic">
                      {data.meetings?.MeetingDescription || "No agenda details captured for this specific session."}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
}

export default DetailMeetingMember;