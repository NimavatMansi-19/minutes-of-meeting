"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export async function saveMeetingType(formData: FormData) {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'meeting_convener')) {
        throw new Error("Permission denied: Only Admins and Conveners can add Meeting Types.");
    }

    const MeetingTypeName = formData.get("MeetingTypeName") as string;
    const Remarks = formData.get("Remarks") as string;

    await prisma.meetingtype.create({
        data: {
            MeetingTypeName: MeetingTypeName,
            Remarks: Remarks,
        },
    });

    redirect("/meetingtype");
}
