"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

// Helper regex function to swap out PRO-X for real names globally in notifications
async function parseMessageForMeetingNames(message: string): Promise<string> {
    const match = message.match(/PRO-(\d+)/);
    if (!match) return message;

    const meetingID = Number(match[1]);
    const meeting = await prisma.meetings.findUnique({
        where: { MeetingID: meetingID },
        include: { meetingtype: true }
    });

    if (meeting?.meetingtype?.MeetingTypeName) {
        return message.replace(`PRO-${meetingID}`, meeting.meetingtype.MeetingTypeName);
    }

    return message;
}

export async function createNotification(staffID: number, message: string) {
    const parsedMessage = await parseMessageForMeetingNames(message);
    await prisma.notification.create({
        data: {
            StaffID: staffID,
            Message: parsedMessage,
        }
    });
}

export async function notifyAllStaff(message: string) {
    const allStaff = await prisma.staff.findMany();
    if (allStaff.length === 0) return;

    const parsedMessage = await parseMessageForMeetingNames(message);

    await prisma.notification.createMany({
        data: allStaff.map(s => ({
            StaffID: s.StaffID,
            Message: parsedMessage
        }))
    });
}

// Global broadcast to all invited members of a meeting
export async function notifyMeetingMembers(meetingID: number, message: string) {
    const members = await prisma.meetingmember.findMany({
        where: { MeetingID: meetingID }
    });

    if (members.length === 0) return;

    const parsedMessage = await parseMessageForMeetingNames(message);

    await prisma.notification.createMany({
        data: members.map(m => ({
            StaffID: m.StaffID,
            Message: parsedMessage
        }))
    });
}

// Actions exclusively called from the client
export async function getNotifications() {
    const session = await requireUser();
    if (!session.StaffID) return [];

    return await prisma.notification.findMany({
        where: { StaffID: session.StaffID },
        orderBy: { Created: 'desc' },
        take: 10
    });
}

export async function markNotificationAsRead(notificationID: number) {
    const session = await requireUser();
    if (!session.StaffID) throw new Error("Unauthorized");

    await prisma.notification.updateMany({
        where: {
            NotificationID: notificationID,
            StaffID: session.StaffID
        },
        data: { IsRead: true }
    });

    revalidatePath('/', 'layout');
    return { success: true };
}

export async function markAllNotificationsAsRead() {
    const session = await requireUser();
    if (!session.StaffID) throw new Error("Unauthorized");

    await prisma.notification.updateMany({
        where: { StaffID: session.StaffID, IsRead: false },
        data: { IsRead: true }
    });

    revalidatePath('/', 'layout');
    return { success: true };
}

export async function sendManualNotification(formData: FormData) {
    const session = await requireUser();
    if (session.role !== 'admin' && session.role !== 'meeting_convener') throw new Error("Unauthorized");

    const targetID = formData.get("TargetID")?.toString();
    const message = formData.get("Message")?.toString();

    if (!targetID || !message) throw new Error("Missing notification parameters");

    if (targetID === "ALL") {
        await notifyAllStaff(message);
    } else {
        await createNotification(Number(targetID), message);
    }

    revalidatePath('/', 'layout');
    redirect("/dashboard");
}
