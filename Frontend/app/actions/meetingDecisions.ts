"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { notifyMeetingMembers } from "./notifications";

export async function addDecision(formData: FormData) {
    const session = await requireUser();
    if (session.role !== 'admin' && session.role !== 'meeting_convener') {
        throw new Error("Unauthorized to add decisions");
    }

    const meetingID = Number(formData.get("MeetingID"));
    const title = formData.get("Title") as string;
    const description = formData.get("Description") as string | null;

    if (!title) throw new Error("Title is required");

    await prisma.decision.create({
        data: {
            MeetingID: meetingID,
            Title: title,
            Description: description,
        }
    });

    await notifyMeetingMembers(meetingID, `A new decision '${title}' was recorded for Meeting PRO-${meetingID}.`);

    revalidatePath(`/meetings/${meetingID}`);
}

export async function updateDecision(formData: FormData) {
    const session = await requireUser();
    if (session.role !== 'admin' && session.role !== 'meeting_convener') {
        throw new Error("Unauthorized to update decisions");
    }

    const decisionID = Number(formData.get("DecisionID"));
    const title = formData.get("Title") as string;
    const description = formData.get("Description") as string | null;

    if (!title) throw new Error("Title is required");

    const decision = await prisma.decision.findUnique({ where: { DecisionID: decisionID } });
    if (!decision) throw new Error("Decision not found");

    await prisma.decision.update({
        where: { DecisionID: decisionID },
        data: {
            Title: title,
            Description: description,
            Modified: new Date()
        }
    });

    await notifyMeetingMembers(decision.MeetingID, `Decision '${title}' was updated in Meeting PRO-${decision.MeetingID}.`);

    revalidatePath(`/meetings/${decision.MeetingID}`);
}

export async function deleteDecision(id: number) {
    const session = await requireUser();
    if (session.role !== 'admin' && session.role !== 'meeting_convener') {
        throw new Error("Unauthorized");
    }

    const decision = await prisma.decision.findUnique({ where: { DecisionID: id } });
    if (!decision) throw new Error("Decision not found");

    await prisma.decision.delete({ where: { DecisionID: id } });

    await notifyMeetingMembers(decision.MeetingID, `A decision was removed from Meeting PRO-${decision.MeetingID}.`);
    revalidatePath(`/meetings/${decision.MeetingID}`);
}

export async function toggleDecisionStatus(id: number, status: string) {
    const session = await requireUser();
    if (session.role !== 'admin' && session.role !== 'meeting_convener') {
        throw new Error("Unauthorized");
    }

    const decision = await prisma.decision.findUnique({ where: { DecisionID: id } });
    if (!decision) throw new Error("Decision not found");

    await prisma.decision.update({
        where: { DecisionID: id },
        data: { Status: status, Modified: new Date() }
    });

    await notifyMeetingMembers(decision.MeetingID, `Decision status for '${decision.Title}' changed to ${status} in Meeting PRO-${decision.MeetingID}.`);

    revalidatePath(`/meetings/${decision.MeetingID}`);
}
