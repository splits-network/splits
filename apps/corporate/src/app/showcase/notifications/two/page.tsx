"use client";

import { useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type NotifType = "message" | "application" | "placement" | "system";

interface Notification {
    id: number;
    type: NotifType;
    title: string;
    body: string;
    time: string;
    timeGroup: "Today" | "Yesterday" | "This Week" | "Earlier";
    read: boolean;
    icon: string;
    iconColor: string;
    actor?: string;
    actorInitials?: string;
}

/* ─── Data ───────────────────────────────────────────────────────────────────── */

const TYPE_META: Record<NotifType, { label: string; icon: string; color: string }> = {
    message: { label: "Messages", icon: "fa-duotone fa-regular fa-comment", color: "text-info" },
    application: { label: "Applications", icon: "fa-duotone fa-regular fa-file-lines", color: "text-warning" },
    placement: { label: "Placements", icon: "fa-duotone fa-regular fa-trophy", color: "text-success" },
    system: { label: "System", icon: "fa-duotone fa-regular fa-gear", color: "text-base-content/40" },
};

const notifications: Notification[] = [
    { id: 1, type: "message", title: "New message from Diana Foster", body: "Hey, I wanted to discuss the VP Engineering search. Are you available for a quick call this afternoon?", time: "12 min ago", timeGroup: "Today", read: false, icon: "fa-duotone fa-regular fa-comment", iconColor: "text-info", actor: "Diana Foster", actorInitials: "DF" },
    { id: 2, type: "application", title: "Application received", body: "Alex Kim applied for Staff Frontend Engineer at Meridian Corp. Review their profile and resume.", time: "45 min ago", timeGroup: "Today", read: false, icon: "fa-duotone fa-regular fa-file-lines", iconColor: "text-warning", actor: "Alex Kim", actorInitials: "AK" },
    { id: 3, type: "placement", title: "Placement confirmed", body: "Emily Zhang has been officially placed as DevOps Lead at CloudNine Infra. Split fee of 70/30 has been processed.", time: "2 hours ago", timeGroup: "Today", read: false, icon: "fa-duotone fa-regular fa-trophy", iconColor: "text-success" },
    { id: 4, type: "system", title: "Profile verification approved", body: "Your recruiter profile has been verified. You now have access to premium candidate matching features.", time: "3 hours ago", timeGroup: "Today", read: true, icon: "fa-duotone fa-regular fa-badge-check", iconColor: "text-secondary" },
    { id: 5, type: "message", title: "Marcus Webb replied to your thread", body: "Thanks for the candidate referral. I have scheduled an initial screen for next Tuesday and will keep you updated.", time: "Yesterday at 4:32 PM", timeGroup: "Yesterday", read: true, icon: "fa-duotone fa-regular fa-comment", iconColor: "text-info", actor: "Marcus Webb", actorInitials: "MW" },
    { id: 6, type: "application", title: "Interview scheduled", body: "Jordan Lee's interview for VP of Engineering at Quantum Financial has been scheduled for Feb 18 at 2:00 PM.", time: "Yesterday at 11:15 AM", timeGroup: "Yesterday", read: true, icon: "fa-duotone fa-regular fa-calendar-check", iconColor: "text-warning" },
    { id: 7, type: "placement", title: "Split fee payment received", body: "Payment of $12,250 has been deposited for the Ryan Chen placement at Orion Labs. View your earnings report.", time: "Yesterday at 9:00 AM", timeGroup: "Yesterday", read: true, icon: "fa-duotone fa-regular fa-money-check-dollar", iconColor: "text-success" },
    { id: 8, type: "system", title: "New feature: AI Matching", body: "We have launched AI-powered candidate matching. Enable it in your settings to get smart recommendations for open roles.", time: "Feb 10", timeGroup: "This Week", read: true, icon: "fa-duotone fa-regular fa-sparkles", iconColor: "text-secondary" },
    { id: 9, type: "application", title: "Candidate withdrew application", body: "Sofia Martinez withdrew her application for Growth Marketing Lead at Spark Commerce. Reason: Accepted another offer.", time: "Feb 9", timeGroup: "This Week", read: true, icon: "fa-duotone fa-regular fa-circle-xmark", iconColor: "text-error" },
    { id: 10, type: "message", title: "Lisa Park sent you a connection request", body: "Lisa Park wants to connect with you on the Splits Network. She specializes in Data and AI recruiting.", time: "Feb 8", timeGroup: "This Week", read: true, icon: "fa-duotone fa-regular fa-user-plus", iconColor: "text-info", actor: "Lisa Park", actorInitials: "LP" },
    { id: 11, type: "system", title: "Scheduled maintenance completed", body: "Platform maintenance has been completed successfully. All services are operating normally. Thank you for your patience.", time: "Feb 5", timeGroup: "Earlier", read: true, icon: "fa-duotone fa-regular fa-wrench", iconColor: "text-base-content/40" },
    { id: 12, type: "placement", title: "Offer extended to candidate", body: "Quantum Financial has extended an offer to Jordan Lee for the VP of Engineering position. Awaiting candidate response.", time: "Feb 4", timeGroup: "Earlier", read: true, icon: "fa-duotone fa-regular fa-paper-plane", iconColor: "text-success" },
];

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function NotificationsPageTwo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [items, setItems] = useState<Notification[]>(notifications);
    const [filter, setFilter] = useState<NotifType | "all">("all");
    const [readFilter, setReadFilter] = useState<"all" | "unread">("all");

    useGSAP(() => {
        gsap.from("[data-notif-hero]", { y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" });
        gsap.from("[data-notif-toolbar]", { y: 20, opacity: 0, duration: 0.6, delay: 0.3, ease: "power2.out" });
        gsap.from("[data-notif-item]", { y: 15, opacity: 0, duration: 0.4, stagger: 0.05, delay: 0.4, ease: "power2.out" });
    }, { scope: containerRef });

    const filtered = useMemo(() => {
        let result = items;
        if (filter !== "all") result = result.filter((n) => n.type === filter);
        if (readFilter === "unread") result = result.filter((n) => !n.read);
        return result;
    }, [items, filter, readFilter]);

    const grouped = useMemo(() => {
        const groups: { label: string; items: Notification[] }[] = [];
        const order = ["Today", "Yesterday", "This Week", "Earlier"];
        for (const label of order) {
            const groupItems = filtered.filter((n) => n.timeGroup === label);
            if (groupItems.length > 0) groups.push({ label, items: groupItems });
        }
        return groups;
    }, [filtered]);

    const unreadCount = items.filter((n) => !n.read).length;

    const markAsRead = (id: number) => {
        setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const archiveItem = (id: number) => {
        setItems((prev) => prev.filter((n) => n.id !== id));
    };

    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = { all: items.length };
        for (const n of items) counts[n.type] = (counts[n.type] || 0) + 1;
        return counts;
    }, [items]);

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100 overflow-hidden">
            {/* Hero */}
            <section className="bg-neutral text-neutral-content py-16 md:py-20">
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <p data-notif-hero className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-4">Notifications</p>
                    <h1 data-notif-hero className="text-4xl md:text-6xl font-bold tracking-tight leading-[0.95] mb-4">Notification<br />Center</h1>
                    <p data-notif-hero className="text-lg text-neutral-content/60 max-w-lg">Messages, application updates, placement alerts, and system notifications grouped by date with filtering and bulk actions.</p>
                </div>
            </section>

            {/* Content */}
            <section className="py-10 md:py-16">
                <div className="max-w-4xl mx-auto px-6 md:px-12">
                    {/* Toolbar */}
                    <div data-notif-toolbar className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2 flex-wrap">
                            {(["all", "message", "application", "placement", "system"] as const).map((key) => (
                                <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium border transition-all ${filter === key ? "border-base-content bg-base-content text-base-100" : "border-base-300 text-base-content/40 hover:text-base-content/60"}`}>
                                    {key === "all" ? "All" : TYPE_META[key].label}
                                    <span className="ml-1.5 opacity-50">{typeCounts[key] || 0}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setReadFilter(readFilter === "all" ? "unread" : "all")} className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium border transition-all ${readFilter === "unread" ? "border-secondary text-secondary" : "border-base-300 text-base-content/40"}`}>
                                {readFilter === "unread" ? "Showing Unread" : "Show Unread Only"}
                                {unreadCount > 0 && <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-secondary text-secondary-content text-[9px] font-bold">{unreadCount}</span>}
                            </button>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-[10px] uppercase tracking-wider text-secondary hover:underline font-medium">Mark all read</button>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    {grouped.length === 0 ? (
                        <div className="border border-base-300 py-20 text-center">
                            <i className="fa-duotone fa-regular fa-bell-slash text-3xl text-base-content/15 mb-4" />
                            <p className="text-sm font-medium text-base-content/40 mb-1">No notifications</p>
                            <p className="text-xs text-base-content/25">
                                {readFilter === "unread" ? "You have read all your notifications." : "Nothing here yet. Notifications will appear as activity happens."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {grouped.map((group) => (
                                <div key={group.label}>
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-3">{group.label}</h3>
                                    <div className="border border-base-300 divide-y divide-base-300">
                                        {group.items.map((n) => (
                                            <div key={n.id} data-notif-item className={`flex items-start gap-4 p-4 md:p-5 transition-colors group ${!n.read ? "bg-secondary/3" : "hover:bg-base-200/30"}`}>
                                                {/* Icon / Avatar */}
                                                <div className="shrink-0 relative">
                                                    {n.actorInitials ? (
                                                        <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary">{n.actorInitials}</div>
                                                    ) : (
                                                        <div className="w-10 h-10 bg-base-200/60 flex items-center justify-center">
                                                            <i className={`${n.icon} ${n.iconColor} text-sm`} />
                                                        </div>
                                                    )}
                                                    {!n.read && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-secondary border-2 border-base-100" />}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className={`text-sm leading-snug mb-0.5 ${!n.read ? "font-semibold text-base-content" : "font-medium text-base-content/70"}`}>{n.title}</p>
                                                            <p className="text-xs text-base-content/40 leading-relaxed line-clamp-2">{n.body}</p>
                                                        </div>
                                                        <span className="text-[10px] text-base-content/25 whitespace-nowrap shrink-0 mt-0.5">{n.time}</span>
                                                    </div>
                                                    {/* Actions */}
                                                    <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!n.read && (
                                                            <button onClick={() => markAsRead(n.id)} className="text-[10px] uppercase tracking-wider text-secondary hover:underline font-medium">Mark read</button>
                                                        )}
                                                        <button onClick={() => archiveItem(n.id)} className="text-[10px] uppercase tracking-wider text-base-content/30 hover:text-error font-medium">Archive</button>
                                                    </div>
                                                </div>

                                                {/* Type Badge */}
                                                <div className="hidden md:flex shrink-0">
                                                    <span className={`text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 border border-base-300 text-base-content/30`}>{TYPE_META[n.type].label}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Summary */}
                    {items.length > 0 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-base-300">
                            <p className="text-xs text-base-content/30">{filtered.length} notification{filtered.length !== 1 ? "s" : ""}{filter !== "all" ? ` in ${TYPE_META[filter].label}` : ""}</p>
                            <div className="flex items-center gap-4">
                                {(["message", "application", "placement", "system"] as NotifType[]).map((t) => (
                                    <span key={t} className="flex items-center gap-1">
                                        <i className={`${TYPE_META[t].icon} ${TYPE_META[t].color} text-[10px]`} />
                                        <span className="text-[10px] text-base-content/25">{typeCounts[t] || 0}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Colophon */}
            <section className="bg-base-200 border-t border-base-300 py-12">
                <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm text-base-content/40 uppercase tracking-[0.2em]">Splits Network &middot; Notifications &middot; Magazine Editorial</p>
                </div>
            </section>
        </div>
    );
}
