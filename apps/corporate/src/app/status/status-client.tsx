'use client';

import { useServiceHealth, type ServiceHealth } from '@/hooks/useServiceHealth';
import { FormEvent, useEffect, useMemo, useState } from 'react';

const corporateFormDefaults = {
    name: '',
    email: '',
    topic: 'operations',
    urgency: 'normal',
    message: '',
};

interface StatusPageClientProps {
    initialStatuses?: ServiceHealth[];
    initialCheckedAt?: string;
}

export default function StatusPageClient({ initialStatuses, initialCheckedAt }: StatusPageClientProps) {
    const {
        serviceStatuses,
        lastChecked,
        healthyCount,
        totalCount,
        allHealthy,
        someUnhealthy,
        isLoading,
        unhealthyServices,
    } = useServiceHealth({ autoRefresh: true, initialStatuses, initialCheckedAt });

    const [formData, setFormData] = useState(corporateFormDefaults);
    const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        document.title = allHealthy
            ? 'All Systems Operational - Employment Networks'
            : 'Service Status - Employment Networks';
    }, [allHealthy]);

    const overallState = useMemo(() => {
        if (isLoading) {
            return {
                title: 'Validating services.',
                color: 'bg-base-300 text-base-content',
                message: 'We run health checks on every corporate surface before publishing results.',
                icon: 'fa-duotone fa-regular fa-stethoscope',
            };
        }

        if (allHealthy) {
            return {
                title: 'All Systems Operational',
                color: 'bg-primary text-primary-content',
                message: 'Partner dashboards, lead forms, and analytics are ready for your next campaign.',
                icon: 'fa-duotone fa-regular fa-circle-check',
            };
        }

        if (someUnhealthy) {
            return {
                title: 'Investigating anomalies',
                color: 'bg-error text-error-content',
                message: 'Our reliability team is mitigating an issue. Track the impacted services below.',
                icon: 'fa-duotone fa-regular fa-triangle-exclamation',
            };
        }

        return {
            title: 'Degraded Performance',
            color: 'bg-warning text-warning-content',
            message: 'Some upstream dependencies are warming up; we will post updates shortly.',
            icon: 'fa-duotone fa-regular fa-wave-square',
        };
    }, [allHealthy, isLoading, someUnhealthy]);

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
            const response = await fetch('/api/v2/status-contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const responseBody = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(responseBody.error || 'Unable to send feedback.');
            }

            setFormFeedback({
                type: 'success',
                message: 'Message received - watch your inbox for a follow-up from our success team.',
            });
            setFormData(corporateFormDefaults);
        } catch (error) {
            setFormFeedback({
                type: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Unable to send feedback. Email help@employmentnetworks.com and we will jump in.',
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
                        <p className="text-xs uppercase tracking-wide text-secondary font-semibold">
                            Employment Networks platform status
                        </p>
                        <h1 className="text-4xl font-bold mt-2">Operational clarity for every campaign</h1>
                        <p className="text-base-content/70 mt-2 max-w-3xl">
                            Live health telemetry across the gateway, identity, ATS, network, billing, docs, AI, and automation services powering Employment Networks.
                        </p>
                    </div>
                    <div className="text-sm text-base-content/70 flex flex-col gap-2 items-start">
                        <span className="text-xs" suppressHydrationWarning>
                            Last checked {lastChecked.toLocaleTimeString()} &nbsp; Auto-refresh every 30 seconds
                        </span>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="space-y-8 lg:col-span-2">
                        <div className={`card ${overallState.color} shadow-xl`}>
                            <div className="card-body">
                                <div className="flex flex-col gap-6 md:flex-row md:justify-between">
                                    <div>
                                        <p className="text-sm uppercase">Live overview</p>
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
                                                {someUnhealthy ? 'Action required' : 'Everything green'}
                                            </p>
                                            <p className="opacity-80">Gateway, AI review, automation, and docs monitored</p>
                                        </div>
                                    </div>
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
                                    <span className="text-xs text-base-content/60">Sorted alphabetically</span>
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
                                    Live incident feed
                                </h2>
                                {unhealthyServices.length > 0 ? (
                                    <div className="mt-4 space-y-4">
                                        {unhealthyServices.map((service) => (
                                            <div key={service.name} className="alert alert-error">
                                                <i className="fa-duotone fa-regular fa-triangle-exclamation" />
                                                <div>
                                                    <p className="font-semibold">{service.name}</p>
                                                    <p className="text-sm">
                                                        {service.error || 'We are mitigating the issue and will update shortly.'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-base-content/70 mt-4">
                                        No incidents at this time. If you are seeing unexpected behavior, let us know via the contact form.
                                    </p>
                                )}
                                <div className="divider" />
                                <p className="text-xs text-base-content/60">
                                    Maintenance notifications, release notes, and RCA summaries are also distributed via email.
                                </p>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h2 className="card-title text-2xl">
                                    <i className="fa-duotone fa-regular fa-headset text-primary" />
                                    Ping support
                                </h2>
                                <p className="text-sm text-base-content/70">
                                    Share how the status impacts your teams and we&apos;ll loop you into the incident channel.
                                </p>

                                {formFeedback && (
                                    <div
                                        className={`alert mt-4 ${formFeedback.type === 'success' ? 'alert-success' : 'alert-error'
                                            }`}
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
                                            placeholder="Alex Operations"
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
                                            placeholder="you@employmentnetworks.com"
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
                                                <option value="operations">Operations</option>
                                                <option value="partners">Partner support</option>
                                                <option value="campaigns">Campaigns</option>
                                                <option value="analytics">Analytics</option>
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
                                                <option value="high">High - blocker</option>
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
                                            placeholder="Include affected teams, timelines, and links."
                                        />
                                    </div>
                                    <button className="btn btn-primary w-full" disabled={submitting} type="submit">
                                        {submitting ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm mr-2" />
                                                Sending.
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
                                    <a className="link link-primary" href="mailto:help@employmentnetworks.com">
                                        help@employmentnetworks.com
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
                                    <li>Weekdays: 8am - 6pm ET</li>
                                    <li>Weekends: On-call escalation for Sev 1 incidents</li>
                                </ul>
                                <p className="text-xs text-base-content/60 mt-3">
                                    Mention the incident ID (if any) and we will tie your note to the active thread.
                                </p>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="card-title text-lg">
                                    <i className="fa-duotone fa-regular fa-circle-info text-accent" />
                                    Quick links
                                </h3>
                                <ul className="text-sm text-base-content/70 space-y-2">
                                    <li>- Press kit: employment-networks.com/press</li>
                                    <li>- Partner program overview</li>
                                    <li>- Subscribe to status RSS/JSON feeds</li>
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
