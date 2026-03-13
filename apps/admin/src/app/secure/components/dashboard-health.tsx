'use client';

import React, { useEffect, useState } from 'react';

interface ServiceStatus {
    name: string;
    status: 'up' | 'degraded' | 'down';
    latencyMs?: number;
}

const GATEWAY_URL = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL || 'http://localhost:3030';

const SERVICES: { name: string; path: string }[] = [
    { name: 'Admin Gateway', path: '/health' },
    { name: 'Identity', path: '/api/v3/identity/health' },
    { name: 'ATS', path: '/api/v3/ats/health' },
    { name: 'Billing', path: '/api/v3/billing/health' },
];

async function checkService(
    name: string,
    path: string,
    token: string,
): Promise<ServiceStatus> {
    const start = Date.now();
    try {
        const res = await fetch(`${GATEWAY_URL}${path}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(5000),
        });
        const latencyMs = Date.now() - start;
        if (!res.ok) return { name, status: 'degraded', latencyMs };
        return {
            name,
            status: latencyMs > 2000 ? 'degraded' : 'up',
            latencyMs,
        };
    } catch {
        return { name, status: 'down', latencyMs: undefined };
    }
}

const STATUS_COLOR = {
    up: 'text-success',
    degraded: 'text-warning',
    down: 'text-error',
};

const STATUS_ICON = {
    up: 'fa-circle-check',
    degraded: 'fa-circle-exclamation',
    down: 'fa-circle-xmark',
};

interface DashboardHealthProps {
    token: string | null;
}

export function DashboardHealth({ token }: DashboardHealthProps) {
    const [services, setServices] = useState<ServiceStatus[]>([]);
    const [checking, setChecking] = useState(false);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    const runHealthCheck = async () => {
        if (!token) return;
        setChecking(true);
        const results = await Promise.all(
            SERVICES.map((s) => checkService(s.name, s.path, token)),
        );
        setServices(results);
        setLastChecked(new Date());
        setChecking(false);
    };

    useEffect(() => {
        if (token) void runHealthCheck();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const overallStatus =
        services.length === 0
            ? 'up'
            : services.some((s) => s.status === 'down')
              ? 'down'
              : services.some((s) => s.status === 'degraded')
                ? 'degraded'
                : 'up';

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
            <div className="card-body p-4 gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <i className={`fa-duotone fa-regular fa-server ${STATUS_COLOR[overallStatus]}`} />
                        <h3 className="font-semibold text-sm">System Health</h3>
                    </div>
                    <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => void runHealthCheck()}
                        disabled={checking || !token}
                        type="button"
                    >
                        {checking ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-arrows-rotate text-xs" />
                        )}
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    {services.length === 0 && !checking ? (
                        <p className="text-xs text-base-content/50">
                            {token ? 'Click refresh to check services' : 'Awaiting auth...'}
                        </p>
                    ) : (
                        services.map((svc) => (
                            <div key={svc.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <i className={`fa-duotone fa-regular ${STATUS_ICON[svc.status]} ${STATUS_COLOR[svc.status]} text-xs`} />
                                    <span className="text-base-content/80">{svc.name}</span>
                                </div>
                                {svc.latencyMs !== undefined && (
                                    <span className="text-xs text-base-content/40">
                                        {svc.latencyMs}ms
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {lastChecked && (
                    <p className="text-xs text-base-content/30 mt-auto">
                        Checked {lastChecked.toLocaleTimeString()}
                    </p>
                )}
            </div>
        </div>
    );
}
