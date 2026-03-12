import Link from "next/link";
import { getDashboardStats } from "@/app/actions/getDashboardStats";
import { markNotificationRead } from "@/app/actions/markNotificationRead";
import { requireUser } from "@/lib/session";
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Paperclip,
    CheckSquare,
    Square,
    Settings,
    Bell,
    User,
    Command,
    Calendar,
    Users,
    UserPlus,
    BarChart3,
    ArrowRight,
    Clock,
    FileText,
    CheckCircle,
    ListTodo,
    Check
} from "lucide-react";

export default async function DashboardPage(props: { searchParams?: { week?: string } }) {
    // Next.js searchParams handling (safe for older and newer versions)
    const searchParams = await Promise.resolve(props.searchParams || {});
    const rawWeek = searchParams.week;
    const weekOffset = rawWeek ? parseInt(rawWeek as string, 10) : 0;
    const finalWeekOffset = isNaN(weekOffset) ? 0 : weekOffset;

    const stats = await getDashboardStats(finalWeekOffset);
    const session = await requireUser();
    const role = session.role;
    const isAdminOrConvener = role === 'admin' || role === 'meeting_convener';

    const upcomingCount = stats.upcomingMeetings.length;
    let firstEventTime = "later";
    if (upcomingCount > 0) {
        firstEventTime = new Date(stats.upcomingMeetings[0].MeetingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const name = stats.staffProfile?.StaffName || (role || 'staff').replace('_', ' ');
    const firstName = name.split(' ')[0];

    // Professional Colors mapping
    const baseColors = [
        "bg-blue-50 text-blue-800 border-l-4 border-blue-500",      // Corporate Blue
        "bg-slate-100 text-slate-800 border-l-4 border-slate-600",  // Slate Gray
        "bg-indigo-50 text-indigo-800 border-l-4 border-indigo-500", // Indigo
        "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500", // Green
        "bg-gray-50 text-gray-800 border-l-4 border-gray-500",      // Gray
    ];

    // Calculate Week Days
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday
    const offset = currentDay === 0 ? 6 : currentDay - 1; // days since Monday
    const monday = new Date(today);
    monday.setDate(monday.getDate() - offset + (finalWeekOffset * 7));

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(monday);
        d.setDate(d.getDate() + i);
        return {
            name: d.toLocaleDateString('en-US', { weekday: 'short' }),
            date: d.getDate(),
            fullDate: d.toDateString(),
            isToday: d.toDateString() === today.toDateString()
        };
    });

    return (
        <div className="min-h-[100dvh] bg-slate-50 p-2 sm:p-4 lg:p-8 flex items-center justify-center font-sans">
            {/* Main Application Window */}
            <div className="bg-white max-w-[1500px] w-full mx-auto rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col xl:flex-row min-h-[90vh] border border-slate-100">

                {/* LEFT CONTENT AREA */}
                <div className="flex-1 p-6 sm:p-8 xl:p-12 border-b xl:border-b-0 xl:border-r border-gray-100 flex flex-col relative overflow-x-hidden">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 xl:mb-12 relative z-20">
                        <div className="relative z-20">
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight mb-2 sm:mb-4 flex items-center gap-3">
                                Good morning, {firstName}
                            </h1>
                            <p className="text-slate-500 text-base sm:text-lg font-medium">
                                You have {upcomingCount} events upcoming, {upcomingCount > 0 ? `next is at ${firstEventTime}` : 'have a great day ahead!'}
                            </p>
                        </div>
                    </div>

                    {/* Navigation / Calendar Controls */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="flex gap-1">
                                <Link href={`/dashboard?week=${finalWeekOffset - 1}`} scroll={false} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 bg-white shadow-sm transition-all">
                                    <ChevronLeft size={18} />
                                </Link>
                                <Link href={`/dashboard?week=${finalWeekOffset + 1}`} scroll={false} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 bg-white shadow-sm transition-all">
                                    <ChevronRight size={18} />
                                </Link>
                            </div>
                            <span className="text-[#374151] font-bold text-base sm:text-lg lg:text-xl">
                                {finalWeekOffset === 0 ? "This Week" : finalWeekOffset === 1 ? "Next Week" : finalWeekOffset === -1 ? "Last Week" : `Week ${finalWeekOffset > 0 ? '+' : ''}${finalWeekOffset}`}
                            </span>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            {finalWeekOffset !== 0 && (
                                <Link href="/dashboard" scroll={false} className="px-4 py-2 sm:px-5 sm:py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-all w-full sm:w-auto border border-teal-100">
                                    Today
                                </Link>
                            )}
                            <button className="px-4 py-2 sm:px-5 sm:py-2.5 flex items-center justify-between sm:justify-center gap-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all w-full sm:w-auto">
                                Week View <ChevronDown size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Weekly Calendar Grid (Responsive) */}
                    <div className="flex-1 bg-white relative rounded-2xl border border-gray-100 p-2 sm:p-4 shadow-sm overflow-hidden flex flex-col">
                        <div className="w-full overflow-x-auto pb-2 flex-1 scrollbar-hide">
                            <div className="min-w-[700px] h-full flex flex-col">
                                {/* Days Header */}
                                <div className="grid grid-cols-7 border-b border-gray-100 pb-3">
                                    {weekDays.map((day, idx) => (
                                        <div key={idx} className="text-center flex flex-col items-center justify-center">
                                            <p className="text-[11px] sm:text-xs text-gray-400 font-extrabold uppercase tracking-wider mb-1sm:mb-2">{day.name}</p>
                                            <p className={`text-sm sm:text-lg font-bold inline-flex w-7 h-7 sm:w-10 sm:h-10 items-center justify-center rounded-full transition-colors ${day.isToday ? 'bg-[#1F2937] text-white shadow-md' : 'text-gray-800'}`}>
                                                {day.date}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Meetings Grid Area */}
                                <div className="grid grid-cols-7 flex-1 min-h-[400px] pt-4 relative">
                                    {/* Horizontal lines for styling */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-4 -z-10">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-full border-b border-slate-100"></div>
                                        ))}
                                    </div>

                                    {weekDays.map((day, idx) => {
                                        const dayMeetings = stats.upcomingMeetings.filter(m => new Date(m.MeetingDate).toDateString() === day.fullDate);
                                        return (
                                            <div key={idx} className="border-r border-gray-50 last:border-r-0 relative flex flex-col gap-3 px-1.5 sm:px-2 pt-2">
                                                {dayMeetings.map((m: any, i) => {
                                                    const time = new Date(m.MeetingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                                    // Set colors conditionally based on status
                                                    let colorClass = "bg-blue-50 text-blue-800 border-l-4 border-blue-500 shadow-sm"; // Upcoming (Blue)

                                                    if (m.IsCancelled) {
                                                        colorClass = "bg-red-50 text-red-800 border-l-4 border-red-500 shadow-sm"; // Cancelled (Red)
                                                    } else if (m.isAttended) {
                                                        colorClass = "bg-slate-100 text-slate-700 border-l-4 border-slate-400 shadow-sm"; // Attended (Grey)
                                                    }

                                                    return (
                                                        <Link href={`/meetings/${m.MeetingID}`} key={m.MeetingID} className={`group block p-3 rounded-lg shadow-sm transition-all hover:translate-x-1 hover:shadow-md cursor-pointer ${colorClass}`}>
                                                            <div className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1 leading-tight flex items-center gap-1">
                                                                <Clock size={10} /> {time}
                                                            </div>
                                                            <p className="font-semibold text-xs sm:text-sm leading-snug line-clamp-3">
                                                                {m.meetingtype?.MeetingTypeName || "General Meeting"}
                                                            </p>
                                                            {/* User bubbles */}
                                                            <div className="mt-3 flex -space-x-1.5 opacity-90">
                                                                <div className="w-5 h-5 rounded-full bg-white border border-slate-200 relative z-30 flex items-center justify-center font-bold text-[8px] text-slate-600 shadow-sm">A</div>
                                                                <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-200 relative z-20 flex items-center justify-center font-bold text-[8px] text-slate-600 shadow-sm">B</div>
                                                            </div>
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR PANEL */}
                <div className="w-full xl:w-[420px] bg-white border-l border-gray-100 flex flex-col p-6 sm:p-8 xl:py-12 xl:px-10 relative z-30 overflow-y-auto">

                    {/* Top right profile / controls */}
                    <div className="hidden xl:flex justify-end items-center gap-4 mb-10">
                        <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            {name} <ChevronDown size={14} className="text-gray-400" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#E5EBE9] text-[#236B69] flex items-center justify-center font-bold overflow-hidden shadow-inner border border-[#C0E0DE]">
                            {name.charAt(0).toUpperCase()}
                        </div>
                        <Link href="/notifications" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-black transition-all">
                            <Bell size={18} />
                        </Link>
                    </div>

                    <div className="flex-1 space-y-8 pb-10">
                        {/* Highlights Unread Notifications strictly at the top */}
                        {stats.myNotifications?.length > 0 && (
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-sm mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Bell size={18} className="text-rose-600 animate-pulse" />
                                    <h3 className="text-sm font-black text-rose-800 uppercase tracking-widest">New Notifications</h3>
                                </div>
                                <div className="space-y-3">
                                    {stats.myNotifications.map((notif: any) => (
                                        <div key={notif.NotificationID} className="flex items-start justify-between gap-3 bg-white p-3 rounded-xl border border-rose-100 shadow-sm">
                                            <p className="text-sm font-bold text-slate-800 leading-snug pt-1">{notif.Message}</p>
                                            <form action={async () => {
                                                "use server";
                                                await markNotificationRead(notif.NotificationID);
                                            }}>
                                                <button type="submit" className="text-rose-500 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg transition-colors border border-rose-100" title="Mark as Read">
                                                    <Check size={16} strokeWidth={3} />
                                                </button>
                                            </form>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dynamic Content based on role */}
                        {isAdminOrConvener ? (
                            <>
                                <div className="border-b border-gray-100 pb-5">
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">Organization Overview</h2>

                                    <div className="mt-4 flex gap-2">
                                        <div className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-[#1F2937] text-white text-sm font-bold shadow-md">
                                            <span>Quick Summary</span>
                                            <BarChart3 size={16} className="opacity-70" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between group p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-[#FFD1C1]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#FFF5F0] text-[#FF9066]">
                                                <Users size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">Total Personnel</p>
                                                <p className="text-xs font-semibold text-gray-400">{stats.totalStaff} enrolled members</p>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900">{stats.totalStaff}</h3>
                                    </div>

                                    <div className="flex items-center justify-between group p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-[#C0E0DE]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#F0F7F6] text-[#45B2A6]">
                                                <Calendar size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">Total Meetings</p>
                                                <p className="text-xs font-semibold text-gray-400">Scheduled so far</p>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900">{stats.totalMeetings}</h3>
                                    </div>

                                    <div className="flex items-center justify-between group p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-blue-200">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                                                <UserPlus size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">Active Members</p>
                                                <p className="text-xs font-semibold text-gray-400">Meeting participants</p>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900">{stats.totalMembers}</h3>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2 mb-4">
                                        <Command size={14} /> Quick Actions
                                    </p>
                                    <div className="space-y-3">
                                        <Link href="/meetings/add" className="w-full flex justify-between items-center p-4 rounded-xl border border-gray-200 hover:border-[#1F2937] hover:shadow-md group transition-all text-sm font-bold text-gray-800">
                                            <span className="flex items-center gap-3"><Calendar size={18} className="text-[#45B2A6] group-hover:scale-110 transition-transform" /> Schedule Meeting</span>
                                            <ArrowRight size={16} className="text-gray-300 group-hover:text-black transition-colors" />
                                        </Link>
                                        <Link href="/staff/add" className="w-full flex justify-between items-center p-4 rounded-xl border border-gray-200 hover:border-[#1F2937] hover:shadow-md group transition-all text-sm font-bold text-gray-800">
                                            <span className="flex items-center gap-3"><UserPlus size={18} className="text-[#FF9066] group-hover:scale-110 transition-transform" /> Add New Staff</span>
                                            <ArrowRight size={16} className="text-gray-300 group-hover:text-black transition-colors" />
                                        </Link>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="border-b border-gray-100 pb-5">
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">Meeting Overview</h2>

                                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                        <div className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-[#1F2937] text-white text-sm font-bold shadow-md">
                                            <span>To-do List</span>
                                            <Paperclip size={16} className="opacity-70" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {/* Action Items */}
                                    {stats.myActionItems?.length > 0 && stats.myActionItems.map((item: any) => (
                                        <div key={`action-${item.ActionItemID}`} className="flex gap-4 items-start group">
                                            <div className="mt-1">
                                                {item.Status === 'Completed' ? (
                                                    <CheckSquare size={20} className="text-[#FA8072] fill-[#FA8072]/20" />
                                                ) : (
                                                    <Square size={20} className="text-gray-300 group-hover:text-[#45B2A6] transition-colors" />
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-base font-bold ${item.Status === 'Completed' ? 'text-gray-500 line-through' : 'text-[#1F2937]'}`}>
                                                    {item.Title}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-400 mt-1 flex items-center gap-1">
                                                    <ListTodo size={14} /> Action Item
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Agendas */}
                                    {stats.recentAgendas?.length > 0 && stats.recentAgendas.map((agenda: any) => (
                                        <div key={`agenda-${agenda.AgendaID}`} className="flex gap-4 items-start group">
                                            <div className="mt-1">
                                                <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                                                    <FileText size={14} />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-[#1F2937]">{agenda.Title}</p>
                                                <p className="text-sm font-semibold text-gray-500 mt-1 flex items-center gap-1">
                                                    Pending Agenda
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Decisions */}
                                    {stats.recentDecisions?.length > 0 && stats.recentDecisions.map((decision: any) => (
                                        <div key={`decision-${decision.DecisionID}`} className="flex gap-4 items-start group">
                                            <div className="mt-1">
                                                <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#F0F7F6] text-[#45B2A6]">
                                                    <CheckCircle size={14} />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-[#1F2937]">{decision.Title}</p>
                                                <p className="text-sm font-semibold text-gray-500 mt-1 flex items-center gap-1">
                                                    Recent Decision
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {(!stats.myActionItems?.length && !stats.recentAgendas?.length && !stats.recentDecisions?.length) && (
                                        <div className="text-center py-8">
                                            <p className="text-gray-400 font-semibold text-sm">No tasks or items found.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-gray-100 mt-8">
                                    <p className="text-xs font-black uppercase tracking-wider flex items-center gap-2 mb-4 text-gray-400">
                                        <Paperclip size={14} /> Attached files
                                    </p>
                                    <div className="flex items-center gap-4 p-3.5 border border-gray-200 rounded-2xl hover:border-orange-300 hover:shadow-md transition-all cursor-pointer bg-white">
                                        <div className="w-12 h-12 rounded-xl bg-[#FFF5F0] text-[#FF9066] flex items-center justify-center font-black text-sm">
                                            PDF
                                        </div>
                                        <div>
                                            <p className="text-sm font-extrabold text-[#1F2937]">new_logo_v2.pdf</p>
                                            <p className="text-xs font-bold text-gray-400 mt-1">3 MB doc</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}
