import { saveUser } from "@/app/actions/saveUser";
import React from "react";
import PageHeader from "../../components/PageHeader";
import Section from "../../components/Section";
import Card from "../../components/Card";
import { UserPlus, User, Mail, Phone, MessageSquare, Save } from "lucide-react";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

async function AddUser() {
  const session = await requireUser();
  const role = session.role;
  if (role !== 'admin' && role !== 'meeting_convener') {
    redirect("/unauthorized");
  }

  return (
    <div className="bg-pattern min-h-screen pb-12">
      <PageHeader
        title="Staff Onboarding"
        description="Register a new personnel member into the organization repository."
        icon={UserPlus}
        backHref="/staff"
      />

      <Section>
        <div className="max-w-3xl mx-auto">
          <Card>
            <form action={saveUser} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                    <User size={16} className="text-indigo-500" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="staffname"
                    placeholder="Enter staff full name"
                    className="input-field"
                    required
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                    <Mail size={16} className="text-indigo-500" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="official@company.com"
                    className="input-field"
                    required
                  />
                </div>

                {/* Mobile Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                    <Phone size={16} className="text-indigo-500" />
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="Mobile"
                    placeholder="+1 (555) 000-0000"
                    className="input-field"
                    required
                  />
                </div>

                {/* Remark Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-800  flex items-center gap-2">
                    <MessageSquare size={16} className="text-indigo-500" />
                    Administrative Remarks
                  </label>
                  <input
                    type="text"
                    name="remark"
                    placeholder="Optional notes..."
                    className="input-field"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="reset"
                  className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-slate-50 transition-all"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2 px-8"
                >
                  <Save size={18} />
                  Authorize & Add Staff
                </button>
              </div>
            </form>
          </Card>
        </div>
      </Section>
    </div>
  );
}

export default AddUser;