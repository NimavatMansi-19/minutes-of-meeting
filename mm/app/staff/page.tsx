import React from "react";
import { prisma } from "../../lib/prisma";
import { staff } from "../generated/prisma/browser";
import Link from "next/link";
import deleteStaff from "../actions/DeleteStaff";
import DeleteUserBtn from "../ui/DeleteUserBtn";
import PageHeader from "../components/PageHeader";
import Section from "../components/Section";
import Card from "../components/Card";
import SearchBar from "../components/SearchBar";
import { Users, UserPlus, FileEdit, Eye, Mail, Phone, Hash } from "lucide-react";
import { requireUser } from "@/lib/session";

async function Staff(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const session = await requireUser();
  const role = session.role;
  const isAdminOrConvener = role === 'admin' || role === 'meeting_convener';

  const searchParams = await props.searchParams;
  const q = searchParams?.q || "";

  const data = await prisma.staff.findMany({
    where: q ? {
      OR: [
        { StaffName: { contains: q, } },
        { EmailAddress: { contains: q, } },
        { MobileNo: { contains: q, } }
      ]
    } : undefined
  });

  return (
    <div className="bg-pattern min-h-screen pb-12">
      <PageHeader
        title="Staff Directory"
        description="Comprehensive directory of all organization staff and personnel."
        icon={Users}
        backHref="/dashboard"
        action={isAdminOrConvener ? {
          href: "/staff/add",
          label: "Onboard Staff",
          icon: UserPlus
        } : undefined}
      >
        <SearchBar placeholder="Search staff members..." />
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
                    <div className="flex items-center gap-2"><Users size={14} /> Name</div>
                  </th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-gray-700">
                    <div className="flex items-center gap-2"><Phone size={14} /> Contact</div>
                  </th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-gray-700">
                    <div className="flex items-center gap-2"><Mail size={14} /> Email</div>
                  </th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-gray-700 font-medium">
                      No staff members found in the repository.
                    </td>
                  </tr>
                ) : (
                  data.map((u: staff) => (
                    <tr key={u.StaffID} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-gray-700">
                          {u.StaffID}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-bold text-black">{u.StaffName}</div>
                      </td>
                      <td className="px-8 py-5 font-medium text-gray-700">
                        {u.MobileNo || "—"}
                      </td>
                      <td className="px-8 py-5 font-medium text-gray-700 text-sm">
                        {u.EmailAddress}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <Link
                            href={`/staff/${u.StaffID}`}
                            title="View Details"
                            className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-gray-600 hover:text-indigo-400 group-hover:text-indigo-400 transition-all shadow-sm"
                          >
                            <Eye size={18} />
                          </Link>
                          {isAdminOrConvener && (
                            <>
                              <Link
                                href={`/staff/edit/${u.StaffID}`}
                                title="Edit Record"
                                className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-gray-600 hover:text-sky-500 group-hover:text-sky-500 transition-all shadow-sm"
                              >
                                <FileEdit size={18} />
                              </Link>
                              <DeleteUserBtn id={u.StaffID} deleteFn={deleteStaff} />
                            </>
                          )}
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

export default Staff;
