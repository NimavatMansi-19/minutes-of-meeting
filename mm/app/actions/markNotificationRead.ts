"use server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function markNotificationRead(notificationId: number) {
    const session = await requireUser();
    const staffId = Number(session.StaffID);

    if (isNaN(staffId) || staffId <= 0) {
        throw new Error("Unauthorized");
    }

    await prisma.notification.update({
        where: {
            NotificationID: notificationId,
            StaffID: staffId
        },
        data: {
            IsRead: true
        }
    });

    revalidatePath("/dashboard");
}
