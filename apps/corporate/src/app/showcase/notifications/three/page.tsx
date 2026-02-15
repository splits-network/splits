"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") { gsap.registerPlugin(ScrollTrigger); }

const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = { precise: "power3.out" };

type NotificationType = "message" | "application" | "placement" | "system";
type NotificationStatus = "unread" | "read";

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    time: string;
    date: "today" | "yesterday" | "this_week" | "older";
    status: NotificationStatus;
    icon: string;
    accent: string;
    actor?: string;
}

const notifications: Notification[] = [
    { id: "1", type: "message", title: "New message from Sarah Mitchell", body: "Hey, I have a strong candidate for the Senior Frontend role at Stripe. Can we discuss the split terms?", time: "12 min ago", date: "today", status: "unread", icon: "fa-envelope", accent: "text-primary", actor: "SM" },
    { id: "2", type: "application", title: "New application received", body: "David Chen applied for Senior Backend Engineer at Datadog. Match score: 94%.", time: "43 min ago", date: "today", status: "unread", icon: "fa-file-lines", accent: "text-accent", actor: "DC" },
    { id: "3", type: "placement", title: "Placement confirmed", body: "Congratulations! Maria Santos has been placed as Product Manager at Notion. Commission: $18,500.", time: "2 hrs ago", date: "today", status: "unread", icon: "fa-trophy", accent: "text-success" },
    { id: "4", type: "system", title: "Weekly digest ready", body: "Your weekly performance report is ready. 12 new candidates, 3 interviews scheduled, 1 placement.", time: "3 hrs ago", date: "today", status: "read", icon: "fa-chart-line", accent: "text-secondary" },
    { id: "5", type: "message", title: "Reply from TechTalent Partners", body: "We'd like to proceed with the 60/40 split on the DevOps Engineer role. Please confirm.", time: "Yesterday, 4:32 PM", date: "yesterday", status: "read", icon: "fa-envelope", accent: "text-primary", actor: "TP" },
    { id: "6", type: "application", title: "Application withdrawn", body: "James Wilson has withdrawn their application for Data Scientist at Anthropic.", time: "Yesterday, 2:15 PM", date: "yesterday", status: "read", icon: "fa-file-xmark", accent: "text-warning", actor: "JW" },
    { id: "7", type: "system", title: "Account security alert", body: "New login detected from Chrome on Windows. If this wasn't you, please secure your account immediately.", time: "Yesterday, 11:00 AM", date: "yesterday", status: "read", icon: "fa-shield-check", accent: "text-error" },
    { id: "8", type: "placement", title: "Split fee received", body: "Payment of $9,250 received for the placement of Alex Torres at Figma. Funds available for withdrawal.", time: "Yesterday, 9:45 AM", date: "yesterday", status: "read", icon: "fa-money-check-dollar", accent: "text-success" },
    { id: "9", type: "message", title: "Interview feedback requested", body: "RecruiterHub is requesting your feedback on the interview with Emily Park for the UX Lead position.", time: "Mon, Feb 9", date: "this_week", status: "read", icon: "fa-comment-dots", accent: "text-primary", actor: "RH" },
    { id: "10", type: "application", title: "Candidate shortlisted", body: "Your candidate Priya Sharma has been shortlisted for Senior DevOps at Vercel. Next step: Technical interview.", time: "Mon, Feb 9", date: "this_week", status: "read", icon: "fa-user-check", accent: "text-accent", actor: "PS" },
    { id: "11", type: "system", title: "Plan renewal reminder", body: "Your Professional plan renews on March 1. Annual billing: $708/year. Manage your subscription in settings.", time: "Sun, Feb 8", date: "this_week", status: "read", icon: "fa-credit-card", accent: "text-secondary" },
    { id: "12", type: "placement", title: "Offer extended", body: "Notion has extended an offer to your candidate Lisa Park for the Engineering Manager role. Awaiting acceptance.", time: "Sat, Feb 7", date: "this_week", status: "read", icon: "fa-handshake", accent: "text-success", actor: "LP" },
];

const typeFilters: { value: NotificationType | "all"; label: string; icon: string }[] = [
    { value: "all", label: "All", icon: "fa-bell" },
    { value: "message", label: "Messages", icon: "fa-envelope" },
    { value: "application", label: "Applications", icon: "fa-file-lines" },
    { value: "placement", label: "Placements", icon: "fa-trophy" },
    { value: "system", label: "System", icon: "fa-gear" },
];

const statusFilters: { value: NotificationStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "read", label: "Read" },
];

export default function NotificationsThreePage() {
    const [items, setItems] = useState<Notification[]>(notifications);
    const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
    const [statusFilter, setStatusFilter] = useState<NotificationStatus | "all">("all");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
        const $1 = (sel: string) => containerRef.current!.querySelector(sel);
        const tl = gsap.timeline({ defaults: { ease: E.precise } });
        tl.fromTo($1(".page-number"), { opacity: 0, y: 60, skewY: 5 }, { opacity: 1, y: 0, skewY: 0, duration: D.slow });
        tl.fromTo($1(".page-title"), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: D.normal }, "-=0.3");
        tl.fromTo($(".filter-bar"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: D.normal }, "-=0.2");
        tl.fromTo($(".notif-item"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: D.fast, stagger: 0.04 }, "-=0.1");
    }, { scope: containerRef });

    const filtered = items.filter((n) => {
        if (typeFilter !== "all" && n.type !== typeFilter) return false;
        if (statusFilter !== "all" && n.status !== statusFilter) return false;
        return true;
    });

    const grouped: { label: string; key: string; items: Notification[] }[] = [
        { label: "Today", key: "today", items: filtered.filter((n) => n.date === "today") },
        { label: "Yesterday", key: "yesterday", items: filtered.filter((n) => n.date === "yesterday") },
        { label: "This Week", key: "this_week", items: filtered.filter((n) => n.date === "this_week") },
        { label: "Older", key: "older", items: filtered.filter((n) => n.date === "older") },
    ].filter((g) => g.items.length > 0);

    const unreadCount = items.filter((n) => n.status === "unread").length;

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (selected.size === filtered.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filtered.map((n) => n.id)));
        }
    };

    const markAsRead = (ids: string[]) => {
        setItems((prev) => prev.map((n) => ids.includes(n.id) ? { ...n, status: "read" as const } : n));
        setSelected(new Set());
    };

    const markAsUnread = (ids: string[]) => {
        setItems((prev) => prev.map((n) => ids.includes(n.id) ? { ...n, status: "unread" as const } : n));
        setSelected(new Set());
    };

    const archiveItems = (ids: string[]) => {
        setItems((prev) => prev.filter((n) => !ids.includes(n.id)));
        setSelected(new Set());
    };

    const markAllRead = () => {
        setItems((prev) => prev.map((n) => ({ ...n, status: "read" as const })));
    };

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content min-h-screen">
            {/* Header */}
            <section className="border-b-2 border-neutral">
                <div className="px-6 lg:px-12 pt-16 pb-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="page-number opacity-0 text-[6rem] lg:text-[8rem] font-black tracking-tighter text-neutral/6 select-none leading-none mb-2">07</div>
                                <div className="page-title opacity-0">
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-2">Notification Center</p>
                                    <h1 className="text-3xl lg:text-5xl font-black tracking-tight mb-3">Notifications</h1>
                                    <p className="text-sm text-base-content/40 max-w-md leading-relaxed">Stay informed about messages, applications, placements, and system updates.</p>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <div className="page-title opacity-0 flex items-center gap-3 mt-24">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 bg-neutral text-neutral-content text-[9px] font-black flex items-center justify-center">{unreadCount}</span>
                                        <span className="text-[9px] uppercase tracking-[0.2em] text-base-content/30 font-bold">Unread</span>
                                    </div>
                                    <button onClick={markAllRead} className="text-[9px] uppercase tracking-[0.2em] text-primary font-bold hover:text-primary/70 transition-colors">
                                        Mark All Read
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <section className="filter-bar opacity-0 border-b border-base-300 sticky top-0 bg-base-100 z-20">
                <div className="px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto py-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                        {/* Type Filters */}
                        <div className="flex items-center gap-1">
                            {typeFilters.map((tf) => (
                                <button
                                    key={tf.value}
                                    onClick={() => setTypeFilter(tf.value)}
                                    className={`px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold transition-colors flex items-center gap-1.5 ${typeFilter === tf.value ? "bg-neutral text-neutral-content" : "text-base-content/30 hover:text-base-content/60"}`}
                                >
                                    <i className={`fa-duotone fa-regular ${tf.icon} text-[9px]`} />
                                    {tf.label}
                                </button>
                            ))}
                        </div>
                        {/* Status Filters */}
                        <div className="flex items-center gap-1">
                            {statusFilters.map((sf) => (
                                <button
                                    key={sf.value}
                                    onClick={() => setStatusFilter(sf.value)}
                                    className={`px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold transition-colors ${statusFilter === sf.value ? "bg-base-300 text-base-content" : "text-base-content/30 hover:text-base-content/60"}`}
                                >
                                    {sf.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Bulk Actions Bar */}
            {selected.size > 0 && (
                <section className="border-b border-base-300 bg-base-200/50">
                    <div className="px-6 lg:px-12">
                        <div className="max-w-4xl mx-auto py-2.5 flex items-center gap-4">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-base-content/40 font-bold">{selected.size} selected</span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => markAsRead(Array.from(selected))} className="px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] font-bold text-base-content/50 hover:text-base-content hover:bg-base-300 transition-colors">
                                    <i className="fa-duotone fa-regular fa-eye mr-1" />Mark Read
                                </button>
                                <button onClick={() => markAsUnread(Array.from(selected))} className="px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] font-bold text-base-content/50 hover:text-base-content hover:bg-base-300 transition-colors">
                                    <i className="fa-duotone fa-regular fa-eye-slash mr-1" />Mark Unread
                                </button>
                                <button onClick={() => archiveItems(Array.from(selected))} className="px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] font-bold text-error/50 hover:text-error hover:bg-error/10 transition-colors">
                                    <i className="fa-duotone fa-regular fa-trash mr-1" />Delete
                                </button>
                            </div>
                            <button onClick={() => setSelected(new Set())} className="ml-auto text-[9px] uppercase tracking-[0.15em] font-bold text-base-content/30 hover:text-base-content/60 transition-colors">
                                Clear
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Notification List */}
            <section className="px-6 lg:px-12 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Select All */}
                    {filtered.length > 0 && (
                        <div className="flex items-center gap-3 mb-4">
                            <button onClick={selectAll} className="w-4 h-4 border-2 border-base-300 flex items-center justify-center hover:border-neutral transition-colors">
                                {selected.size === filtered.length && filtered.length > 0 && (
                                    <i className="fa-duotone fa-regular fa-check text-[7px]" />
                                )}
                            </button>
                            <span className="text-[9px] uppercase tracking-[0.2em] text-base-content/25 font-bold">
                                {selected.size === filtered.length && filtered.length > 0 ? "Deselect All" : "Select All"}
                            </span>
                        </div>
                    )}

                    {/* Grouped Notifications */}
                    {grouped.length > 0 ? (
                        <div className="space-y-6">
                            {grouped.map((group) => (
                                <div key={group.key}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-[9px] uppercase tracking-[0.3em] text-base-content/25 font-black">{group.label}</span>
                                        <div className="flex-1 h-px bg-base-300" />
                                        <span className="text-[9px] text-base-content/20 font-bold">{group.items.length}</span>
                                    </div>
                                    <div className="border-2 border-neutral/10">
                                        {group.items.map((notif, idx) => (
                                            <div
                                                key={notif.id}
                                                className={`notif-item opacity-0 flex items-start gap-3 px-4 py-3.5 transition-colors cursor-pointer group ${idx < group.items.length - 1 ? "border-b border-base-300" : ""} ${notif.status === "unread" ? "bg-base-200/40" : "hover:bg-base-200/30"}`}
                                            >
                                                {/* Checkbox */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleSelect(notif.id); }}
                                                    className={`w-4 h-4 border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${selected.has(notif.id) ? "border-neutral bg-neutral" : "border-base-300 group-hover:border-neutral/30"}`}
                                                >
                                                    {selected.has(notif.id) && <i className="fa-duotone fa-regular fa-check text-[7px] text-neutral-content" />}
                                                </button>

                                                {/* Unread Indicator */}
                                                <div className="w-2 flex-shrink-0 mt-2">
                                                    {notif.status === "unread" && <div className="w-2 h-2 bg-primary" />}
                                                </div>

                                                {/* Icon / Avatar */}
                                                <div className="flex-shrink-0">
                                                    {notif.actor ? (
                                                        <div className="w-8 h-8 bg-neutral text-neutral-content text-[9px] font-black flex items-center justify-center">
                                                            {notif.actor}
                                                        </div>
                                                    ) : (
                                                        <div className={`w-8 h-8 bg-base-200 flex items-center justify-center ${notif.accent}`}>
                                                            <i className={`fa-duotone fa-regular ${notif.icon} text-xs`} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <p className={`text-xs tracking-tight leading-snug ${notif.status === "unread" ? "font-bold" : "font-medium text-base-content/70"}`}>
                                                            {notif.title}
                                                        </p>
                                                        <span className="text-[9px] text-base-content/25 flex-shrink-0 mt-0.5">{notif.time}</span>
                                                    </div>
                                                    <p className="text-[11px] text-base-content/40 mt-0.5 leading-relaxed line-clamp-2">{notif.body}</p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-0.5">
                                                    {notif.status === "unread" ? (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); markAsRead([notif.id]); }}
                                                            className="w-6 h-6 flex items-center justify-center text-base-content/25 hover:text-base-content/60 transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <i className="fa-duotone fa-regular fa-eye text-[9px]" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); markAsUnread([notif.id]); }}
                                                            className="w-6 h-6 flex items-center justify-center text-base-content/25 hover:text-base-content/60 transition-colors"
                                                            title="Mark as unread"
                                                        >
                                                            <i className="fa-duotone fa-regular fa-eye-slash text-[9px]" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); archiveItems([notif.id]); }}
                                                        className="w-6 h-6 flex items-center justify-center text-base-content/25 hover:text-error/60 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-trash text-[9px]" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="border-2 border-neutral/10 py-16 text-center">
                            <div className="w-12 h-12 mx-auto bg-base-200 flex items-center justify-center mb-4">
                                <i className="fa-duotone fa-regular fa-bell-slash text-xl text-base-content/15" />
                            </div>
                            <p className="text-sm font-bold tracking-tight mb-1">No notifications</p>
                            <p className="text-[11px] text-base-content/30">
                                {typeFilter !== "all" || statusFilter !== "all"
                                    ? "No notifications match your current filters. Try adjusting your selection."
                                    : "You're all caught up. New notifications will appear here."}
                            </p>
                            {(typeFilter !== "all" || statusFilter !== "all") && (
                                <button
                                    onClick={() => { setTypeFilter("all"); setStatusFilter("all"); }}
                                    className="mt-4 px-4 py-2 text-[9px] uppercase tracking-[0.2em] font-bold bg-base-200 text-base-content/50 hover:text-base-content transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* Summary Footer */}
                    {filtered.length > 0 && (
                        <div className="mt-6 flex items-center justify-between">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-base-content/20 font-bold">
                                Showing {filtered.length} of {items.length} notifications
                            </span>
                            <div className="flex items-center gap-4">
                                <button className="text-[9px] uppercase tracking-[0.15em] text-base-content/30 font-bold hover:text-base-content/60 transition-colors">
                                    <i className="fa-duotone fa-regular fa-gear mr-1" />Preferences
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Notification Settings Teaser */}
            <section className="px-6 lg:px-12 py-10 border-t-2 border-neutral/10">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-base-200/50 border-2 border-base-300 p-6 lg:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/25 font-bold mb-1">Notification Preferences</p>
                            <p className="text-sm font-bold tracking-tight mb-1">Customize what you receive</p>
                            <p className="text-[11px] text-base-content/35 leading-relaxed max-w-md">
                                Control which notifications you see, how they're delivered, and set quiet hours to reduce interruptions.
                            </p>
                        </div>
                        <button className="px-5 py-2.5 bg-neutral text-neutral-content text-[9px] uppercase tracking-[0.3em] font-black hover:bg-primary hover:text-primary-content transition-colors flex-shrink-0">
                            Manage Preferences
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
