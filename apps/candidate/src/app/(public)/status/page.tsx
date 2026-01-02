'use client';

import { useServiceHealth } from '@/hooks/useServiceHealth';
import { useEffect } from 'react';

export default function StatusPage() {
    const {
        serviceStatuses,
        lastChecked,
        allHealthy,
        isLoading
    } = useServiceHealth({ autoRefresh: true });

    // Set page title
    useEffect(() => {
        document.title = allHealthy
            ? 'All Systems Operational - Applicant Network'
            : 'Service Status - Applicant Network';
    }, [allHealthy]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'badge badge-success';
            case 'degraded':
                return 'badge badge-warning';
            case 'down':
                return 'badge badge-error';
            default:
                return 'badge';
        }
    };

    const getOverallStatus = () => {
        if (isLoading) return { text: 'Checking...', color: 'bg-base-300' };
        if (allHealthy) return { text: 'All Systems Operational', color: 'bg-success' };

        const hasDown = serviceStatuses.some(s => s?.status === 'unhealthy');
        if (hasDown) return { text: 'Partial System Outage', color: 'bg-error' };

        return { text: 'Degraded Performance', color: 'bg-warning' };
    };

    const overallStatus = getOverallStatus();

    return (
        <div className="min-h-screen bg-base-200 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">System Status</h1>
                    <p className="text-base-content/70">
                        Current operational status of Applicant Network services
                    </p>
                </div>

                {/* Overall Status Card */}
                <div className={`card ${overallStatus.color} text-white mb-8`}>
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{overallStatus.text}</h2>
                                <p className="opacity-90">
                                    {isLoading ? (
                                        'Checking service health...'
                                    ) : allHealthy ? (
                                        'All services are running smoothly'
                                    ) : (
                                        'Some services are experiencing issues'
                                    )}
                                </p>
                            </div>
                            <div>
                                {isLoading ? (
                                    <span className="loading loading-spinner loading-lg"></span>
                                ) : allHealthy ? (
                                    <i className="fa-solid fa-circle-check text-5xl"></i>
                                ) : (
                                    <i className="fa-solid fa-circle-exclamation text-5xl"></i>
                                )}
                            </div>
                        </div>
                        {lastChecked && (
                            <p className="text-sm opacity-75 mt-4">
                                Last checked: {new Date(lastChecked).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Service Status List */}
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title mb-4">
                            <i className="fa-solid fa-server"></i>
                            Service Status
                        </h2>

                        <div className="space-y-3">
                            {serviceStatuses.map((service) => (
                                <div
                                    key={service.name}
                                    className="flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <i className="fa-solid fa-server text-xl text-base-content/60"></i>
                                        <div>
                                            <div className="font-medium">
                                                {service.name}
                                            </div>
                                            {service.error && (
                                                <div className="text-sm text-error mt-1">
                                                    {service.error}
                                                </div>
                                            )}
                                            {service.responseTime && (
                                                <div className="text-xs text-base-content/60 mt-1">
                                                    Response time: {service.responseTime}ms
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        {service.status === 'checking' ? (
                                            <span className="loading loading-spinner loading-sm"></span>
                                        ) : (
                                            <span className={getStatusBadge(service.status)}>
                                                {service.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center text-sm text-base-content/60">
                    <p className="mb-2">
                        This page automatically refreshes every 30 seconds
                    </p>
                    <p>
                        For support inquiries, please contact{' '}
                        <a href="mailto:support@applicant.network" className="link link-primary">
                            support@applicant.network
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
