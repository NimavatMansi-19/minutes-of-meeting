"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

export default async function deleteUser(MeetingMemberID: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const member = await prisma.meetingmember.findUnique({ where: { MeetingMemberID } });
  if (!member) throw new Error("Member not found");

  const meeting = await prisma.meetings.findUnique({ where: { MeetingID: member.MeetingID } });
  if (!meeting) throw new Error("Meeting not found");

  const isAdmin = user.role === 'admin';
  const isConvener = user.role === 'meeting_convener';

  if (!isAdmin && !isConvener) {
    redirect("/unauthorized");
  }

  const isOwner = meeting.CreatedBy === user.StaffID;

  if (isConvener && !isOwner) {
    redirect("/unauthorized");
  }

  await prisma.meetingmember.delete({ where: { MeetingMemberID } });
  revalidatePath("/meetingmember");
}