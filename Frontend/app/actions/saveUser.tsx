"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

async function saveUser(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'admin' && user.role !== 'meeting_convener')) {
    throw new Error("Permission denied: Only Admins can add staff.");
  }

  const StaffName = formData.get("staffname") as string;
  const EmailAddress = formData.get("email") as string;
  const MobileNo = formData.get("Mobile") as string;
  const Remarks = formData.get("remark") as string;

  const data = {
    StaffName,
    EmailAddress,
    MobileNo,
    Remarks,
    // Created and Modified will auto-default to now()
  };

  await prisma.staff.create({ data });
  revalidatePath("/staff");
  redirect("/staff");
}

export { saveUser };