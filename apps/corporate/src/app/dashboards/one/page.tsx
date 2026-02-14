"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Mock Data ───────────────────────────────────────────────────────────── */

const kpis = [
    {
        label: "Active Jobs",
        value: "47",
        trend: "+12%",
        trendUp: true,
        icon: "fa-duotone fa-regular fa-briefcase",
        color: "primary",
    },
    {
        label: "Applications",
        value: "1,234",
        trend: "+8.3%",
        trendUp: true,
        icon: "fa-duotone fa-regular fa-file-lines",
        color: "secondary",
    },
    {
        label: "Placements",
        value: "23",
        trend: "+4",
        trendUp: true,
        icon: "fa-duotone fa-regular fa-user-check",
        color: "accent",
    },
    {
        label: "Revenue",
        value: "$234,500",
        trend: "+18.2%",
        trendUp: true,
        icon: "fa-duotone fa-regular fa-dollar-sign",
        color: "success",
    },
];

const applicationsOverTime = [
    { day: "Jan 15", count: 28 },
    { day: "Jan 16", count: 35 },
    { day: "Jan 17", count: 22 },
    { day: "Jan 18", count: 41 },
    { day: "Jan 19", count: 38 },
    { day: "Jan 20", count: 15 },
    { day: "Jan 21", count: 12 },
    { day: "Jan 22", count: 45 },
    { day: "Jan 23", count: 52 },
    { day: "Jan 24", count: 48 },
    { day: "Jan 25", count: 61 },
    { day: "Jan 26", count: 55 },
    { day: "Jan 27", count: 18 },
    { day: "Jan 28", count: 14 },
    { day: "Jan 29", count: 58 },
    { day: "Jan 30", count: 63 },
    { day: "Jan 31", count: 72 },
    { day: "Feb 1", count: 68 },
    { day: "Feb 2", count: 75 },
    { day: "Feb 3", count: 22 },
    { day: "Feb 4", count: 19 },
    { day: "Feb 5", count: 81 },
    { day: "Feb 6", count: 77 },
    { day: "Feb 7", count: 85 },
    { day: "Feb 8", count: 90 },
    { day: "Feb 9", count: 82 },
    { day: "Feb 10", count: 25 },
    { day: "Feb 11", count: 21 },
    { day: "Feb 12", count: 88 },
    { day: "Feb 13", count: 95 },
];

const jobsByStatus = [
    { status: "Open", count: 24, color: "oklch(var(--p))" },
    { status: "Filled", count: 12, color: "oklch(var(--su))" },
    { status: "Pending", count: 7, color: "oklch(var(--wa))" },
    { status: "Closed", count: 4, color: "oklch(var(--bc) / 0.3)" },
];

const placementsByMonth = [
    { month: "Sep", count: 3 },
    { month: "Oct", count: 5 },
    { month: "Nov", count: 4 },
    { month: "Dec", count: 6 },
    { month: "Jan", count: 8 },
    { month: "Feb", count: 5 },
];

const revenueTrend = [
    { month: "Aug", revenue: 18200, placements: 2 },
    { month: "Sep", revenue: 28500, placements: 3 },
    { month: "Oct", revenue: 42100, placements: 5 },
    { month: "Nov", revenue: 35800, placements: 4 },
    { month: "Dec", revenue: 51200, placements: 6 },
    { month: "Jan", revenue: 68400, placements: 8 },
    { month: "Feb", revenue: 42300, placements: 5 },
];

const topRecruiters = [
    { name: "Sarah Kim", initials: "SK", placements: 8, revenue: 68400 },
    { name: "Marcus Chen", initials: "MC", placements: 6, revenue: 51200 },
    { name: "David Park", initials: "DP", placements: 5, revenue: 42300 },
    { name: "Lisa Monroe", initials: "LM", placements: 4, revenue: 35800 },
    { name: "James Rivera", initials: "JR", placements: 3, revenue: 28500 },
];

const applicationFunnel = [
    { stage: "Applications", count: 1234, pct: 100 },
    { stage: "Screened", count: 847, pct: 68.6 },
    { stage: "Interviewed", count: 312, pct: 25.3 },
    { stage: "Offered", count: 58, pct: 4.7 },
    { stage: "Placed", count: 23, pct: 1.9 },
];

const hiringPipeline = [
    { stage: "Sourcing", engineering: 12, sales: 8, marketing: 4, design: 3 },
    { stage: "Screening", engineering: 9, sales: 6, marketing: 3, design: 2 },
    { stage: "Interview", engineering: 5, sales: 4, marketing: 2, design: 2 },
    { stage: "Offer", engineering: 2, sales: 2, marketing: 1, design: 1 },
    { stage: "Hired", engineering: 1, sales: 1, marketing: 1, design: 0 },
];

const geoDistribution = [
    { location: "New York", count: 142 },
    { location: "San Francisco", count: 118 },
    { location: "Austin", count: 95 },
    { location: "Chicago", count: 78 },
    { location: "Remote", count: 234 },
    { location: "London", count: 62 },
    { location: "Toronto", count: 48 },
];

const timeToHire = [
    { role: "Engineering", avgDays: 34, benchmark: 42 },
    { role: "Sales", avgDays: 28, benchmark: 35 },
    { role: "Marketing", avgDays: 22, benchmark: 30 },
    { role: "Design", avgDays: 31, benchmark: 38 },
    { role: "Product", avgDays: 38, benchmark: 45 },
];

const activityFeed = [
    { type: "job_posted", title: "Senior React Developer posted", user: "Sarah K.", initials: "SK", time: "12 min ago", icon: "fa-duotone fa-regular fa-plus-circle", iconColor: "text-primary" },
    { type: "application", title: "New application for DevOps Engineer", user: "Marcus C.", initials: "MC", time: "34 min ago", icon: "fa-duotone fa-regular fa-file-lines", iconColor: "text-secondary" },
    { type: "placement", title: "Placement confirmed - Full Stack Engineer", user: "David P.", initials: "DP", time: "1 hr ago", icon: "fa-duotone fa-regular fa-handshake", iconColor: "text-success" },
    { type: "application", title: "3 new applications for Product Manager", user: "Lisa M.", initials: "LM", time: "2 hrs ago", icon: "fa-duotone fa-regular fa-file-lines", iconColor: "text-secondary" },
    { type: "job_posted", title: "Data Scientist role published", user: "James R.", initials: "JR", time: "3 hrs ago", icon: "fa-duotone fa-regular fa-plus-circle", iconColor: "text-primary" },
    { type: "placement", title: "Placement confirmed - UX Designer", user: "Anna W.", initials: "AW", time: "5 hrs ago", icon: "fa-duotone fa-regular fa-handshake", iconColor: "text-success" },
    { type: "application", title: "New application for Backend Engineer", user: "Tom B.", initials: "TB", time: "6 hrs ago", icon: "fa-duotone fa-regular fa-file-lines", iconColor: "text-secondary" },
    { type: "job_posted", title: "Marketing Lead role published", user: "Rachel G.", initials: "RG", time: "8 hrs ago", icon: "fa-duotone fa-regular fa-plus-circle", iconColor: "text-primary" },
];

const quickActions = [
    { label: "Post New Job", description: "Create and publish a new job listing to the marketplace", icon: "fa-duotone fa-regular fa-plus-circle", color: "primary" },
    { label: "Review Applications", description: "Screen and manage incoming candidate applications", icon: "fa-duotone fa-regular fa-inbox", color: "secondary" },
    { label: "Message Recruiters", description: "Communicate with your connected recruiting network", icon: "fa-duotone fa-regular fa-paper-plane", color: "accent" },
];

const sidebarNav = [
    { label: "Dashboard", icon: "fa-duotone fa-regular fa-grid-2", active: true },
    { label: "Roles", icon: "fa-duotone fa-regular fa-briefcase", active: false },
    { label: "Recruiters", icon: "fa-duotone fa-regular fa-user-tie", active: false },
    { label: "Candidates", icon: "fa-duotone fa-regular fa-users", active: false },
    { label: "Companies", icon: "fa-duotone fa-regular fa-building", active: false },
    { label: "Applications", icon: "fa-duotone fa-regular fa-file-lines", active: false },
    { label: "Messages", icon: "fa-duotone fa-regular fa-paper-plane", active: false },
    { label: "Placements", icon: "fa-duotone fa-regular fa-handshake", active: false },
];

/* ─── SVG Helpers ─────────────────────────────────────────────────────────── */

/** Build a smooth cubic-bezier spline through a set of points */
function smoothPath(points: { x: number; y: number }[]): string {
    if (points.length < 2) return "";
    const d: string[] = [`M ${points[0].x} ${points[0].y}`];
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(i - 1, 0)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(i + 2, points.length - 1)];
        const tension = 0.3;
        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = p1.y + (p2.y - p0.y) * tension;
        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = p2.y - (p3.y - p1.y) * tension;
        d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
    }
    return d.join(" ");
}

function formatCurrency(n: number): string {
    if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
    return `$${n}`;
}

/* ─── Chart Components ────────────────────────────────────────────────────── */

function AreaChart({ data }: { data: typeof applicationsOverTime }) {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const max = Math.max(...data.map((d) => d.count));
    const w = 640;
    const h = 220;
    const pl = 40;
    const pr = 16;
    const pt = 16;
    const pb = 28;
    const chartW = w - pl - pr;
    const chartH = h - pt - pb;

    const points = data.map((d, i) => ({
        x: pl + (i / (data.length - 1)) * chartW,
        y: pt + chartH - (d.count / max) * chartH,
    }));

    const line = smoothPath(points);
    const area = `${line} L ${points[points.length - 1].x} ${h - pb} L ${points[0].x} ${h - pb} Z`;

    const gridValues = [0, 25, 50, 75, 100];

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(var(--p))" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="oklch(var(--p))" stopOpacity="0.02" />
                </linearGradient>
            </defs>
            {/* Y-axis grid lines and labels */}
            {gridValues.map((v, i) => {
                const yy = pt + chartH - (v / max) * chartH;
                return (
                    <g key={i}>
                        <line x1={pl} y1={yy} x2={w - pr} y2={yy} stroke="oklch(var(--bc) / 0.06)" strokeWidth="1" />
                        <text x={pl - 6} y={yy + 3} textAnchor="end" fontSize="9" className="fill-base-content/40" fontFamily="system-ui">{v}</text>
                    </g>
                );
            })}
            {/* X-axis labels (every 7th) */}
            {data.filter((_, i) => i % 7 === 0 || i === data.length - 1).map((d, _, arr) => {
                const idx = data.indexOf(d);
                const xx = pl + (idx / (data.length - 1)) * chartW;
                return (
                    <text key={d.day} x={xx} y={h - 6} textAnchor="middle" fontSize="9" className="fill-base-content/40" fontFamily="system-ui">{d.day}</text>
                );
            })}
            {/* Area fill */}
            <path d={area} fill="url(#areaGrad)" />
            {/* Line */}
            <path d={line} fill="none" stroke="oklch(var(--p))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Interactive hover columns */}
            {points.map((p, i) => (
                <g key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
                    <rect x={p.x - chartW / data.length / 2} y={pt} width={chartW / data.length} height={chartH} fill="transparent" />
                    {hoverIdx === i && (
                        <>
                            <line x1={p.x} y1={pt} x2={p.x} y2={h - pb} stroke="oklch(var(--p) / 0.3)" strokeWidth="1" strokeDasharray="3 3" />
                            <circle cx={p.x} cy={p.y} r="5" fill="oklch(var(--b1))" stroke="oklch(var(--p))" strokeWidth="2.5" />
                            <rect x={p.x - 28} y={p.y - 26} width="56" height="20" rx="4" fill="oklch(var(--n))" />
                            <text x={p.x} y={p.y - 13} textAnchor="middle" fontSize="10" fontWeight="700" fill="oklch(var(--nc))" fontFamily="system-ui">{data[i].count}</text>
                        </>
                    )}
                </g>
            ))}
            {/* Dots on key points */}
            {points.filter((_, i) => i % 7 === 0 || i === points.length - 1).map((p, i) => (
                <circle key={`dot-${i}`} cx={p.x} cy={p.y} r="3" fill="oklch(var(--p))" />
            ))}
        </svg>
    );
}

function DonutChart({ data }: { data: typeof jobsByStatus }) {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const size = 200;
    const cx = size / 2;
    const cy = size / 2;
    const outerR = 88;
    const innerR = 58;
    const gap = 1.5; // degrees gap between segments

    let cumAngle = -90;

    const segments = data.map((d, idx) => {
        const fullAngle = (d.count / total) * 360;
        const angle = fullAngle - gap;
        const startAngle = cumAngle + gap / 2;
        const endAngle = startAngle + angle;
        cumAngle += fullAngle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        const largeArc = angle > 180 ? 1 : 0;

        const oR = hoverIdx === idx ? outerR + 4 : outerR;
        const iR = hoverIdx === idx ? innerR - 2 : innerR;

        const path = [
            `M ${cx + oR * Math.cos(startRad)} ${cy + oR * Math.sin(startRad)}`,
            `A ${oR} ${oR} 0 ${largeArc} 1 ${cx + oR * Math.cos(endRad)} ${cy + oR * Math.sin(endRad)}`,
            `L ${cx + iR * Math.cos(endRad)} ${cy + iR * Math.sin(endRad)}`,
            `A ${iR} ${iR} 0 ${largeArc} 0 ${cx + iR * Math.cos(startRad)} ${cy + iR * Math.sin(startRad)}`,
            "Z",
        ].join(" ");

        return { ...d, path, pct: ((d.count / total) * 100).toFixed(1), idx };
    });

    return (
        <div className="flex items-center gap-8">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
                {segments.map((s) => (
                    <path
                        key={s.idx}
                        d={s.path}
                        fill={s.color}
                        className="transition-all duration-200 cursor-pointer"
                        style={{ opacity: hoverIdx !== null && hoverIdx !== s.idx ? 0.5 : 1 }}
                        onMouseEnter={() => setHoverIdx(s.idx)}
                        onMouseLeave={() => setHoverIdx(null)}
                    />
                ))}
                <text x={cx} y={cy - 6} textAnchor="middle" fontSize="28" fontWeight="900" className="fill-base-content" fontFamily="system-ui">
                    {total}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" className="fill-base-content/40" fontFamily="system-ui">
                    Total Jobs
                </text>
            </svg>
            <div className="space-y-3 min-w-[120px]">
                {data.map((d, i) => (
                    <div
                        key={i}
                        className={`flex items-center gap-3 text-sm transition-opacity duration-200 cursor-default ${hoverIdx !== null && hoverIdx !== i ? "opacity-40" : ""}`}
                        onMouseEnter={() => setHoverIdx(i)}
                        onMouseLeave={() => setHoverIdx(null)}
                    >
                        <span className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: d.color }}></span>
                        <span className="text-base-content/70 flex-1">{d.status}</span>
                        <span className="font-bold text-base-content tabular-nums">{d.count}</span>
                        <span className="text-base-content/40 text-xs tabular-nums w-10 text-right">
                            {((d.count / total) * 100).toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BarChart({ data }: { data: typeof placementsByMonth }) {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const max = Math.max(...data.map((d) => d.count));

    return (
        <div className="flex items-end gap-4 h-48 px-2">
            {data.map((d, i) => {
                const heightPct = (d.count / max) * 100;
                const isHovered = hoverIdx === i;
                return (
                    <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-2 cursor-default"
                        onMouseEnter={() => setHoverIdx(i)}
                        onMouseLeave={() => setHoverIdx(null)}
                    >
                        <span className={`text-xs font-bold tabular-nums transition-colors duration-200 ${isHovered ? "text-primary" : "text-base-content"}`}>
                            {d.count}
                        </span>
                        <div
                            className={`w-full transition-all duration-300 ${isHovered ? "bg-primary" : "bg-primary/70"}`}
                            style={{ height: `${heightPct}%`, minHeight: "4px" }}
                        ></div>
                        <span className={`text-xs transition-colors duration-200 ${isHovered ? "text-base-content font-semibold" : "text-base-content/50"}`}>
                            {d.month}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

/* ─── NEW: Revenue Trend (Dual-Axis Line Chart) ──────────────────────────── */

function RevenueTrendChart({ data }: { data: typeof revenueTrend }) {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const maxRev = Math.max(...data.map((d) => d.revenue));
    const maxP = Math.max(...data.map((d) => d.placements));
    const w = 640;
    const h = 220;
    const pl = 50;
    const pr = 40;
    const pt = 16;
    const pb = 28;
    const chartW = w - pl - pr;
    const chartH = h - pt - pb;

    const revPoints = data.map((d, i) => ({
        x: pl + (i / (data.length - 1)) * chartW,
        y: pt + chartH - (d.revenue / maxRev) * chartH,
    }));
    const plcPoints = data.map((d, i) => ({
        x: pl + (i / (data.length - 1)) * chartW,
        y: pt + chartH - (d.placements / maxP) * chartH,
    }));

    const revLine = smoothPath(revPoints);
    const plcLine = smoothPath(plcPoints);
    const revArea = `${revLine} L ${revPoints[revPoints.length - 1].x} ${h - pb} L ${revPoints[0].x} ${h - pb} Z`;

    const yTicks = [0, 0.25, 0.5, 0.75, 1];

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(var(--su))" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="oklch(var(--su))" stopOpacity="0.01" />
                </linearGradient>
            </defs>
            {/* Grid + Y-axis left (Revenue) */}
            {yTicks.map((pct, i) => {
                const yy = pt + chartH * (1 - pct);
                return (
                    <g key={i}>
                        <line x1={pl} y1={yy} x2={w - pr} y2={yy} stroke="oklch(var(--bc) / 0.06)" strokeWidth="1" />
                        <text x={pl - 6} y={yy + 3} textAnchor="end" fontSize="9" className="fill-base-content/40" fontFamily="system-ui">
                            {formatCurrency(Math.round(maxRev * pct))}
                        </text>
                    </g>
                );
            })}
            {/* Y-axis right (Placements) */}
            {yTicks.map((pct, i) => {
                const yy = pt + chartH * (1 - pct);
                return (
                    <text key={`r-${i}`} x={w - pr + 6} y={yy + 3} textAnchor="start" fontSize="9" className="fill-base-content/40" fontFamily="system-ui">
                        {Math.round(maxP * pct)}
                    </text>
                );
            })}
            {/* X-axis labels */}
            {data.map((d, i) => (
                <text key={d.month} x={pl + (i / (data.length - 1)) * chartW} y={h - 6} textAnchor="middle" fontSize="9" className="fill-base-content/40" fontFamily="system-ui">{d.month}</text>
            ))}
            {/* Revenue area + line */}
            <path d={revArea} fill="url(#revGrad)" />
            <path d={revLine} fill="none" stroke="oklch(var(--su))" strokeWidth="2.5" strokeLinecap="round" />
            {/* Placements line */}
            <path d={plcLine} fill="none" stroke="oklch(var(--p))" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" />
            {/* Dots */}
            {revPoints.map((p, i) => (
                <g key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
                    <rect x={p.x - chartW / data.length / 2} y={pt} width={chartW / data.length} height={chartH} fill="transparent" />
                    <circle cx={p.x} cy={p.y} r="3.5" fill="oklch(var(--su))" />
                    <circle cx={plcPoints[i].x} cy={plcPoints[i].y} r="3" fill="oklch(var(--p))" />
                    {hoverIdx === i && (
                        <>
                            <line x1={p.x} y1={pt} x2={p.x} y2={h - pb} stroke="oklch(var(--bc) / 0.15)" strokeWidth="1" strokeDasharray="3 3" />
                            <circle cx={p.x} cy={p.y} r="6" fill="oklch(var(--b1))" stroke="oklch(var(--su))" strokeWidth="2.5" />
                            <circle cx={plcPoints[i].x} cy={plcPoints[i].y} r="5" fill="oklch(var(--b1))" stroke="oklch(var(--p))" strokeWidth="2" />
                            <rect x={p.x - 36} y={p.y - 28} width="72" height="20" rx="4" fill="oklch(var(--n))" />
                            <text x={p.x} y={p.y - 15} textAnchor="middle" fontSize="10" fontWeight="700" fill="oklch(var(--nc))" fontFamily="system-ui">
                                {formatCurrency(data[i].revenue)}
                            </text>
                        </>
                    )}
                </g>
            ))}
            {/* Legend */}
            <circle cx={pl + 4} cy={pt + 6} r="4" fill="oklch(var(--su))" />
            <text x={pl + 14} y={pt + 10} fontSize="9" className="fill-base-content/60" fontFamily="system-ui">Revenue</text>
            <line x1={pl + 66} y1={pt + 6} x2={pl + 80} y2={pt + 6} stroke="oklch(var(--p))" strokeWidth="2" strokeDasharray="4 3" />
            <text x={pl + 86} y={pt + 10} fontSize="9" className="fill-base-content/60" fontFamily="system-ui">Placements</text>
        </svg>
    );
}

/* ─── NEW: Top Recruiters (Horizontal Bar) ────────────────────────────────── */

function TopRecruitersChart({ data }: { data: typeof topRecruiters }) {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const maxPlacements = Math.max(...data.map((d) => d.placements));

    return (
        <div className="space-y-4">
            {data.map((d, i) => {
                const pct = (d.placements / maxPlacements) * 100;
                const isHovered = hoverIdx === i;
                return (
                    <div
                        key={i}
                        className="flex items-center gap-4 cursor-default"
                        onMouseEnter={() => setHoverIdx(i)}
                        onMouseLeave={() => setHoverIdx(null)}
                    >
                        <div className={`w-9 h-9 flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors duration-200 ${isHovered ? "bg-primary text-primary-content" : "bg-base-300 text-base-content/70"}`}>
                            {d.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-semibold truncate transition-colors duration-200 ${isHovered ? "text-primary" : "text-base-content"}`}>
                                    {d.name}
                                </span>
                                <div className="flex items-center gap-3 text-xs tabular-nums flex-shrink-0 ml-3">
                                    <span className="font-bold text-base-content">{d.placements} placed</span>
                                    <span className="text-base-content/40">{formatCurrency(d.revenue)}</span>
                                </div>
                            </div>
                            <div className="w-full h-2 bg-base-300 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${isHovered ? "bg-primary" : "bg-primary/60"}`}
                                    style={{ width: `${pct}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ─── NEW: Application Funnel ─────────────────────────────────────────────── */

function FunnelChart({ data }: { data: typeof applicationFunnel }) {
    const maxCount = data[0].count;

    return (
        <div className="space-y-3">
            {data.map((d, i) => {
                const widthPct = (d.count / maxCount) * 100;
                const conversionFromPrev = i > 0 ? ((d.count / data[i - 1].count) * 100).toFixed(0) : null;
                const colors = [
                    "bg-primary",
                    "bg-primary/80",
                    "bg-secondary",
                    "bg-secondary/80",
                    "bg-success",
                ];
                return (
                    <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-base-content">{d.stage}</span>
                                {conversionFromPrev && (
                                    <span className="text-xs text-base-content/40">
                                        ({conversionFromPrev}% conv.)
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 tabular-nums">
                                <span className="text-sm font-bold text-base-content">{d.count.toLocaleString()}</span>
                                <span className="text-xs text-base-content/40">{d.pct}%</span>
                            </div>
                        </div>
                        <div className="w-full h-7 bg-base-300 overflow-hidden flex items-center justify-center" style={{ width: `${widthPct}%`, margin: "0 auto", minWidth: "60px" }}>
                            <div className={`w-full h-full ${colors[i]}`}></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ─── NEW: Hiring Pipeline (Stacked Horizontal Bar) ──────────────────────── */

function PipelineChart({ data }: { data: typeof hiringPipeline }) {
    const categories = [
        { key: "engineering" as const, label: "Engineering", color: "oklch(var(--p))" },
        { key: "sales" as const, label: "Sales", color: "oklch(var(--su))" },
        { key: "marketing" as const, label: "Marketing", color: "oklch(var(--wa))" },
        { key: "design" as const, label: "Design", color: "oklch(var(--se))" },
    ];

    const maxTotal = Math.max(...data.map((d) => d.engineering + d.sales + d.marketing + d.design));

    return (
        <div>
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6">
                {categories.map((c) => (
                    <div key={c.key} className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: c.color }}></span>
                        <span className="text-base-content/60">{c.label}</span>
                    </div>
                ))}
            </div>
            <div className="space-y-4">
                {data.map((d, i) => {
                    const total = d.engineering + d.sales + d.marketing + d.design;
                    const barWidth = (total / maxTotal) * 100;
                    return (
                        <div key={i} className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-base-content w-20 text-right flex-shrink-0">{d.stage}</span>
                            <div className="flex-1">
                                <div className="flex h-6 overflow-hidden" style={{ width: `${barWidth}%`, minWidth: "40px" }}>
                                    {categories.map((c) => {
                                        const val = d[c.key];
                                        if (val === 0) return null;
                                        const segPct = (val / total) * 100;
                                        return (
                                            <div
                                                key={c.key}
                                                className="h-full transition-all duration-300 hover:opacity-80"
                                                style={{ width: `${segPct}%`, backgroundColor: c.color }}
                                                title={`${c.label}: ${val}`}
                                            ></div>
                                        );
                                    })}
                                </div>
                            </div>
                            <span className="text-xs font-bold text-base-content tabular-nums w-6 text-right">{total}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── NEW: Geographic Distribution (Horizontal Bar) ──────────────────────── */

function GeoChart({ data }: { data: typeof geoDistribution }) {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const sorted = [...data].sort((a, b) => b.count - a.count);
    const maxCount = sorted[0].count;

    return (
        <div className="space-y-3">
            {sorted.map((d, i) => {
                const pct = (d.count / maxCount) * 100;
                const isHovered = hoverIdx === i;
                return (
                    <div
                        key={i}
                        className="flex items-center gap-4 cursor-default"
                        onMouseEnter={() => setHoverIdx(i)}
                        onMouseLeave={() => setHoverIdx(null)}
                    >
                        <span className={`text-sm w-28 text-right flex-shrink-0 transition-colors duration-200 ${isHovered ? "text-primary font-semibold" : "text-base-content/70"}`}>
                            {d.location}
                        </span>
                        <div className="flex-1 h-5 bg-base-300 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${isHovered ? "bg-secondary" : "bg-secondary/60"}`}
                                style={{ width: `${pct}%` }}
                            ></div>
                        </div>
                        <span className={`text-sm tabular-nums w-10 text-right font-bold transition-colors duration-200 ${isHovered ? "text-secondary" : "text-base-content"}`}>
                            {d.count}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

/* ─── NEW: Time to Hire (Comparison Bar) ──────────────────────────────────── */

function TimeToHireChart({ data }: { data: typeof timeToHire }) {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const maxDays = Math.max(...data.map((d) => Math.max(d.avgDays, d.benchmark)));

    return (
        <div>
            {/* Legend */}
            <div className="flex gap-6 mb-6">
                <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 bg-primary flex-shrink-0"></span>
                    <span className="text-base-content/60">Your Average</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 bg-base-content/20 flex-shrink-0"></span>
                    <span className="text-base-content/60">Industry Benchmark</span>
                </div>
            </div>
            <div className="space-y-5">
                {data.map((d, i) => {
                    const avgPct = (d.avgDays / maxDays) * 100;
                    const benchPct = (d.benchmark / maxDays) * 100;
                    const diff = d.benchmark - d.avgDays;
                    const isHovered = hoverIdx === i;
                    return (
                        <div
                            key={i}
                            className="cursor-default"
                            onMouseEnter={() => setHoverIdx(i)}
                            onMouseLeave={() => setHoverIdx(null)}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-sm font-semibold transition-colors duration-200 ${isHovered ? "text-primary" : "text-base-content"}`}>
                                    {d.role}
                                </span>
                                <div className="flex items-center gap-2 text-xs tabular-nums">
                                    <span className="font-bold text-primary">{d.avgDays}d</span>
                                    <span className="text-base-content/30">vs</span>
                                    <span className="text-base-content/50">{d.benchmark}d</span>
                                    <span className="text-success font-semibold">-{diff}d</span>
                                </div>
                            </div>
                            <div className="relative h-4 bg-base-300 overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full bg-base-content/15 transition-all duration-300"
                                    style={{ width: `${benchPct}%` }}
                                ></div>
                                <div
                                    className={`absolute top-0 left-0 h-full transition-all duration-300 ${isHovered ? "bg-primary" : "bg-primary/70"}`}
                                    style={{ width: `${avgPct}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Page Component ──────────────────────────────────────────────────────── */

export default function DashboardOne() {
    const mainRef = useRef<HTMLElement>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const $ = (sel: string) =>
                mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                mainRef.current!.querySelector(sel);

            // ── Header entrance ──────────────────────────────────
            const headerTl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            headerTl
                .fromTo(
                    $1(".dash-kicker"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 },
                )
                .fromTo(
                    $(".dash-headline-word"),
                    { opacity: 0, y: 80, rotateX: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 1,
                        stagger: 0.12,
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".dash-subtitle"),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    "-=0.5",
                );

            // ── KPI cards stagger ────────────────────────────────
            gsap.fromTo(
                $(".kpi-card"),
                { opacity: 0, y: 40, scale: 0.96 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".kpi-grid"),
                        start: "top 85%",
                    },
                },
            );

            // ── Charts section ───────────────────────────────────
            gsap.fromTo(
                $1(".charts-heading"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".charts-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".chart-card"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.12,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".charts-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ── Advanced Analytics heading ────────────────────────
            gsap.fromTo(
                $1(".advanced-heading"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".advanced-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".advanced-card"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.12,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".advanced-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ── Deep Insights heading ─────────────────────────────
            gsap.fromTo(
                $1(".insights-heading"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".insights-section"),
                        start: "top 75%",
                    },
                },
            );

            gsap.fromTo(
                $(".insights-card"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.12,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".insights-grid"),
                        start: "top 80%",
                    },
                },
            );

            // ── Activity & Actions split ─────────────────────────
            gsap.fromTo(
                $1(".activity-panel"),
                { opacity: 0, x: -60 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".split-section"),
                        start: "top 70%",
                    },
                },
            );
            gsap.fromTo(
                $1(".actions-panel"),
                { opacity: 0, x: 60 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".split-section"),
                        start: "top 70%",
                    },
                },
            );

            // ── Activity items stagger ───────────────────────────
            gsap.fromTo(
                $(".activity-item"),
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    stagger: 0.06,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $1(".activity-list"),
                        start: "top 80%",
                    },
                },
            );

            // ── Action cards stagger ─────────────────────────────
            gsap.fromTo(
                $(".action-card"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".actions-grid"),
                        start: "top 85%",
                    },
                },
            );

            // ── Sidebar nav items stagger ────────────────────────
            gsap.fromTo(
                $(".sidebar-nav-item"),
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    stagger: 0.06,
                    ease: "power2.out",
                    delay: 0.3,
                },
            );

            gsap.fromTo(
                $1(".sidebar-brand"),
                { opacity: 0, y: -10 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.1 },
            );
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="overflow-hidden">
            <div className="drawer lg:drawer-open">
                {/* Hidden checkbox drives mobile drawer toggle */}
                <input
                    id="dashboard-drawer"
                    type="checkbox"
                    className="drawer-toggle"
                    checked={sidebarOpen}
                    onChange={() => setSidebarOpen(!sidebarOpen)}
                />

                {/* ═══════════════════════════════════════════════════════
                    SIDEBAR
                   ═══════════════════════════════════════════════════════ */}
                <div className="drawer-side z-40">
                    <label htmlFor="dashboard-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                    <aside className="w-64 min-h-screen bg-neutral text-neutral-content flex flex-col">
                        {/* Brand */}
                        <div className="sidebar-brand p-6 pb-4 opacity-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-primary flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-chart-mixed text-primary-content text-sm"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-black tracking-tight leading-none">Splits</p>
                                    <p className="text-[10px] uppercase tracking-[0.15em] opacity-50 mt-0.5">Network</p>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="mx-5 border-t border-neutral-content/10"></div>

                        {/* Navigation */}
                        <nav className="flex-1 px-3 py-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-content/30 px-3 mb-3">
                                Navigation
                            </p>
                            <ul className="space-y-1">
                                {sidebarNav.map((item, i) => (
                                    <li key={i}>
                                        <button
                                            className={`sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 opacity-0 ${
                                                item.active
                                                    ? "bg-primary text-primary-content font-bold"
                                                    : "text-neutral-content/70 hover:bg-neutral-content/5 hover:text-neutral-content"
                                            }`}
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <i className={`${item.icon} w-5 text-center ${item.active ? "" : "opacity-60"}`}></i>
                                            <span>{item.label}</span>
                                            {item.active && (
                                                <span className="ml-auto w-1.5 h-1.5 bg-primary-content rounded-full"></span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Sidebar footer */}
                        <div className="mx-5 border-t border-neutral-content/10"></div>
                        <div className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary text-primary-content flex items-center justify-center font-bold text-xs">
                                    SK
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold truncate">Sarah Kim</p>
                                    <p className="text-[10px] text-neutral-content/40 truncate">Admin</p>
                                </div>
                                <button className="text-neutral-content/30 hover:text-neutral-content transition-colors">
                                    <i className="fa-duotone fa-regular fa-gear text-sm"></i>
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* ═══════════════════════════════════════════════════════
                    MAIN CONTENT
                   ═══════════════════════════════════════════════════════ */}
                <div className="drawer-content">

            {/* ═══════════════════════════════════════════════════════
                HEADER
               ═══════════════════════════════════════════════════════ */}
            <section className="relative py-20 lg:py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    {/* Mobile sidebar toggle */}
                    <label
                        htmlFor="dashboard-drawer"
                        className="btn btn-sm btn-ghost lg:hidden mb-6 -ml-2"
                    >
                        <i className="fa-duotone fa-regular fa-bars text-lg"></i>
                        <span className="text-xs uppercase tracking-wider font-semibold">Menu</span>
                    </label>

                    <div className="max-w-3xl">
                        <p className="dash-kicker text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6 opacity-0">
                            Recruiting Dashboard
                        </p>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-6">
                            <span className="dash-headline-word inline-block opacity-0 text-base-content">
                                Your
                            </span>{" "}
                            <span className="dash-headline-word inline-block opacity-0 text-primary">
                                recruiting
                            </span>{" "}
                            <span className="dash-headline-word inline-block opacity-0 text-base-content">
                                at a glance.
                            </span>
                        </h1>

                        <p className="dash-subtitle text-lg md:text-xl text-base-content/70 leading-relaxed max-w-xl opacity-0">
                            Real-time metrics, pipeline visibility, and actionable
                            insights across your entire recruiting operation.
                        </p>
                    </div>

                    <div className="flex gap-2 mt-10">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`btn btn-sm ${activeTab === "overview" ? "btn-primary" : "btn-ghost"}`}
                        >
                            <i className="fa-duotone fa-regular fa-chart-mixed"></i>
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("activity")}
                            className={`btn btn-sm ${activeTab === "activity" ? "btn-primary" : "btn-ghost"}`}
                        >
                            <i className="fa-duotone fa-regular fa-clock-rotate-left"></i>
                            Activity
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                KPI CARDS
               ═══════════════════════════════════════════════════════ */}
            <section className="bg-base-200 py-12">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {kpis.map((kpi, i) => (
                            <div
                                key={i}
                                className={`kpi-card bg-base-100 border-t-4 border-${kpi.color} p-6 opacity-0`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 bg-${kpi.color}/10 flex items-center justify-center`}>
                                        <i className={`${kpi.icon} text-xl text-${kpi.color}`}></i>
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm font-semibold ${kpi.trendUp ? "text-success" : "text-error"}`}>
                                        <i className={`fa-solid fa-arrow-${kpi.trendUp ? "up" : "down"} text-xs`}></i>
                                        {kpi.trend}
                                    </div>
                                </div>
                                <div className="text-3xl md:text-4xl font-black tracking-tight text-base-content">
                                    {kpi.value}
                                </div>
                                <div className="text-sm uppercase tracking-wider text-base-content/50 mt-1">
                                    {kpi.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                CHARTS — Primary Analytics
               ═══════════════════════════════════════════════════════ */}
            <section className="charts-section py-20 lg:py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="charts-heading max-w-3xl mb-16 opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            Analytics
                        </p>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight">
                            Pipeline performance.
                        </h2>
                    </div>

                    <div className="charts-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Applications Over Time */}
                        <div className="chart-card lg:col-span-2 bg-base-200 p-8 opacity-0">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-base-content">
                                        Applications Over Time
                                    </h3>
                                    <p className="text-sm text-base-content/50">
                                        Last 30 days &middot; hover for details
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-success">
                                    <i className="fa-solid fa-arrow-up text-xs"></i>
                                    +23.4%
                                </div>
                            </div>
                            <div className="h-56">
                                <AreaChart data={applicationsOverTime} />
                            </div>
                        </div>

                        {/* Jobs by Status */}
                        <div className="chart-card bg-base-200 p-8 opacity-0">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-base-content">
                                    Jobs by Status
                                </h3>
                                <p className="text-sm text-base-content/50">
                                    Current distribution
                                </p>
                            </div>
                            <div className="flex justify-center">
                                <DonutChart data={jobsByStatus} />
                            </div>
                        </div>

                        {/* Placements by Month */}
                        <div className="chart-card lg:col-span-2 bg-base-200 p-8 opacity-0">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-base-content">
                                        Placements by Month
                                    </h3>
                                    <p className="text-sm text-base-content/50">
                                        Last 6 months
                                    </p>
                                </div>
                                <div className="text-sm text-base-content/50">
                                    <span className="font-bold text-base-content text-lg">31</span>{" "}
                                    total placements
                                </div>
                            </div>
                            <BarChart data={placementsByMonth} />
                        </div>

                        {/* Revenue Trend */}
                        <div className="chart-card bg-base-200 p-8 opacity-0">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-base-content">
                                    Revenue Trend
                                </h3>
                                <p className="text-sm text-base-content/50">
                                    Revenue vs. placements &middot; 7 months
                                </p>
                            </div>
                            <div className="h-56">
                                <RevenueTrendChart data={revenueTrend} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                ADVANCED ANALYTICS — Funnel + Pipeline + Recruiters
               ═══════════════════════════════════════════════════════ */}
            <section className="advanced-section py-20 lg:py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="advanced-heading max-w-3xl mb-16 opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            Advanced Analytics
                        </p>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight">
                            Deeper insights.
                        </h2>
                    </div>

                    <div className="advanced-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Application Funnel */}
                        <div className="advanced-card bg-base-100 p-8 border-t-4 border-primary opacity-0">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-filter text-primary"></i>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-base-content">
                                        Application Funnel
                                    </h3>
                                    <p className="text-sm text-base-content/50">
                                        Conversion through each stage
                                    </p>
                                </div>
                            </div>
                            <FunnelChart data={applicationFunnel} />
                        </div>

                        {/* Top Recruiters */}
                        <div className="advanced-card bg-base-100 p-8 border-t-4 border-secondary opacity-0">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-trophy text-secondary"></i>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-base-content">
                                        Top Performing Recruiters
                                    </h3>
                                    <p className="text-sm text-base-content/50">
                                        By placements this quarter
                                    </p>
                                </div>
                            </div>
                            <TopRecruitersChart data={topRecruiters} />
                        </div>

                        {/* Hiring Pipeline */}
                        <div className="advanced-card lg:col-span-2 bg-base-100 p-8 border-t-4 border-accent opacity-0">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 bg-accent/10 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-diagram-project text-accent"></i>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-base-content">
                                        Hiring Pipeline by Department
                                    </h3>
                                    <p className="text-sm text-base-content/50">
                                        Candidates at each stage across departments
                                    </p>
                                </div>
                            </div>
                            <PipelineChart data={hiringPipeline} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                DEEP INSIGHTS — Geo + Time to Hire
               ═══════════════════════════════════════════════════════ */}
            <section className="insights-section py-20 lg:py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="insights-heading max-w-3xl mb-16 opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            Deep Insights
                        </p>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight">
                            Operational intelligence.
                        </h2>
                    </div>

                    <div className="insights-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Geographic Distribution */}
                        <div className="insights-card bg-base-200 p-8 opacity-0">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-earth-americas text-secondary"></i>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-base-content">
                                        Geographic Distribution
                                    </h3>
                                    <p className="text-sm text-base-content/50">
                                        Applications by location
                                    </p>
                                </div>
                            </div>
                            <GeoChart data={geoDistribution} />
                        </div>

                        {/* Time to Hire */}
                        <div className="insights-card bg-base-200 p-8 opacity-0">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-stopwatch text-primary"></i>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-base-content">
                                        Time to Hire
                                    </h3>
                                    <p className="text-sm text-base-content/50">
                                        Your average vs. industry benchmark
                                    </p>
                                </div>
                            </div>
                            <TimeToHireChart data={timeToHire} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SPLIT-SCREEN — Activity Feed (60) + Quick Actions (40)
               ═══════════════════════════════════════════════════════ */}
            <section className="split-section py-20 lg:py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
                        {/* Activity Feed */}
                        <div className="activity-panel lg:col-span-3 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                Recent Activity
                            </p>
                            <h2 className="text-3xl md:text-4xl font-black leading-[0.95] tracking-tight mb-8">
                                What&apos;s happening now.
                            </h2>

                            <div className="activity-list space-y-0 max-h-[520px] overflow-y-auto">
                                {activityFeed.map((item, i) => (
                                    <div
                                        key={i}
                                        className="activity-item flex items-start gap-4 p-4 border-b border-base-300 hover:bg-base-100 transition-colors opacity-0"
                                    >
                                        <div className="w-10 h-10 bg-base-100 flex items-center justify-center flex-shrink-0">
                                            <i className={`${item.icon} ${item.iconColor}`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-base-content text-sm leading-snug">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-base-content/50 mt-1">
                                                {item.user} &middot; {item.time}
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 bg-primary text-primary-content flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            {item.initials}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="actions-panel lg:col-span-2 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                                Quick Actions
                            </p>
                            <h2 className="text-3xl md:text-4xl font-black leading-[0.95] tracking-tight mb-8">
                                Take action.
                            </h2>

                            <div className="actions-grid space-y-4">
                                {quickActions.map((action, i) => (
                                    <button
                                        key={i}
                                        className={`action-card w-full text-left border-l-4 border-${action.color} bg-base-100 p-6 hover:bg-base-100/80 transition-colors opacity-0`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 bg-${action.color}/10 flex items-center justify-center flex-shrink-0`}>
                                                <i className={`${action.icon} text-xl text-${action.color}`}></i>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-base-content mb-1">
                                                    {action.label}
                                                </h3>
                                                <p className="text-sm text-base-content/60 leading-relaxed">
                                                    {action.description}
                                                </p>
                                            </div>
                                            <i className="fa-duotone fa-regular fa-arrow-right text-base-content/30 ml-auto mt-1"></i>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Summary stat block */}
                            <div className="mt-8 bg-primary text-primary-content p-8">
                                <p className="text-sm uppercase tracking-wider opacity-70 mb-2">
                                    This Month
                                </p>
                                <div className="text-4xl font-black tracking-tight mb-1">
                                    $42,300
                                </div>
                                <p className="text-sm opacity-70">
                                    Revenue from 5 placements
                                </p>
                                <div className="flex items-center gap-2 mt-4 text-sm font-semibold">
                                    <i className="fa-solid fa-arrow-up text-xs"></i>
                                    +18.2% vs last month
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                BOTTOM CTA
               ═══════════════════════════════════════════════════════ */}
            <section className="py-20 bg-neutral text-neutral-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            Ready to Start
                        </p>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                            Your recruiting command center awaits.
                        </h2>
                        <p className="text-lg opacity-70 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Get complete visibility into your pipeline, track placements in
                            real time, and manage your entire recruiting operation from one dashboard.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="https://splits.network/sign-up"
                                className="btn btn-lg bg-white text-neutral hover:bg-white/90 border-0 shadow-lg"
                            >
                                <i className="fa-duotone fa-regular fa-rocket"></i>
                                Get Started Free
                            </a>
                            <a
                                href="#"
                                className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                            >
                                <i className="fa-duotone fa-regular fa-calendar"></i>
                                Book a Demo
                            </a>
                        </div>
                    </div>
                </div>
            </section>

                </div>{/* end drawer-content */}
            </div>{/* end drawer */}
        </main>
    );
}
