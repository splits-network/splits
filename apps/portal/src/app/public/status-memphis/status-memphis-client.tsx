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
    const [incidentsLoaded, setIncidentsLoaded] = useState(false);

    useEffect(() => {
        fetch(`${getGatewayBaseUrl()}/api/v2/system-health/incidents?limit=10`)
            .then((r) => r.json())
            .then((json) => {
                setIncidents(json.data || []);
                setIncidentsLoaded(true);
            })
            .catch(() => setIncidentsLoaded(true));
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
                accentColor: "purple",
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
                accentColor: "teal",
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
                accentColor: "coral",
            };
        }
        return {
            headline: "MONITORING SYSTEM ANOMALIES",
            subtext: "We're seeing unusual patterns. No confirmed impact yet. Everything still works — this is precautionary. We'll update as we learn more.",
            bgColor: "bg-yellow",
            textColor: "text-dark",
            badgeColor: "bg-yellow",
            badgeText: "text-dark",
            accentColor: "yellow",
        };
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

    return (
        <StatusAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="status-hero relative min-h-[50vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[10%] left-[5%] w-20 h-20 rounded-full border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[60%] right-[8%] w-16 h-16 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[15%] left-[12%] w-10 h-10 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[25%] right-[18%] w-14 h-14 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[25%] right-[28%] w-20 h-8 -rotate-6 border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[45%] left-[22%] w-8 h-8 rotate-45 bg-coral opacity-0" />
                    {/* SVG shapes */}
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

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 opacity-0 text-white">
                            {heroState.headline}
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-8 opacity-0 text-white/70">
                            {heroState.subtext}
                        </p>

                        <div className="hero-timestamp inline-flex items-center gap-2 px-4 py-2 border-4 border-purple text-xs font-bold uppercase tracking-wider opacity-0 text-white/60">
                            <i className="fa-duotone fa-regular fa-clock text-purple"></i>
                            <span suppressHydrationWarning>
                                Last checked {lastChecked.toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                RETRO METRICS - Bold color-blocked counters
               ══════════════════════════════════════════════════════════════ */}
            <section className="retro-metrics py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    <div className="metric-block p-8 md:p-12 text-center opacity-0 bg-teal text-dark">
                        <div className="retro-metric-value text-4xl md:text-6xl font-black mb-2">
                            {healthyCount}/{totalCount}
                        </div>
                        <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em]">
                            Services Healthy
                        </div>
                    </div>
                    <div className="metric-block p-8 md:p-12 text-center opacity-0 bg-coral text-white">
                        <div className="retro-metric-value text-4xl md:text-6xl font-black mb-2">
                            {avgResponseTime}ms
                        </div>
                        <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em]">
                            Avg Response
                        </div>
                    </div>
                    <div className="metric-block p-8 md:p-12 text-center opacity-0 bg-yellow text-dark">
                        <div className="retro-metric-value text-4xl md:text-6xl font-black mb-2">
                            {uptimePercent}%
                        </div>
                        <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em]">
                            Uptime
                        </div>
                    </div>
                    <div className="metric-block p-8 md:p-12 text-center opacity-0 bg-purple text-white">
                        <div className="retro-metric-value text-4xl md:text-6xl font-black mb-2">
                            30s
                        </div>
                        <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em]">
                            Auto-Refresh
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SERVICE GRID
               ══════════════════════════════════════════════════════════════ */}
            <section className="status-services py-16 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="services-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-white">
                                Services
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                                Service{" "}
                                <span className="text-coral">Breakdown</span>
                            </h2>
                            <p className="text-base text-white/70 mt-2">
                                Real-time health across all infrastructure layers
                            </p>
                        </div>

                        <div className="services-grid grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {serviceStatuses.map((service, idx) => {
                                const accent = accentAt(idx);
                                const borderClass = `border-${accent}`;
                                const accentBg = `bg-${accent}`;

                                return (
                                    <div key={service.name}
                                        className={`service-card relative p-5 border-4 ${borderClass} bg-white/5 opacity-0`}>
                                        {/* Corner accent */}
                                        <div className={`absolute top-0 right-0 w-8 h-8 ${accentBg}`} />

                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <h3 className="font-black text-sm uppercase tracking-wide text-white">
                                                {service.name}
                                            </h3>
                                            <span className={statusBadgeClass(service.status)}>
                                                {statusLabel(service.status)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                                                    Response
                                                </p>
                                                <p className={`text-lg font-black text-${accent}`}>
                                                    {service.responseTime ? `${service.responseTime}ms` : "---"}
                                                </p>
                                            </div>
                                            {service.timestamp && (
                                                <div className="text-right">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                                                        Last Check
                                                    </p>
                                                    <p className="text-xs font-bold text-white/60"
                                                        suppressHydrationWarning>
                                                        {new Date(service.timestamp).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {service.error && (
                                            <div className="mt-3 p-2 border-2 border-coral bg-coral/10">
                                                <p className="text-xs text-coral">
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
                INCIDENT FEED
               ══════════════════════════════════════════════════════════════ */}
            <section className="status-incidents py-16 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="incidents-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-white">
                                Incidents
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Active{" "}
                                <span className="text-coral">Incidents</span>
                            </h2>
                        </div>

                        {/* Active incidents */}
                        {unhealthyServices.length > 0 && (
                            <div className="space-y-4 mb-8">
                                {unhealthyServices.map((service) => (
                                    <div key={service.name}
                                        className="incident-card relative p-6 border-4 border-coral bg-white opacity-0">
                                        <div className="absolute top-0 right-0 w-8 h-8 bg-coral" />
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-coral">
                                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-lg text-white"></i>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-dark">
                                                    {service.name}
                                                </h3>
                                                <p className="text-base mt-1 text-dark/70">
                                                    {service.error || "We're mitigating the issue. Updates every 10 minutes."}
                                                </p>
                                                <span className="inline-block mt-2 badge badge-coral">
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {unhealthyServices.length === 0 && (
                            <div className="no-incidents-card relative p-8 border-4 border-teal bg-white text-center mb-8 opacity-0">
                                <div className="absolute top-0 right-0 w-8 h-8 bg-teal" />
                                <i className="fa-duotone fa-regular fa-circle-check text-5xl text-teal mb-3"></i>
                                <p className="font-black text-xl uppercase tracking-wide text-dark">
                                    No Active Incidents
                                </p>
                                <p className="text-base mt-2 text-dark/60">
                                    All services running smooth. We'll update here if anything changes.
                                </p>
                            </div>
                        )}

                        {/* Past incidents */}
                        {incidents.filter((i) => i.resolved_at).length > 0 && (
                            <div className="past-incidents space-y-4">
                                <h3 className="font-black text-xl uppercase tracking-wide mb-4 text-dark">
                                    <i className="fa-duotone fa-regular fa-clock-rotate-left mr-2 text-purple"></i>
                                    Past Incidents
                                </h3>
                                {incidents
                                    .filter((i) => i.resolved_at)
                                    .map((incident) => (
                                        <div key={incident.id}
                                            className="past-incident-card relative p-5 border-4 border-purple bg-white">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                <div>
                                                    <p className="font-black text-base uppercase tracking-wide text-dark">
                                                        {incident.service_name}
                                                    </p>
                                                    <p className="text-xs mt-1 text-dark/60">
                                                        {incident.severity === "unhealthy" ? "Service outage" : "Degraded performance"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-dark/60"
                                                            suppressHydrationWarning>
                                                            {new Date(incident.started_at).toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-dark/50">
                                                            Duration:{" "}
                                                            {incident.duration_seconds != null
                                                                ? incident.duration_seconds < 60
                                                                    ? `${incident.duration_seconds}s`
                                                                    : `${Math.round(incident.duration_seconds / 60)}m`
                                                                : "N/A"}
                                                        </p>
                                                    </div>
                                                    <span className="badge badge-teal">
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
            <section className="status-cta relative py-20 overflow-hidden bg-dark">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[12%] right-[6%] w-14 h-14 rounded-full border-4 border-coral" />
                    <div className="absolute bottom-[18%] left-[10%] w-10 h-10 rotate-45 bg-teal" />
                    <div className="absolute top-[50%] left-[4%] w-8 h-8 rounded-full bg-yellow" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center max-w-3xl mx-auto opacity-0">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 text-white">
                            Need{" "}
                            <span className="text-coral">Help?</span>
                        </h2>
                        <p className="text-lg mb-8 text-white/60">
                            If you're experiencing issues not reflected here,
                            our support team is ready to assist.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/public/contact-memphis"
                                className="btn btn-coral btn-md uppercase tracking-wider">
                                <i className="fa-duotone fa-regular fa-message"></i>
                                Contact Us
                            </a>
                            <a href="mailto:help@splits.network"
                                className="btn btn-outline-white btn-md uppercase tracking-wider">
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                help@splits.network
                            </a>
                            <a href="/public/status"
                                className="btn btn-outline-white btn-md uppercase tracking-wider">
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
