'use client';

import { useServiceHealth } from '@/hooks/useServiceHealth';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const corporateFormDefaults = {
    name: '',
    email: '',
    topic: 'operations',
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
                title: 'Validating services…',
                color: 'bg-base-300 text-base-content',
                message: 'We run health checks on every corporate surface before publishing results.',
                icon: 'fa-solid fa-stethoscope',
            };
        }

        if (allHealthy) {
            return {
                title: 'All Systems Operational',
                color: 'bg-primary text-primary-content',
                message: 'Partner dashboards, lead forms, and analytics are ready for your next campaign.',
                icon: 'fa-solid fa-circle-check',
            };
        }

        if (someUnhealthy) {
            return {
                title: 'Investigating anomalies',
                color: 'bg-error text-error-content',
                message: 'Our reliability team is mitigating an issue. Track the impacted services below.',
                icon: 'fa-solid fa-triangle-exclamation',
            };
        }

        return {
            title: 'Degraded Performance',
            color: 'bg-warning text-warning-content',
            message: 'Some upstream dependencies are warming up; we will post updates shortly.',
            icon: 'fa-solid fa-wave-square',
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
            const response = await fetch('/api/status-contact', {
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
                message: 'Message received — watch your inbox for a follow-up from our success team.',
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
                        <p className="text-sm uppercase tracking-wide text-secondary font-semibold">
                            Employment Networks Status
                        </p>
                        <h1 className="text-4xl font-bold mt-2">Realtime service visibility</h1>
                        <p className="text-base-content/70 mt-2 max-w-2xl">
                            Keep marketing sites, partner funnels, and recruiter handoffs humming. Monitor gateway,
                            automation, billing, document, and AI services in one place.
                        </p>
                    </div>
                    <div className="text-sm text-base-content/70 flex flex-col gap-2 items-start">
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
                                        <p className="text-sm uppercase">Corporate health summary</p>
                                        <h2 className="text-3xl font-bold flex items-center gap-3 mt-2">
                                            <i className={`${overallState.icon} text-2xl`} />
                                            {overallState.title}
                                        </h2>
                                        <p className="mt-2 opacity-90">{overallState.message}</p>
                                    </div>
                                    <div className="grid gap-3 text-sm">
                                        <div className="bg-base-100/20 rounded-xl p-3">
                                            <p className="font-semibold text-lg">{healthyCount}/{totalCount}</p>
                                            <p className="opacity-80">Services online</p>
                                        </div>
                                        <div className="bg-base-100/20 rounded-xl p-3">
                                            <p className="font-semibold text-lg">
                                                {someUnhealthy ? 'Action required' : 'Everything green'}
                                            </p>
                                            <p className="opacity-80">Gateway, document, AI, automation coverage</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h2 className="card-title">
                                        <i className="fa-solid fa-server" />
                                        Service-by-service health
                                    </h2>
                                    <span className="text-xs text-base-content/60">Monitoring 24/7/365</span>
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
                                                        <i className="fa-solid fa-circle-exclamation mr-1" />
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
                                    <i className="fa-solid fa-bullhorn" />
                                    Live incident feed
                                </h2>
                                {unhealthyServices.length > 0 ? (
                                    <div className="mt-4 space-y-4">
                                        {unhealthyServices.map((service) => (
                                            <div key={service.name} className="alert alert-error">
                                                <i className="fa-solid fa-triangle-exclamation" />
                                                <div>
                                                    <p className="font-semibold">{service.name}</p>
                                                    <p className="text-sm">
                                                        {service.error ||
                                                            'We are mitigating the issue and will update this feed shortly.'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-base-content/70 mt-4">
                                        No active incidents. If you are seeing unexpected behavior, drop us a note via
                                        the contact form and we will open a ticket immediately.
                                    </p>
                                )}
                                <div className="divider" />
                                <p className="text-xs text-base-content/60">
                                    Maintenance is scheduled during low-traffic windows and announced here plus via
                                    email.
                                </p>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h2 className="card-title text-2xl">
                                    <i className="fa-solid fa-headset text-primary" />
                                    Contact success team
                                </h2>
                                <p className="text-sm text-base-content/70">
                                    Let us know if a status change is impacting a launch, event, or executive review.
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
                                            placeholder="Jordan Recruiter"
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
                                            placeholder="you@company.com"
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
                                                <option value="marketing">Marketing site</option>
                                                <option value="automation">Automation</option>
                                                <option value="ai">AI review</option>
                                                <option value="documents">Document workflows</option>
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
                                                <option value="high">High - launch blocking</option>
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
                                            placeholder="Share impact, timeline expectations, and stakeholders."
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
                                                <i className="fa-solid fa-paper-plane mr-2" />
                                                Send message
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
                                    <i className="fa-solid fa-clock text-secondary" />
                                    Enterprise support hours
                                </h3>
                                <ul className="text-sm text-base-content/70 space-y-1 mt-2">
                                    <li>Weekdays: 8am – 8pm ET</li>
                                    <li>Weekends: On-call response for severity 1 incidents</li>
                                </ul>
                                <p className="text-xs text-base-content/60 mt-3">
                                    Severity definitions follow your MSA. Mention the severity tier in your note for the
                                    fastest escalation.
                                </p>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="card-title text-lg">
                                    <i className="fa-solid fa-circle-info text-accent" />
                                    Quick references
                                </h3>
                                <ul className="text-sm text-base-content/70 space-y-2">
                                    <li>• Partner portal: portal.splits.network</li>
                                    <li>• Incident playbook (PDF) — request via support</li>
                                    <li>• Subscribe to RSS: /status.rss</li>
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
