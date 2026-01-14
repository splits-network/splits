import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireAuth } from '../../middleware/auth';
import { buildAuthHeaders } from '../../helpers/auth-headers';

export type ServiceName =
    | 'analytics'
    | 'ats'
    | 'network'
    | 'billing'
    | 'notification'
    | 'identity'
    | 'document'
    | 'automation';

export interface ResourceDefinition {
    name: string;
    service: ServiceName;
    basePath: string;
    tag: string;
    serviceBasePath?: string;
}

export const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

export const buildQueryString = (query?: Record<string, any>) => {
    if (!query || Object.keys(query).length === 0) {
        return '';
    }
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }
        if (Array.isArray(value)) {
            value.forEach(item => params.append(key, String(item)));
        } else {
            params.append(key, String(value));
        }
    });
    return params.toString();
};

export function registerResourceRoutes(
    app: FastifyInstance,
    services: ServiceRegistry,
    resource: ResourceDefinition
) {
    const serviceClient = () => services.get(resource.service);
    const apiBase = `/api/v2${resource.basePath}`;
    const serviceBase = resource.serviceBasePath ?? `/api/v2${resource.basePath}`;

    const routeOptions = (description: string) => {
        return {
            preHandler: requireAuth(),
            // Remove schema with invalid properties for Fastify 5.x
        };
    };

    app.get(
        apiBase,
        routeOptions(`List ${resource.name}`),
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const data = await serviceClient().get(
                serviceBase,
                request.query as Record<string, any>,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.send(data);
        }
    );

    app.get(
        `${apiBase}/:id`,
        routeOptions(`Get ${resource.name} by ID`),
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `${serviceBase}/${id}?${queryString}` : `${serviceBase}/${id}`;
            const data = await serviceClient().get(
                path,
                undefined,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.send(data);
        }
    );

    app.post(
        apiBase,
        routeOptions(`Create ${resource.name}`),
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const data = await serviceClient().post(
                serviceBase,
                request.body,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.code(201).send(data);
        }
    );

    app.patch(
        `${apiBase}/:id`,
        routeOptions(`Update ${resource.name}`),
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const data = await serviceClient().patch(
                `${serviceBase}/${id}`,
                request.body,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.send(data);
        }
    );

    app.delete(
        `${apiBase}/:id`,
        routeOptions(`Delete ${resource.name}`),
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const data = await serviceClient().delete(
                `${serviceBase}/${id}`,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.send(data);
        }
    );
}
