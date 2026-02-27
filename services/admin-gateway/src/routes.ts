import { FastifyInstance } from 'fastify';
import httpProxy from '@fastify/http-proxy';

/**
 * Register proxy routes for all domain services under /admin/{service}/
 *
 * Each route strips the /admin/{service} prefix before forwarding to the
 * downstream service (rewritePrefix: '') so domain services receive paths
 * like /users, /jobs — not /admin/identity/users.
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
            prefix: `/admin/${serviceName}`,
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
