'use client';

import { useServiceHealth } from '@/hooks/useServiceHealth';

export default function StatusPage() {
    const {
        serviceStatuses,
        lastChecked,
        healthyCount,
        totalCount,
        allHealthy,
        someUnhealthy,
    } = useServiceHealth();

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2">System Status</h1>
                <p className="text-base-content/70">Real-time status of all Splits Network services</p>
            </div>

            {/* Overall Status Card */}
            <div className={`card shadow mb-6 ${allHealthy ? 'bg-success text-success-content' :
                someUnhealthy ? 'bg-error text-error-content' :
                    'bg-warning text-warning-content'
                }`}>
                <div className="card-body">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="card-title text-2xl">
                                {allHealthy ? (
                                    <><i className="fa-solid fa-circle-check"></i> All Systems Operational</>
                                ) : someUnhealthy ? (
                                    <><i className="fa-solid fa-circle-exclamation"></i> Service Degradation</>
                                ) : (
                                    <><i className="fa-solid fa-spinner fa-spin"></i> Checking Services...</>
                                )}
                            </h2>
                            <p className="text-sm opacity-90 mt-1">
                                {healthyCount} of {totalCount} services healthy
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs opacity-75">
                                Last checked: {lastChecked.toLocaleTimeString()}
                            </p>
                            <p className="text-xs opacity-60 mt-1">
                                Auto-refreshes every 30 seconds
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Status List */}
            <div className="space-y-4">
                {serviceStatuses.map((service) => (
                    <div key={service.name} className="card bg-base-100 shadow">
                        <div className="card-body p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {/* Status Indicator */}
                                    <div className="flex-shrink-0">
                                        {service.status === 'healthy' && (
                                            <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
                                        )}
                                        {service.status === 'unhealthy' && (
                                            <div className="w-3 h-3 rounded-full bg-error animate-pulse"></div>
                                        )}
                                        {service.status === 'checking' && (
                                            <div className="w-3 h-3 rounded-full bg-warning animate-pulse"></div>
                                        )}
                                    </div>

                                    {/* Service Info */}
                                    <div>
                                        <h3 className="font-semibold">{service.name}</h3>
                                        <div className="flex items-center gap-3 text-sm text-base-content/70">
                                            <span className={`badge badge-sm ${service.status === 'healthy' ? 'badge-success' :
                                                service.status === 'unhealthy' ? 'badge-error' :
                                                    'badge-warning'
                                                }`}>
                                                {service.status === 'healthy' ? 'Operational' :
                                                    service.status === 'unhealthy' ? 'Down' :
                                                        'Checking...'}
                                            </span>
                                            {service.responseTime !== undefined && (
                                                <span>Response: {service.responseTime}ms</span>
                                            )}
                                            {service.timestamp && (
                                                <span>Last check: {new Date(service.timestamp).toLocaleTimeString()}</span>
                                            )}
                                        </div>
                                        {service.error && (
                                            <p className="text-xs text-error mt-1">
                                                <i className="fa-solid fa-triangle-exclamation"></i> {service.error}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Status Icon */}
                                <div className="flex-shrink-0 text-2xl">
                                    {service.status === 'healthy' && (
                                        <i className="fa-solid fa-circle-check text-success"></i>
                                    )}
                                    {service.status === 'unhealthy' && (
                                        <i className="fa-solid fa-circle-xmark text-error"></i>
                                    )}
                                    {service.status === 'checking' && (
                                        <i className="fa-solid fa-spinner fa-spin text-warning"></i>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Info */}
            <div className="text-center mt-8 text-sm text-base-content/60">
                <p>Status updates automatically every 30 seconds</p>
                <p className="mt-2">
                    Having issues? Contact support at{' '}
                    <a href="mailto:support@splits.network" className="link">
                        support@splits.network
                    </a>
                </p>
            </div>
        </div>
    );
}
