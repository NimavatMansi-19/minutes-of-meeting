"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

export default async function deleteMeetingType(id: number) {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'meeting_convener')) {
        throw new Error("Permission denied: Only Admins and Conveners can delete Meeting Types.");
    }

    await prisma.meetingtype.delete({
        where: {
            MeetingTypeID: id,
        },
    });
    revalidatePath("/meetingtype");
}
