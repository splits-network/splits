"use client";

import { useState, useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── types ─── */

interface Notification {
  id: string;
  type: "message" | "application" | "placement" | "system" | "payment" | "network";
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: string;
  color: string;
  group: "today" | "yesterday" | "this-week" | "older";
}

/* ─── data ─── */

const typeConfig: Record<string, { label: string; icon: string }> = {
  message: { label: "Messages", icon: "fa-envelope" },
  application: { label: "Applications", icon: "fa-file-lines" },
  placement: { label: "Placements", icon: "fa-clipboard-check" },
  system: { label: "System", icon: "fa-gear" },
  payment: { label: "Payments", icon: "fa-money-bill-transfer" },
  network: { label: "Network", icon: "fa-chart-network" },
};

const initialNotifications: Notification[] = [
  { id: "n1", type: "message", title: "New message from Marcus Chen", description: "Hey Katherine, I have 3 strong candidates for the VP Eng role at Cortex AI. Want to schedule a sync?", time: "12 min ago", read: false, icon: "fa-envelope", color: "primary", group: "today" },
  { id: "n2", type: "application", title: "Candidate submitted for Senior SWE", description: "Rachel Chen has been submitted to Nexus Dynamics by TechFlow Partners via split-fee agreement.", time: "45 min ago", read: false, icon: "fa-user-plus", color: "primary", group: "today" },
  { id: "n3", type: "placement", title: "Placement confirmed!", description: "Tom Nguyen has been placed as Backend Engineer at Pipeline Co. Commission: $19,500. Split: 50/50.", time: "2 hours ago", read: false, icon: "fa-circle-check", color: "success", group: "today" },
  { id: "n4", type: "payment", title: "Payment received - $24,000", description: "Split-fee payment for placement PLC-001 (Rachel Chen → Nexus Dynamics) has been processed.", time: "3 hours ago", read: false, icon: "fa-money-bill-transfer", color: "success", group: "today" },
  { id: "n5", type: "system", title: "Weekly digest ready", description: "Your weekly recruiting performance report is ready to view. 3 placements, 12 submissions, $63,500 in fees.", time: "5 hours ago", read: true, icon: "fa-chart-simple", color: "primary", group: "today" },
  { id: "n6", type: "network", title: "New partner request", description: "Summit Talent Group wants to connect with you on the Splits Network for executive search collaboration.", time: "Yesterday at 4:30 PM", read: true, icon: "fa-handshake", color: "primary", group: "yesterday" },
  { id: "n7", type: "application", title: "Interview feedback received", description: "J. Martinez from Nexus Dynamics submitted feedback on Priya Sharma. Rating: 4/5. Proceeding to final round.", time: "Yesterday at 11:00 AM", read: true, icon: "fa-comment-check", color: "primary", group: "yesterday" },
  { id: "n8", type: "message", title: "Message from Sarah Kim", description: "The client wants to increase the salary range for the DevOps role. Updated to $175K-$200K. Can you update the listing?", time: "Yesterday at 9:15 AM", read: true, icon: "fa-envelope", color: "primary", group: "yesterday" },
  { id: "n9", type: "system", title: "Account security update", description: "Two-factor authentication has been enabled on your account. All sessions are now secured.", time: "Mon, Feb 10", read: true, icon: "fa-shield-check", color: "warning", group: "this-week" },
  { id: "n10", type: "placement", title: "Placement anniversary - 1 year", description: "Emma Brown has been at DataVault for 1 year. Retention milestone achieved. Great placement!", time: "Mon, Feb 10", read: true, icon: "fa-cake-candles", color: "success", group: "this-week" },
  { id: "n11", type: "network", title: "Recruiter joined your network", description: "Alex Rivera from Horizon Staffing has joined your network. Specialization: Full-Stack Engineering.", time: "Sun, Feb 9", read: true, icon: "fa-link", color: "primary", group: "this-week" },
  { id: "n12", type: "payment", title: "Invoice generated - PLC-006", description: "Invoice #INV-2847 for $19,500 has been generated for placement PLC-006. Payment due in 30 days.", time: "Sat, Feb 8", read: true, icon: "fa-file-invoice-dollar", color: "primary", group: "this-week" },
];

const groupLabels: Record<string, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "this-week": "This Week",
  older: "Older",
};

/* ─── component ─── */

export default function NotificationsShowcaseTen() {
  const mainRef = useRef<HTMLElement>(null);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");

  useGSAP(() => {
    if (!mainRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(".notif-scanline", { scaleX: 0 }, { scaleX: 1, duration: 0.6 })
      .fromTo(".notif-header", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
      .fromTo(".notif-item", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04 }, "-=0.2");
    gsap.fromTo(".status-pulse", { scale: 0.6, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, { scope: mainRef });

  const filtered = useMemo(() => {
    let data = [...notifications];
    if (typeFilter) data = data.filter(n => n.type === typeFilter);
    if (statusFilter === "unread") data = data.filter(n => !n.read);
    if (statusFilter === "read") data = data.filter(n => n.read);
    return data;
  }, [notifications, typeFilter, statusFilter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const grouped = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    for (const n of filtered) {
      if (!groups[n.group]) groups[n.group] = [];
      groups[n.group].push(n);
    }
    return groups;
  }, [filtered]);

  const toggleRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const deleteNotif = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <main ref={mainRef} className="min-h-screen bg-base-300 text-base-content overflow-x-hidden">
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="fixed top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-primary/30 pointer-events-none z-10" />

      {/* Header */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-6">
        <div className="notif-scanline h-[2px] bg-primary w-32 mb-6 origin-left" />
        <div className="notif-header flex items-start justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3 opacity-80">sys.notifications &gt; activity_feed v2.0</p>
            <h1 className="text-3xl font-black tracking-tight">
              Notifications
              {unreadCount > 0 && <span className="ml-3 px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary font-mono text-sm align-middle">{unreadCount}</span>}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn btn-ghost btn-sm font-mono uppercase tracking-wider text-[10px]">
                <i className="fa-duotone fa-regular fa-check-double mr-1" /> Mark All Read
              </button>
            )}
            <button className="btn btn-ghost btn-sm font-mono uppercase tracking-wider text-[10px]">
              <i className="fa-duotone fa-regular fa-gear mr-1" /> Settings
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="flex gap-1">
            {(["all", "unread", "read"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                statusFilter === s ? "bg-primary/10 border-primary/20 text-primary" : "bg-base-200 border-base-content/10 text-base-content/30"
              }`}>{s}</button>
            ))}
          </div>

          <span className="text-base-content/10">|</span>

          {/* Type filter */}
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setTypeFilter("")} className={`px-2 py-1 font-mono text-[10px] uppercase tracking-wider border transition-colors ${
              !typeFilter ? "bg-primary/10 border-primary/20 text-primary" : "bg-base-200 border-base-content/10 text-base-content/30"
            }`}>All</button>
            {Object.entries(typeConfig).map(([key, cfg]) => (
              <button key={key} onClick={() => setTypeFilter(typeFilter === key ? "" : key)} className={`px-2 py-1 font-mono text-[10px] uppercase tracking-wider border transition-colors flex items-center gap-1 ${
                typeFilter === key ? "bg-primary/10 border-primary/20 text-primary" : "bg-base-200 border-base-content/10 text-base-content/30"
              }`}>
                <i className={`fa-duotone fa-regular ${cfg.icon} text-[9px]`} /> {cfg.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications List */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 flex items-center justify-center bg-base-content/5 text-base-content/15 border border-base-content/10 mx-auto mb-4">
              <i className="fa-duotone fa-regular fa-bell-slash text-2xl" />
            </div>
            <h3 className="text-lg font-bold mb-2">No Notifications</h3>
            <p className="text-sm text-base-content/30 mb-6">
              {statusFilter === "unread" ? "All caught up! No unread notifications." : "No notifications match your current filters."}
            </p>
            <button onClick={() => { setTypeFilter(""); setStatusFilter("all"); }} className="btn btn-outline btn-sm font-mono uppercase tracking-wider text-[10px]">
              <i className="fa-duotone fa-regular fa-filter-circle-xmark mr-1" /> Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {["today", "yesterday", "this-week", "older"].map(group => {
              const items = grouped[group];
              if (!items || items.length === 0) return null;
              return (
                <div key={group}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-base-content/25">{groupLabels[group]}</span>
                    <div className="flex-1 h-[1px] bg-base-content/5" />
                  </div>
                  <div className="space-y-1">
                    {items.map(notif => (
                      <div key={notif.id} className={`notif-item group flex items-start gap-4 p-4 border transition-colors cursor-pointer ${
                        notif.read ? "bg-base-200 border-base-content/5 hover:border-base-content/10" : "bg-base-200 border-l-2 border-l-primary border-t border-r border-b border-base-content/5 hover:border-base-content/10"
                      }`}>
                        {/* Icon */}
                        <div className={`w-9 h-9 flex items-center justify-center border flex-shrink-0 ${
                          notif.color === "success" ? "bg-success/10 border-success/20 text-success" :
                          notif.color === "warning" ? "bg-warning/10 border-warning/20 text-warning" :
                          "bg-primary/10 border-primary/20 text-primary"
                        }`}>
                          <i className={`fa-duotone fa-regular ${notif.icon} text-xs`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className={`text-sm truncate ${notif.read ? "text-base-content/50" : "font-bold"}`}>{notif.title}</p>
                                {!notif.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                              </div>
                              <p className="text-xs text-base-content/30 leading-relaxed line-clamp-2">{notif.description}</p>
                            </div>
                            <span className="font-mono text-[10px] text-base-content/20 whitespace-nowrap flex-shrink-0">{notif.time}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); toggleRead(notif.id); }} className="btn btn-ghost btn-xs btn-square" title={notif.read ? "Mark unread" : "Mark read"}>
                            <i className={`fa-duotone fa-regular ${notif.read ? "fa-envelope" : "fa-envelope-open"} text-[10px] text-base-content/30`} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }} className="btn btn-ghost btn-xs btn-square" title="Delete">
                            <i className="fa-duotone fa-regular fa-trash text-[10px] text-base-content/20 hover:text-error" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="py-10 px-6 border-t border-base-content/10 bg-base-200">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-8 text-base-content/20">
          <div className="flex items-center gap-2"><span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" /><span className="font-mono text-[10px] uppercase tracking-wider">Notification System Operational</span></div>
          <span className="text-base-content/10">|</span><span className="font-mono text-[10px] uppercase tracking-wider">Splits Network // Component Showcase</span>
        </div>
      </section>
    </main>
  );
}
