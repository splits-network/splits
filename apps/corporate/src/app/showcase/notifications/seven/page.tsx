"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Mock Data ──────────────────────────────────────────────────────────────────

interface Notification {
    id: string;
    type: "placement" | "proposal" | "assignment" | "system" | "message" | "alert";
    title: string;
    description: string;
    time: string;
    read: boolean;
    actor?: string;
}

const notifications: Notification[] = [
    { id: "N-001", type: "placement", title: "Placement Confirmed", description: "Sarah Kim has been officially placed as Staff Engineer at Meridian Labs. Split fee of $25,500 will be processed.", time: "15m ago", read: false, actor: "System" },
    { id: "N-002", type: "proposal", title: "New Split Proposal", description: "Alex Rivera has proposed a 60/40 split for the Senior PM role at Vertex AI. Review and respond.", time: "1h ago", read: false, actor: "A. Rivera" },
    { id: "N-003", type: "message", title: "New Message", description: "Hey Marcus, I have 3 strong candidates for the DevOps Lead position. Can we discuss?", time: "2h ago", read: false, actor: "T. Santos" },
    { id: "N-004", type: "assignment", title: "Role Assignment", description: "You have been assigned to the Lead Backend Engineer role at Prism Financial. 50/50 split.", time: "5h ago", read: true, actor: "System" },
    { id: "N-005", type: "alert", title: "Deadline Approaching", description: "The submission deadline for VP Engineering at Apex Systems expires in 48 hours.", time: "8h ago", read: true },
    { id: "N-006", type: "system", title: "System Update", description: "Splits Network v4.2.0 has been deployed. New features include enhanced matching and bulk actions.", time: "1d ago", read: true, actor: "System" },
    { id: "N-007", type: "placement", title: "Placement Pending Review", description: "David Park placement as Engineering Manager at NovaTech is pending final approval.", time: "1d ago", read: true, actor: "System" },
    { id: "N-008", type: "proposal", title: "Proposal Declined", description: "Your proposal for 2 candidates for the DevOps Lead at CloudScale has been declined by the job owner.", time: "2d ago", read: true, actor: "J. Lee" },
    { id: "N-009", type: "message", title: "Interview Feedback", description: "Candidate Emily Zhang completed Round 3 interview. Hiring manager feedback is positive.", time: "3d ago", read: true, actor: "Vertex AI" },
    { id: "N-010", type: "system", title: "Monthly Report Ready", description: "Your January 2026 performance report is ready. 4 placements, $102K in split fees earned.", time: "5d ago", read: true, actor: "System" },
];

type FilterType = "all" | "unread" | "placement" | "proposal" | "message" | "system" | "alert" | "assignment";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NotificationsSevenPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [filter, setFilter] = useState<FilterType>("all");
    const [notifState, setNotifState] = useState(notifications);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(".bp-notif-ref", { opacity: 0 }, { opacity: 1, duration: 0.25 });
            tl.fromTo(".bp-notif-title", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 }, "-=0.1");
            tl.fromTo(".bp-notif-toolbar", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3");
            tl.fromTo(".bp-notif-item", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.06 }, "-=0.2");
            gsap.to(".bp-pulse-dot", { opacity: 0.3, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" });
        },
        { scope: containerRef },
    );

    const unreadCount = notifState.filter((n) => !n.read).length;

    const markAllRead = () => {
        setNotifState((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const toggleRead = (id: string) => {
        setNotifState((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
    };

    const filtered = notifState.filter((n) => {
        if (filter === "all") return true;
        if (filter === "unread") return !n.read;
        return n.type === filter;
    });

    const typeIcon = (type: Notification["type"]) => {
        switch (type) {
            case "placement": return { icon: "fa-handshake", color: "#22c55e" };
            case "proposal": return { icon: "fa-file-signature", color: "#3b5ccc" };
            case "assignment": return { icon: "fa-briefcase", color: "#14b8a6" };
            case "message": return { icon: "fa-message", color: "#3b5ccc" };
            case "system": return { icon: "fa-gear", color: "#c8ccd4" };
            case "alert": return { icon: "fa-triangle-exclamation", color: "#eab308" };
        }
    };

    const filters: { key: FilterType; label: string }[] = [
        { key: "all", label: "ALL" },
        { key: "unread", label: `UNREAD (${unreadCount})` },
        { key: "placement", label: "PLACEMENTS" },
        { key: "proposal", label: "PROPOSALS" },
        { key: "message", label: "MESSAGES" },
        { key: "alert", label: "ALERTS" },
    ];

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image: linear-gradient(rgba(59, 92, 204, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 92, 204, 0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            <div ref={containerRef} className="min-h-screen bg-[#0a0e17] text-[#c8ccd4] relative">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04] pointer-events-none"></div>

                <div className="container mx-auto px-4 py-10 relative z-10">
                    <div className="bp-notif-ref flex justify-between items-center mb-6 opacity-0">
                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">REF: SN-NOTF07-2026</div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-[#c8ccd4]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] bp-pulse-dot"></span>
                            NOTIFICATIONS
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="bp-notif-title text-3xl md:text-4xl font-bold text-white opacity-0">
                            Notification <span className="text-[#3b5ccc]">Center</span>
                        </h1>
                        {unreadCount > 0 && (
                            <span className="px-2 py-1 bg-[#3b5ccc] text-white font-mono text-[10px] tracking-widest">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <p className="font-mono text-xs text-[#c8ccd4]/40 tracking-wider mb-10">// ACTIVITY FEED AND ALERTS</p>

                    <div className="max-w-3xl mx-auto">
                        {/* ═══ Toolbar ═══ */}
                        <div className="bp-notif-toolbar opacity-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                            <div className="flex flex-wrap gap-2">
                                {filters.map((f) => (
                                    <button
                                        key={f.key}
                                        onClick={() => setFilter(f.key)}
                                        className={`px-3 py-2 font-mono text-[9px] tracking-widest border transition-colors ${
                                            filter === f.key
                                                ? "border-[#3b5ccc] text-[#3b5ccc] bg-[#3b5ccc]/10"
                                                : "border-[#c8ccd4]/10 text-[#c8ccd4]/30 hover:text-[#c8ccd4]/60 hover:border-[#c8ccd4]/20"
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="font-mono text-[9px] text-[#3b5ccc]/40 tracking-widest hover:text-[#3b5ccc] transition-colors"
                                >
                                    MARK_ALL_READ
                                </button>
                            )}
                        </div>

                        {/* ═══ Notification List ═══ */}
                        <div className="border border-[#3b5ccc]/15">
                            <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10 flex items-center justify-between">
                                <span>ACTIVITY_FEED</span>
                                <span>{filtered.length} ITEMS</span>
                            </div>
                            {filtered.length === 0 ? (
                                <div className="p-12 text-center">
                                    <i className="fa-duotone fa-regular fa-bell-slash text-3xl text-[#c8ccd4]/10 mb-4"></i>
                                    <div className="font-mono text-[10px] text-[#c8ccd4]/20 tracking-widest">NO_NOTIFICATIONS_FOUND</div>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#3b5ccc]/5">
                                    {filtered.map((notif) => {
                                        const { icon, color } = typeIcon(notif.type);
                                        return (
                                            <div
                                                key={notif.id}
                                                className={`bp-notif-item px-6 py-4 flex items-start gap-4 opacity-0 hover:bg-[#3b5ccc]/5 transition-colors cursor-pointer ${
                                                    !notif.read ? "bg-[#3b5ccc]/[0.02]" : ""
                                                }`}
                                                onClick={() => toggleRead(notif.id)}
                                            >
                                                {/* Unread indicator */}
                                                <div className="flex-shrink-0 mt-2">
                                                    {!notif.read ? (
                                                        <div className="w-2 h-2 bg-[#3b5ccc]"></div>
                                                    ) : (
                                                        <div className="w-2 h-2"></div>
                                                    )}
                                                </div>

                                                {/* Icon */}
                                                <div
                                                    className="w-10 h-10 border flex items-center justify-center flex-shrink-0"
                                                    style={{ borderColor: `${color}20`, backgroundColor: `${color}08` }}
                                                >
                                                    <i
                                                        className={`fa-duotone fa-regular ${icon} text-sm`}
                                                        style={{ color: `${color}60` }}
                                                    ></i>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className={`text-sm font-bold ${!notif.read ? "text-white" : "text-[#c8ccd4]/60"}`}>
                                                            {notif.title}
                                                        </h3>
                                                        <span
                                                            className="font-mono text-[8px] tracking-widest px-1.5 py-0.5 border"
                                                            style={{ borderColor: `${color}20`, color: `${color}50` }}
                                                        >
                                                            {notif.type.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[#c8ccd4]/30 leading-relaxed">{notif.description}</p>
                                                    {notif.actor && (
                                                        <div className="font-mono text-[9px] text-[#c8ccd4]/15 tracking-wider mt-2">
                                                            FROM: {notif.actor}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Time */}
                                                <div className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-wider flex-shrink-0 mt-1">
                                                    {notif.time}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* ═══ Footer ═══ */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="font-mono text-[8px] text-[#c8ccd4]/15 tracking-widest">
                                NOTIFICATION_ENGINE v1.4 // LAST_POLL: 2026-02-14T12:00:00Z
                            </div>
                            <button className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest hover:text-[#3b5ccc] transition-colors">
                                <i className="fa-duotone fa-regular fa-gear text-[8px] mr-1"></i>
                                PREFERENCES
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
