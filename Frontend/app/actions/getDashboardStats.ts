"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function getDashboardStats(weekOffset: number = 0) {
    const user = await getCurrentUser();

    // Calculate Week Range
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday
    const offset = currentDay === 0 ? 6 : currentDay - 1; // days since Monday
    const monday = new Date(today);
    monday.setDate(monday.getDate() - offset + (weekOffset * 7));
    monday.setHours(0, 0, 0, 0);

    const nextMonday = new Date(monday);
    nextMonday.setDate(nextMonday.getDate() + 7);

    let meetingFilter: any = undefined;
    let staffProfile = null;

    let staffId = 0;

    if (user && (user.sys_role === 'meeting_convener' || user.role === 'meeting_convener')) {
        staffId = Number(user.StaffID);
        if (!isNaN(staffId) && staffId > 0) {
            meetingFilter = {
                OR: [
                    { CreatedBy: staffId },
                    {
                        meetingmember: {
                            some: { StaffID: staffId }
                        }
                    },
                    { CreatedBy: 0 },
                    { CreatedBy: null }
                ]
            };
        }
    } else if (user && (user.sys_role === 'staff' || user.role === 'staff')) {
        staffId = Number(user.StaffID);
        if (!isNaN(staffId) && staffId > 0) {
            meetingFilter = {
                OR: [
                    {
                        meetingmember: {
                            some: {
                                StaffID: staffId
                            }
                        }
                    },
                    { CreatedBy: 0 },
                    { CreatedBy: null }
                ]
            };
            staffProfile = await prisma.staff.findUnique({
                where: { StaffID: staffId }
            });
        }
    }

    const [totalStaff, totalMeetings, totalMembers, meetingsBase, myActionItems] = await Promise.all([
        prisma.staff.count(),
        prisma.meetings.count({ where: meetingFilter }),
        prisma.meetingmember.count(),
        prisma.meetings.findMany({
            where: {
                ...meetingFilter,
                MeetingDate: {
                    gte: monday,
                    lt: nextMonday
                },
            },
            orderBy: {
                MeetingDate: "asc",
            },
            include: {
                meetingmember: {
                    select: {
                        StaffID: true,
                        IsPresent: true
                    }
                }
            }
        }),
        prisma.actionitem.findMany({
            where: {
                AssignedTo: staffId,
                Status: { not: 'Completed' }
            },
            take: 5,
            orderBy: { DueDate: 'asc' },
            include: { meetings: true }
        })
    ]);

    const meetingIds = meetingsBase.map((m: any) => m.MeetingID);

    const [recentAgendas, recentDecisions, myNotifications] = await Promise.all([
        prisma.meetingagenda.findMany({
            where: {
                IsCompleted: false,
                MeetingID: { in: meetingIds.length > 0 ? meetingIds : [-1] }
            },
            take: 5,
            orderBy: { OrderSeq: 'asc' }
        }),
        prisma.decision.findMany({
            where: {
                MeetingID: { in: meetingIds.length > 0 ? meetingIds : [-1] }
            },
            take: 3,
            orderBy: { Created: 'desc' }
        }),
        prisma.notification.findMany({
            where: {
                StaffID: staffId,
                IsRead: false
            },
            take: 5,
            orderBy: { Created: 'desc' }
        })
    ]);

    // Manually fetch meeting types for the retrieved meetings
    const typeIds = Array.from(new Set(meetingsBase.map((m) => m.MeetingTypeID)));
    const meetingTypes = await prisma.meetingtype.findMany({
        where: {
            MeetingTypeID: {
                in: typeIds.length > 0 ? typeIds : [-1],
            },
        },
    });

    const typeMap = new Map(meetingTypes.map((t) => [t.MeetingTypeID, t]));

    const upcomingMeetings = meetingsBase.map((meeting: any) => {
        let isAttended = false;
        if (staffId > 0) {
            isAttended = meeting.meetingmember?.some((m: any) => m.StaffID === staffId && m.IsPresent);
        } else {
            // If admin (staffId 0), check if anyone attended, or maybe just leave it based on meeting date?
            // "attended meeting"
            isAttended = meeting.meetingmember?.some((m: any) => m.IsPresent);
        }

        return {
            ...meeting,
            isAttended,
            meetingtype: typeMap.get(meeting.MeetingTypeID) || null,
        }
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
