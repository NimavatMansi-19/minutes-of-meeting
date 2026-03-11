"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { notifyMeetingMembers } from "./notifications";

export async function addMeetingAgenda(formData: FormData) {
    const session = await requireUser();
    const role = session.role;
    if (role !== 'admin' && role !== 'meeting_convener') throw new Error("Unauthorized");

    const meetingID = Number(formData.get("MeetingID"));
    const title = formData.get("Title")?.toString();
    const description = formData.get("Description")?.toString() || null;

    if (!meetingID || !title) {
        throw new Error("MeetingID and Title are required");
    }

    const maxOrder = await prisma.meetingagenda.findFirst({
        where: { MeetingID: meetingID },
        orderBy: { OrderSeq: 'desc' }
    });
    const nextOrder = maxOrder ? maxOrder.OrderSeq + 1 : 1;

    await prisma.meetingagenda.create({
        data: {
            MeetingID: meetingID,
            Title: title,
            Description: description,
            OrderSeq: nextOrder,
            CreatedBy: session.StaffID || 0
        }
    });

    await notifyMeetingMembers(meetingID, `A new agenda item was added to Meeting PRO-${meetingID}.`);

    revalidatePath(`/meetings/${meetingID}`);
    return { success: true };
}

export async function toggleAgendaCompletion(agendaID: number, isCompleted: boolean) {
    const session = await requireUser();
    const role = session.role;
    if (role !== 'admin' && role !== 'meeting_convener') throw new Error("Unauthorized");

    const agenda = await prisma.meetingagenda.update({
        where: { AgendaID: agendaID },
        data: { IsCompleted: isCompleted, Modified: new Date() }
    });

    await notifyMeetingMembers(agenda.MeetingID, `Agenda item '${agenda.Title}' status was updated in Meeting PRO-${agenda.MeetingID}.`);

    revalidatePath(`/meetings/${agenda.MeetingID}`);
    return { success: true };
}

export async function updateAgenda(formData: FormData) {
    const session = await requireUser();
    const role = session.role;
    if (role !== 'admin' && role !== 'meeting_convener') throw new Error("Unauthorized");

    const agendaID = Number(formData.get("AgendaID"));
    const title = formData.get("Title")?.toString() || "Untitled";
    const description = formData.get("Description")?.toString() || null;

    const agenda = await prisma.meetingagenda.update({
        where: { AgendaID: agendaID },
        data: { Title: title, Description: description, Modified: new Date() }
    });

    await notifyMeetingMembers(agenda.MeetingID, `Agenda item '${agenda.Title}' was modified in Meeting PRO-${agenda.MeetingID}.`);

    revalidatePath(`/meetings/${agenda.MeetingID}`);
    return { success: true };
}

export async function deleteAgenda(agendaID: number) {
    const session = await requireUser();
    const role = session.role;
    if (role !== 'admin' && role !== 'meeting_convener') throw new Error("Unauthorized");

    const agenda = await prisma.meetingagenda.delete({
        where: { AgendaID: agendaID }
    });

    await notifyMeetingMembers(agenda.MeetingID, `An agenda item was removed from Meeting PRO-${agenda.MeetingID}.`);

    revalidatePath(`/meetings/${agenda.MeetingID}`);
    return { success: true };
}

export async function moveAgenda(agendaID: number, direction: 'up' | 'down') {
    const session = await requireUser();
    const role = session.role;
    if (role !== 'admin' && role !== 'meeting_convener') throw new Error("Unauthorized");

    const currentAgenda = await prisma.meetingagenda.findUnique({ where: { AgendaID: agendaID } });
    if (!currentAgenda) throw new Error("Agenda not found");

    const swapWith = await prisma.meetingagenda.findFirst({
        where: {
            MeetingID: currentAgenda.MeetingID,
            OrderSeq: direction === 'up' ? { lt: currentAgenda.OrderSeq } : { gt: currentAgenda.OrderSeq }
        },
        orderBy: { OrderSeq: direction === 'up' ? 'desc' : 'asc' }
    });

    if (!swapWith) return { success: true }; // Nothing to swap with

    // Swap orders
    await prisma.$transaction([
        prisma.meetingagenda.update({
            where: { AgendaID: currentAgenda.AgendaID },
            data: { OrderSeq: swapWith.OrderSeq }
        }),
        prisma.meetingagenda.update({
            where: { AgendaID: swapWith.AgendaID },
            data: { OrderSeq: currentAgenda.OrderSeq }
        })
    ]);

    await notifyMeetingMembers(currentAgenda.MeetingID, `Agenda item order was updated in Meeting PRO-${currentAgenda.MeetingID}.`);

    revalidatePath(`/meetings/${currentAgenda.MeetingID}`);
    return { success: true };
}
