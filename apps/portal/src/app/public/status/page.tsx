import { headers } from 'next/headers';
import StatusPageClient from './status-client';
import type { ServiceHealth } from '@/hooks/use-service-health';

export const revalidate = 30;

const services: Array<{ name: string; url: string }> = [
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

async function resolveBaseUrl() {
    const headersList = await headers();
    const host = headersList.get('x-forwarded-host') ?? headersList.get('host');
    const proto = headersList.get('x-forwarded-proto') ?? 'http';

    if (host) {
        return `${proto}://${host}`;
    }

    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3100';
}

async function fetchServiceHealth(baseUrl: string, service: { name: string; url: string }): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
        const response = await fetch(`${baseUrl}${service.url}`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        });
        const responseTime = Date.now() - startTime;
        const data = await response.json().catch(() => ({}));

        if (response.ok && data.status === 'healthy') {
            return {
                ...service,
                status: 'healthy',
                timestamp: data.timestamp,
                responseTime,
            };
        }

        return {
            ...service,
            status: 'unhealthy',
            error: data.error || 'Service returned unhealthy status',
            timestamp: data.timestamp,
            responseTime,
        };
    } catch (error) {
        return {
            ...service,
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Failed to connect to service',
            responseTime: Date.now() - startTime,
        };
    }
}

export default async function StatusPage() {
    const baseUrl = await resolveBaseUrl();
    const initialStatuses = await Promise.all(
        services.map((service) => fetchServiceHealth(baseUrl, service))
    );

    return (
        <StatusPageClient
            initialStatuses={initialStatuses}
            initialCheckedAt={new Date().toISOString()}
        />
    );
}
