'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface MarketplaceMetrics {
    id: string;
    date: string;
    total_placements: number;
    total_applications: number;
    hire_rate: number;
    placement_completion_rate: number;
    avg_time_to_hire_days: number;
    active_recruiters: number;
    active_jobs: number;
    active_candidates: number;
    fraud_signals: number;
    disputed_placements: number;
    health_score: number;
}

interface MarketplaceHealthWidgetProps {
    limit?: number;
}

export default function MarketplaceHealthWidget({ limit = 7 }: MarketplaceHealthWidgetProps) {
    const { getToken } = useAuth();
    const [metrics, setMetrics] = useState<MarketplaceMetrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadMetrics();
    }, [limit]);

    const loadMetrics = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                setError('Not authenticated');
                return;
            }

            const api = createAuthenticatedClient(token);

            // Fetch marketplace health metrics from analytics service
            const response: any = await api.get('/marketplace-metrics', {
                params: {
                    limit,
                    sort_by: 'date',
                    sort_order: 'desc',
                },
            });

            const data = response?.data || response;
            setMetrics(Array.isArray(data) ? data : []);
        } catch (err: any) {
            // Endpoint may not exist yet - show empty state instead of error
            console.debug('Marketplace metrics endpoint not available:', err.message);
            setMetrics([]);
        } finally {
            setLoading(false);
        }
    };

    const latestMetrics = metrics[0];

    if (loading) {
        return (
            <div className="card bg-base-100">
                <div className="card-body">
                    <h3 className="card-title text-lg mb-4">Marketplace Health</h3>
                    <div className="flex items-center justify-center h-64">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !latestMetrics) {
        return (
            <div className="card bg-base-100">
                <div className="card-body">
                    <h3 className="card-title text-lg mb-4">Marketplace Health</h3>
                    <div className="flex flex-col items-center justify-center h-48 text-base-content/50">
                        <i className="fa-duotone fa-regular fa-chart-line text-4xl mb-3 opacity-30"></i>
                        <p className="text-sm">Marketplace metrics not available</p>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate health score color
    const getHealthColor = (score: number) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'error';
    };

    const healthColor = getHealthColor(latestMetrics.health_score);

    return (
        <div className="card bg-base-100">
            <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="card-title text-lg">Marketplace Health</h3>
                    <div className={`badge badge-${healthColor} badge-lg`}>
                        {latestMetrics.health_score.toFixed(0)} / 100
                    </div>
                </div>

                {/* Health Score Gauge */}
                <div className="mb-6">
                    <div className="flex items-center justify-center mb-2">
                        <div
                            className="radial-progress text-primary"
                            style={{ '--value': latestMetrics.health_score } as any}
                            role="progressbar"
                        >
                            <span className="text-2xl font-bold">{latestMetrics.health_score.toFixed(0)}</span>
                        </div>
                    </div>
                    <p className="text-center text-sm text-base-content/60">
                        Last updated: {new Date(latestMetrics.date).toLocaleDateString()}
                    </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title text-xs">Hire Rate</div>
                        <div className="stat-value text-lg">{(latestMetrics.hire_rate * 100).toFixed(1)}%</div>
                    </div>
                    <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title text-xs">Avg Time to Hire</div>
                        <div className="stat-value text-lg">{latestMetrics.avg_time_to_hire_days}d</div>
                    </div>
                    <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title text-xs">Active Recruiters</div>
                        <div className="stat-value text-lg">{latestMetrics.active_recruiters}</div>
                    </div>
                    <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title text-xs">Active Jobs</div>
                        <div className="stat-value text-lg">{latestMetrics.active_jobs}</div>
                    </div>
                </div>

                {/* Warning Indicators */}
                {(latestMetrics.fraud_signals > 0 || latestMetrics.disputed_placements > 0) && (
                    <div className="mt-4 space-y-2">
                        {latestMetrics.fraud_signals > 0 && (
                            <div className="alert alert-warning py-2">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <span className="text-sm">
                                    {latestMetrics.fraud_signals} fraud signal{latestMetrics.fraud_signals !== 1 ? 's' : ''} detected
                                </span>
                            </div>
                        )}
                        {latestMetrics.disputed_placements > 0 && (
                            <div className="alert alert-error py-2">
                                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                <span className="text-sm">
                                    {latestMetrics.disputed_placements} disputed placement{latestMetrics.disputed_placements !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Trend Sparkline (if we have historical data) */}
                {metrics.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-base-300">
                        <div className="text-xs text-base-content/60 mb-2">7-Day Health Score Trend</div>
                        <div className="flex items-end justify-between h-12 gap-1">
                            {metrics
                                .slice(0, 7)
                                .reverse()
                                .map((m, i) => (
                                    <div
                                        key={m.id || i}
                                        className="flex-1 bg-primary rounded-t"
                                        style={{ height: `${m.health_score}%` }}
                                        title={`${new Date(m.date).toLocaleDateString()}: ${m.health_score.toFixed(0)}`}
                                    ></div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
