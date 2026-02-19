"use client";

import {
    useServiceHealth,
    getGatewayBaseUrl,
    type ServiceHealth,
} from "@splits-network/shared-ui";
import { useEffect, useMemo, useState } from "react";
import { StatusBaselAnimator } from "./status-animator";

interface HealthIncident {
    id: string;
    service_name: string;
    severity: string;
    started_at: string;
    resolved_at: string | null;
    duration_seconds: number | null;
}

interface StatusBaselClientProps {
    initialStatuses?: ServiceHealth[];
    initialCheckedAt?: string;
}

export default function StatusBaselClient({
    initialStatuses,
    initialCheckedAt,
}: StatusBaselClientProps) {
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

    const heroState = useMemo(() => {
        if (isLoading) {
            return {
                headline: "Checking system status",
                subtext:
                    "Validating the API gateway, auth, ATS, network, billing, docs, AI, and automation stacks.",
                badgeClass: "badge badge-info",
            };
        }
        if (allHealthy) {
            return {
                headline: "All systems operational",
                subtext:
                    "Recruiter dashboards, pipelines, automations, and AI review signals are green. Everything's running smooth.",
                badgeClass: "badge badge-success",
            };
        }
        if (someUnhealthy) {
            return {
                headline: "Investigating service degradation",
                subtext:
                    "We detected a hiccup. Core features still work — you can browse, apply, and message.",
                badgeClass: "badge badge-error",
            };
        }
        return {
            headline: "Monitoring system anomalies",
            subtext:
                "Unusual patterns detected. No confirmed impact yet. This is precautionary.",
            badgeClass: "badge badge-warning",
        };
    }, [isLoading, allHealthy, someUnhealthy]);

    const statusBadgeClass = (status: string) => {
        switch (status) {
            case "healthy":
                return "badge badge-success badge-sm";
            case "unhealthy":
                return "badge badge-error badge-sm";
            default:
                return "badge badge-warning badge-sm";
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
        <StatusBaselAnimator>
            {/* ══════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════ */}
            <section className="bs-hero py-28 bg-neutral text-neutral-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <div className="bs-hero-badge mb-6 opacity-0">
                            <span className={`${heroState.badgeClass} gap-2`}>
                                <i className="fa-duotone fa-regular fa-signal-bars" />
                                Live System Status
                            </span>
                        </div>

                        <h1 className="bs-hero-headline text-5xl md:text-6xl lg:text-7xl font-black leading-[0.92] tracking-tight mb-6 opacity-0">
                            {heroState.headline}
                        </h1>

                        <p className="bs-hero-body text-lg md:text-xl opacity-70 leading-relaxed mb-8 opacity-0">
                            {heroState.subtext}
                        </p>

                        <div className="bs-hero-timestamp inline-flex items-center gap-3 border-l-4 border-secondary bg-neutral-content/5 px-6 py-3 opacity-0">
                            <i className="fa-duotone fa-regular fa-clock text-secondary" />
                            <span
                                className="text-sm font-semibold opacity-70"
                                suppressHydrationWarning
                            >
                                Last checked {lastChecked.toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                METRICS BAR
               ══════════════════════════════════════════════════════════ */}
            <section className="bs-metrics bg-primary text-primary-content py-10">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {[
                            {
                                value: `${healthyCount}/${totalCount}`,
                                label: "Services Healthy",
                            },
                            { value: `${avgResponseTime}ms`, label: "Avg Response" },
                            { value: `${uptimePercent}%`, label: "Uptime" },
                            { value: "30s", label: "Auto-Refresh" },
                        ].map((m, i) => (
                            <div key={i} className="bs-metric-item opacity-0">
                                <div className="text-3xl md:text-4xl font-black tracking-tight">
                                    {m.value}
                                </div>
                                <div className="text-sm uppercase tracking-wider opacity-70 mt-1">
                                    {m.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                SERVICE GRID
               ══════════════════════════════════════════════════════════ */}
            <section className="bs-services py-20 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-6xl mx-auto">
                        <div className="bs-services-heading mb-12 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                Services
                            </p>
                            <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight">
                                Service breakdown
                            </h2>
                            <p className="text-base text-base-content/60 mt-2">
                                Real-time health across all infrastructure layers
                            </p>
                        </div>

                        <div className="bs-services-grid grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {serviceStatuses.map((service) => {
                                const borderColor =
                                    service.status === "healthy"
                                        ? "border-success"
                                        : service.status === "unhealthy"
                                          ? "border-error"
                                          : "border-warning";
                                const textColor =
                                    service.status === "healthy"
                                        ? "text-success"
                                        : service.status === "unhealthy"
                                          ? "text-error"
                                          : "text-warning";

                                return (
                                    <div
                                        key={service.name}
                                        className={`bs-service-card border-l-4 ${borderColor} bg-base-200 p-5 shadow-sm opacity-0`}
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <h3 className="font-bold text-sm">
                                                {service.name}
                                            </h3>
                                            <span
                                                className={statusBadgeClass(
                                                    service.status,
                                                )}
                                            >
                                                {statusLabel(service.status)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-base-content/40">
                                                    Response
                                                </p>
                                                <p
                                                    className={`text-lg font-black ${textColor}`}
                                                >
                                                    {service.responseTime
                                                        ? `${service.responseTime}ms`
                                                        : "---"}
                                                </p>
                                            </div>
                                            {service.timestamp && (
                                                <div className="text-right">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/40">
                                                        Last Check
                                                    </p>
                                                    <p
                                                        className="text-xs font-bold text-base-content/60"
                                                        suppressHydrationWarning
                                                    >
                                                        {new Date(
                                                            service.timestamp,
                                                        ).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {service.error && (
                                            <div className="mt-3 border-l-2 border-error bg-error/5 p-2">
                                                <p className="text-xs text-error">
                                                    <i className="fa-duotone fa-regular fa-circle-exclamation mr-1" />
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

            {/* ══════════════════════════════════════════════════════════
                INCIDENTS
               ══════════════════════════════════════════════════════════ */}
            <section className="bs-incidents py-20 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="bs-incidents-heading mb-12 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                Incidents
                            </p>
                            <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight">
                                Active incidents
                            </h2>
                        </div>

                        {/* Active incidents */}
                        {unhealthyServices.length > 0 && (
                            <div className="space-y-4 mb-8">
                                {unhealthyServices.map((service) => (
                                    <div
                                        key={service.name}
                                        className="bs-incident-card border-l-4 border-error bg-base-100 p-6 shadow-sm opacity-0"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-error/10">
                                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-lg text-error" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">
                                                    {service.name}
                                                </h3>
                                                <p className="text-base-content/70 mt-1">
                                                    {service.error ||
                                                        "We're mitigating the issue. Updates every 10 minutes."}
                                                </p>
                                                <span className="badge badge-error badge-sm mt-2">
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {unhealthyServices.length === 0 && (
                            <div className="bs-no-incidents border-l-4 border-success bg-base-100 p-8 text-center mb-8 shadow-sm opacity-0">
                                <i className="fa-duotone fa-regular fa-circle-check text-5xl text-success mb-3" />
                                <p className="font-bold text-xl">
                                    No Active Incidents
                                </p>
                                <p className="text-base-content/60 mt-2">
                                    All services running smooth. We&apos;ll update
                                    here if anything changes.
                                </p>
                            </div>
                        )}

                        {/* Past incidents */}
                        {incidents.filter((i) => i.resolved_at).length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-xl mb-4">
                                    <i className="fa-duotone fa-regular fa-clock-rotate-left mr-2 text-secondary" />
                                    Past Incidents
                                </h3>
                                {incidents
                                    .filter((i) => i.resolved_at)
                                    .map((incident) => (
                                        <div
                                            key={incident.id}
                                            className="border-l-4 border-secondary bg-base-100 p-5 shadow-sm"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                <div>
                                                    <p className="font-bold text-base">
                                                        {incident.service_name}
                                                    </p>
                                                    <p className="text-xs text-base-content/60 mt-1">
                                                        {incident.severity ===
                                                        "unhealthy"
                                                            ? "Service outage"
                                                            : "Degraded performance"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p
                                                            className="text-xs font-bold text-base-content/60"
                                                            suppressHydrationWarning
                                                        >
                                                            {new Date(
                                                                incident.started_at,
                                                            ).toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-base-content/50">
                                                            Duration:{" "}
                                                            {incident.duration_seconds !=
                                                            null
                                                                ? incident.duration_seconds <
                                                                  60
                                                                    ? `${incident.duration_seconds}s`
                                                                    : `${Math.round(incident.duration_seconds / 60)}m`
                                                                : "N/A"}
                                                        </p>
                                                    </div>
                                                    <span className="badge badge-success badge-sm">
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

            {/* ══════════════════════════════════════════════════════════
                FOOTER CTA
               ══════════════════════════════════════════════════════════ */}
            <section className="bs-cta py-24 bg-primary text-primary-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="bs-cta-content text-center max-w-3xl mx-auto opacity-0">
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                            Need help?
                        </h2>
                        <p className="text-lg opacity-80 mb-10">
                            If you&apos;re experiencing issues not reflected here,
                            our support team is ready to assist.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/contact"
                                className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg"
                            >
                                <i className="fa-duotone fa-regular fa-message" />
                                Contact Us
                            </a>
                            <a
                                href="mailto:help@splits.network"
                                className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                            >
                                <i className="fa-duotone fa-regular fa-envelope" />
                                help@splits.network
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </StatusBaselAnimator>
    );
}
