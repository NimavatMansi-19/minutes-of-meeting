"use server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function deleteActionItem(actionItemId: number, meetingId: number) {
    const session = await requireUser();
    if (session.role !== 'admin' && session.role !== 'meeting_convener') {
        throw new Error("Unauthorized");
    }

    await prisma.actionitem.delete({
        where: { ActionItemID: actionItemId }
    });

    revalidatePath(`/meetings/${meetingId}`);
    revalidatePath(`/actionitems`);
}
