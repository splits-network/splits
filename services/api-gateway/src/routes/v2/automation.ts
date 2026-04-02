import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients.js';
import { ResourceDefinition, registerResourceRoutes, getCorrelationId } from './common.js';
import { requireAuth } from '../../middleware/auth.js';
import { buildAuthHeaders } from '../../helpers/auth-headers.js';

const AUTOMATION_RESOURCES: ResourceDefinition[] = [
    {
        name: 'automation-rules',
        service: 'automation',
        basePath: '/automation-rules',
        serviceBasePath: '/api/v2/automation-rules',
        tag: 'automation',
    },
    {
        name: 'automation-executions',
        service: 'automation',
        basePath: '/automation-executions',
        serviceBasePath: '/api/v2/automation-executions',
        tag: 'automation',
    },
    {
        name: 'fraud-signals',
        service: 'automation',
        basePath: '/fraud-signals',
        serviceBasePath: '/api/v2/fraud-signals',
        tag: 'automation',
    },
];

export function registerAutomationRoutes(app: FastifyInstance, services: ServiceRegistry) {
    AUTOMATION_RESOURCES.forEach(resource => registerResourceRoutes(app, services, resource));

    // Custom execution action routes (approve/reject)
    const serviceClient = () => services.get('automation');

    app.post(
        '/api/v2/automation-executions/:id/approve',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const data = await serviceClient().post(
                `/api/v2/automation-executions/${id}/approve`,
                request.body,
                correlationId,
                buildAuthHeaders(request),
            );
            return reply.send(data);
        },
    );

    app.post(
        '/api/v2/automation-executions/:id/reject',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const data = await serviceClient().post(
                `/api/v2/automation-executions/${id}/reject`,
                request.body,
                correlationId,
                buildAuthHeaders(request),
            );
            return reply.send(data);
        },
    );
}
