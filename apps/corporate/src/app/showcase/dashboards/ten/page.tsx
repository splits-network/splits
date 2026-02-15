"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── sidebar nav items ─── */

const sidebarItems = [
  { icon: "fa-grid-2", label: "Dashboard", href: "#", active: true },
  { icon: "fa-briefcase", label: "Roles", href: "#" },
  { icon: "fa-user-tie", label: "Recruiters", href: "#" },
  { icon: "fa-users", label: "Candidates", href: "#" },
  { icon: "fa-building", label: "Companies", href: "#" },
  { icon: "fa-file-lines", label: "Applications", href: "#" },
  { icon: "fa-comments", label: "Messages", href: "#", badge: 3 },
  { icon: "fa-handshake", label: "Placements", href: "#" },
];

/* ─── mock data ─── */

const kpis = [
  {
    icon: "fa-briefcase",
    label: "Active Jobs",
    value: 47,
    formatted: "47",
    trend: +12,
    trendLabel: "vs last month",
  },
  {
    icon: "fa-file-lines",
    label: "Applications",
    value: 1234,
    formatted: "1,234",
    trend: +8.3,
    trendLabel: "vs last month",
  },
  {
    icon: "fa-handshake",
    label: "Placements",
    value: 23,
    formatted: "23",
    trend: +4,
    trendLabel: "vs last month",
  },
  {
    icon: "fa-dollar-sign",
    label: "Revenue",
    value: 234500,
    formatted: "$234,500",
    trend: +15.2,
    trendLabel: "vs last month",
  },
];

const applicationsOverTime = [
  { day: "Jan 15", value: 28 },
  { day: "Jan 16", value: 35 },
  { day: "Jan 17", value: 22 },
  { day: "Jan 18", value: 41 },
  { day: "Jan 19", value: 38 },
  { day: "Jan 20", value: 50 },
  { day: "Jan 21", value: 45 },
  { day: "Jan 22", value: 32 },
  { day: "Jan 23", value: 58 },
  { day: "Jan 24", value: 42 },
  { day: "Jan 25", value: 65 },
  { day: "Jan 26", value: 55 },
  { day: "Jan 27", value: 48 },
  { day: "Jan 28", value: 72 },
  { day: "Jan 29", value: 60 },
  { day: "Jan 30", value: 68 },
  { day: "Feb 01", value: 75 },
  { day: "Feb 02", value: 62 },
  { day: "Feb 03", value: 80 },
  { day: "Feb 04", value: 71 },
  { day: "Feb 05", value: 85 },
  { day: "Feb 06", value: 78 },
  { day: "Feb 07", value: 92 },
  { day: "Feb 08", value: 88 },
  { day: "Feb 09", value: 76 },
  { day: "Feb 10", value: 95 },
  { day: "Feb 11", value: 83 },
  { day: "Feb 12", value: 90 },
  { day: "Feb 13", value: 98 },
  { day: "Feb 14", value: 105 },
];

const jobsByStatus = [
  { label: "Open", value: 18, color: "oklch(var(--s))" },
  { label: "Filled", value: 12, color: "oklch(var(--su))" },
  { label: "Pending", value: 9, color: "oklch(var(--wa))" },
  { label: "Closed", value: 8, color: "oklch(var(--bc) / 0.3)" },
];

const placementsByMonth = [
  { month: "Sep", value: 8 },
  { month: "Oct", value: 12 },
  { month: "Nov", value: 15 },
  { month: "Dec", value: 10 },
  { month: "Jan", value: 18 },
  { month: "Feb", value: 23 },
];

const activityFeed = [
  {
    id: 1,
    type: "placement",
    icon: "fa-handshake",
    message: "Placement confirmed for Senior React Developer at TechCorp",
    user: "Sarah Chen",
    initials: "SC",
    time: "12 min ago",
  },
  {
    id: 2,
    type: "application",
    icon: "fa-file-circle-plus",
    message: "New application received for DevOps Engineer position",
    user: "System",
    initials: "SY",
    time: "28 min ago",
  },
  {
    id: 3,
    type: "job",
    icon: "fa-plus-circle",
    message: "New job posted: Staff Backend Engineer - $180k-$220k",
    user: "Marcus Webb",
    initials: "MW",
    time: "1 hr ago",
  },
  {
    id: 4,
    type: "split",
    icon: "fa-split",
    message: "Split agreement accepted on Product Manager role - 50/50",
    user: "Lisa Park",
    initials: "LP",
    time: "2 hr ago",
  },
  {
    id: 5,
    type: "application",
    icon: "fa-file-circle-plus",
    message: "3 new applications for Full Stack Developer position",
    user: "System",
    initials: "SY",
    time: "3 hr ago",
  },
  {
    id: 6,
    type: "placement",
    icon: "fa-handshake",
    message: "Placement confirmed for Data Scientist at AnalyticsPro",
    user: "James Rodriguez",
    initials: "JR",
    time: "4 hr ago",
  },
  {
    id: 7,
    type: "job",
    icon: "fa-plus-circle",
    message: "Job updated: Senior Designer - increased budget to $160k",
    user: "Sarah Chen",
    initials: "SC",
    time: "5 hr ago",
  },
  {
    id: 8,
    type: "split",
    icon: "fa-split",
    message: "New split proposal received for ML Engineer role - 60/40",
    user: "Alex Kim",
    initials: "AK",
    time: "6 hr ago",
  },
];

const quickActions = [
  {
    icon: "fa-plus-circle",
    title: "Post New Job",
    description: "Create and publish a new position to the network",
    accent: "primary",
  },
  {
    icon: "fa-inbox",
    title: "Review Applications",
    description: "12 applications awaiting review",
    accent: "secondary",
  },
  {
    icon: "fa-comments",
    title: "Message Recruiters",
    description: "3 unread conversations",
    accent: "accent",
  },
  {
    icon: "fa-chart-line",
    title: "View Analytics",
    description: "Full performance breakdown",
    accent: "primary",
  },
];

/* ─── chart components ─── */

function AreaChart({
  data,
}: {
  data: { day: string; value: number }[];
}) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const padding = { top: 20, right: 10, bottom: 30, left: 40 };
  const w = 600;
  const h = 220;
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - (d.value / maxVal) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => {
    const y = padding.top + chartH - pct * chartH;
    const val = Math.round(pct * maxVal);
    return { y, val };
  });

  const labelIndices = [0, Math.floor(data.length / 4), Math.floor(data.length / 2), Math.floor((3 * data.length) / 4), data.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* grid lines */}
      {gridLines.map((gl) => (
        <g key={gl.val}>
          <line
            x1={padding.left}
            y1={gl.y}
            x2={w - padding.right}
            y2={gl.y}
            stroke="currentColor"
            strokeOpacity={0.06}
            strokeDasharray="4 4"
          />
          <text x={padding.left - 6} y={gl.y + 3} textAnchor="end" className="fill-base-content/30" fontSize="9" fontFamily="monospace">
            {gl.val}
          </text>
        </g>
      ))}

      {/* x-axis labels */}
      {labelIndices.map((idx) => (
        <text
          key={idx}
          x={points[idx].x}
          y={h - 6}
          textAnchor="middle"
          className="fill-base-content/30"
          fontSize="8"
          fontFamily="monospace"
        >
          {data[idx].day}
        </text>
      ))}

      {/* area fill */}
      <path d={areaPath} fill="oklch(var(--p) / 0.1)" />

      {/* line */}
      <path d={linePath} fill="none" stroke="oklch(var(--p))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* endpoint dot */}
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill="oklch(var(--p))" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="7" fill="oklch(var(--p) / 0.3)" />
    </svg>
  );
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 72;
  const innerR = 50;

  let cumulative = 0;
  const segments = data.map((d) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);

    const path = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    return { ...d, path };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-36 h-36 flex-shrink-0">
        {segments.map((seg) => (
          <path key={seg.label} d={seg.path} fill={seg.color} stroke="oklch(var(--b3))" strokeWidth="2" />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-base-content" fontSize="22" fontWeight="bold" fontFamily="monospace">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="fill-base-content/40" fontSize="8" fontFamily="monospace">
          TOTAL JOBS
        </text>
      </svg>
      <div className="space-y-2.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="font-mono text-xs text-base-content/50">{d.label}</span>
            <span className="font-mono text-xs font-bold text-base-content">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: { month: string; value: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const padding = { top: 15, right: 10, bottom: 28, left: 32 };
  const w = 400;
  const h = 200;
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const barWidth = chartW / data.length - 8;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => {
    const y = padding.top + chartH - pct * chartH;
    const val = Math.round(pct * maxVal);
    return { y, val };
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* grid */}
      {gridLines.map((gl) => (
        <g key={gl.val}>
          <line x1={padding.left} y1={gl.y} x2={w - padding.right} y2={gl.y} stroke="currentColor" strokeOpacity={0.06} strokeDasharray="4 4" />
          <text x={padding.left - 6} y={gl.y + 3} textAnchor="end" className="fill-base-content/30" fontSize="9" fontFamily="monospace">
            {gl.val}
          </text>
        </g>
      ))}

      {/* bars */}
      {data.map((d, i) => {
        const barH = (d.value / maxVal) * chartH;
        const x = padding.left + (i * chartW) / data.length + 4;
        const y = padding.top + chartH - barH;
        const isLast = i === data.length - 1;
        return (
          <g key={d.month}>
            <rect x={x} y={y} width={barWidth} height={barH} fill={isLast ? "oklch(var(--p))" : "oklch(var(--p) / 0.4)"} />
            <text x={x + barWidth / 2} y={h - 8} textAnchor="middle" className="fill-base-content/30" fontSize="9" fontFamily="monospace">
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── main component ─── */

export default function DashboardTen() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useGSAP(
    () => {
      if (!mainRef.current) return;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;

      /* ── header boot sequence ── */
      const headerTl = gsap.timeline({ defaults: { ease: "power2.out" } });
      headerTl
        .fromTo(".header-scanline", { scaleX: 0 }, { scaleX: 1, duration: 0.6 })
        .fromTo(".header-title span", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.2")
        .fromTo(".header-subtitle", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.1");

      /* ── KPI cards stagger ── */
      gsap.fromTo(
        ".kpi-card",
        { opacity: 0, y: 30, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: ".kpi-row", start: "top 85%" },
        }
      );

      /* ── status dots pulse ── */
      gsap.fromTo(
        ".kpi-dot",
        { scale: 0.6, opacity: 0.4 },
        { scale: 1, opacity: 1, duration: 1.2, repeat: -1, yoyo: true, stagger: 0.3, ease: "sine.inOut" }
      );

      /* ── chart panels ── */
      gsap.fromTo(
        ".chart-panel",
        { opacity: 0, y: 40, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: ".charts-grid", start: "top 80%" },
        }
      );

      /* ── activity items slide in ── */
      gsap.fromTo(
        ".activity-item",
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: ".activity-section", start: "top 80%" },
        }
      );

      /* ── quick action cards ── */
      gsap.fromTo(
        ".action-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: ".actions-grid", start: "top 85%" },
        }
      );

      /* ── sidebar nav items stagger ── */
      gsap.fromTo(
        ".sidebar-nav-item",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.06,
          ease: "power2.out",
          delay: 0.3,
        }
      );
    },
    { scope: mainRef }
  );

  /* ─── sidebar content (shared between mobile overlay & desktop fixed) ─── */
  const sidebarContent = (
    <aside className="w-64 h-full bg-base-200 border-r border-base-content/5 flex flex-col">
      {/* Sidebar header */}
      <div className="p-5 border-b border-base-content/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            <i className="fa-duotone fa-regular fa-terminal text-sm" />
          </div>
          <div>
            <p className="font-mono text-sm font-bold tracking-tight">Splits</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30">
              Mission Control
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-base-content/20 px-3 mb-3">
          // navigation
        </p>
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setSidebarOpen(false);
                }}
                className={`sidebar-nav-item flex items-center gap-3 px-3 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors duration-200 ${
                  item.active
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-base-content/40 hover:text-base-content/70 hover:bg-base-300/50 border-l-2 border-transparent"
                }`}
              >
                <i className={`fa-duotone fa-regular ${item.icon} w-4 text-center`} />
                <span className="flex-1">{item.label}</span>
                {item.active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
                {item.badge && (
                  <span className="font-mono text-[10px] font-bold bg-primary text-primary-content px-1.5 py-0.5 leading-none">
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar footer */}
      <div className="p-4 border-t border-base-content/5">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 font-mono text-xs font-bold">
            SC
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs font-bold text-base-content/70 truncate">Sarah Chen</p>
            <p className="font-mono text-[10px] text-base-content/30 truncate">Admin</p>
          </div>
          <button className="text-base-content/20 hover:text-base-content/50 transition-colors">
            <i className="fa-duotone fa-regular fa-gear text-sm" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div ref={mainRef} className="min-h-screen bg-base-300 text-base-content overflow-x-hidden flex">
      {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-base-300/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar panel */}
          <div className="relative z-10 h-full w-64">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* ═══ DESKTOP SIDEBAR (fixed) ═══ */}
      <div className="hidden lg:block flex-shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 min-w-0">
        {/* ═══ HEADER ═══ */}
        <section className="relative px-6 pt-8 pb-8">
          {/* Background grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Mobile hamburger + scanline row */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center bg-base-200 border border-base-content/5 text-base-content/50 hover:text-primary hover:border-primary/20 transition-colors"
              >
                <i className="fa-duotone fa-regular fa-bars text-sm" />
              </button>
              <div className="header-scanline h-[2px] bg-primary w-32 origin-left" />
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-2">
              <div>
                <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3 opacity-80">
                  sys.dashboard &gt; mission_control v2.0
                </p>
                <h1 className="header-title text-4xl md:text-5xl font-black tracking-tight leading-[0.95]">
                  <span className="inline">Mission </span>
                  <span className="text-primary">Control</span>
                </h1>
                <p className="header-subtitle text-base-content/40 font-mono text-sm mt-2">
                  Real-time recruiting operations dashboard
                </p>
              </div>

              {/* Tab switcher */}
              <div className="flex gap-1 bg-base-200 p-1 border border-base-content/5 self-start md:self-auto">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`font-mono text-xs uppercase tracking-wider px-4 py-2 transition-colors ${
                    activeTab === "overview" ? "bg-primary text-primary-content" : "text-base-content/40 hover:text-base-content/60"
                  }`}
                >
                  <i className="fa-duotone fa-regular fa-grid-2 mr-2" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`font-mono text-xs uppercase tracking-wider px-4 py-2 transition-colors ${
                    activeTab === "activity" ? "bg-primary text-primary-content" : "text-base-content/40 hover:text-base-content/60"
                  }`}
                >
                  <i className="fa-duotone fa-regular fa-signal-stream mr-2" />
                  Activity
                </button>
              </div>
            </div>

            {/* System status bar */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-4 text-base-content/20">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="font-mono text-[10px] uppercase tracking-wider">All Systems Operational</span>
              </div>
              <span className="hidden md:inline text-base-content/10">|</span>
              <span className="font-mono text-[10px] uppercase tracking-wider">Last sync: 12s ago</span>
              <span className="hidden md:inline text-base-content/10">|</span>
              <span className="font-mono text-[10px] uppercase tracking-wider">Region: US-East</span>
            </div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-6 right-6 w-10 h-10 border-r-2 border-t-2 border-primary/20" />
        </section>

      {/* ═══ KPI CARDS ═══ */}
      <section className="kpi-row px-6 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div
              key={kpi.label}
              className="kpi-card relative p-6 bg-base-200 border border-base-content/5 hover:border-primary/20 transition-colors duration-300 group"
            >
              {/* Index number */}
              <span className="absolute top-3 right-3 font-mono text-xs text-base-content/10">
                {String(idx + 1).padStart(2, "0")}
              </span>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
                  <i className={`fa-duotone fa-regular ${kpi.icon} text-lg`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/40 mb-1">{kpi.label}</p>
                  <p className="font-mono text-3xl font-black text-base-content tracking-tight">{kpi.formatted}</p>
                </div>
              </div>

              {/* Trend indicator */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-base-content/5">
                <span className="kpi-dot w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                <span className={`font-mono text-xs font-bold ${kpi.trend > 0 ? "text-success" : "text-error"}`}>
                  {kpi.trend > 0 ? "+" : ""}
                  {kpi.trend}%
                </span>
                <span className="font-mono text-[10px] text-base-content/30">{kpi.trendLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CHARTS SECTION ═══ */}
      <section className="charts-grid px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-2">
              // data.visualization
            </p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Performance Metrics</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications Over Time */}
            <div className="chart-panel p-6 bg-base-200 border border-base-content/5 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-mono text-sm font-bold tracking-tight">Applications Over Time</h3>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30 mt-1">Last 30 days</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-success">live</span>
                </div>
              </div>
              <div className="h-56">
                <AreaChart data={applicationsOverTime} />
              </div>
            </div>

            {/* Jobs by Status */}
            <div className="chart-panel p-6 bg-base-200 border border-base-content/5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-mono text-sm font-bold tracking-tight">Jobs by Status</h3>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30 mt-1">Current distribution</p>
                </div>
                <span className="font-mono text-xs text-base-content/20">01</span>
              </div>
              <div className="flex items-center justify-center py-4">
                <DonutChart data={jobsByStatus} />
              </div>
            </div>

            {/* Placements by Month */}
            <div className="chart-panel p-6 bg-base-200 border border-base-content/5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-mono text-sm font-bold tracking-tight">Placements by Month</h3>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30 mt-1">6-month trend</p>
                </div>
                <span className="font-mono text-xs text-base-content/20">02</span>
              </div>
              <div className="h-48">
                <BarChart data={placementsByMonth} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ACTIVITY FEED + QUICK ACTIONS ═══ */}
      <section className="activity-section px-6 py-6 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-base-200 border border-base-content/5">
            <div className="p-6 border-b border-base-content/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-1">
                    // activity.feed
                  </p>
                  <h3 className="text-lg font-bold tracking-tight">Recent Activity</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="kpi-dot w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-success">streaming</span>
                </div>
              </div>
            </div>
            <div className="max-h-[480px] overflow-y-auto">
              {activityFeed.map((item) => (
                <div
                  key={item.id}
                  className="activity-item flex items-start gap-4 p-4 border-b border-base-content/5 hover:bg-base-300/50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 flex-shrink-0 font-mono text-xs font-bold">
                    {item.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <i className={`fa-duotone fa-regular ${item.icon} text-primary/60 text-sm mt-0.5`} />
                      <p className="text-sm text-base-content/70 leading-relaxed">{item.message}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="font-mono text-[10px] font-bold text-base-content/40">{item.user}</span>
                      <span className="text-base-content/10">|</span>
                      <span className="font-mono text-[10px] text-base-content/25">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="actions-grid space-y-4">
            <div className="mb-4">
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-1">
                // quick.actions
              </p>
              <h3 className="text-lg font-bold tracking-tight">Command Center</h3>
            </div>

            {quickActions.map((action) => (
              <button
                key={action.title}
                className="action-card w-full text-left p-5 bg-base-200 border border-base-content/5 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <i className={`fa-duotone fa-regular ${action.icon} text-lg`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-mono text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-xs text-base-content/40 mt-0.5">{action.description}</p>
                  </div>
                  <i className="fa-duotone fa-regular fa-arrow-right text-base-content/10 group-hover:text-primary/50 transition-colors mt-1" />
                </div>
              </button>
            ))}

            {/* System Status Widget */}
            <div className="p-5 bg-base-200 border border-base-content/5 mt-6">
              <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30 mb-3">System Status</p>
              <div className="space-y-2.5">
                {[
                  { label: "API Gateway", status: "online" },
                  { label: "Job Pipeline", status: "online" },
                  { label: "Payment Engine", status: "online" },
                  { label: "Notification Bus", status: "online" },
                ].map((sys) => (
                  <div key={sys.label} className="flex items-center justify-between">
                    <span className="font-mono text-xs text-base-content/50">{sys.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-success">{sys.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER BAR ═══ */}
      <section className="px-6 py-6 border-t border-base-content/10 bg-base-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-base-content/20">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="font-mono text-[10px] uppercase tracking-wider">All Systems Operational</span>
            </div>
            <span className="text-base-content/10">|</span>
            <span className="font-mono text-[10px] uppercase tracking-wider">Splits Network // Mission Control</span>
          </div>
          <span className="font-mono text-[10px] text-base-content/15 uppercase tracking-wider">
            Dashboard v2.0 // {new Date().getFullYear()}
          </span>
        </div>
      </section>
      </main>
    </div>
  );
}
