'use server';
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function getDashboardStats(weekOffset: number = 0) {
    const user = await getCurrentUser();

    // Calculate week range (same as before)
    const today = new Date();
    const currentDay = today.getDay();
    const offset = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(today);
    monday.setDate(monday.getDate() - offset + (weekOffset * 7));
    monday.setHours(0, 0, 0, 0);
    const nextMonday = new Date(monday);
    nextMonday.setDate(nextMonday.getDate() + 7);

    let meetingFilter: any = undefined;
    let staffProfile = null;
    let staffId = 0;

    if (user && (user.sys_role === 'meeting_convener' || user.role === 'meeting_convener')) {
        staffId = Number(user.StaffID || 0);
        if (!isNaN(staffId) && staffId > 0) {
            meetingFilter = {
                OR: [
                    { CreatedBy: staffId },
                    { meetingmember: { some: { StaffID: staffId } } },
                    { CreatedBy: 0 },
                    { CreatedBy: null }
                ]
            };
        }
    } else if (user && (user.sys_role === 'staff' || user.role === 'staff')) {
        staffId = Number(user.StaffID || 0);
        if (!isNaN(staffId) && staffId > 0) {
            meetingFilter = {
                OR: [
                    { meetingmember: { some: { StaffID: staffId } } },
                    { CreatedBy: 0 },
                    { CreatedBy: null }
                ]
            };
            staffProfile = await prisma.staff.findUnique({ where: { StaffID: staffId } });
        }
    }

    // Ensure staffId is a valid number for queries below
    if (isNaN(staffId)) staffId = 0;

    // ⚠️ Run queries **sequentially** to avoid pool timeout
    const totalStaff = await prisma.staff.count();
    const totalMeetings = await prisma.meetings.count({ where: meetingFilter });
    const totalMembers = await prisma.meetingmember.count();

    const meetingsBase = await prisma.meetings.findMany({
        where: {
            ...meetingFilter,
            MeetingDate: { gte: monday, lt: nextMonday }
        },
        orderBy: { MeetingDate: "asc" },
        include: { meetingmember: { select: { StaffID: true, IsPresent: true } } }
    });

    const myActionItems = staffId > 0 ? await prisma.actionitem.findMany({
        where: { AssignedTo: staffId, Status: { not: 'Completed' } },
        take: 5,
        orderBy: { DueDate: 'asc' },
        include: { meetings: true }
    }) : [];

    const meetingIds = meetingsBase.map(m => m.MeetingID);

    const recentAgendas = await prisma.meetingagenda.findMany({
        where: { IsCompleted: false, MeetingID: meetingIds.length > 0 ? { in: meetingIds } : -1 },
        take: 5,
        orderBy: { OrderSeq: 'asc' }
    });

    const recentDecisions = await prisma.decision.findMany({
        where: { MeetingID: meetingIds.length > 0 ? { in: meetingIds } : -1 },
        take: 3,
        orderBy: { Created: 'desc' }
    });

    const myNotifications = staffId > 0 ? await prisma.notification.findMany({
        where: { StaffID: staffId, IsRead: false },
        take: 5,
        orderBy: { Created: 'desc' }
    }) : [];

    const typeIds = Array.from(new Set(meetingsBase.map(m => m.MeetingTypeID)));
    const meetingTypes = await prisma.meetingtype.findMany({
        where: { MeetingTypeID: typeIds.length > 0 ? { in: typeIds } : -1 }
    });
    const typeMap = new Map(meetingTypes.map(t => [t.MeetingTypeID, t]));

    const upcomingMeetings = meetingsBase.map(meeting => {
        const isAttended = staffId > 0
            ? meeting.meetingmember?.some(m => m.StaffID === staffId && m.IsPresent)
            : meeting.meetingmember?.some(m => m.IsPresent);
        return { ...meeting, isAttended, meetingtype: typeMap.get(meeting.MeetingTypeID) || null };
    });

    return {
        totalStaff,
        totalMeetings,
        totalMembers,
        upcomingMeetings,
        staffProfile,
        myActionItems,
        recentAgendas,
        recentDecisions,
        myNotifications
    };
}