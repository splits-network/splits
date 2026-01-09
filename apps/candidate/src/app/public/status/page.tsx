'use client';

import { useServiceHealth } from '@/hooks/useServiceHealth';
import { FormEvent, useEffect, useMemo, useState } from 'react';

const initialFormState = {
    name: '',
    email: '',
    topic: 'technical',
    urgency: 'normal',
    message: '',
};

export default function StatusPage() {
    const {
        serviceStatuses,
        lastChecked,
        healthyCount,
        totalCount,
        allHealthy,
        someUnhealthy,
        isLoading,
        unhealthyServices,
        refresh,
    } = useServiceHealth({ autoRefresh: true });

    const [formData, setFormData] = useState(initialFormState);
    const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        document.title = allHealthy
            ? 'All Systems Operational - Applicant Network'
            : 'Service Status - Applicant Network';
    }, [allHealthy]);

    const overallState = useMemo(() => {
        if (isLoading) {
            return {
                title: 'Checking every service…',
                color: 'bg-base-300 text-base-content',
                message: 'Hang tight while we run the latest health checks.',
                icon: 'fa-duotone fa-regular fa-stethoscope',
            };
        }

        if (allHealthy) {
            return {
                title: 'All Systems Operational',
                color: 'bg-success text-success-content',
                message: 'Realtime updates confirm recruiters, automation, and AI reviews are all online.',
                icon: 'fa-duotone fa-regular fa-circle-check',
            };
        }

        if (someUnhealthy) {
            return {
                title: 'Degraded Performance',
                color: 'bg-error text-error-content',
                message: 'We detected a hiccup and our on-call team is investigating.',
                icon: 'fa-duotone fa-regular fa-triangle-exclamation',
            };
        }

        return {
            title: 'Monitoring in Progress',
            color: 'bg-warning text-warning-content',
            message: 'One or more services are warming up. We will update this card in a moment.',
            icon: 'fa-duotone fa-regular fa-wave-square',
        };
    }, [allHealthy, someUnhealthy, isLoading]);

    const statusBadge = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'badge badge-success';
            case 'unhealthy':
                return 'badge badge-error';
            default:
                return 'badge badge-warning';
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setFormFeedback(null);

        try {
            const response = await fetch('/api/status-contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const responseBody = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(responseBody.error || 'We could not save your note.');
            }

            setFormFeedback({
                type: 'success',
                message: 'Thanks for the update! Our support engineers will reply within one business day.',
            });
            setFormData(initialFormState);
        } catch (error) {
            setFormFeedback({
                type: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'We could not save your note. Please email help@applicant.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-base-200 via-base-100 to-base-200 py-12">
            <div className="container mx-auto px-4">
                <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase text-primary">Applicant Network Live Status</p>
                        <h1 className="text-4xl font-bold mt-2">Stay ahead of every status change</h1>
                        <p className="text-base-content/70 mt-2 max-w-2xl">
                            We monitor the gateway, recruiter tools, AI review pipeline, and document processing stack
                            so candidates always know what to expect.
                        </p>
                    </div>
                    <div className="text-sm text-base-content/70 flex flex-col items-start gap-2">
                        <span className="text-xs" suppressHydrationWarning>
                            Last checked {lastChecked.toLocaleTimeString()} · Auto-refresh every 30s
                        </span>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="space-y-8 lg:col-span-2">
                        <div className={`card ${overallState.color} shadow-xl`}>
                            <div className="card-body">
                                <div className="flex flex-col gap-6 md:flex-row md:justify-between">
                                    <div>
                                        <p className="text-sm uppercase tracking-wide">Live health summary</p>
                                        <h2 className="text-3xl font-bold flex items-center gap-3 mt-2">
                                            <i className={`${overallState.icon} text-2xl`} />
                                            {overallState.title}
                                        </h2>
                                        <p className="mt-2 opacity-90">{overallState.message}</p>
                                    </div>
                                    <div className="grid gap-3 text-sm">
                                        <div className="bg-base-100/20 rounded-xl p-3">
                                            <p className="font-semibold text-lg">{healthyCount}/{totalCount}</p>
                                            <p className="opacity-80">Services healthy</p>
                                        </div>
                                        <div className="bg-base-100/20 rounded-xl p-3">
                                            <p className="font-semibold text-lg">
                                                {someUnhealthy ? 'Investigating' : 'All clear'}
                                            </p>
                                            <p className="opacity-80">AI, automation, billing, and docs monitored</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg">
                                        <i className="fa-duotone fa-regular fa-gauge-high text-primary" />
                                        Response insights
                                    </h3>
                                    <p className="text-base-content/70 text-sm">
                                        We track round-trip response times for every health ping and surface slowdowns
                                        before they impact candidate dashboards.
                                    </p>
                                    <p className="text-xs text-base-content/60 mt-4">
                                        Need deeper telemetry? Contact support for a raw health snapshot.
                                    </p>
                                </div>
                            </div>
                            <div className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg">
                                        <i className="fa-duotone fa-regular fa-bell text-secondary" />
                                        Incident comms
                                    </h3>
                                    <p className="text-base-content/70 text-sm">
                                        During a disruption we post updates here, send proactive notifications, and keep
                                        recruiter + candidate emails flowing via the notification service.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h2 className="card-title">
                                        <i className="fa-duotone fa-regular fa-server" />
                                        Service-by-service detail
                                    </h2>
                                    <span className="text-xs text-base-content/60">
                                        Sorted alphabetically · click refresh for real-time data
                                    </span>
                                </div>
                                <div className="space-y-3 mt-4">
                                    {serviceStatuses.map((service) => (
                                        <div
                                            key={service.name}
                                            className="flex flex-col gap-3 rounded-xl border border-base-200 p-4 md:flex-row md:items-center md:justify-between"
                                        >
                                            <div>
                                                <p className="font-semibold">{service.name}</p>
                                                <p className="text-xs text-base-content/60">
                                                    {service.responseTime
                                                        ? `Response ${service.responseTime}ms`
                                                        : 'Awaiting heartbeat'}
                                                </p>
                                                {service.error && (
                                                    <p className="mt-1 text-xs text-error">
                                                        <i className="fa-duotone fa-regular fa-circle-exclamation mr-1" />
                                                        {service.error}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {service.timestamp && (
                                                    <span className="text-xs text-base-content/50" suppressHydrationWarning>
                                                        {new Date(service.timestamp).toLocaleTimeString()}
                                                    </span>
                                                )}
                                                <span className={statusBadge(service.status)}>
                                                    {service.status === 'healthy'
                                                        ? 'Operational'
                                                        : service.status === 'unhealthy'
                                                            ? 'Investigating'
                                                            : 'Checking'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <i className="fa-duotone fa-regular fa-wave-square" />
                                    Live updates & incidents
                                </h2>
                                {unhealthyServices.length > 0 ? (
                                    <div className="mt-4 space-y-4">
                                        {unhealthyServices.map((service) => (
                                            <div key={service.name} className="alert alert-error">
                                                <i className="fa-duotone fa-regular fa-circle-exclamation" />
                                                <div>
                                                    <p className="font-semibold">{service.name}</p>
                                                    <p className="text-sm">
                                                        {service.error ||
                                                            'Our engineers are investigating and will share updates soon.'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-base-content/70 mt-4">
                                        No active incidents. Our AI review service, automation flows, billing, and
                                        document stack are operating normally.
                                    </p>
                                )}
                                <p className="text-xs text-base-content/50 mt-6">
                                    We post maintenance windows at least 24 hours in advance and update this feed first
                                    whenever something changes.
                                </p>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h2 className="card-title text-2xl">
                                    <i className="fa-duotone fa-regular fa-envelope-circle-check text-primary" />
                                    Talk with support
                                </h2>
                                <p className="text-sm text-base-content/70">
                                    Send us context from right inside the status page and we&apos;ll loop you into the
                                    incident channel.
                                </p>

                                {formFeedback && (
                                    <div
                                        className={`alert ${formFeedback.type === 'success' ? 'alert-success' : 'alert-error'
                                            } mt-4`}
                                    >
                                        <span>{formFeedback.message}</span>
                                    </div>
                                )}

                                <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                                    <div className="fieldset">
                                        <label className="label">Full name</label>
                                        <input
                                            className="input w-full"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Taylor Candidate"
                                        />
                                    </div>
                                    <div className="fieldset">
                                        <label className="label">Email</label>
                                        <input
                                            className="input w-full"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="you@applicant.network"
                                        />
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="fieldset">
                                            <label className="label">Topic</label>
                                            <select
                                                className="select w-full"
                                                value={formData.topic}
                                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                            >
                                                <option value="technical">Technical issue</option>
                                                <option value="ai">AI review question</option>
                                                <option value="documents">Document upload</option>
                                                <option value="notifications">Notifications</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="fieldset">
                                            <label className="label">Urgency</label>
                                            <select
                                                className="select w-full"
                                                value={formData.urgency}
                                                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                            >
                                                <option value="normal">Normal</option>
                                                <option value="high">High - blocking applications</option>
                                                <option value="low">Low - FYI</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="fieldset">
                                        <label className="label">Message</label>
                                        <textarea
                                            className="textarea h-24 w-full"
                                            required
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Share any impact to your applications or recruiter convos…"
                                        />
                                    </div>
                                    <button className="btn btn-primary w-full" disabled={submitting} type="submit">
                                        {submitting ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm mr-2" />
                                                Sending…
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-duotone fa-regular fa-paper-plane mr-2" />
                                                Send update
                                            </>
                                        )}
                                    </button>
                                </form>
                                <p className="text-xs text-base-content/60 mt-4">
                                    Prefer email?{' '}
                                    <a className="link link-primary" href="mailto:help@applicant.network">
                                        help@applicant.network
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="card-title text-lg">
                                    <i className="fa-duotone fa-regular fa-clock text-secondary" />
                                    Support hours
                                </h3>
                                <ul className="text-sm text-base-content/70 space-y-1 mt-2">
                                    <li>Monday–Friday: 9am – 6pm ET</li>
                                    <li>Saturday: 10am – 4pm ET</li>
                                    <li>Sunday: On-call coverage for incidents</li>
                                </ul>
                                <p className="text-xs text-base-content/60 mt-3">
                                    For urgent issues, mention “status page” in your note so we can prioritize the
                                    thread.
                                </p>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="card-title text-lg">
                                    <i className="fa-duotone fa-regular fa-circle-info text-accent" />
                                    Quick resources
                                </h3>
                                <ul className="text-sm text-base-content/70 space-y-2">
                                    <li>• Help Center: /help</li>
                                    <li>• Candidate community: /marketplace</li>
                                    <li>• Instant notifications: enable push + email under Settings</li>
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
