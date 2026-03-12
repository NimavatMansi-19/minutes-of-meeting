"use server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function saveActionItem(formData: FormData) {
    const session = await requireUser();
    if (session.role !== 'admin' && session.role !== 'meeting_convener') {
        throw new Error("Unauthorized");
    }

    const actionItemId = formData.get("ActionItemID") as string | null;
    const meetingId = Number(formData.get("MeetingID"));
    const assignedTo = Number(formData.get("AssignedTo"));
    const title = formData.get("Title") as string;
    const dueDateStr = formData.get("DueDate") as string;
    const status = formData.get("Status") as string || "Pending";

    if (!title || !meetingId || !assignedTo) {
        throw new Error("Missing required fields");
    }

    const dueDate = dueDateStr ? new Date(dueDateStr) : null;

    if (actionItemId) {
        // Find existing to check if it was reassigned
        const existing = await prisma.actionitem.findUnique({ where: { ActionItemID: Number(actionItemId) } });

        await prisma.actionitem.update({
            where: { ActionItemID: Number(actionItemId) },
            data: {
                AssignedTo: assignedTo,
                Title: title,
                DueDate: dueDate,
                Status: status,
                Modified: new Date()
            }
        });

        if (existing && existing.AssignedTo !== assignedTo) {
            await prisma.notification.create({
                data: {
                    StaffID: assignedTo,
                    Message: `You have been reassigned a task: "${title}"`
                }
            });
        }
    } else {
        await prisma.actionitem.create({
            data: {
                MeetingID: meetingId,
                AssignedTo: assignedTo,
                Title: title,
                DueDate: dueDate,
                Status: status,
                CreatedBy: Number(session.user_id) || 0
            }
        });

        await prisma.notification.create({
            data: {
                StaffID: assignedTo,
                Message: `You have been assigned a new task: "${title}"`
            }
        });
    }

    revalidatePath(`/meetings/${meetingId}`);
    revalidatePath(`/actionitems`);
}
