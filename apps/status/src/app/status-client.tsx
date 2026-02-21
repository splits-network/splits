"use client";

import {
    useServiceHealth,
    type ServiceHealth,
} from "@splits-network/shared-ui";
import { FormEvent, useMemo, useState } from "react";
import { StatusAnimator } from "@/components/status-animator";

interface HealthIncident {
    id: string;
    service_name: string;
    severity: string;
    started_at: string;
    resolved_at: string | null;
    duration_seconds: number | null;
}

interface StatusClientProps {
    initialStatuses?: ServiceHealth[];
    initialCheckedAt?: string;
    initialIncidents?: HealthIncident[];
}

const formDefaults = {
    name: "",
    email: "",
    topic: "support",
    urgency: "normal",
    message: "",
};

export default function StatusClient({
    initialStatuses,
    initialCheckedAt,
    initialIncidents = [],
}: StatusClientProps) {
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

    const [incidents] = useState<HealthIncident[]>(initialIncidents);
    const [formData, setFormData] = useState(formDefaults);
    const [formFeedback, setFormFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const [submitting, setSubmitting] = useState(false);

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
                    "Running health checks across all platform services. Results in a moment.",
                badgeClass: "badge badge-info",
            };
        }
        if (allHealthy) {
            return {
                headline: "All systems operational",
                subtext:
                    "All platform services are responding normally. Dashboards, pipelines, automations, and AI review are fully operational.",
                badgeClass: "badge badge-success",
            };
        }
        if (someUnhealthy) {
            return {
                headline: "Investigating service degradation",
                subtext:
                    "One or more services are not responding as expected. Core platform features remain available.",
                badgeClass: "badge badge-error",
            };
        }
        return {
            headline: "Monitoring system anomalies",
            subtext:
                "Unusual activity patterns detected across one or more services. No confirmed user impact. Monitoring as a precaution.",
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

    const groupedIncidents = useMemo(() => {
        const resolved = incidents.filter((i) => i.resolved_at);
        const groups: Record<string, HealthIncident[]> = {};
        for (const incident of resolved) {
            const day = new Date(incident.started_at).toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC",
                },
            );
            if (!groups[day]) groups[day] = [];
            groups[day].push(incident);
        }
        return Object.entries(groups);
    }, [incidents]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setFormFeedback(null);

        try {
            const response = await fetch("/api/v2/status-contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    source: "status-app",
                    submitted_at: new Date().toISOString(),
                }),
            });

            const responseBody = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    responseBody.error ||
                        "Submission failed. Check your connection and try again.",
                );
            }

            setFormFeedback({
                type: "success",
                message:
                    "Report received. Our support team will follow up within one business day.",
            });
            setFormData(formDefaults);
        } catch (error) {
            setFormFeedback({
                type: "error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Submission failed. Email help@splits.network directly and reference the status page.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <StatusAnimator>
            {/* ══════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════ */}
            <section className="bs-hero py-28 bg-neutral text-neutral-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <div className="bs-hero-badge mb-6 opacity-0">
                            <span className={`${heroState.badgeClass} gap-2`}>
                                <i className="fa-duotone fa-regular fa-signal-bars" />
                                System Status
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
                                Last checked{" "}
                                {lastChecked.toLocaleTimeString()}
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
                                label: "Healthy Services",
                            },
                            {
                                value: `${avgResponseTime}ms`,
                                label: "Avg Response Time",
                            },
                            {
                                value: `${uptimePercent}%`,
                                label: "Uptime",
                            },
                            { value: "30s", label: "Refresh Interval" },
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
                EDITORIAL SPLIT — SERVICES (2/3) + INCIDENTS (1/3)
               ══════════════════════════════════════════════════════════ */}
            <section
                id="incidents"
                className="bs-editorial py-20 bg-base-100"
            >
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Section kicker + heading spans full width */}
                        <div className="bs-editorial-heading mb-12 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                Infrastructure
                            </p>
                            <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight">
                                Live service health
                            </h2>
                            <p className="text-base text-base-content/60 mt-2 max-w-2xl">
                                Real-time health for every service in the
                                platform, updated every 30 seconds.
                            </p>
                        </div>

                        {/* 2/3 + 1/3 editorial split */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* LEFT — Service breakdown (2/3) */}
                            <div className="lg:col-span-2">
                                <div className="bs-services">
                                    <h3 className="bs-services-heading text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 mb-5 border-b border-base-300 pb-3 opacity-0">
                                        Service health
                                    </h3>

                                    <div className="bs-services-grid grid md:grid-cols-2 gap-3">
                                        {serviceStatuses.map((service) => {
                                            const borderColor =
                                                service.status === "healthy"
                                                    ? "border-success"
                                                    : service.status ===
                                                        "unhealthy"
                                                      ? "border-error"
                                                      : "border-warning";
                                            const textColor =
                                                service.status === "healthy"
                                                    ? "text-success"
                                                    : service.status ===
                                                        "unhealthy"
                                                      ? "text-error"
                                                      : "text-warning";

                                            return (
                                                <div
                                                    key={service.name}
                                                    className={`bs-service-card border-l-4 ${borderColor} bg-base-200 p-5 shadow-sm opacity-0`}
                                                >
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <h4 className="font-bold text-sm">
                                                            {service.name}
                                                        </h4>
                                                        <span
                                                            className={statusBadgeClass(
                                                                service.status,
                                                            )}
                                                        >
                                                            {statusLabel(
                                                                service.status,
                                                            )}
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

                            {/* RIGHT — Active incidents (1/3) */}
                            <div className="bs-incidents">
                                <h3 className="bs-incidents-heading text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 mb-5 border-b border-base-300 pb-3 opacity-0">
                                    Active incidents
                                </h3>

                                {unhealthyServices.length > 0 && (
                                    <div className="space-y-4">
                                        {unhealthyServices.map((service) => (
                                            <div
                                                key={service.name}
                                                className="bs-incident-card border-l-4 border-error bg-base-200 p-5 shadow-sm opacity-0"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-error/10">
                                                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-error" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-sm">
                                                            {service.name}
                                                        </h4>
                                                        <p className="text-xs text-base-content/70 mt-1 leading-relaxed">
                                                            {service.error ||
                                                                "Investigating. This page updates automatically as status changes."}
                                                        </p>
                                                        <span className="badge badge-error badge-xs mt-2">
                                                            Active
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {unhealthyServices.length === 0 && (
                                    <div className="bs-no-incidents border-l-4 border-success bg-base-200 p-6 shadow-sm opacity-0">
                                        <div className="flex items-center gap-4 mb-3">
                                            <i className="fa-duotone fa-regular fa-circle-check text-2xl text-success" />
                                            <p className="font-bold text-base">
                                                All clear
                                            </p>
                                        </div>
                                        <p className="text-sm text-base-content/60 leading-relaxed">
                                            All services are operating normally.
                                            This page updates automatically if
                                            conditions change.
                                        </p>
                                    </div>
                                )}

                                {/* Sidebar info cards */}
                                <div className="mt-6 space-y-4">
                                    <div className="bs-sidebar-card border-l-4 border-secondary bg-base-200 p-5 shadow-sm opacity-0">
                                        <h4 className="font-bold text-sm mb-2">
                                            <i className="fa-duotone fa-regular fa-clock text-secondary mr-2" />
                                            Support hours
                                        </h4>
                                        <ul className="text-xs text-base-content/70 space-y-1">
                                            <li>Weekdays: 8am - 8pm ET</li>
                                            <li>
                                                Weekends: On-call for critical
                                                incidents
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bs-sidebar-card border-l-4 border-accent bg-base-200 p-5 shadow-sm opacity-0">
                                        <h4 className="font-bold text-sm mb-2">
                                            <i className="fa-duotone fa-regular fa-circle-info text-accent mr-2" />
                                            Quick links
                                        </h4>
                                        <ul className="text-xs text-base-content/70 space-y-1.5">
                                            <li>
                                                <a
                                                    href="https://splits.network"
                                                    className="link link-primary"
                                                >
                                                    Splits Network
                                                </a>{" "}
                                                — platform
                                            </li>
                                            <li>
                                                <a
                                                    href="mailto:help@splits.network"
                                                    className="link link-primary"
                                                >
                                                    help@splits.network
                                                </a>{" "}
                                                — email
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                CONTACT — PING SUPPORT
               ══════════════════════════════════════════════════════════ */}
            <section id="contact" className="bs-contact py-20 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-10 opacity-0 bs-contact-heading">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                                Report an Issue
                            </p>
                            <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight">
                                Report an issue
                            </h2>
                            <p className="text-base text-base-content/60 mt-2">
                                Describe what you are experiencing and our
                                support team will follow up directly.
                            </p>
                        </div>

                        <div className="bs-contact-form border-l-4 border-primary bg-base-100 p-8 shadow-md opacity-0">
                            {formFeedback && (
                                <div
                                    className={`alert mb-6 ${
                                        formFeedback.type === "success"
                                            ? "alert-success"
                                            : "alert-error"
                                    }`}
                                >
                                    <span>{formFeedback.message}</span>
                                </div>
                            )}

                            <form
                                className="space-y-5"
                                onSubmit={handleSubmit}
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend">
                                            Full name
                                        </legend>
                                        <input
                                            className="input w-full"
                                            required
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                            placeholder="Your full name"
                                        />
                                    </fieldset>
                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend">
                                            Email
                                        </legend>
                                        <input
                                            className="input w-full"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                })
                                            }
                                            placeholder="you@company.com"
                                        />
                                    </fieldset>
                                </div>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend">
                                            Topic
                                        </legend>
                                        <select
                                            className="select w-full"
                                            value={formData.topic}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    topic: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="support">
                                                General Support
                                            </option>
                                            <option value="automation">
                                                Automation
                                            </option>
                                            <option value="ai">
                                                AI review
                                            </option>
                                            <option value="documents">
                                                Document workflows
                                            </option>
                                            <option value="billing">
                                                Billing/reporting
                                            </option>
                                        </select>
                                    </fieldset>
                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend">
                                            Urgency
                                        </legend>
                                        <select
                                            className="select w-full"
                                            value={formData.urgency}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    urgency: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="normal">
                                                Normal
                                            </option>
                                            <option value="high">
                                                High — Blocking Issue
                                            </option>
                                            <option value="low">
                                                Low — Informational
                                            </option>
                                        </select>
                                    </fieldset>
                                </div>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">
                                        Message
                                    </legend>
                                    <textarea
                                        className="textarea h-28 w-full"
                                        required
                                        value={formData.message}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                message: e.target.value,
                                            })
                                        }
                                        placeholder="What are you experiencing? Include affected workflows, error messages, and timing."
                                    />
                                </fieldset>
                                <button
                                    className="btn btn-primary"
                                    disabled={submitting}
                                    type="submit"
                                >
                                    {submitting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-regular fa-paper-plane" />
                                            Submit Report
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                NEED HELP CTA
               ══════════════════════════════════════════════════════════ */}
            <section className="bs-cta py-24 bg-primary text-primary-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="bs-cta-content text-center max-w-3xl mx-auto opacity-0">
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                            Something not right?
                        </h2>
                        <p className="text-lg opacity-80 mb-10">
                            If you are experiencing an issue not shown above,
                            reach out. Our support team responds within the hour
                            during business hours.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="#contact"
                                className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg"
                            >
                                <i className="fa-duotone fa-regular fa-message" />
                                Report Issue
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

            {/* ══════════════════════════════════════════════════════════
                PAST INCIDENTS (collapsible archive)
               ══════════════════════════════════════════════════════════ */}
            {groupedIncidents.length > 0 && (
                <section className="bs-past-incidents py-16 bg-base-100">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="max-w-4xl mx-auto">
                            <details className="group">
                                <summary className="bs-past-incidents-toggle font-bold text-xl cursor-pointer list-none flex items-center gap-2 select-none opacity-0">
                                    <i className="fa-duotone fa-regular fa-chevron-right text-sm text-secondary transition-transform duration-200 group-open:rotate-90" />
                                    <i className="fa-duotone fa-regular fa-clock-rotate-left mr-1 text-secondary" />
                                    Incident History
                                    <span className="text-sm font-normal text-base-content/50 ml-2">
                                        ({incidents.filter((i) => i.resolved_at).length})
                                    </span>
                                </summary>
                                <div className="space-y-8 mt-6">
                                    {groupedIncidents.map(
                                        ([day, dayIncidents]) => (
                                            <div key={day}>
                                                <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/40 mb-4 border-b border-base-300 pb-2">
                                                    {day}
                                                </h4>
                                                <div className="space-y-3">
                                                    {dayIncidents.map(
                                                        (incident) => (
                                                            <div
                                                                key={
                                                                    incident.id
                                                                }
                                                                className="border-l-4 border-secondary bg-base-200 p-5 shadow-sm"
                                                            >
                                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                                    <div>
                                                                        <p className="font-bold text-base">
                                                                            {
                                                                                incident.service_name
                                                                            }
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
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </details>
                        </div>
                    </div>
                </section>
            )}
        </StatusAnimator>
    );
}
