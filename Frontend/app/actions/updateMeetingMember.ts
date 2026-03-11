"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { createNotification } from "./notifications";

export async function updateMeetingMember(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const MeetingMemberID = formData.get("MeetingMemberID");
    const MeetingID = formData.get("MeetingID");
    const StaffID = formData.get("StaffID");
    const Remarks = formData.get("Remarks");
    const IsPresent = formData.get("IsPresent") === "on";

    const id = Number(MeetingMemberID);
    const targetMeetingId = Number(MeetingID);

    const isAdmin = user.role === 'admin';
    const isConvener = user.role === 'meeting_convener';

    if (!isAdmin && !isConvener) {
        redirect("/unauthorized");
    }

    const currentMember = await prisma.meetingmember.findUnique({ where: { MeetingMemberID: id } });
    if (!currentMember) throw new Error("Member not found");

    const sourceMeeting = await prisma.meetings.findUnique({ where: { MeetingID: currentMember.MeetingID } });
    const targetMeeting = await prisma.meetings.findUnique({ where: { MeetingID: targetMeetingId } });

    if (!sourceMeeting || !targetMeeting) throw new Error("Meeting not found");

    if (isConvener) {
        if (sourceMeeting.CreatedBy !== user.StaffID || targetMeeting.CreatedBy !== user.StaffID) {
            redirect("/unauthorized");
        }
    }

    await prisma.meetingmember.update({
        where: {
            MeetingMemberID: id,
        },
        data: {
            MeetingID: targetMeetingId,
            StaffID: Number(StaffID),
            Remarks: Remarks as string,
            IsPresent: IsPresent,
        },
    });

    await createNotification(Number(StaffID), `Your assigned meeting details were updated for Meeting PRO-${targetMeetingId}.`);

    redirect("/meetingmember");
}
