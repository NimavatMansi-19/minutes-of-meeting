"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { notifyMeetingMembers } from "./notifications";

export async function toggleActionItemStatus(id: number, status: string) {
    const session = await requireUser();

    // Security: Only admins, conveners, or the assigned staff can toggle
    const item = await prisma.actionitem.findUnique({ where: { ActionItemID: id } });
    if (!item) throw new Error("Item not found");

    if (session.role !== 'admin' && session.role !== 'meeting_convener' && item.AssignedTo !== session.StaffID) {
        throw new Error("Unauthorized to modify this task");
    }

    await prisma.actionitem.update({
        where: { ActionItemID: id },
        data: { Status: status, Modified: new Date() }
    });

    await notifyMeetingMembers(item.MeetingID, `Action Item '${item.Title}' status changed to ${status} in Meeting PRO-${item.MeetingID}.`);

    revalidatePath("/actionitems");
}
