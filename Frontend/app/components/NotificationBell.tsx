"use client";

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, CheckCircle2 } from 'lucide-react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../actions/notifications';

interface NotificationType {
    NotificationID: number;
    StaffID: number;
    Message: string;
    IsRead: boolean;
    Created: Date | null;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (e) {
            console.error("Failed to load notifications", e);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchNotifications();

        // Simple polling every 30 seconds to simulate real-time
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.IsRead).length;

    const handleMarkAsRead = async (id: number) => {
        setLoading(true);
        await markNotificationAsRead(id);
        await fetchNotifications();
        setLoading(false);
    };

    const handleMarkAllAsRead = async () => {
        setLoading(true);
        await markAllNotificationsAsRead();
        await fetchNotifications();
        setLoading(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg text-gray-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden outline-none origin-top-right animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-gray-900 tracking-tight">Notifications</h3>
                                <p className="text-xs font-medium text-gray-500 mt-0.5">You have {unreadCount} unread alerts</p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={loading}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50 flex items-center gap-1 bg-indigo-50 px-2.5 py-1.5 rounded-lg"
                                >
                                    <CheckCircle2 size={12} />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[350px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-10 text-center flex flex-col items-center">
                                    <Bell size={24} className="text-slate-300 mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">All caught up!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.NotificationID}
                                            className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 ${!notification.IsRead ? 'bg-indigo-50/30' : ''}`}
                                        >
                                            <div className="mt-0.5 relative shrink-0">
                                                {!notification.IsRead && (
                                                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white shadow-sm"></span>
                                                )}
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex flex-col items-center justify-center text-slate-500 border border-slate-200">
                                                    <Bell size={14} />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notification.IsRead ? 'font-bold text-indigo-900' : 'font-medium text-gray-700'} leading-snug`}>
                                                    {notification.Message}
                                                </p>
                                                {notification.Created && (
                                                    <p className="mt-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-400">
                                                        {new Date(notification.Created).toLocaleString(undefined, {
                                                            month: 'short', day: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                            {!notification.IsRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.NotificationID)}
                                                    disabled={loading}
                                                    className="shrink-0 p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200 h-fit"
                                                    title="Mark as read"
                                                >
                                                    <Check size={16} strokeWidth={3} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">System Notifications</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
