"use client";

import { useCallback, useEffect, useState } from "react";
import { getGatewayBaseUrl } from "./gateway-url";

export interface ServiceHealth {
    name: string;
    status: "healthy" | "unhealthy" | "degraded" | "checking" | "unknown";
    timestamp?: string;
    error?: string;
    responseTime?: number;
}

export interface SystemHealthData {
    status: string;
    services: Array<{
        service: string;
        displayName: string;
        status: string;
        lastCheck: string;
        lastResponseTime: number;
        error?: string;
        recentResults: Array<{ status: string; timestamp: string }>;
    }>;
    lastUpdated: string;
    checkIntervalMs: number;
}

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
        initialStatuses ?? [],
    );
    const [lastChecked, setLastChecked] = useState<Date>(
        initialCheckedAt ? new Date(initialCheckedAt) : new Date(),
    );
    const [isLoading, setIsLoading] = useState(!hasInitialStatuses);

    const fetchSystemHealth = useCallback(async () => {
        try {
            const response = await fetch(`${getGatewayBaseUrl()}/api/v2/system-health`, {
                cache: "no-store",
                signal: AbortSignal.timeout(10000),
            });

            const json = await response.json().catch(() => ({}));
            const data: SystemHealthData | undefined = json.data;

            if (!data || !data.services) {
                return;
            }

            const mapped: ServiceHealth[] = data.services.map((s) => ({
                name: s.displayName,
                status: s.status as ServiceHealth["status"],
                timestamp: s.lastCheck,
                responseTime: s.lastResponseTime,
                error: s.error,
            }));

            setServiceStatuses(mapped);
            setLastChecked(new Date(data.lastUpdated));
            setIsLoading(false);
        } catch {
            // If the aggregated endpoint is unavailable, keep existing data
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!hasInitialStatuses) {
            fetchSystemHealth();
        }

        if (autoRefresh) {
            const interval = setInterval(fetchSystemHealth, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [hasInitialStatuses, autoRefresh, refreshInterval, fetchSystemHealth]);

    const healthyCount = serviceStatuses.filter(
        (s) => s.status === "healthy",
    ).length;
    const totalCount = serviceStatuses.length;
    const allHealthy = totalCount > 0 && healthyCount === totalCount;
    const someUnhealthy = serviceStatuses.some(
        (s) => s.status === "unhealthy" || s.status === "degraded",
    );
    const unhealthyServices = serviceStatuses.filter(
        (s) => s.status === "unhealthy" || s.status === "degraded",
    );

    return {
        serviceStatuses,
        lastChecked,
        isLoading,
        healthyCount,
        totalCount,
        allHealthy,
        someUnhealthy,
        unhealthyServices,
        refresh: fetchSystemHealth,
    };
}
