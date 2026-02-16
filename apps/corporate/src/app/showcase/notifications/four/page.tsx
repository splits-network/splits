"use client";

import { useState, useRef, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

type NotifType =
    | "placement"
    | "candidate"
    | "message"
    | "system"
    | "billing"
    | "role"
    | "team";

interface Notification {
    id: string;
    type: NotifType;
    title: string;
    body: string;
    time: string;
    read: boolean;
    avatar?: string;
    initials?: string;
    link?: string;
}

const TYPE_META: Record<
    NotifType,
    { icon: string; color: string; label: string }
> = {
    placement: {
        icon: "fa-duotone fa-regular fa-trophy",
        color: "text-success",
        label: "Placement",
    },
    candidate: {
        icon: "fa-duotone fa-regular fa-user",
        color: "text-info",
        label: "Candidate",
    },
    message: {
        icon: "fa-duotone fa-regular fa-comment",
        color: "text-primary",
        label: "Message",
    },
    system: {
        icon: "fa-duotone fa-regular fa-gear",
        color: "text-base-content/50",
        label: "System",
    },
    billing: {
        icon: "fa-duotone fa-regular fa-credit-card",
        color: "text-warning",
        label: "Billing",
    },
    role: {
        icon: "fa-duotone fa-regular fa-briefcase",
        color: "text-secondary",
        label: "Role",
    },
    team: {
        icon: "fa-duotone fa-regular fa-users",
        color: "text-accent",
        label: "Team",
    },
};

const INITIAL_NOTIFICATIONS: Notification[] = [
    /* Today */
    {
        id: "1",
        type: "placement",
        title: "Placement Confirmed!",
        body: "Sarah Chen has been placed as Senior Product Designer at Stripe. Commission: $18,750.",
        time: "10 minutes ago",
        read: false,
        initials: "SC",
    },
    {
        id: "2",
        type: "message",
        title: "New message from David Park",
        body: "Hey, I have a candidate who might be a great fit for your DevOps role. Can we chat?",
        time: "32 minutes ago",
        read: false,
        initials: "DP",
    },
    {
        id: "3",
        type: "candidate",
        title: "Candidate status updated",
        body: "Jordan Rivera moved to Final Interview stage for the Engineering Manager role at Datadog.",
        time: "1 hour ago",
        read: false,
        initials: "JR",
    },
    {
        id: "4",
        type: "role",
        title: "New matching role",
        body: "VP of Engineering at Notion matches your search criteria. $280K-$350K, San Francisco.",
        time: "2 hours ago",
        read: true,
        initials: "N",
    },
    /* Yesterday */
    {
        id: "5",
        type: "billing",
        title: "Invoice paid",
        body: "Your monthly invoice for Professional plan ($149.00) has been processed successfully.",
        time: "Yesterday, 4:30 PM",
        read: true,
    },
    {
        id: "6",
        type: "team",
        title: "New team member",
        body: "Alex Thompson has accepted your invitation and joined your organization.",
        time: "Yesterday, 2:15 PM",
        read: true,
        initials: "AT",
    },
    {
        id: "7",
        type: "message",
        title: "Message from Lisa Wang",
        body: "Thanks for the referral! The candidate nailed the first interview. Moving to technical round.",
        time: "Yesterday, 11:00 AM",
        read: true,
        initials: "LW",
    },
    {
        id: "8",
        type: "candidate",
        title: "Application received",
        body: "Marcus Johnson applied for the Full Stack Developer role. 7 years experience, strong React/Node background.",
        time: "Yesterday, 9:22 AM",
        read: true,
        initials: "MJ",
    },
    /* Earlier */
    {
        id: "9",
        type: "system",
        title: "Platform update",
        body: "We've launched AI-powered candidate matching. Check out the new Automation section in your dashboard.",
        time: "Feb 10, 2026",
        read: true,
    },
    {
        id: "10",
        type: "placement",
        title: "Split fee received",
        body: "Your 50% split fee of $12,500 for the CloudOps placement has been deposited to your account.",
        time: "Feb 9, 2026",
        read: true,
    },
    {
        id: "11",
        type: "role",
        title: "Role expired",
        body: "The Product Manager role at Figma has expired. 3 candidates were submitted, 1 reached final stage.",
        time: "Feb 8, 2026",
        read: true,
    },
    {
        id: "12",
        type: "system",
        title: "Scheduled maintenance",
        body: "Platform maintenance scheduled for Feb 15, 2026, 2:00-4:00 AM EST. Brief downtime expected.",
        time: "Feb 7, 2026",
        read: true,
    },
];

type FilterKey = "all" | NotifType;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function NotificationsFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [filter, setFilter] = useState<FilterKey>("all");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showDetail, setShowDetail] = useState<string | null>(null);

    /* Animations */
    useGSAP(
        () => {
            gsap.fromTo(
                ".cin-notif-header",
                { opacity: 0, y: -16 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
            );
            gsap.fromTo(
                ".cin-notif-list",
                { opacity: 0 },
                { opacity: 1, duration: 0.4, delay: 0.2 },
            );
        },
        { scope: containerRef },
    );

    /* Computed */
    const unreadCount = notifications.filter((n) => !n.read).length;

    const filtered = useMemo(() => {
        if (filter === "all") return notifications;
        return notifications.filter((n) => n.type === filter);
    }, [notifications, filter]);

    const groupedByDate = useMemo(() => {
        const groups: { label: string; items: Notification[] }[] = [];
        const today: Notification[] = [];
        const yesterday: Notification[] = [];
        const earlier: Notification[] = [];

        filtered.forEach((n) => {
            if (
                n.time.includes("minute") ||
                n.time.includes("hour") ||
                n.time.includes("just now")
            ) {
                today.push(n);
            } else if (n.time.startsWith("Yesterday")) {
                yesterday.push(n);
            } else {
                earlier.push(n);
            }
        });

        if (today.length) groups.push({ label: "Today", items: today });
        if (yesterday.length)
            groups.push({ label: "Yesterday", items: yesterday });
        if (earlier.length) groups.push({ label: "Earlier", items: earlier });
        return groups;
    }, [filtered]);

    /* Handlers */
    const markRead = (id: string) =>
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );

    const markAllRead = () =>
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    const toggleSelect = (id: string) =>
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const deleteSelected = () => {
        setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
        setSelectedIds(new Set());
    };

    const markSelectedRead = () => {
        setNotifications((prev) =>
            prev.map((n) => (selectedIds.has(n.id) ? { ...n, read: true } : n)),
        );
        setSelectedIds(new Set());
    };

    const detailNotif = showDetail
        ? notifications.find((n) => n.id === showDetail)
        : null;

    const FILTER_TABS: { key: FilterKey; label: string }[] = [
        { key: "all", label: "All" },
        { key: "message", label: "Messages" },
        { key: "candidate", label: "Candidates" },
        { key: "placement", label: "Placements" },
        { key: "role", label: "Roles" },
        { key: "billing", label: "Billing" },
        { key: "team", label: "Team" },
        { key: "system", label: "System" },
    ];

    /* ---------------------------------------------------------------- */
    /*  Render                                                           */
    /* ---------------------------------------------------------------- */

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100">
            {/* Header */}
            <header className="cin-notif-header bg-neutral text-neutral-content">
                <div className="max-w-4xl mx-auto px-6 py-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3 font-semibold">
                                Notifications
                            </p>
                            <h1 className="text-3xl md:text-4xl font-black mb-2">
                                Notification Center
                            </h1>
                            <p className="text-neutral-content/60">
                                {unreadCount > 0
                                    ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                                    : "All caught up!"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="btn btn-sm btn-ghost text-neutral-content/60 hover:text-neutral-content"
                                >
                                    <i className="fa-duotone fa-regular fa-check-double text-xs mr-1" />
                                    Mark all read
                                </button>
                            )}
                            <button className="btn btn-sm btn-ghost text-neutral-content/60 hover:text-neutral-content">
                                <i className="fa-duotone fa-regular fa-gear text-xs" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-6">
                {/* Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 border-b border-base-300 scrollbar-none">
                    {FILTER_TABS.map((tab) => {
                        const count =
                            tab.key === "all"
                                ? notifications.length
                                : notifications.filter(
                                      (n) => n.type === tab.key,
                                  ).length;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`btn btn-sm whitespace-nowrap ${
                                    filter === tab.key
                                        ? "btn-primary"
                                        : "btn-ghost border border-base-300"
                                }`}
                            >
                                {tab.label}
                                <span
                                    className={`badge badge-xs ml-1 ${
                                        filter === tab.key
                                            ? "badge-primary-content bg-primary-content/20"
                                            : "badge-ghost"
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Bulk actions */}
                {selectedIds.size > 0 && (
                    <div className="flex items-center justify-between p-3 bg-primary/5 border border-coral/20 rounded-lg mb-4">
                        <span className="text-sm font-semibold">
                            {selectedIds.size} selected
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={markSelectedRead}
                                className="btn btn-xs btn-ghost"
                            >
                                <i className="fa-duotone fa-regular fa-check text-xs mr-1" />
                                Mark read
                            </button>
                            <button
                                onClick={deleteSelected}
                                className="btn btn-xs btn-ghost text-error"
                            >
                                <i className="fa-duotone fa-regular fa-trash text-xs mr-1" />
                                Delete
                            </button>
                            <button
                                onClick={() => setSelectedIds(new Set())}
                                className="btn btn-xs btn-ghost"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Notification list */}
                <div className="cin-notif-list space-y-6">
                    {groupedByDate.length === 0 && (
                        <div className="text-center py-16">
                            <i className="fa-duotone fa-regular fa-bell-slash text-4xl text-base-content/20 mb-4 block" />
                            <p className="font-semibold text-base-content/60">
                                No notifications
                            </p>
                            <p className="text-xs text-base-content/40 mt-1">
                                {filter !== "all"
                                    ? "Try a different filter."
                                    : "You're all caught up!"}
                            </p>
                        </div>
                    )}

                    {groupedByDate.map((group) => (
                        <div key={group.label}>
                            <p className="text-xs uppercase tracking-wider text-base-content/40 font-semibold mb-3">
                                {group.label}
                            </p>
                            <div className="space-y-1">
                                {group.items.map((notif) => {
                                    const meta = TYPE_META[notif.type];
                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => {
                                                markRead(notif.id);
                                                setShowDetail(notif.id);
                                            }}
                                            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors group ${
                                                notif.read
                                                    ? "bg-base-100 border-base-300 hover:bg-base-200/50"
                                                    : "bg-primary/[0.03] border-coral/10 hover:bg-primary/[0.06]"
                                            }`}
                                        >
                                            {/* Checkbox */}
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-xs checkbox-primary mt-1 shrink-0"
                                                checked={selectedIds.has(
                                                    notif.id,
                                                )}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                onChange={() =>
                                                    toggleSelect(notif.id)
                                                }
                                            />

                                            {/* Icon / Avatar */}
                                            <div
                                                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                                    notif.initials
                                                        ? "bg-primary/10"
                                                        : "bg-base-200"
                                                }`}
                                            >
                                                {notif.initials ? (
                                                    <span className="text-xs font-bold text-primary">
                                                        {notif.initials}
                                                    </span>
                                                ) : (
                                                    <i
                                                        className={`${meta.icon} ${meta.color} text-sm`}
                                                    />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            {!notif.read && (
                                                                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                                            )}
                                                            <span
                                                                className={`text-sm truncate ${
                                                                    notif.read
                                                                        ? "font-medium"
                                                                        : "font-bold"
                                                                }`}
                                                            >
                                                                {notif.title}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-base-content/50 line-clamp-2 leading-relaxed">
                                                            {notif.body}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span
                                                            className={`badge badge-xs ${meta.color} badge-outline`}
                                                        >
                                                            {meta.label}
                                                        </span>
                                                        <span className="text-[11px] text-base-content/40 whitespace-nowrap">
                                                            {notif.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Detail slide-over */}
            {detailNotif && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-40"
                        onClick={() => setShowDetail(null)}
                    />
                    <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-base-100 z-50 shadow-2xl flex flex-col">
                        {/* Detail header */}
                        <div className="flex items-center justify-between p-4 border-b border-base-300">
                            <div className="flex items-center gap-2">
                                <i
                                    className={`${TYPE_META[detailNotif.type].icon} ${
                                        TYPE_META[detailNotif.type].color
                                    }`}
                                />
                                <span className="badge badge-sm badge-outline">
                                    {TYPE_META[detailNotif.type].label}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowDetail(null)}
                                className="btn btn-ghost btn-sm btn-square"
                            >
                                <i className="fa-duotone fa-regular fa-xmark" />
                            </button>
                        </div>

                        {/* Detail body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                        detailNotif.initials
                                            ? "bg-primary/10"
                                            : "bg-base-200"
                                    }`}
                                >
                                    {detailNotif.initials ? (
                                        <span className="text-sm font-bold text-primary">
                                            {detailNotif.initials}
                                        </span>
                                    ) : (
                                        <i
                                            className={`${
                                                TYPE_META[detailNotif.type].icon
                                            } ${TYPE_META[detailNotif.type].color} text-lg`}
                                        />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold">
                                        {detailNotif.title}
                                    </h3>
                                    <p className="text-xs text-base-content/40">
                                        {detailNotif.time}
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-base-content/70 leading-relaxed mb-8">
                                {detailNotif.body}
                            </p>

                            {/* Action buttons based on type */}
                            <div className="space-y-2">
                                {detailNotif.type === "message" && (
                                    <button className="btn btn-primary btn-sm w-full">
                                        <i className="fa-duotone fa-regular fa-reply mr-2" />
                                        Reply
                                    </button>
                                )}
                                {detailNotif.type === "candidate" && (
                                    <button className="btn btn-primary btn-sm w-full">
                                        <i className="fa-duotone fa-regular fa-user mr-2" />
                                        View Candidate
                                    </button>
                                )}
                                {detailNotif.type === "placement" && (
                                    <button className="btn btn-primary btn-sm w-full">
                                        <i className="fa-duotone fa-regular fa-trophy mr-2" />
                                        View Placement
                                    </button>
                                )}
                                {detailNotif.type === "role" && (
                                    <button className="btn btn-primary btn-sm w-full">
                                        <i className="fa-duotone fa-regular fa-briefcase mr-2" />
                                        View Role
                                    </button>
                                )}
                                {detailNotif.type === "billing" && (
                                    <button className="btn btn-primary btn-sm w-full">
                                        <i className="fa-duotone fa-regular fa-file-invoice mr-2" />
                                        View Invoice
                                    </button>
                                )}
                                <button className="btn btn-ghost btn-sm w-full border border-base-300">
                                    <i className="fa-duotone fa-regular fa-trash mr-2 text-error" />
                                    Delete notification
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
