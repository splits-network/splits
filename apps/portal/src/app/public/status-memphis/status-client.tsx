"use client";

import {
    useServiceHealth,
    getGatewayBaseUrl,
    type ServiceHealth,
} from "@splits-network/shared-ui";
import { useEffect, useMemo, useState } from "react";
import { StatusAnimator } from "./status-animator";

interface HealthIncident {
    id: string;
    service_name: string;
    severity: string;
    started_at: string;
    resolved_at: string | null;
    duration_seconds: number | null;
}

interface StatusMemphisClientProps {
    initialStatuses?: ServiceHealth[];
    initialCheckedAt?: string;
}

// Memphis accent cycling (coral → teal → yellow → purple)
const ACCENT_COLORS = ['coral', 'teal', 'yellow', 'purple'] as const;
const accentAt = (idx: number) => ACCENT_COLORS[idx % 4];

export default function StatusMemphisClient({
    initialStatuses,
    initialCheckedAt,
}: StatusMemphisClientProps) {
    const {
        serviceStatuses,
        lastChecked,
        healthyCount,
        totalCount,
        allHealthy,
        someUnhealthy,
        isLoading,
        unhealthyServices,
    } = useServiceHealth({
        autoRefresh: true,
        initialStatuses,
        initialCheckedAt,
    });

    const [incidents, setIncidents] = useState<HealthIncident[]>([]);

    useEffect(() => {
        fetch(`${getGatewayBaseUrl()}/api/v2/system-health/incidents?limit=10`)
            .then((r) => r.json())
            .then((json) => setIncidents(json.data || []))
            .catch(() => {});
    }, []);

    const avgResponseTime = useMemo(() => {
        const times = serviceStatuses
            .filter((s) => s.responseTime != null)
            .map((s) => s.responseTime!);
        if (times.length === 0) return 0;
        return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    }, [serviceStatuses]);

    const uptimePercent = useMemo(() => {
        if (totalCount === 0) return "---";
        return ((healthyCount / totalCount) * 100).toFixed(1);
    }, [healthyCount, totalCount]);

    // State-based styling using Memphis Tailwind classes
    const heroState = useMemo(() => {
        if (isLoading) {
            return {
                headline: "CHECKING SYSTEM STATUS",
                subtext: "Hang tight while we validate the API gateway, auth, ATS, network, billing, docs, AI, and automation stacks.",
                bgColor: "bg-dark",
                textColor: "text-cream",
                badgeColor: "bg-purple",
                badgeText: "text-white",
            };
        }
        if (allHealthy) {
            return {
                headline: "ALL SYSTEMS OPERATIONAL",
                subtext: "Recruiter dashboards, pipelines, automations, and AI review signals are green. Post roles, submit candidates, track placements — everything's running smooth.",
                bgColor: "bg-teal",
                textColor: "text-dark",
                badgeColor: "bg-teal",
                badgeText: "text-dark",
            };
        }
        if (someUnhealthy) {
            return {
                headline: "INVESTIGATING SERVICE DEGRADATION",
                subtext: "We detected a hiccup. Follow the incident card below or ping us at help@splits.network. Core features still work — you can browse, apply, and message.",
                bgColor: "bg-coral",
                textColor: "text-white",
                badgeColor: "bg-coral",
                badgeText: "text-white",
            };
        }
        return {
            headline: "MONITORING SYSTEM ANOMALIES",
            subtext: "We're seeing unusual patterns. No confirmed impact yet. Everything still works — this is precautionary. We'll update as we learn more.",
            bgColor: "bg-yellow",
            textColor: "text-dark",
            badgeColor: "bg-yellow",
            badgeText: "text-dark",
        };
    }, [isLoading, allHealthy, someUnhealthy]);

    // Overall status styling
    const overallLabel = useMemo(() => {
        if (isLoading) return "Checking System Status";
        if (allHealthy) return "All Systems Operational";  
        if (someUnhealthy) return "Service Issues Detected";
        return "System Under Investigation";
    }, [isLoading, allHealthy, someUnhealthy]);

    const overallBorderColor = useMemo(() => {
        if (isLoading) return "border-purple";
        if (allHealthy) return "border-teal";
        if (someUnhealthy) return "border-coral"; 
        return "border-yellow";
    }, [isLoading, allHealthy, someUnhealthy]);

    const overallAccentBg = useMemo(() => {
        if (isLoading) return "bg-purple";
        if (allHealthy) return "bg-teal";
        if (someUnhealthy) return "bg-coral";
        return "bg-yellow";
    }, [isLoading, allHealthy, someUnhealthy]);

    const statusBadgeClass = (status: string) => {
        switch (status) {
            case "healthy":
                return "badge badge-teal";
            case "unhealthy":
                return "badge badge-coral";
            default:
                return "badge badge-yellow";
        }
    };

    const statusLabel = (status: string) => {
        switch (status) {
            case "healthy":
                return "Operational";
            case "unhealthy":
                return "Down";
            default:
                return "Degraded";
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case "healthy":
                return "bg-teal";
            case "unhealthy":
                return "bg-coral";
            default:
                return "bg-yellow";
        }
    };

    const statusTextColor = (status: string) => {
        switch (status) {
            case "healthy":
                return "text-teal";
            case "unhealthy":
                return "text-coral";
            default:
                return "text-yellow";
        }
    };

    return (
        <StatusAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className={`status-hero relative min-h-[50vh] overflow-hidden flex items-center ${heroState.bgColor}`}>
                {/* Memphis decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[10%] left-[5%] w-20 h-20 rounded-full border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[60%] right-[8%] w-16 h-16 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[15%] left-[12%] w-10 h-10 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[25%] right-[18%] w-14 h-14 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[25%] right-[28%] w-20 h-8 -rotate-6 border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[45%] left-[22%] w-8 h-8 rotate-45 bg-coral opacity-0" />
                    {/* SVG shapes - stroke colors via Tailwind */}
                    <svg className="memphis-shape absolute bottom-[10%] right-[40%] opacity-0 stroke-purple" width="80" height="25" viewBox="0 0 80 25">
                        <polyline points="0,20 10,5 20,20 30,5 40,20 50,5 60,20 70,5 80,20"
                            fill="none" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <svg className="memphis-shape absolute top-[70%] left-[35%] opacity-0 stroke-yellow" width="30" height="30" viewBox="0 0 30 30">
                        <line x1="15" y1="3" x2="15" y2="27" strokeWidth="4" strokeLinecap="round" />
                        <line x1="3" y1="15" x2="27" y2="15" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="hero-badge inline-block mb-6 opacity-0">
                            <span className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] ${heroState.badgeColor} ${heroState.badgeText}`}>
                                <i className="fa-duotone fa-regular fa-signal-bars"></i>
                                Live System Status
                            </span>
                        </div>

                        <h1 className={`hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 opacity-0 ${heroState.textColor}`}>
                            {heroState.headline}
                        </h1>

                        <p className={`hero-subtext text-lg md:text-xl leading-relaxed mb-8 opacity-0 ${heroState.textColor}/70`}>
                            {heroState.subtext}
                        </p>

                        <div className={`hero-timestamp inline-flex items-center gap-2 px-4 py-2 border-4 border-purple text-xs font-bold uppercase tracking-wider opacity-0 ${heroState.textColor}/60`}>
                            <i className="fa-duotone fa-regular fa-clock text-purple"></i>
                            <span suppressHydrationWarning>
                                Last checked {lastChecked.toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                OVERALL STATUS
               ══════════════════════════════════════════════════════════════ */}
            <section className="status-overall py-16 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className={`overall-card relative p-8 md:p-12 border-4 ${overallBorderColor} opacity-0`}
                            style={{ backgroundColor: "#FFFFFF" }}>
                            {/* Corner accent */}
                            <div className={`absolute top-0 right-0 w-12 h-12 ${overallAccentBg}`} />

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 flex items-center justify-center ${overallAccentBg}`}>
                                        {isLoading ? (
                                            <i className="fa-duotone fa-regular fa-stethoscope text-2xl" style={{ color: "#FFFFFF" }}></i>
                                        ) : allHealthy ? (
                                            <i className="fa-duotone fa-regular fa-circle-check text-2xl" style={{ color: "#1A1A2E" }}></i>
                                        ) : someUnhealthy ? (
                                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-2xl" style={{ color: "#FFFFFF" }}></i>
                                        ) : (
                                            <i className="fa-duotone fa-regular fa-wave-square text-2xl" style={{ color: "#1A1A2E" }}></i>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight"
                                            style={{ color: "#1A1A2E" }}>
                                            {overallLabel}
                                        </h2>
                                        <p className="text-sm mt-1" style={{ color: "rgba(26,26,46,0.6)" }}>
                                            {healthyCount}/{totalCount} services reporting healthy
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="text-center p-3 border-4"
                                        style={{ borderColor: "#4ECDC4" }}>
                                        <p className="text-2xl font-black" style={{ color: "#4ECDC4" }}>
                                            {healthyCount}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider"
                                            style={{ color: "rgba(26,26,46,0.5)" }}>
                                            Healthy
                                        </p>
                                    </div>
                                    <div className="text-center p-3 border-4"
                                        style={{ borderColor: "#FF6B6B" }}>
                                        <p className="text-2xl font-black" style={{ color: "#FF6B6B" }}>
                                            {totalCount - healthyCount}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider"
                                            style={{ color: "rgba(26,26,46,0.5)" }}>
                                            Issues
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SERVICE GRID
               ══════════════════════════════════════════════════════════════ */}
            <section className="status-services py-16 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="services-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                                Services
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                style={{ color: "#FFFFFF" }}>
                                Service{" "}
                                <span style={{ color: "#FF6B6B" }}>Detail</span>
                            </h2>
                        </div>

                        <div className="services-grid grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {serviceStatuses.map((service) => {
                                const borderMap: Record<string, string> = {
                                    healthy: "#4ECDC4",
                                    unhealthy: "#FF6B6B",
                                    degraded: "#FFE66D",
                                    checking: "#A78BFA",
                                    unknown: "#A78BFA",
                                };
                                const borderColor = borderMap[service.status] || "#A78BFA";
                                return (
                                    <div key={service.name}
                                        className="service-card relative p-5 border-4 opacity-0"
                                        style={{ borderColor, backgroundColor: "rgba(255,255,255,0.04)" }}>
                                        {/* Corner accent */}
                                        <div className="absolute top-0 right-0 w-8 h-8"
                                            style={{ backgroundColor: borderColor }} />

                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <h3 className="font-black text-sm uppercase tracking-wide"
                                                style={{ color: "#FFFFFF" }}>
                                                {service.name}
                                            </h3>
                                            <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusColor(service.status)}`}
                                                style={{ color: service.status === "healthy" || service.status === "unhealthy" ? "#FFFFFF" : "#1A1A2E" }}>
                                                {statusLabel(service.status)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider"
                                                    style={{ color: "rgba(255,255,255,0.4)" }}>
                                                    Response
                                                </p>
                                                <p className={`text-lg font-black ${statusTextColor(service.status)}`}>
                                                    {service.responseTime ? `${service.responseTime}ms` : "---"}
                                                </p>
                                            </div>
                                            {service.timestamp && (
                                                <div className="text-right">
                                                    <p className="text-xs font-bold uppercase tracking-wider"
                                                        style={{ color: "rgba(255,255,255,0.4)" }}>
                                                        Last Check
                                                    </p>
                                                    <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.6)" }}
                                                        suppressHydrationWarning>
                                                        {new Date(service.timestamp).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {service.error && (
                                            <div className="mt-3 p-2 border-2" style={{ borderColor: "#FF6B6B" }}>
                                                <p className="text-xs" style={{ color: "#FF6B6B" }}>
                                                    <i className="fa-duotone fa-regular fa-circle-exclamation mr-1"></i>
                                                    {service.error}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                UPTIME STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="status-stats py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    <div className="stat-block p-6 md:p-8 text-center opacity-0"
                        style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                        <div className="text-3xl md:text-4xl font-black mb-1">{uptimePercent}%</div>
                        <div className="text-xs font-bold uppercase tracking-[0.12em]">Uptime</div>
                    </div>
                    <div className="stat-block p-6 md:p-8 text-center opacity-0"
                        style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                        <div className="text-3xl md:text-4xl font-black mb-1">{totalCount}</div>
                        <div className="text-xs font-bold uppercase tracking-[0.12em]">Services Monitored</div>
                    </div>
                    <div className="stat-block p-6 md:p-8 text-center opacity-0"
                        style={{ backgroundColor: "#FFE66D", color: "#1A1A2E" }}>
                        <div className="text-3xl md:text-4xl font-black mb-1">{avgResponseTime}ms</div>
                        <div className="text-xs font-bold uppercase tracking-[0.12em]">Avg Response</div>
                    </div>
                    <div className="stat-block p-6 md:p-8 text-center opacity-0"
                        style={{ backgroundColor: "#A78BFA", color: "#FFFFFF" }}>
                        <div className="text-3xl md:text-4xl font-black mb-1">30s</div>
                        <div className="text-xs font-bold uppercase tracking-[0.12em]">Refresh Interval</div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                INCIDENT HISTORY
               ══════════════════════════════════════════════════════════════ */}
            <section className="status-incidents py-16 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="incidents-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                style={{ backgroundColor: "#A78BFA", color: "#FFFFFF" }}>
                                Incidents
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                style={{ color: "#1A1A2E" }}>
                                Live{" "}
                                <span style={{ color: "#A78BFA" }}>Feed</span>
                            </h2>
                        </div>

                        {/* Active incidents */}
                        {unhealthyServices.length > 0 && (
                            <div className="space-y-4 mb-8">
                                {unhealthyServices.map((service) => (
                                    <div key={service.name}
                                        className="incident-card relative p-6 border-4 opacity-0"
                                        style={{ borderColor: "#FF6B6B", backgroundColor: "#FFFFFF" }}>
                                        <div className="absolute top-0 right-0 w-8 h-8"
                                            style={{ backgroundColor: "#FF6B6B" }} />
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: "#FF6B6B" }}>
                                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-lg"
                                                    style={{ color: "#FFFFFF" }}></i>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg uppercase tracking-wide"
                                                    style={{ color: "#1A1A2E" }}>
                                                    {service.name}
                                                </h3>
                                                <p className="text-sm mt-1" style={{ color: "rgba(26,26,46,0.7)" }}>
                                                    {service.error || "We are mitigating the issue and will update shortly."}
                                                </p>
                                                <span className="inline-block mt-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                                                    style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {unhealthyServices.length === 0 && (
                            <div className="no-incidents-card relative p-8 border-4 text-center mb-8 opacity-0"
                                style={{ borderColor: "#4ECDC4", backgroundColor: "#FFFFFF" }}>
                                <div className="absolute top-0 right-0 w-8 h-8"
                                    style={{ backgroundColor: "#4ECDC4" }} />
                                <i className="fa-duotone fa-regular fa-circle-check text-3xl mb-3"
                                    style={{ color: "#4ECDC4" }}></i>
                                <p className="font-black text-lg uppercase tracking-wide"
                                    style={{ color: "#1A1A2E" }}>
                                    No Active Incidents
                                </p>
                                <p className="text-sm mt-1" style={{ color: "rgba(26,26,46,0.6)" }}>
                                    All services are operating normally. If you see unexpected behavior,
                                    email help@splits.network.
                                </p>
                            </div>
                        )}

                        {/* Past incidents */}
                        {incidents.filter((i) => i.resolved_at).length > 0 && (
                            <div className="past-incidents space-y-4">
                                <h3 className="font-black text-lg uppercase tracking-wide mb-4"
                                    style={{ color: "#1A1A2E" }}>
                                    <i className="fa-duotone fa-regular fa-clock-rotate-left mr-2"
                                        style={{ color: "#A78BFA" }}></i>
                                    Past Incidents
                                </h3>
                                {incidents
                                    .filter((i) => i.resolved_at)
                                    .map((incident) => (
                                        <div key={incident.id}
                                            className="incident-card relative p-5 border-4 opacity-0"
                                            style={{ borderColor: "#A78BFA", backgroundColor: "#FFFFFF" }}>
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                <div>
                                                    <p className="font-black text-sm uppercase tracking-wide"
                                                        style={{ color: "#1A1A2E" }}>
                                                        {incident.service_name}
                                                    </p>
                                                    <p className="text-xs mt-1" style={{ color: "rgba(26,26,46,0.6)" }}>
                                                        {incident.severity === "unhealthy" ? "Service outage" : "Degraded performance"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold" style={{ color: "rgba(26,26,46,0.6)" }}
                                                            suppressHydrationWarning>
                                                            {new Date(incident.started_at).toLocaleString()}
                                                        </p>
                                                        <p className="text-xs" style={{ color: "rgba(26,26,46,0.5)" }}>
                                                            Duration:{" "}
                                                            {incident.duration_seconds != null
                                                                ? incident.duration_seconds < 60
                                                                    ? `${incident.duration_seconds}s`
                                                                    : `${Math.round(incident.duration_seconds / 60)}m`
                                                                : "N/A"}
                                                        </p>
                                                    </div>
                                                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                                                        style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                                                        Resolved
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FOOTER CTA
               ══════════════════════════════════════════════════════════════ */}
            <section className="status-cta relative py-20 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[12%] right-[6%] w-14 h-14 rounded-full border-4"
                        style={{ borderColor: "#FF6B6B" }} />
                    <div className="absolute bottom-[18%] left-[10%] w-10 h-10 rotate-45"
                        style={{ backgroundColor: "#4ECDC4" }} />
                    <div className="absolute top-[50%] left-[4%] w-8 h-8 rounded-full"
                        style={{ backgroundColor: "#FFE66D" }} />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center max-w-3xl mx-auto opacity-0">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6"
                            style={{ color: "#FFFFFF" }}>
                            Need{" "}
                            <span style={{ color: "#FF6B6B" }}>Help?</span>
                        </h2>
                        <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
                            If you are experiencing issues not reflected here,
                            our support team is ready to assist.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="mailto:help@splits.network"
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-wider border-4 transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#FF6B6B", borderColor: "#FF6B6B", color: "#FFFFFF" }}>
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                help@splits.network
                            </a>
                            <a href="/public/status"
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-wider border-4 transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "transparent", borderColor: "#FFFFFF", color: "#FFFFFF" }}>
                                <i className="fa-duotone fa-regular fa-arrow-left"></i>
                                Classic View
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </StatusAnimator>
    );
}
