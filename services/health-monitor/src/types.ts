export type ServiceStatus = "healthy" | "degraded" | "unhealthy";

export interface ServiceDefinition {
    name: string;
    displayName: string;
    url: string;
    healthPath: string;
}

export interface ServiceCheckResult {
    service: string;
    status: ServiceStatus;
    responseTime: number;
    timestamp: string;
    error?: string;
    checks?: Record<string, any>;
}

export interface AggregatedServiceStatus {
    service: string;
    displayName: string;
    status: ServiceStatus;
    lastCheck: string;
    lastResponseTime: number;
    recentResults: Array<{ status: ServiceStatus; timestamp: string }>;
    error?: string;
}

export interface SystemHealthResponse {
    status: ServiceStatus;
    services: AggregatedServiceStatus[];
    lastUpdated: string;
    checkIntervalMs: number;
}

export interface HealthIncident {
    id: string;
    service_name: string;
    severity: string;
    started_at: string;
    resolved_at: string | null;
    duration_seconds: number | null;
    error_details: Record<string, any> | null;
}

export interface SiteNotification {
    id: string;
    type: string;
    severity: string;
    source: string;
    title: string;
    message: string | null;
    starts_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    dismissible: boolean;
    metadata: Record<string, any>;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}
