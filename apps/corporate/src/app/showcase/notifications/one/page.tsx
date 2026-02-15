"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") { gsap.registerPlugin(ScrollTrigger); }

/* --- Data ----------------------------------------------------------------- */

type NotificationType = "placement" | "message" | "system" | "achievement" | "candidate" | "billing";

interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    description: string;
    time: string;
    read: boolean;
    icon: string;
    iconColor: string;
    iconBg: string;
    action?: string;
}

const mockNotifications: Notification[] = [
    { id: 1, type: "placement", title: "Placement confirmed!", description: "Alex Rivera has been officially placed as Senior Engineer at TechCorp. Commission: $18,500.", time: "2 hours ago", read: false, icon: "fa-duotone fa-regular fa-trophy", iconColor: "text-success", iconBg: "bg-success/10", action: "View Placement" },
    { id: 2, type: "message", title: "New message from Priya Patel", description: "Hey Sarah, I wanted to follow up on the VP Engineering candidates you submitted last week...", time: "3 hours ago", read: false, icon: "fa-duotone fa-regular fa-comment", iconColor: "text-primary", iconBg: "bg-primary/10", action: "Reply" },
    { id: 3, type: "candidate", title: "Candidate moved to Interview", description: "Jordan Lee has advanced to the interview stage for VP Engineering at DataFlow.", time: "5 hours ago", read: false, icon: "fa-duotone fa-regular fa-user-check", iconColor: "text-info", iconBg: "bg-info/10", action: "View Pipeline" },
    { id: 4, type: "achievement", title: "Badge earned: Pro Recruiter", description: "Congratulations! You have completed 25+ placements and earned the Pro Recruiter badge.", time: "1 day ago", read: true, icon: "fa-duotone fa-regular fa-award", iconColor: "text-warning", iconBg: "bg-warning/10" },
    { id: 5, type: "system", title: "New roles matching your specializations", description: "12 new engineering roles were posted today that match your profile. 3 are marked as urgent.", time: "1 day ago", read: true, icon: "fa-duotone fa-regular fa-briefcase", iconColor: "text-secondary", iconBg: "bg-secondary/10", action: "Browse Roles" },
    { id: 6, type: "billing", title: "Invoice paid: February 2026", description: "Your Pro plan payment of $49.00 has been successfully processed.", time: "2 days ago", read: true, icon: "fa-duotone fa-regular fa-credit-card", iconColor: "text-accent", iconBg: "bg-accent/10", action: "View Invoice" },
    { id: 7, type: "placement", title: "Candidate feedback received", description: "TechCorp left a 5-star review for your placement of Casey Nguyen. View the review on your profile.", time: "3 days ago", read: true, icon: "fa-duotone fa-regular fa-star", iconColor: "text-warning", iconBg: "bg-warning/10", action: "View Review" },
    { id: 8, type: "message", title: "Message from Robert Tanaka", description: "Great news about the DataFlow search. Can we schedule a call to discuss the final candidates?", time: "3 days ago", read: true, icon: "fa-duotone fa-regular fa-comment", iconColor: "text-primary", iconBg: "bg-primary/10", action: "Reply" },
    { id: 9, type: "system", title: "Platform maintenance scheduled", description: "Splits Network will undergo scheduled maintenance on Feb 20 from 2-4 AM PT. No action needed.", time: "5 days ago", read: true, icon: "fa-duotone fa-regular fa-gear", iconColor: "text-base-content/50", iconBg: "bg-base-300" },
    { id: 10, type: "candidate", title: "Candidate withdrew application", description: "Sam Patel has withdrawn their application for Backend Engineer at ScaleAI.", time: "1 week ago", read: true, icon: "fa-duotone fa-regular fa-user-xmark", iconColor: "text-error", iconBg: "bg-error/10" },
];

const filterOptions: { label: string; value: NotificationType | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Placements", value: "placement" },
    { label: "Messages", value: "message" },
    { label: "Candidates", value: "candidate" },
    { label: "Achievements", value: "achievement" },
    { label: "Billing", value: "billing" },
    { label: "System", value: "system" },
];

/* --- Page ----------------------------------------------------------------- */

export default function NotificationsOne() {
    const mainRef = useRef<HTMLElement>(null);
    const [notifications, setNotifications] = useState(mockNotifications);
    const [filter, setFilter] = useState<NotificationType | "all">("all");

    const unreadCount = notifications.filter((n) => !n.read).length;
    const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);

    const markAsRead = (id: number) => {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    };
    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };
    const deleteNotification = (id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    useGSAP(() => {
        if (!mainRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (s: string) => mainRef.current!.querySelectorAll(s);
        const $1 = (s: string) => mainRef.current!.querySelector(s);
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo($1(".notif-kicker"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 })
          .fromTo($(".notif-title-word"), { opacity: 0, y: 60, rotateX: 30 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.1 }, "-=0.3")
          .fromTo($1(".notif-desc"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4")
          .fromTo($1(".notif-content"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");
    }, { scope: mainRef });

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* Header */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10" style={{ clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)" }} />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="max-w-3xl">
                            <p className="notif-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">Activity</p>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-4">
                                <span className="notif-title-word inline-block opacity-0">Your</span>{" "}
                                <span className="notif-title-word inline-block opacity-0 text-primary">notifications.</span>
                            </h1>
                            <p className="notif-desc text-base text-neutral-content/50 max-w-xl opacity-0">
                                Stay on top of placements, messages, and marketplace activity.
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1.5 bg-primary/20 text-primary text-sm font-bold">{unreadCount} unread</div>
                                <button onClick={markAllRead} className="btn btn-sm btn-ghost border-neutral-content/20 text-neutral-content">
                                    <i className="fa-duotone fa-regular fa-check-double" /> Mark all read
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="bg-base-200 border-b border-base-300">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex gap-0 overflow-x-auto">
                        {filterOptions.map((f) => {
                            const count = f.value === "all" ? notifications.length : notifications.filter((n) => n.type === f.value).length;
                            return (
                                <button key={f.value} onClick={() => setFilter(f.value)}
                                    className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${filter === f.value ? "border-primary text-primary" : "border-transparent text-base-content/40 hover:text-base-content/60"}`}>
                                    {f.label}
                                    <span className={`text-[10px] px-1.5 py-0.5 font-bold ${filter === f.value ? "bg-primary/10 text-primary" : "bg-base-300 text-base-content/30"}`}>{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Notifications List */}
            <section className="notif-content opacity-0 container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <div className="max-w-3xl mx-auto">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-base-200 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-bell-slash text-2xl text-base-content/20" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">No notifications</h3>
                            <p className="text-sm text-base-content/40">Nothing here yet. Check back later.</p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {filtered.map((n) => (
                                <div key={n.id}
                                    className={`flex items-start gap-4 p-5 border-b border-base-300 transition-all group ${!n.read ? "bg-primary/[0.03] border-l-4 border-l-primary" : "hover:bg-base-200/50"}`}>
                                    {/* Icon */}
                                    <div className={`w-10 h-10 ${n.iconBg} flex items-center justify-center flex-shrink-0`}>
                                        <i className={`${n.icon} ${n.iconColor}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-1">
                                            <h3 className={`text-sm ${!n.read ? "font-bold" : "font-semibold"}`}>{n.title}</h3>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-[10px] text-base-content/30 whitespace-nowrap">{n.time}</span>
                                                {!n.read && <div className="w-2 h-2 bg-primary flex-shrink-0" />}
                                            </div>
                                        </div>
                                        <p className="text-sm text-base-content/50 leading-relaxed mb-2 line-clamp-2">{n.description}</p>

                                        <div className="flex items-center gap-2">
                                            {n.action && (
                                                <button className="text-xs text-primary font-semibold hover:underline">{n.action}</button>
                                            )}
                                            <div className="hidden group-hover:flex items-center gap-1 ml-auto">
                                                {!n.read && (
                                                    <button onClick={() => markAsRead(n.id)} className="btn btn-ghost btn-xs text-[10px]">
                                                        <i className="fa-duotone fa-regular fa-check" /> Mark read
                                                    </button>
                                                )}
                                                <button onClick={() => deleteNotification(n.id)} className="btn btn-ghost btn-xs text-[10px] text-error">
                                                    <i className="fa-duotone fa-regular fa-trash" /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Summary */}
                    {filtered.length > 0 && (
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-base-300">
                            <span className="text-sm text-base-content/40">Showing {filtered.length} notification{filtered.length !== 1 ? "s" : ""}</span>
                            <button className="text-xs text-error font-semibold hover:underline">Clear all read notifications</button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
