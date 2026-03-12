"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

export default async function deleteStaff(StaffID: number) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'admin' && user.role !== 'meeting_convener')) {
    throw new Error("Permission denied: Only Admins can delete staff.");
  }

  await prisma.staff.delete({ where: { StaffID } });
  revalidatePath("/staff");
}