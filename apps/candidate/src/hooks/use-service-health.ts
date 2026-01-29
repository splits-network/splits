'use client';

import { useEffect, useState } from 'react';

export interface ServiceHealth {
    name: string;
    url: string;
    status: 'healthy' | 'unhealthy' | 'checking';
    timestamp?: string;
    error?: string;
    responseTime?: number;
}

const services: Omit<ServiceHealth, 'status' | 'timestamp' | 'error' | 'responseTime'>[] = [
    { name: 'API Gateway', url: '/api-health/gateway' },
    { name: 'Identity Service', url: '/api-health/identity' },
    { name: 'ATS Service', url: '/api-health/ats' },
    { name: 'Network Service', url: '/api-health/network' },
    { name: 'Billing Service', url: '/api-health/billing' },
    { name: 'Notification Service', url: '/api-health/notification' },
    { name: 'Automation Service', url: '/api-health/automation' },
    { name: 'Document Service', url: '/api-health/document' },
    { name: 'Document Processing Service', url: '/api-health/document-processing' },
    { name: 'AI Review Service', url: '/api-health/ai' },
];

const checkServiceHealth = async (service: typeof services[0]): Promise<ServiceHealth> => {
    const startTime = Date.now();
    try {
        const response = await fetch(service.url, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000), // 5 second timeout
        });
        const responseTime = Date.now() - startTime;
        const data = await response.json();

        if (response.ok && data.status === 'healthy') {
            return {
                ...service,
                status: 'healthy',
                timestamp: data.timestamp,
                responseTime,
            };
        } else {
            return {
                ...service,
                status: 'unhealthy',
                error: data.error || 'Service returned unhealthy status',
                timestamp: data.timestamp,
                responseTime,
            };
        }
    } catch (error) {
        const responseTime = Date.now() - startTime;
        return {
            ...service,
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Failed to connect to service',
            responseTime,
        };
    }
};

export function useServiceHealth(options?: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    initialStatuses?: ServiceHealth[];
    initialCheckedAt?: string | Date;
}) {
    const {
        autoRefresh = true,
        refreshInterval = 30000,
        initialStatuses,
        initialCheckedAt,
    } = options || {};

    const hasInitialStatuses = initialStatuses !== undefined;
    const [serviceStatuses, setServiceStatuses] = useState<ServiceHealth[]>(
        initialStatuses ?? services.map(s => ({ ...s, status: 'checking' as const }))
    );
    const [lastChecked, setLastChecked] = useState<Date>(
        initialCheckedAt ? new Date(initialCheckedAt) : new Date()
    );
    const [isLoading, setIsLoading] = useState(!hasInitialStatuses);

    const checkAllServices = async () => {
        // Don't set loading on subsequent checks to avoid layout shifts
        const results = await Promise.all(services.map(checkServiceHealth));
        setServiceStatuses(results);
        setLastChecked(new Date());
        setIsLoading(false);
    };

    useEffect(() => {
        if (!hasInitialStatuses) {
            checkAllServices();
        }

        if (autoRefresh) {
            const interval = setInterval(checkAllServices, refreshInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const healthyCount = serviceStatuses.filter(s => s.status === 'healthy').length;
    const totalCount = serviceStatuses.length;
    const allHealthy = healthyCount === totalCount;
    const someUnhealthy = serviceStatuses.some(s => s.status === 'unhealthy');
    const unhealthyServices = serviceStatuses.filter(s => s.status === 'unhealthy');

    return {
        serviceStatuses,
        lastChecked,
        isLoading,
        healthyCount,
        totalCount,
        allHealthy,
        someUnhealthy,
        unhealthyServices,
        refresh: checkAllServices,
    };
}
