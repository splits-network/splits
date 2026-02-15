"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

const C = { coral: "#FF6B6B", teal: "#4ECDC4", yellow: "#FFE66D", purple: "#A78BFA", dark: "#1A1A2E", cream: "#F5F0EB", white: "#FFFFFF" };

interface Notification {
    id: number;
    type: "application" | "message" | "placement" | "system" | "review";
    title: string;
    description: string;
    time: string;
    read: boolean;
    group: "today" | "yesterday" | "week";
}

const TYPE_META: Record<string, { icon: string; color: string; label: string }> = {
    application: { icon: "fa-duotone fa-regular fa-file-circle-plus", color: C.coral, label: "Application" },
    message: { icon: "fa-duotone fa-regular fa-comment", color: C.teal, label: "Message" },
    placement: { icon: "fa-duotone fa-regular fa-trophy", color: C.yellow, label: "Placement" },
    system: { icon: "fa-duotone fa-regular fa-gear", color: C.purple, label: "System" },
    review: { icon: "fa-duotone fa-regular fa-star", color: C.coral, label: "Review" },
};

const INITIAL_NOTIFICATIONS: Notification[] = [
    { id: 1, type: "application", title: "New application received", description: "Priya Sharma applied for Senior Frontend Engineer at TechCorp", time: "10 minutes ago", read: false, group: "today" },
    { id: 2, type: "message", title: "New message from David Chen", description: "Hey Marcus, wanted to discuss the VP Engineering role split...", time: "32 minutes ago", read: false, group: "today" },
    { id: 3, type: "placement", title: "Placement confirmed!", description: "Sarah Johnson placed as DevOps Engineer at CloudScale. Fee: $25,000", time: "1 hour ago", read: false, group: "today" },
    { id: 4, type: "system", title: "Profile verification approved", description: "Your recruiter profile has been verified and badges updated.", time: "2 hours ago", read: true, group: "today" },
    { id: 5, type: "review", title: "New 5-star review", description: "Emily Chen left a review: 'Marcus was incredible throughout the process'", time: "3 hours ago", read: false, group: "today" },
    { id: 6, type: "application", title: "3 new applications", description: "Backend Engineer role at DataDriven received 3 new applications", time: "Yesterday at 4:30 PM", read: true, group: "yesterday" },
    { id: 7, type: "message", title: "Sarah Kim accepted split terms", description: "60/40 split-fee agreement for Product Manager at StartupXYZ", time: "Yesterday at 2:15 PM", read: true, group: "yesterday" },
    { id: 8, type: "system", title: "Subscription renewed", description: "Your Pro plan has been renewed. Next billing: March 1, 2026", time: "Yesterday at 9:00 AM", read: true, group: "yesterday" },
    { id: 9, type: "placement", title: "Interview scheduled", description: "James Wilson interview with DataDriven on Feb 18 at 2:00 PM", time: "Monday at 3:45 PM", read: true, group: "week" },
    { id: 10, type: "application", title: "Application deadline approaching", description: "UX Designer role at DesignCo closes in 2 days. 18 applications so far.", time: "Monday at 10:00 AM", read: true, group: "week" },
    { id: 11, type: "system", title: "New feature: AI candidate matching", description: "Try our new AI-powered candidate-job matching tool in the dashboard.", time: "Sunday at 8:00 AM", read: true, group: "week" },
];

const FILTER_TYPES = ["all", "application", "message", "placement", "system", "review"] as const;
type FilterType = typeof FILTER_TYPES[number];

export default function NotificationsSixPage() {
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [filter, setFilter] = useState<FilterType>("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
    const pageRef = useRef<HTMLDivElement>(null);

    const filtered = notifications.filter((n) => {
        if (filter !== "all" && n.type !== filter) return false;
        if (statusFilter === "unread" && n.read) return false;
        if (statusFilter === "read" && !n.read) return false;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;
    const groups = { today: filtered.filter(n => n.group === "today"), yesterday: filtered.filter(n => n.group === "yesterday"), week: filtered.filter(n => n.group === "week") };

    const toggleRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(pageRef.current.querySelectorAll(".notif-item"), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out", stagger: 0.04, delay: 0.3 });
    }, []);

    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const items = pageRef.current.querySelectorAll(".notif-item");
        gsap.fromTo(items, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out", stagger: 0.03 });
    }, [filter, statusFilter]);

    const renderGroup = (label: string, items: Notification[], color: string) => {
        if (items.length === 0) return null;
        return (
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-5" style={{ backgroundColor: color }} />
                    <span className="text-xs font-black uppercase tracking-[0.15em]" style={{ color: C.dark }}>{label}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 border-2" style={{ borderColor: color, color }}>
                        {items.length}
                    </span>
                </div>
                <div className="space-y-2">
                    {items.map((n) => {
                        const meta = TYPE_META[n.type];
                        return (
                            <div key={n.id} className="notif-item border-3 p-4 flex items-start gap-4 transition-all"
                                style={{
                                    borderColor: n.read ? "rgba(26,26,46,0.08)" : meta.color,
                                    backgroundColor: n.read ? "transparent" : "rgba(255,255,255,0.8)",
                                    opacity: n.read ? 0.7 : 1,
                                }}>
                                {/* Icon */}
                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
                                    style={{ backgroundColor: n.read ? C.cream : meta.color }}>
                                    <i className={`${meta.icon} text-sm`}
                                        style={{ color: n.read ? "rgba(26,26,46,0.4)" : (meta.color === C.yellow ? C.dark : C.white) }}></i>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />}
                                        <h4 className="text-sm font-bold truncate" style={{ color: C.dark }}>{n.title}</h4>
                                    </div>
                                    <p className="text-xs truncate" style={{ color: C.dark, opacity: 0.5 }}>{n.description}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.dark, opacity: 0.3 }}>{n.time}</span>
                                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase border" style={{ borderColor: meta.color, color: meta.color }}>{meta.label}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button onClick={() => toggleRead(n.id)} title={n.read ? "Mark unread" : "Mark read"}
                                        className="w-7 h-7 flex items-center justify-center border-2 transition-colors"
                                        style={{ borderColor: "rgba(26,26,46,0.1)", color: n.read ? "rgba(26,26,46,0.3)" : meta.color }}>
                                        <i className={`fa-${n.read ? "regular" : "solid"} fa-circle text-[8px]`}></i>
                                    </button>
                                    <button onClick={() => deleteNotification(n.id)} title="Delete"
                                        className="w-7 h-7 flex items-center justify-center border-2 transition-colors"
                                        style={{ borderColor: "rgba(26,26,46,0.1)", color: "rgba(26,26,46,0.3)" }}>
                                        <i className="fa-duotone fa-regular fa-trash text-[10px]"></i>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div ref={pageRef} className="min-h-screen" style={{ backgroundColor: C.cream }}>
            <div className="flex h-1.5">
                <div className="flex-1" style={{ backgroundColor: C.coral }} />
                <div className="flex-1" style={{ backgroundColor: C.teal }} />
                <div className="flex-1" style={{ backgroundColor: C.yellow }} />
                <div className="flex-1" style={{ backgroundColor: C.purple }} />
            </div>

            {/* Header */}
            <div style={{ backgroundColor: C.dark }}>
                <div className="container mx-auto px-4 py-10">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div>
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                style={{ backgroundColor: C.coral, color: C.white }}>
                                <i className="fa-duotone fa-regular fa-bell"></i>Notifications
                            </span>
                            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight" style={{ color: C.white }}>
                                Activity{" "}<span style={{ color: C.coral }}>Feed</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                                <span className="px-3 py-1 text-xs font-black uppercase"
                                    style={{ backgroundColor: C.coral, color: C.white }}>
                                    {unreadCount} unread
                                </span>
                            )}
                            <button onClick={markAllRead}
                                className="px-4 py-2 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                                style={{ borderColor: C.teal, color: C.teal }}>
                                <i className="fa-duotone fa-regular fa-check-double mr-1"></i>Mark All Read
                            </button>
                            <a href="#" className="px-4 py-2 text-xs font-black uppercase tracking-wider border-3"
                                style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)" }}>
                                <i className="fa-duotone fa-regular fa-gear mr-1"></i>Settings
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Filters */}
                    <div className="border-4 p-4 mb-6 flex flex-wrap items-center gap-3" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                        <span className="text-xs font-black uppercase tracking-wider" style={{ color: C.dark, opacity: 0.4 }}>Type:</span>
                        <div className="flex flex-wrap gap-1">
                            {FILTER_TYPES.map((f) => {
                                const meta = f === "all" ? { color: C.dark, label: "All" } : TYPE_META[f];
                                return (
                                    <button key={f} onClick={() => setFilter(f)}
                                        className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-2 transition-all"
                                        style={{
                                            borderColor: filter === f ? meta.color : "rgba(26,26,46,0.1)",
                                            backgroundColor: filter === f ? meta.color : "transparent",
                                            color: filter === f ? (meta.color === C.yellow ? C.dark : C.white) : "rgba(26,26,46,0.5)",
                                        }}>
                                        {f === "all" ? "All" : meta.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="w-px h-6 mx-1" style={{ backgroundColor: "rgba(26,26,46,0.1)" }} />

                        <span className="text-xs font-black uppercase tracking-wider" style={{ color: C.dark, opacity: 0.4 }}>Status:</span>
                        <div className="flex gap-1">
                            {(["all", "unread", "read"] as const).map((s) => (
                                <button key={s} onClick={() => setStatusFilter(s)}
                                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-2 transition-all"
                                    style={{
                                        borderColor: statusFilter === s ? C.coral : "rgba(26,26,46,0.1)",
                                        backgroundColor: statusFilter === s ? C.coral : "transparent",
                                        color: statusFilter === s ? C.white : "rgba(26,26,46,0.5)",
                                    }}>
                                    {s}
                                </button>
                            ))}
                        </div>

                        <span className="ml-auto text-xs font-bold" style={{ color: C.dark, opacity: 0.3 }}>
                            {filtered.length} notifications
                        </span>
                    </div>

                    {/* Notification Groups */}
                    {filtered.length === 0 ? (
                        <div className="border-4 p-12 text-center" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border-4" style={{ borderColor: C.teal }}>
                                <i className="fa-duotone fa-regular fa-bell-slash text-2xl" style={{ color: C.teal }}></i>
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-wide mb-2" style={{ color: C.dark }}>All Caught Up</h3>
                            <p className="text-sm" style={{ color: C.dark, opacity: 0.5 }}>No notifications match your current filters.</p>
                        </div>
                    ) : (
                        <>
                            {renderGroup("Today", groups.today, C.coral)}
                            {renderGroup("Yesterday", groups.yesterday, C.teal)}
                            {renderGroup("This Week", groups.week, C.purple)}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
