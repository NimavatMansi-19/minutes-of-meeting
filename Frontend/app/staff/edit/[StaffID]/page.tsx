import { prisma } from '@/lib/prisma';
import React from 'react'
import EditStaffAction from '@/app/actions/EditStaff';
import PageHeader from '@/app/components/PageHeader';
import Section from '@/app/components/Section';
import Card from '@/app/components/Card';
import { User, Mail, Phone, MessageSquare, Save, UserCog } from 'lucide-react';
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";

async function EditStaff({ params }: { params: Promise<{ StaffID: string }> }) {
  const session = await requireUser();
  const role = session.role;
  if (role !== 'admin' && role !== 'meeting_convener') {
    redirect("/unauthorized");
  }

  const { StaffID } = await params;
  const data = await prisma.staff.findFirst({
    where: {
      StaffID: Number(StaffID)
    }
  })

  if (!data) {
    redirect("/staff");
  }

  return (
    <div className="bg-pattern min-h-screen pb-12">
      <PageHeader
        title="Edit Staff Member"
        description={`Updating profile information for ${data.StaffName}.`}
        icon={UserCog}
        backHref={`/staff/${StaffID}`}
      />

      <Section>
        <div className="max-w-3xl mx-auto">
          <Card>
            <form action={EditStaffAction} className="space-y-8">
              <input
                type="hidden"
                name="StaffID"
                defaultValue={data.StaffID.toString()}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                    <User size={16} className="text-indigo-500" />
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    name="staffname"
                    defaultValue={data.StaffName}
                    placeholder="e.g., Jonathan Doe"
                    className="input-field"
                    required
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                    <Mail size={16} className="text-indigo-500" />
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={data.EmailAddress || ""}
                    placeholder="email@organization.com"
                    className="input-field"
                    required
                  />
                </div>

                {/* Mobile Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                    <Phone size={16} className="text-indigo-500" />
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="Mobile"
                    defaultValue={data.MobileNo || ""}
                    placeholder="+1 (555) 000-0000"
                    className="input-field"
                    required
                  />
                </div>

                {/* Remark Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                    <MessageSquare size={16} className="text-indigo-500" />
                    Personnel Remarks
                  </label>
                  <input
                    type="text"
                    name="remark"
                    defaultValue={data.Remarks || ""}
                    placeholder="Role specific notes..."
                    className="input-field"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <button
                  type="submit"
                  className="w-full btn-primary py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all"
                >
                  <Save size={20} />
                  Update Personnel Record
                </button>
              </div>
            </form>
          </Card>
        </div>
      </Section>
    </div>
  );
}

export default EditStaff
