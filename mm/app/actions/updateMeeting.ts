"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { notifyMeetingMembers } from "./notifications";

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function updateMeeting(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const MeetingID = formData.get("MeetingID");
    const MeetingDate = formData.get("MeetingDate") as string;
    const MeetingTypeID = formData.get("MeetingTypeID");
    const MeetingDescription = formData.get("MeetingDescription") as string;
    const IsCancelled = formData.get("IsCancelled") === "on";

    const id = Number(MeetingID);

    // Permission Check
    const existingMeeting = await prisma.meetings.findUnique({
        where: { MeetingID: id },
    });

    if (!existingMeeting) throw new Error("Meeting not found");

    const isAdmin = user.role === 'admin';
    const isConvener = user.role === 'meeting_convener';
    const isOwner = existingMeeting.CreatedBy === user.StaffID;

    if (!isAdmin && (!isConvener || !isOwner)) {
        throw new Error("Permission denied: You can only edit meetings you created.");
    }

    // Process File Upload
    const documentFile = formData.get("DocumentPath") as File | null;
    let DocumentPath = existingMeeting.DocumentPath; // default to existing

    if (documentFile && documentFile.size > 0 && documentFile.name !== "undefined") {
        const bytes = await documentFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${documentFile.name.replace(/\s+/g, '_')}`;
        const uploadDir = join(process.cwd(), 'public', 'uploads');

        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        DocumentPath = `/uploads/${fileName}`;
    }

    const updateData: any = {
        MeetingDate: new Date(MeetingDate),
        MeetingTypeID: Number(MeetingTypeID),
        MeetingDescription: MeetingDescription,
        DocumentPath: DocumentPath || null,
        IsCancelled: IsCancelled,
        Modified: new Date(),
    };

    if (IsCancelled) {
        updateData.CancellationDateTime = new Date();
        const reason = formData.get("CancellationReason") as string;
        if (reason) updateData.CancellationReason = reason;
    }

    await prisma.meetings.update({
        where: {
            MeetingID: id,
        },
        data: updateData,
    });

    await notifyMeetingMembers(id, `Meeting PRO-${id} has been updated.`);

    redirect("/meetings");
}
