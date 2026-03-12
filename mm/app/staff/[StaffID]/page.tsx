import { prisma } from "@/lib/prisma";
import Link from "next/link";
import React from "react";
import PageHeader from "@/app/components/PageHeader";
import Section from "@/app/components/Section";
import Card from "@/app/components/Card";
import { User, Mail, Phone, MessageSquare, Calendar, FileEdit, Clock, CheckCircle, Users, Bell } from "lucide-react";

async function DetailStaff({ params }: { params: Promise<{ StaffID: string }> }) {
  const { StaffID } = await params;
  const data = await prisma.staff.findFirst({
    where: { StaffID: Number(StaffID) },
    include: {
      meetingmember: {
        include: {
          meetings: {
            include: { meetingtype: true }
          }
        },
        orderBy: { Created: 'desc' }
      },
      actionitem: {
        include: { meetings: true },
        orderBy: { Created: 'desc' }
      },
      notification: {
        orderBy: { Created: 'desc' }
      }
    }
  });

  if (!data) {
    return (
      <div className="bg-pattern min-h-screen">
        <PageHeader title="Staff Not Found" icon={User} backHref="/staff" />
        <Section>
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 font-medium text-lg">The requested staff record could not be found in the repository.</p>
            </div>
          </Card>
        </Section>
      </div>
    );
  }

  return (
    <div className="bg-pattern min-h-screen pb-12">
      <PageHeader
        title="Staff Profile"
        description="Detailed personnel record and administrative information."
        icon={User}
        backHref="/staff"
        action={{
          href: `/staff/edit/${data.StaffID}`,
          label: "Update Record",
          icon: FileEdit
        }}
      />

      <Section>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Avatar & Basic Info */}
          <div className="md:col-span-1 space-y-6">
            <Card className="text-center">
              <div className="mx-auto w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white mb-4 shadow-xl shadow-indigo-500/20">
                <User size={48} />
              </div>
              <h2 className="text-xl font-bold text-black line-clamp-1">{data.StaffName}</h2>
              <p className="text-sm text-gray-600 font-medium">Organization Personnel</p>

              <div className="mt-6 pt-6 border-t border-slate-200 flex justify-center gap-4">
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">ID</p>
                  <p className="font-bold text-indigo-600">#{data.StaffID}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white backdrop-blur-xl border border-slate-200 shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-slate-50 text-indigo-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Created At</p>
                  <p className="text-sm text-gray-900 font-medium">{data.Created ? new Date(data.Created).toLocaleDateString() : "Unknown"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-slate-50 text-indigo-600">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Last Modified</p>
                  <p className="text-sm text-gray-900 font-medium">{data.Modified ? new Date(data.Modified).toLocaleDateString() : "Unknown"}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="md:col-span-2 space-y-6">
            <Card title="Personnel Information">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 text-indigo-600">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Email Address</p>
                    <p className="text-lg font-medium text-black">{data.EmailAddress || "No email registered"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 text-indigo-600">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Mobile Access</p>
                    <p className="text-lg font-medium text-black">{data.MobileNo || "No contact number"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 text-indigo-600">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Administrative Remarks</p>
                    <p className="text-lg font-medium text-black">{data.Remarks || "Zero remarks documented"}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Meetings Attendance" className="mt-8">
              {data.meetingmember.length === 0 ? (
                <p className="text-gray-500 text-sm">No meetings attended yet.</p>
              ) : (
                <div className="space-y-4">
                  {data.meetingmember.slice(0, 5).map((member) => (
                    <div key={member.MeetingMemberID} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                          <Users size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{member.meetings.MeetingDescription || "Untitled Meeting"}</p>
                          <p className="text-xs text-gray-500">{new Date(member.meetings.MeetingDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-xs font-bold px-2 py-1 rounded-md bg-white border border-slate-200">
                        {member.IsPresent ? "Present" : "Absent"}
                      </div>
                    </div>
                  ))}
                  {data.meetingmember.length > 5 && (
                    <p className="text-xs text-center text-gray-500 font-medium">And {data.meetingmember.length - 5} more meetings...</p>
                  )}
                </div>
              )}
            </Card>

            <Card title="Assigned Action Items">
              {data.actionitem.length === 0 ? (
                <p className="text-gray-500 text-sm">No action items assigned.</p>
              ) : (
                <div className="space-y-4">
                  {data.actionitem.slice(0, 5).map((item) => (
                    <div key={item.ActionItemID} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 gap-4">
                      <div className="flex flex-col">
                        <p className="font-medium text-gray-900 line-clamp-1">{item.Title}</p>
                        <p className="text-xs text-gray-500">From meeting on {new Date(item.meetings.MeetingDate).toLocaleDateString()}</p>
                      </div>
                      <div className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${item.Status === "Completed" ? "bg-green-100 text-green-700" : item.Status === "In Progress" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"}`}>
                        {item.Status}
                      </div>
                    </div>
                  ))}
                  {data.actionitem.length > 5 && (
                    <p className="text-xs text-center text-gray-500 font-medium">And {data.actionitem.length - 5} more action items...</p>
                  )}
                </div>
              )}
            </Card>

            <Card title="System Notifications">
              {data.notification.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent notifications.</p>
              ) : (
                <div className="space-y-4">
                  {data.notification.slice(0, 5).map((notif) => (
                    <div key={notif.NotificationID} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className={`p-2 rounded-lg ${notif.IsRead ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-600'}`}>
                        <Bell size={16} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${notif.IsRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{notif.Message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.Created ? new Date(notif.Created).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                  ))}
                  {data.notification.length > 5 && (
                    <p className="text-xs text-center text-gray-500 font-medium">And {data.notification.length - 5} more notifications...</p>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
}

export default DetailStaff;
