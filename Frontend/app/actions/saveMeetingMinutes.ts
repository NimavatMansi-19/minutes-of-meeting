"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { notifyMeetingMembers } from "./notifications";

export async function saveMeetingMinute(formData: FormData) {
    const session = await requireUser();

    // Authorization check
    if (session.role !== 'admin' && session.role !== 'meeting_convener') {
        throw new Error("Unauthorized access. Admin or Convener rights required.");
    }

    const meetingID = formData.get("MeetingID")?.toString();
    const notes = formData.get("Notes")?.toString();

    if (!meetingID || !notes) {
        throw new Error("Meeting ID and Notes are required.");
    }

    // Try to find if minute already exists
    const existingMinute = await prisma.meetingminutes.findFirst({
        where: { MeetingID: Number(meetingID) }
    });

    if (existingMinute) {
        // Update existing minute
        await prisma.meetingminutes.update({
            where: { MeetingMinuteID: existingMinute.MeetingMinuteID },
            data: {
                Notes: notes,
                Modified: new Date(),
            }
        });
    } else {
        // Create new minute
        await prisma.meetingminutes.create({
            data: {
                MeetingID: Number(meetingID),
                Notes: notes,
                CreatedBy: session.StaffID || 0,
            }
        });
    }

    // Always create a history log
    await prisma.minuteshistory.create({
        data: {
            MeetingID: Number(meetingID),
            Content: notes,
            EditedBy: session.StaffID || 0,
        }
    });

    await notifyMeetingMembers(Number(meetingID), `Minutes have been published for Meeting PRO-${meetingID}.`);

    revalidatePath(`/meetings/${meetingID}`);
    return { success: true };
}
