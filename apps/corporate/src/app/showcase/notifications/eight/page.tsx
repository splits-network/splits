"use client";

import { useRef, useState, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const BG = {
  deep: "#0a1628",
  mid: "#0d1d33",
  card: "#0f2847",
  dark: "#081220",
  input: "#0b1a2e",
};

const D = { fast: 0.3, normal: 0.6, hero: 1.0, build: 1.4 };
const E = { smooth: "power2.out", bounce: "back.out(1.2)", elastic: "elastic.out(1, 0.5)" };
const S = { tight: 0.05, normal: 0.1, loose: 0.15 };

type NotifType = "match" | "message" | "application" | "system" | "payment" | "team";

interface Notification {
  id: number;
  type: NotifType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  avatar?: string;
  action?: string;
}

const TYPE_CONFIG: Record<NotifType, { icon: string; color: string; bgColor: string; borderColor: string; label: string }> = {
  match: { icon: "fa-bullseye-arrow", color: "text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/20", label: "Match" },
  message: { icon: "fa-comment", color: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20", label: "Message" },
  application: { icon: "fa-file-lines", color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20", label: "Application" },
  system: { icon: "fa-gear", color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20", label: "System" },
  payment: { icon: "fa-credit-card", color: "text-green-400", bgColor: "bg-green-500/10", borderColor: "border-green-500/20", label: "Payment" },
  team: { icon: "fa-users", color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20", label: "Team" },
};

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, type: "match", title: "New candidate match", description: "Sarah Chen (96% match) for Senior Frontend Engineer at TechCorp", time: "2 min ago", read: false, avatar: "SC", action: "View Match" },
  { id: 2, type: "message", title: "New message from Marcus Rivera", description: "Hey, I wanted to discuss the split-fee arrangement for the DevOps role...", time: "15 min ago", read: false, avatar: "MR", action: "Reply" },
  { id: 3, type: "application", title: "Application status updated", description: "Emily Watson's application for Cloud Architect moved to Interview stage", time: "1 hour ago", read: false, avatar: "EW", action: "View Application" },
  { id: 4, type: "payment", title: "Payment received", description: "Placement fee of $12,500 received for James Park - Product Manager at InnovateCo", time: "2 hours ago", read: true, action: "View Invoice" },
  { id: 5, type: "team", title: "Team member joined", description: "Aisha Patel accepted your invitation and joined your team as a Member", time: "3 hours ago", read: true, avatar: "AP" },
  { id: 6, type: "match", title: "3 new matches found", description: "Based on your expertise in Technology recruiting, we found 3 new potential matches", time: "5 hours ago", read: true, action: "View All" },
  { id: 7, type: "system", title: "Scheduled maintenance", description: "Platform maintenance scheduled for Feb 15, 2026 at 2:00 AM PST. Expected downtime: 30 minutes.", time: "6 hours ago", read: true },
  { id: 8, type: "application", title: "New application received", description: "David Kim applied for Backend Engineer role at DataFlow Inc.", time: "8 hours ago", read: true, avatar: "DK", action: "Review" },
  { id: 9, type: "message", title: "Message from Rachel Torres", description: "Thanks for the recommendation! I'll follow up with the candidate tomorrow.", time: "12 hours ago", read: true, avatar: "RT" },
  { id: 10, type: "payment", title: "Invoice generated", description: "Invoice #INV-2026-0214 generated for February placement fees - $37,500", time: "1 day ago", read: true, action: "Download" },
  { id: 11, type: "system", title: "New feature: AI Matching v2", description: "We've launched improved AI matching with 15% better accuracy. Try it out on your next search.", time: "1 day ago", read: true, action: "Learn More" },
  { id: 12, type: "team", title: "Role permission updated", description: "Your role was updated to Manager by admin Sarah Chen", time: "2 days ago", read: true },
  { id: 13, type: "match", title: "Match expired", description: "The match for Senior DevOps at CloudScale has expired. The position has been filled.", time: "2 days ago", read: true },
  { id: 14, type: "message", title: "Group message", description: "Alex Nguyen started a group conversation about the Q1 placement targets", time: "3 days ago", read: true, avatar: "AN" },
];

export default function NotificationsEightPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | NotifType>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useGSAP(() => {
    if (!containerRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: E.smooth } });
    tl.from(".notif-header", { opacity: 0, y: -20, duration: D.normal })
      .from(".notif-controls", { opacity: 0, y: 10, duration: D.fast }, "-=0.3")
      .from(".notif-item", { opacity: 0, x: -20, duration: D.fast, stagger: S.tight }, "-=0.2");
  }, { scope: containerRef });

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = useMemo(() => {
    let data = [...notifications];
    if (filter !== "all") data = data.filter(n => n.type === filter);
    if (showUnreadOnly) data = data.filter(n => !n.read);
    return data;
  }, [notifications, filter, showUnreadOnly]);

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div ref={containerRef} className="min-h-screen text-white" style={{ background: BG.deep }}>
      {/* Blueprint Grid Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Corner Dimension Marks */}
      <div className="fixed top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-500/20 z-50" />
      <div className="fixed top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/20 z-50" />
      <div className="fixed bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-500/20 z-50" />
      <div className="fixed bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-500/20 z-50" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="notif-header flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border border-cyan-500/30 flex items-center justify-center relative" style={{ background: BG.card }}>
              <i className="fa-duotone fa-regular fa-bell text-cyan-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold text-white" style={{ background: "#22d3ee" }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <p className="text-white/40 font-mono text-xs tracking-wider uppercase">
                // {unreadCount > 0 ? `${unreadCount} UNREAD` : "ALL CAUGHT UP"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="px-3 py-2 rounded border border-cyan-500/20 font-mono text-xs text-cyan-400 hover:bg-cyan-500/10 transition-colors flex items-center gap-2" style={{ background: BG.card }}>
                <i className="fa-duotone fa-regular fa-check-double" />
                Mark all read
              </button>
            )}
            <button className="px-3 py-2 rounded border border-cyan-500/20 font-mono text-xs text-white/50 hover:text-white/70 transition-colors flex items-center gap-2" style={{ background: BG.card }}>
              <i className="fa-duotone fa-regular fa-gear" />
              Settings
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="notif-controls flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "match", "message", "application", "payment", "team", "system"] as const).map(f => {
              const isAll = f === "all";
              const config = isAll ? null : TYPE_CONFIG[f];
              const count = isAll ? notifications.length : notifications.filter(n => n.type === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded font-mono text-xs transition-colors flex items-center gap-1.5 ${
                    filter === f
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-400"
                      : "border border-cyan-500/10 text-white/40 hover:text-white/60"
                  }`}
                  style={filter !== f ? { background: BG.input } : {}}
                >
                  {config && <i className={`fa-duotone fa-regular ${config.icon} text-[10px]`} />}
                  {isAll ? "All" : config!.label}
                  <span className="text-[10px] opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`px-3 py-1.5 rounded font-mono text-xs transition-colors flex items-center gap-1.5 ${
                showUnreadOnly
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-400"
                  : "border border-cyan-500/10 text-white/40 hover:text-white/60"
              }`}
              style={!showUnreadOnly ? { background: BG.input } : {}}
            >
              <i className="fa-duotone fa-regular fa-filter text-[10px]" />
              Unread only
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-cyan-500/10" style={{ background: BG.card }}>
              <i className="fa-duotone fa-regular fa-bell-slash text-cyan-400/20 text-4xl mb-4 block" />
              <p className="text-white/50 font-mono text-sm">No notifications to show</p>
              <p className="text-white/30 font-mono text-xs mt-1">
                {showUnreadOnly ? "No unread notifications" : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notif => {
              const config = TYPE_CONFIG[notif.type];
              return (
                <div
                  key={notif.id}
                  className={`notif-item group flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                    notif.read
                      ? "border-cyan-500/10 hover:border-cyan-500/20"
                      : "border-cyan-500/25 hover:border-cyan-500/35"
                  }`}
                  style={{ background: notif.read ? BG.card : BG.mid }}
                  onClick={() => markAsRead(notif.id)}
                >
                  {/* Unread Dot + Icon */}
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${config.bgColor} ${config.borderColor}`}>
                      {notif.avatar ? (
                        <span className={`font-mono text-xs font-bold ${config.color}`}>{notif.avatar}</span>
                      ) : (
                        <i className={`fa-duotone fa-regular ${config.icon} ${config.color} text-sm`} />
                      )}
                    </div>
                    {!notif.read && (
                      <span className="absolute -top-1 -left-1 w-3 h-3 rounded-full border-2" style={{ background: "#22d3ee", borderColor: BG.deep }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-sm ${notif.read ? "text-white/70" : "text-white font-medium"} truncate`}>
                            {notif.title}
                          </p>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${config.bgColor} ${config.color} ${config.borderColor} border shrink-0`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-white/40 text-xs font-mono truncate">{notif.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-white/30 text-xs font-mono whitespace-nowrap">{notif.time}</span>
                        <button
                          onClick={e => { e.stopPropagation(); deleteNotification(notif.id); }}
                          className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                        >
                          <i className="fa-duotone fa-regular fa-xmark text-xs" />
                        </button>
                      </div>
                    </div>
                    {notif.action && (
                      <button className="mt-2 px-3 py-1 rounded text-xs font-mono text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/10 transition-colors">
                        {notif.action}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-8 grid grid-cols-3 sm:grid-cols-6 gap-3">
          {(Object.entries(TYPE_CONFIG) as [NotifType, typeof TYPE_CONFIG[NotifType]][]).map(([type, config]) => {
            const count = notifications.filter(n => n.type === type).length;
            const unread = notifications.filter(n => n.type === type && !n.read).length;
            return (
              <div
                key={type}
                className="rounded-lg border border-cyan-500/10 p-3 text-center"
                style={{ background: BG.card }}
              >
                <i className={`fa-duotone fa-regular ${config.icon} ${config.color} text-lg mb-1 block opacity-50`} />
                <p className="text-white font-mono text-lg font-bold">{count}</p>
                <p className="text-white/40 text-[10px] font-mono uppercase">{config.label}</p>
                {unread > 0 && (
                  <span className="text-[10px] font-mono text-cyan-400">{unread} new</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
