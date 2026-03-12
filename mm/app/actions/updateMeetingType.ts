"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export async function updateMeetingType(formData: FormData) {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'meeting_convener')) {
        throw new Error("Permission denied: Only Admins and Conveners can update Meeting Types.");
    }

    const MeetingTypeID = formData.get("MeetingTypeID");
    const MeetingTypeName = formData.get("MeetingTypeName") as string;
    const Remarks = formData.get("Remarks") as string;

    await prisma.meetingtype.update({
        where: {
            MeetingTypeID: Number(MeetingTypeID),
        },
        data: {
            MeetingTypeName: MeetingTypeName,
            Remarks: Remarks,
        },
    });

    redirect("/meetingtype");
}
