"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// -- Data ---------------------------------------------------------------------

type NotifType = "application" | "placement" | "message" | "system" | "role";

interface Notification {
    id: string;
    type: NotifType;
    title: string;
    desc: string;
    time: string;
    read: boolean;
    group: "today" | "yesterday" | "thisWeek" | "older";
}

const typeConfig: Record<NotifType, { icon: string; color: string; label: string }> = {
    application: { icon: "fa-duotone fa-regular fa-file-lines", color: "text-blue-600 border-blue-200 bg-blue-50", label: "Application" },
    placement: { icon: "fa-duotone fa-regular fa-badge-check", color: "text-emerald-600 border-emerald-200 bg-emerald-50", label: "Placement" },
    message: { icon: "fa-duotone fa-regular fa-comment", color: "text-[#233876] border-[#233876]/20 bg-[#233876]/5", label: "Message" },
    system: { icon: "fa-duotone fa-regular fa-gear", color: "text-[#0f1b3d]/40 border-[#0f1b3d]/10 bg-[#f7f8fa]", label: "System" },
    role: { icon: "fa-duotone fa-regular fa-briefcase", color: "text-amber-600 border-amber-200 bg-amber-50", label: "Role" },
};

const initialNotifications: Notification[] = [
    { id: "N-001", type: "application", title: "New application received", desc: "Alex Martinez applied for Senior Frontend Engineer at TechCorp", time: "10 minutes ago", read: false, group: "today" },
    { id: "N-002", type: "message", title: "New message from CloudSys", desc: "Regarding the Backend Engineer role: Can we schedule a debrief?", time: "25 minutes ago", read: false, group: "today" },
    { id: "N-003", type: "placement", title: "Placement confirmed", desc: "Emily Rodriguez has been placed as Marketing Director at GrowthCo", time: "1 hour ago", read: false, group: "today" },
    { id: "N-004", type: "role", title: "New role matches your profile", desc: "VP of Engineering at ScaleUp Inc - $280-350K, New York", time: "2 hours ago", read: false, group: "today" },
    { id: "N-005", type: "system", title: "Weekly report ready", desc: "Your weekly performance report for Feb 7-13, 2026 is available", time: "3 hours ago", read: true, group: "today" },
    { id: "N-006", type: "application", title: "Application status updated", desc: "Priya Sharma moved to Interview stage for Backend Engineer at CloudSys", time: "Yesterday at 4:30 PM", read: true, group: "yesterday" },
    { id: "N-007", type: "message", title: "Message from Sarah Kim", desc: "Thank you for the offer preparation help! The call went great.", time: "Yesterday at 2:15 PM", read: true, group: "yesterday" },
    { id: "N-008", type: "application", title: "3 new applications", desc: "Three candidates applied for Product Manager at StartupXYZ", time: "Yesterday at 11:00 AM", read: true, group: "yesterday" },
    { id: "N-009", type: "placement", title: "Placement milestone", desc: "You have reached 147 total placements. Congratulations!", time: "Tuesday at 9:00 AM", read: true, group: "thisWeek" },
    { id: "N-010", type: "role", title: "Role update: Design Lead", desc: "Pixel Inc updated the salary range for Design Lead to $140-175K", time: "Monday at 3:45 PM", read: true, group: "thisWeek" },
    { id: "N-011", type: "system", title: "Platform maintenance", desc: "Scheduled maintenance on Feb 15, 2026 from 2:00-4:00 AM PST", time: "Monday at 10:00 AM", read: true, group: "thisWeek" },
    { id: "N-012", type: "application", title: "Application withdrawn", desc: "Tom Wilson withdrew application for Senior Frontend Engineer at TechCorp", time: "Last Friday", read: true, group: "older" },
    { id: "N-013", type: "message", title: "Team message from Marcus", desc: "Can we review the Q1 pipeline numbers this week?", time: "Last Thursday", read: true, group: "older" },
];

const filterOptions = [
    { id: "all", label: "All", icon: "fa-regular fa-bell" },
    { id: "application", label: "Applications", icon: "fa-regular fa-file-lines" },
    { id: "placement", label: "Placements", icon: "fa-regular fa-badge-check" },
    { id: "message", label: "Messages", icon: "fa-regular fa-comment" },
    { id: "role", label: "Roles", icon: "fa-regular fa-briefcase" },
    { id: "system", label: "System", icon: "fa-regular fa-gear" },
];

const groupLabels: Record<string, string> = {
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    older: "Older",
};

// -- Component ----------------------------------------------------------------

export default function NotificationsNinePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState(initialNotifications);
    const [activeFilter, setActiveFilter] = useState("all");
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo($1(".notif-nine-title"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 });
            tl.fromTo($(".notif-nine-filter"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04 }, "-=0.4");
            tl.fromTo($(".notif-nine-group"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, "-=0.2");
        },
        { scope: containerRef },
    );

    const toggleRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
        );
    };

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const filteredNotifications = notifications.filter((n) => {
        if (activeFilter !== "all" && n.type !== activeFilter) return false;
        if (showUnreadOnly && n.read) return false;
        return true;
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    const grouped = filteredNotifications.reduce<Record<string, Notification[]>>((acc, n) => {
        if (!acc[n.group]) acc[n.group] = [];
        acc[n.group].push(n);
        return acc;
    }, {});

    const groupOrder = ["today", "yesterday", "thisWeek", "older"];

    return (
        <div ref={containerRef} className="min-h-screen bg-[#f7f8fa]">
            {/* Header */}
            <section className="relative bg-white overflow-hidden border-b border-[#233876]/10">
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="absolute top-8 right-8 font-mono text-[10px] text-[#233876]/20 tracking-wider">v9.0</div>

                <div className="container mx-auto px-6 relative z-10 py-12">
                    <div className="max-w-4xl mx-auto notif-nine-title opacity-0">
                        <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">
                            REF: EN-NOTIF-09 // Activity
                        </span>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h1 className="text-3xl md:text-4xl font-bold text-[#0f1b3d]">Notifications</h1>
                                {unreadCount > 0 && (
                                    <span className="font-mono text-xs text-white bg-[#233876] px-2.5 py-1">{unreadCount} new</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                                    className={`px-4 py-2 border-2 text-xs font-medium transition-colors ${
                                        showUnreadOnly
                                            ? "border-[#233876] bg-[#233876] text-white"
                                            : "border-[#233876]/10 text-[#0f1b3d]/40 hover:border-[#233876]/25"
                                    }`}
                                >
                                    <i className="fa-regular fa-filter mr-1.5" />Unread Only
                                </button>
                                <button
                                    onClick={markAllRead}
                                    className="px-4 py-2 border-2 border-[#233876]/15 text-xs text-[#233876] font-medium hover:border-[#233876] transition-colors"
                                >
                                    <i className="fa-regular fa-check-double mr-1.5" />Mark All Read
                                </button>
                                <a
                                    href="/settings/nine"
                                    className="px-3 py-2 border-2 border-[#233876]/10 text-[#233876]/30 hover:border-[#233876]/25 hover:text-[#233876] transition-colors"
                                >
                                    <i className="fa-regular fa-gear" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="relative py-6 bg-white border-b border-[#233876]/10">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-2">
                        {filterOptions.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setActiveFilter(opt.id)}
                                className={`notif-nine-filter opacity-0 flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors ${
                                    activeFilter === opt.id
                                        ? "border-2 border-[#233876] bg-[#233876] text-white"
                                        : "border-2 border-[#233876]/10 text-[#0f1b3d]/40 hover:border-[#233876]/25"
                                }`}
                            >
                                <i className={`${opt.icon} text-[10px]`} />
                                {opt.label}
                            </button>
                        ))}
                        <span className="font-mono text-[10px] text-[#233876]/25 ml-2">{filteredNotifications.length} notifications</span>
                    </div>
                </div>
            </section>

            {/* Notification Feed */}
            <section className="relative py-8">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        {groupOrder.map((groupKey) => {
                            const items = grouped[groupKey];
                            if (!items || items.length === 0) return null;

                            return (
                                <div key={groupKey} className="notif-nine-group opacity-0 mb-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="font-mono text-[10px] text-[#233876]/35 tracking-wider uppercase">{groupLabels[groupKey]}</span>
                                        <div className="flex-1 border-t border-dashed border-[#233876]/8" />
                                        <span className="font-mono text-[10px] text-[#233876]/20">{items.length}</span>
                                    </div>

                                    <div className="space-y-px bg-[#233876]/10">
                                        {items.map((notif) => {
                                            const config = typeConfig[notif.type];

                                            return (
                                                <div
                                                    key={notif.id}
                                                    className={`bg-white flex items-start gap-4 p-5 hover:bg-[#f7f8fa] transition-colors cursor-pointer relative group ${
                                                        !notif.read ? "border-l-[3px] border-l-[#233876]" : ""
                                                    }`}
                                                >
                                                    {/* Unread dot */}
                                                    {!notif.read && (
                                                        <div className="absolute top-2 right-2 w-2 h-2 bg-[#233876] rounded-full" />
                                                    )}

                                                    {/* Icon */}
                                                    <div className={`w-10 h-10 border flex items-center justify-center flex-shrink-0 ${config.color}`}>
                                                        <i className={`${config.icon} text-sm`} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <div className={`text-sm mb-0.5 ${!notif.read ? "font-semibold text-[#0f1b3d]" : "text-[#0f1b3d]/60"}`}>
                                                                    {notif.title}
                                                                </div>
                                                                <div className="text-xs text-[#0f1b3d]/35 leading-relaxed">{notif.desc}</div>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <span className="font-mono text-[10px] text-[#0f1b3d]/20">{notif.time}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={`font-mono text-[9px] tracking-wider uppercase border px-1.5 py-0.5 ${config.color}`}>
                                                                {config.label}
                                                            </span>
                                                            <span className="font-mono text-[9px] text-[#233876]/15">{notif.id}</span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toggleRead(notif.id); }}
                                                            className="w-7 h-7 border border-[#233876]/10 flex items-center justify-center hover:border-[#233876]/30 transition-colors"
                                                            title={notif.read ? "Mark unread" : "Mark read"}
                                                        >
                                                            <i className={`fa-regular ${notif.read ? "fa-envelope" : "fa-envelope-open"} text-[10px] text-[#233876]/30`} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                                            className="w-7 h-7 border border-[#233876]/10 flex items-center justify-center hover:border-red-300 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <i className="fa-regular fa-trash text-[10px] text-[#0f1b3d]/20" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty State */}
                        {filteredNotifications.length === 0 && (
                            <div className="border-2 border-[#233876]/10 bg-white p-16 text-center relative">
                                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                <div className="w-16 h-16 border-2 border-[#233876]/10 flex items-center justify-center mx-auto mb-6">
                                    <i className="fa-duotone fa-regular fa-bell-slash text-2xl text-[#233876]/15" />
                                </div>
                                <h3 className="font-bold text-lg text-[#0f1b3d] mb-2">No Notifications</h3>
                                <p className="text-sm text-[#0f1b3d]/35 max-w-md mx-auto mb-6">
                                    {showUnreadOnly
                                        ? "All caught up! You have no unread notifications."
                                        : "No notifications match your current filter. Try selecting a different category."}
                                </p>
                                {showUnreadOnly && (
                                    <button
                                        onClick={() => setShowUnreadOnly(false)}
                                        className="px-5 py-2.5 border-2 border-[#233876]/15 text-sm text-[#233876] font-medium hover:border-[#233876] transition-colors"
                                    >
                                        View All Notifications
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Settings Link */}
                        <div className="mt-8 text-center">
                            <a
                                href="/settings/nine"
                                className="inline-flex items-center gap-2 font-mono text-xs text-[#233876]/40 hover:text-[#233876] transition-colors"
                            >
                                <i className="fa-regular fa-gear text-[10px]" />
                                Manage Notification Preferences
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reference bar */}
            <section className="relative py-6 bg-white border-t border-[#233876]/10">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">EMPLOYMENT NETWORKS // NOTIFICATIONS v9.0</span>
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">CLEAN ARCHITECTURE</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
