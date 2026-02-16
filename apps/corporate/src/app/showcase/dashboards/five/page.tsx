import type { Metadata } from "next";
import { DashboardFiveAnimator } from "./dashboard-five-animator";
import { DashboardSidebar } from "./dashboard-sidebar";

export const metadata: Metadata = {
    title: "Recruiting Dashboard - Mission Control | Employment Networks",
    description:
        "Real-time recruiting dashboard. Track jobs, applications, placements, and revenue across your entire recruiting operation.",
};

// -- KPI metrics for top row
const kpiMetrics = [
    {
        value: 47,
        suffix: "",
        prefix: "",
        label: "ACTIVE JOBS",
        icon: "fa-duotone fa-regular fa-briefcase",
        color: "text-info",
        borderColor: "border-info/30",
        bgColor: "bg-info/10",
        trend: "+12%",
        trendUp: true,
        trendLabel: "vs last month",
    },
    {
        value: 1234,
        suffix: "",
        prefix: "",
        label: "APPLICATIONS",
        icon: "fa-duotone fa-regular fa-file-lines",
        color: "text-warning",
        borderColor: "border-warning/30",
        bgColor: "bg-warning/10",
        trend: "+23%",
        trendUp: true,
        trendLabel: "vs last month",
    },
    {
        value: 23,
        suffix: "",
        prefix: "",
        label: "PLACEMENTS",
        icon: "fa-duotone fa-regular fa-handshake",
        color: "text-success",
        borderColor: "border-success/30",
        bgColor: "bg-success/10",
        trend: "+8%",
        trendUp: true,
        trendLabel: "vs last month",
    },
    {
        value: 234500,
        suffix: "",
        prefix: "$",
        label: "REVENUE",
        icon: "fa-duotone fa-regular fa-money-bill-trend-up",
        color: "text-accent",
        borderColor: "border-yellow/30",
        bgColor: "bg-accent/10",
        trend: "+18%",
        trendUp: true,
        trendLabel: "vs last month",
    },
];

// -- Applications over time (last 30 days, sampled)
const applicationsOverTime = [
    { day: "Jan 15", value: 28 },
    { day: "Jan 17", value: 35 },
    { day: "Jan 19", value: 22 },
    { day: "Jan 21", value: 42 },
    { day: "Jan 23", value: 38 },
    { day: "Jan 25", value: 55 },
    { day: "Jan 27", value: 48 },
    { day: "Jan 29", value: 62 },
    { day: "Jan 31", value: 45 },
    { day: "Feb 2", value: 58 },
    { day: "Feb 4", value: 72 },
    { day: "Feb 6", value: 65 },
    { day: "Feb 8", value: 80 },
    { day: "Feb 10", value: 74 },
    { day: "Feb 12", value: 88 },
    { day: "Feb 14", value: 92 },
];

// -- Jobs by status (donut chart data)
const jobsByStatus = [
    { label: "Open", count: 22, color: "#38bdf8", percent: 47 },
    { label: "Filled", count: 12, color: "#4ade80", percent: 26 },
    { label: "Pending", count: 8, color: "#fbbf24", percent: 17 },
    { label: "Closed", count: 5, color: "#71717a", percent: 10 },
];

// -- Placements by month (bar chart)
const placementsByMonth = [
    { month: "Sep", value: 8 },
    { month: "Oct", value: 12 },
    { month: "Nov", value: 15 },
    { month: "Dec", value: 10 },
    { month: "Jan", value: 18 },
    { month: "Feb", value: 23 },
];

// -- Activity feed
const activityFeed = [
    {
        id: 1,
        type: "placement",
        icon: "fa-duotone fa-regular fa-handshake",
        color: "text-success",
        bgColor: "bg-success/10",
        title: "Placement confirmed",
        description: "Sarah Chen placed at TechCorp as Senior Engineer",
        time: "12 min ago",
        avatar: "SC",
    },
    {
        id: 2,
        type: "application",
        icon: "fa-duotone fa-regular fa-file-circle-plus",
        color: "text-info",
        bgColor: "bg-info/10",
        title: "New application received",
        description: "Marcus Rivera applied for Product Manager at Finova",
        time: "34 min ago",
        avatar: "MR",
    },
    {
        id: 3,
        type: "job",
        icon: "fa-duotone fa-regular fa-briefcase",
        color: "text-warning",
        bgColor: "bg-warning/10",
        title: "Job posted",
        description: "DataStream Inc. posted Full Stack Developer role",
        time: "1 hr ago",
        avatar: "DS",
    },
    {
        id: 4,
        type: "interview",
        icon: "fa-duotone fa-regular fa-calendar-check",
        color: "text-accent",
        bgColor: "bg-accent/10",
        title: "Interview scheduled",
        description: "Emily Park - Round 2 with NovaTech for UX Lead",
        time: "2 hrs ago",
        avatar: "EP",
    },
    {
        id: 5,
        type: "application",
        icon: "fa-duotone fa-regular fa-file-circle-plus",
        color: "text-info",
        bgColor: "bg-info/10",
        title: "New application received",
        description: "James Wu applied for DevOps Engineer at CloudBase",
        time: "3 hrs ago",
        avatar: "JW",
    },
    {
        id: 6,
        type: "placement",
        icon: "fa-duotone fa-regular fa-handshake",
        color: "text-success",
        bgColor: "bg-success/10",
        title: "Offer accepted",
        description: "Aisha Johnson accepted Data Analyst role at Metrix",
        time: "4 hrs ago",
        avatar: "AJ",
    },
    {
        id: 7,
        type: "job",
        icon: "fa-duotone fa-regular fa-briefcase",
        color: "text-warning",
        bgColor: "bg-warning/10",
        title: "Job updated",
        description: "Quantum Labs increased salary range for ML Engineer",
        time: "5 hrs ago",
        avatar: "QL",
    },
    {
        id: 8,
        type: "recruiter",
        icon: "fa-duotone fa-regular fa-user-tie",
        color: "text-error",
        bgColor: "bg-error/10",
        title: "Recruiter joined",
        description: "Lisa Tran joined the network from West Coast Staffing",
        time: "6 hrs ago",
        avatar: "LT",
    },
];

// -- Quick actions
const quickActions = [
    {
        title: "Post New Job",
        description: "Create a new job listing and broadcast to recruiters",
        icon: "fa-duotone fa-regular fa-circle-plus",
        color: "text-info",
        borderColor: "border-info/20",
        bgColor: "bg-info/10",
        href: "#",
    },
    {
        title: "Review Applications",
        description: "18 new applications need your review",
        icon: "fa-duotone fa-regular fa-inbox",
        color: "text-warning",
        borderColor: "border-warning/20",
        bgColor: "bg-warning/10",
        href: "#",
        badge: "18",
    },
    {
        title: "Message Recruiters",
        description: "3 unread conversations in your inbox",
        icon: "fa-duotone fa-regular fa-comments",
        color: "text-success",
        borderColor: "border-success/20",
        bgColor: "bg-success/10",
        href: "#",
        badge: "3",
    },
    {
        title: "View Reports",
        description: "Monthly performance and analytics reports",
        icon: "fa-duotone fa-regular fa-chart-mixed",
        color: "text-accent",
        borderColor: "border-yellow/20",
        bgColor: "bg-accent/10",
        href: "#",
    },
];

// -- Pipeline data for the table
const pipelineData = [
    {
        role: "Senior Engineer",
        company: "TechCorp",
        candidates: 34,
        stage: "Interviewing",
        stageColor: "text-info",
        stageBg: "bg-info/10",
        daysOpen: 12,
    },
    {
        role: "Product Manager",
        company: "Finova",
        candidates: 22,
        stage: "Screening",
        stageColor: "text-warning",
        stageBg: "bg-warning/10",
        daysOpen: 8,
    },
    {
        role: "UX Lead",
        company: "NovaTech",
        candidates: 15,
        stage: "Final Round",
        stageColor: "text-success",
        stageBg: "bg-success/10",
        daysOpen: 21,
    },
    {
        role: "DevOps Engineer",
        company: "CloudBase",
        candidates: 28,
        stage: "Sourcing",
        stageColor: "text-accent",
        stageBg: "bg-accent/10",
        daysOpen: 3,
    },
    {
        role: "ML Engineer",
        company: "Quantum Labs",
        candidates: 19,
        stage: "Interviewing",
        stageColor: "text-info",
        stageBg: "bg-info/10",
        daysOpen: 15,
    },
    {
        role: "Data Analyst",
        company: "Metrix",
        candidates: 41,
        stage: "Offer",
        stageColor: "text-success",
        stageBg: "bg-success/10",
        daysOpen: 28,
    },
];

// -- Helper to build the SVG area chart path
function buildAreaPath(
    data: typeof applicationsOverTime,
    width: number,
    height: number,
    padding: number,
) {
    const maxVal = Math.max(...data.map((d) => d.value));
    const xStep = (width - padding * 2) / (data.length - 1);

    const points = data.map((d, i) => ({
        x: padding + i * xStep,
        y: height - padding - (d.value / maxVal) * (height - padding * 2),
    }));

    // Build smooth curve
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        linePath += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    // Build fill area (close to bottom)
    const fillPath =
        linePath +
        ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return { linePath, fillPath, points };
}

// -- Helper to build donut chart segments
function buildDonutSegments(data: typeof jobsByStatus) {
    const circumference = 2 * Math.PI * 45; // r=45
    let offset = 0;
    return data.map((item) => {
        const dashLength = (item.percent / 100) * circumference;
        const dashOffset = circumference - dashLength;
        const segment = {
            ...item,
            strokeDasharray: `${dashLength} ${circumference - dashLength}`,
            strokeDashoffset: 0,
            rotation: (offset / 100) * 360 - 90,
            targetOffset: dashOffset,
        };
        offset += item.percent;
        return segment;
    });
}

export default function DashboardFivePage() {
    const areaWidth = 600;
    const areaHeight = 200;
    const areaPadding = 30;
    const { linePath, fillPath, points } = buildAreaPath(
        applicationsOverTime,
        areaWidth,
        areaHeight,
        areaPadding,
    );
    const donutSegments = buildDonutSegments(jobsByStatus);
    const maxPlacement = Math.max(...placementsByMonth.map((d) => d.value));

    return (
        <DashboardSidebar>
            <DashboardFiveAnimator>
                {/* ================================================================
                HEADER - Dashboard Title & Status
               ================================================================ */}
                <section className="dash-header bg-[#09090b] text-[#e5e7eb] pt-8 pb-8 relative overflow-hidden">
                    {/* Scanline overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{
                            backgroundImage:
                                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
                        }}
                    />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-7xl mx-auto">
                            {/* System status bar */}
                            <div className="dash-status flex items-center gap-3 mb-6 opacity-0">
                                <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
                                <span className="font-mono text-xs uppercase tracking-[0.3em] text-success/80">
                                    Dashboard Online
                                </span>
                                <span className="font-mono text-xs text-[#e5e7eb]/30 ml-auto">
                                    v2.4.1 // recruiting-hq
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="dash-headline text-4xl md:text-5xl font-bold leading-tight mb-3 opacity-0">
                                <span className="text-[#e5e7eb]">
                                    Recruiting{" "}
                                </span>
                                <span className="text-info">Dashboard</span>
                            </h1>

                            <p className="dash-subtext text-lg text-[#e5e7eb]/50 mb-10 max-w-2xl font-light opacity-0">
                                Mission control for your entire recruiting
                                operation. Real-time metrics, pipeline
                                visibility, and actionable insights.
                            </p>

                            {/* KPI Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {kpiMetrics.map((kpi, i) => (
                                    <div
                                        key={i}
                                        className={`kpi-card border ${kpi.borderColor} bg-[#18181b]/80 rounded-xl p-5 opacity-0`}
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <div
                                                className={`w-8 h-8 rounded-lg ${kpi.bgColor} flex items-center justify-center`}
                                            >
                                                <i
                                                    className={`${kpi.icon} ${kpi.color} text-sm`}
                                                />
                                            </div>
                                            <span className="font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/40">
                                                {kpi.label}
                                            </span>
                                        </div>
                                        <div
                                            className="kpi-value font-mono text-3xl md:text-4xl font-bold text-[#e5e7eb] mb-2"
                                            data-value={kpi.value}
                                            data-suffix={kpi.suffix}
                                            data-prefix={kpi.prefix}
                                        >
                                            {kpi.prefix}0{kpi.suffix}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`font-mono text-xs ${kpi.trendUp ? "text-success" : "text-error"}`}
                                            >
                                                <i
                                                    className={`fa-solid ${kpi.trendUp ? "fa-arrow-up" : "fa-arrow-down"} text-[10px] mr-1`}
                                                />
                                                {kpi.trend}
                                            </span>
                                            <span className="text-[10px] text-[#e5e7eb]/30">
                                                {kpi.trendLabel}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================================================================
                CHARTS - Data Visualizations
               ================================================================ */}
                <section className="charts-section bg-[#09090b] text-[#e5e7eb] py-16 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="max-w-7xl mx-auto">
                            <div className="charts-heading mb-10 opacity-0">
                                <span className="font-mono text-xs uppercase tracking-[0.3em] text-info/60 block mb-3">
                                    Analytics
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold">
                                    Performance Metrics
                                </h2>
                            </div>

                            <div className="charts-grid grid lg:grid-cols-3 gap-6">
                                {/* Applications Over Time - Area Chart */}
                                <div className="chart-card lg:col-span-2 border border-[#27272a] bg-[#18181b]/60 rounded-xl p-6 opacity-0">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="font-bold text-sm mb-1">
                                                Applications Over Time
                                            </h3>
                                            <span className="font-mono text-[10px] text-[#e5e7eb]/30 uppercase tracking-wider">
                                                Last 30 days
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse" />
                                            <span className="font-mono text-xs text-[#e5e7eb]/40">
                                                Live
                                            </span>
                                        </div>
                                    </div>

                                    <svg
                                        viewBox={`0 0 ${areaWidth} ${areaHeight}`}
                                        className="w-full h-auto"
                                        preserveAspectRatio="xMidYMid meet"
                                    >
                                        {/* Grid lines */}
                                        {[0.25, 0.5, 0.75].map((ratio) => (
                                            <line
                                                key={ratio}
                                                x1={areaPadding}
                                                y1={
                                                    areaPadding +
                                                    ratio *
                                                        (areaHeight -
                                                            areaPadding * 2)
                                                }
                                                x2={areaWidth - areaPadding}
                                                y2={
                                                    areaPadding +
                                                    ratio *
                                                        (areaHeight -
                                                            areaPadding * 2)
                                                }
                                                stroke="#27272a"
                                                strokeWidth="0.5"
                                                strokeDasharray="4 4"
                                            />
                                        ))}

                                        {/* Area fill */}
                                        <path
                                            d={fillPath}
                                            className="area-chart-fill"
                                            fill="#38bdf8"
                                            fillOpacity="0.08"
                                        />

                                        {/* Line */}
                                        <path
                                            d={linePath}
                                            className="area-chart-line"
                                            fill="none"
                                            stroke="#38bdf8"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />

                                        {/* Data points */}
                                        {points.map((p, i) => (
                                            <circle
                                                key={i}
                                                cx={p.x}
                                                cy={p.y}
                                                r="3"
                                                fill="#09090b"
                                                stroke="#38bdf8"
                                                strokeWidth="1.5"
                                            />
                                        ))}

                                        {/* X-axis labels (show every 4th) */}
                                        {applicationsOverTime.map((d, i) =>
                                            i % 4 === 0 ? (
                                                <text
                                                    key={i}
                                                    x={points[i].x}
                                                    y={areaHeight - 8}
                                                    fill="#71717a"
                                                    fontSize="9"
                                                    textAnchor="middle"
                                                    fontFamily="monospace"
                                                >
                                                    {d.day}
                                                </text>
                                            ) : null,
                                        )}
                                    </svg>
                                </div>

                                {/* Jobs by Status - Donut Chart */}
                                <div className="chart-card border border-[#27272a] bg-[#18181b]/60 rounded-xl p-6 opacity-0">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="font-bold text-sm mb-1">
                                                Jobs by Status
                                            </h3>
                                            <span className="font-mono text-[10px] text-[#e5e7eb]/30 uppercase tracking-wider">
                                                Current distribution
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center mb-6">
                                        <svg
                                            viewBox="0 0 120 120"
                                            className="w-40 h-40"
                                        >
                                            {donutSegments.map((seg, i) => (
                                                <circle
                                                    key={i}
                                                    className="donut-segment"
                                                    cx="60"
                                                    cy="60"
                                                    r="45"
                                                    fill="none"
                                                    stroke={seg.color}
                                                    strokeWidth="10"
                                                    strokeDasharray={
                                                        seg.strokeDasharray
                                                    }
                                                    strokeLinecap="round"
                                                    data-target-offset={
                                                        seg.targetOffset
                                                    }
                                                    transform={`rotate(${seg.rotation} 60 60)`}
                                                />
                                            ))}
                                            {/* Center text */}
                                            <text
                                                x="60"
                                                y="56"
                                                fill="#e5e7eb"
                                                fontSize="18"
                                                fontWeight="bold"
                                                textAnchor="middle"
                                                fontFamily="monospace"
                                            >
                                                47
                                            </text>
                                            <text
                                                x="60"
                                                y="70"
                                                fill="#71717a"
                                                fontSize="8"
                                                textAnchor="middle"
                                                fontFamily="monospace"
                                            >
                                                TOTAL JOBS
                                            </text>
                                        </svg>
                                    </div>

                                    {/* Legend */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {jobsByStatus.map((item, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2"
                                            >
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            item.color,
                                                    }}
                                                />
                                                <span className="text-xs text-[#e5e7eb]/60">
                                                    {item.label}
                                                </span>
                                                <span className="font-mono text-xs text-[#e5e7eb]/80 ml-auto">
                                                    {item.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Placements by Month - Bar Chart */}
                            <div className="chart-card border border-[#27272a] bg-[#18181b]/60 rounded-xl p-6 mt-6 opacity-0">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="font-bold text-sm mb-1">
                                            Placements by Month
                                        </h3>
                                        <span className="font-mono text-[10px] text-[#e5e7eb]/30 uppercase tracking-wider">
                                            6-month trend
                                        </span>
                                    </div>
                                    <div className="font-mono text-sm text-success">
                                        <i className="fa-solid fa-arrow-up text-[10px] mr-1" />
                                        +44% overall
                                    </div>
                                </div>

                                <div className="flex items-end gap-4 h-48">
                                    {placementsByMonth.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 flex flex-col items-center gap-2"
                                        >
                                            <span className="font-mono text-xs text-[#e5e7eb]/60">
                                                {item.value}
                                            </span>
                                            <div className="w-full relative flex-1 flex items-end">
                                                <div
                                                    className="chart-bar w-full rounded-t-md bg-success/80"
                                                    style={{
                                                        height: `${(item.value / maxPlacement) * 100}%`,
                                                        transformOrigin:
                                                            "bottom",
                                                    }}
                                                />
                                            </div>
                                            <span className="font-mono text-[10px] text-[#e5e7eb]/40 uppercase">
                                                {item.month}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================================================================
                ACTIVITY FEED & QUICK ACTIONS - Side by side
               ================================================================ */}
                <section className="activity-section bg-[#0a0a0c] text-[#e5e7eb] py-16 overflow-hidden relative">
                    {/* Subtle scanline overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.02]"
                        style={{
                            backgroundImage:
                                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
                        }}
                    />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid lg:grid-cols-5 gap-8">
                                {/* Activity Feed - Takes more space */}
                                <div className="lg:col-span-3">
                                    <div className="activity-heading mb-8 opacity-0">
                                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-warning/60 block mb-3">
                                            Live Feed
                                        </span>
                                        <h2 className="text-3xl md:text-4xl font-bold">
                                            Recent Activity
                                        </h2>
                                    </div>

                                    <div className="activity-list space-y-3 max-h-[560px] overflow-y-auto pr-2 scrollbar-thin">
                                        {activityFeed.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="activity-item flex items-start gap-4 border border-[#27272a] bg-[#18181b]/60 rounded-xl p-4 opacity-0"
                                            >
                                                {/* Avatar */}
                                                <div
                                                    className={`w-10 h-10 rounded-lg ${activity.bgColor} flex items-center justify-center flex-shrink-0`}
                                                >
                                                    <span
                                                        className={`font-mono text-xs font-bold ${activity.color}`}
                                                    >
                                                        {activity.avatar}
                                                    </span>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <i
                                                            className={`${activity.icon} ${activity.color} text-xs`}
                                                        />
                                                        <span className="font-bold text-sm truncate">
                                                            {activity.title}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[#e5e7eb]/50 truncate">
                                                        {activity.description}
                                                    </p>
                                                </div>

                                                {/* Time */}
                                                <span className="font-mono text-[10px] text-[#e5e7eb]/30 flex-shrink-0 whitespace-nowrap">
                                                    {activity.time}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="actions-section lg:col-span-2">
                                    <div className="actions-heading mb-8 opacity-0">
                                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-success/60 block mb-3">
                                            Command Center
                                        </span>
                                        <h2 className="text-3xl md:text-4xl font-bold">
                                            Quick Actions
                                        </h2>
                                    </div>

                                    <div className="actions-grid space-y-4">
                                        {quickActions.map((action, i) => (
                                            <a
                                                key={i}
                                                href={action.href}
                                                className={`action-card flex items-start gap-4 border ${action.borderColor} bg-[#18181b]/60 rounded-xl p-5 opacity-0 hover:bg-[#1f1f23] transition-colors group`}
                                            >
                                                <div
                                                    className={`w-11 h-11 rounded-lg ${action.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                                                >
                                                    <i
                                                        className={`${action.icon} ${action.color} text-lg`}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-sm">
                                                            {action.title}
                                                        </span>
                                                        {action.badge && (
                                                            <span className="font-mono text-[10px] bg-error/20 text-error px-2 py-0.5 rounded-full">
                                                                {action.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-[#e5e7eb]/50">
                                                        {action.description}
                                                    </p>
                                                </div>
                                                <i className="fa-solid fa-chevron-right text-xs text-[#e5e7eb]/20 group-hover:text-[#e5e7eb]/50 transition-colors mt-1" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================================================================
                PIPELINE TABLE - Active Job Pipelines
               ================================================================ */}
                <section className="pipeline-section bg-[#09090b] text-[#e5e7eb] py-16 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="max-w-7xl mx-auto">
                            <div className="pipeline-heading mb-10 opacity-0">
                                <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent/60 block mb-3">
                                    Pipeline Monitor
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold">
                                    Active Pipelines
                                </h2>
                            </div>

                            <div className="pipeline-table border border-[#27272a] bg-[#18181b]/60 rounded-xl overflow-hidden">
                                {/* Table header */}
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#27272a] bg-[#18181b]">
                                    <div className="col-span-4 font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/40">
                                        Role / Company
                                    </div>
                                    <div className="col-span-2 font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/40 text-center">
                                        Candidates
                                    </div>
                                    <div className="col-span-3 font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/40">
                                        Stage
                                    </div>
                                    <div className="col-span-2 font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/40 text-center">
                                        Days Open
                                    </div>
                                    <div className="col-span-1 font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/40 text-right">
                                        Action
                                    </div>
                                </div>

                                {/* Table rows */}
                                {pipelineData.map((row, i) => (
                                    <div
                                        key={i}
                                        className="pipeline-row grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#27272a]/50 last:border-0 hover:bg-[#1f1f23]/50 transition-colors opacity-0"
                                    >
                                        <div className="col-span-4">
                                            <div className="font-bold text-sm">
                                                {row.role}
                                            </div>
                                            <div className="text-xs text-[#e5e7eb]/40">
                                                {row.company}
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-center">
                                            <span className="font-mono text-sm">
                                                {row.candidates}
                                            </span>
                                        </div>
                                        <div className="col-span-3 flex items-center">
                                            <span
                                                className={`font-mono text-xs px-3 py-1 rounded-full ${row.stageBg} ${row.stageColor}`}
                                            >
                                                {row.stage}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-center">
                                            <span className="font-mono text-sm text-[#e5e7eb]/60">
                                                {row.daysOpen}d
                                            </span>
                                        </div>
                                        <div className="col-span-1 flex items-center justify-end">
                                            <button className="w-8 h-8 rounded-lg bg-[#27272a]/50 flex items-center justify-center hover:bg-info/20 hover:text-info transition-colors text-[#e5e7eb]/40">
                                                <i className="fa-solid fa-arrow-right text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================================================================
                FOOTER CTA - Get Started
               ================================================================ */}
                <section className="cta-section bg-[#09090b] text-[#e5e7eb] py-20 overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-info/20" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 border border-[#27272a] rounded-full px-4 py-2 mb-8">
                                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                <span className="font-mono text-xs uppercase tracking-wider text-[#e5e7eb]/50">
                                    All systems operational
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Your recruiting{" "}
                                <span className="text-info">
                                    command center
                                </span>{" "}
                                awaits
                            </h2>

                            <p className="text-lg text-[#e5e7eb]/50 mb-10 max-w-xl mx-auto">
                                Get real-time visibility into every pipeline,
                                placement, and revenue stream across your
                                network.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="https://splits.network/sign-up"
                                    className="btn btn-info btn-lg font-mono uppercase tracking-wider"
                                >
                                    <i className="fa-duotone fa-regular fa-rocket" />
                                    Get Started Free
                                </a>
                                <a
                                    href="#"
                                    className="btn btn-outline border-[#27272a] text-[#e5e7eb]/70 btn-lg font-mono uppercase tracking-wider hover:bg-[#18181b] hover:border-info/50 hover:text-info"
                                >
                                    <i className="fa-duotone fa-regular fa-play" />
                                    Watch Demo
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </DashboardFiveAnimator>
        </DashboardSidebar>
    );
}
