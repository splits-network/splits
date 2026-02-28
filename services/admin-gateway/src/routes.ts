import { FastifyInstance } from 'fastify';
import httpProxy from '@fastify/http-proxy';

/**
 * Register proxy routes for all domain services under /api/v2/{service}/
 *
 * Each route strips the /api/v2/{service} prefix before forwarding to the
 * downstream service (rewritePrefix: '') so domain services receive paths
 * like /admin/users, /admin/jobs — matching their registered admin routes.
 */
export async function registerAdminRoutes(
    app: FastifyInstance,
    services: Record<string, string>
): Promise<void> {
    const serviceMap: Record<string, string> = {
        identity: services.identity,
        ats: services.ats,
        network: services.network,
        billing: services.billing,
        notification: services.notification,
        document: services.document,
        automation: services.automation,
        'document-processing': services['document-processing'],
        ai: services.ai,
        analytics: services.analytics,
        content: services.content,
        integration: services.integration,
        matching: services.matching,
    };

    for (const [serviceName, serviceUrl] of Object.entries(serviceMap)) {
        await app.register(httpProxy, {
            upstream: serviceUrl,
            prefix: `/api/v2/${serviceName}`,
            rewritePrefix: '',
            replyOptions: {
                rewriteRequestHeaders: (req, headers) => ({
                    ...headers,
                    'x-clerk-user-id': (req as any).adminAuth?.clerkUserId ?? '',
                    'x-user-id': (req as any).adminAuth?.userId ?? '',
                    'x-is-platform-admin': 'true',
                }),
            },
        });
    }
}
