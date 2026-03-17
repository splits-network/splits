import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceClient } from '../../clients';
import { requireAuth, optionalAuth } from '../../middleware/auth';
import { buildAuthHeaders } from '../../helpers/auth-headers';

type AuthLevel = 'required' | 'optional' | 'none';

export interface V3RouteConfig {
    /** Auto-generates Core 5 CRUD proxy (GET list, GET :id, POST, PATCH :id, DELETE :id) */
    resource?: string;
    /** Single route path for views/actions (e.g., '/jobs/views/recruiter-board') */
    path?: string;
    /** HTTP method — required when path is set */
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    /** Authentication level */
    auth: AuthLevel;
}

/**
 * Register V3 gateway routes for a service.
 * Every V3 route does the same thing: validate auth → proxy → return response.
 * No custom handlers. No business logic. Just declarative config.
 */
export function registerV3Routes(
    app: FastifyInstance,
    serviceClient: ServiceClient,
    routes: V3RouteConfig[]
) {
    for (const route of routes) {
        if (route.resource) {
            registerCrudProxy(app, serviceClient, route.resource, route.auth);
        } else if (route.path && route.method) {
            registerSingleProxy(app, serviceClient, route);
        }
    }
}

function getPreHandler(auth: AuthLevel) {
    switch (auth) {
        case 'required': return requireAuth();
        case 'optional': return optionalAuth();
        case 'none': return undefined;
    }
}

function getCorrelationId(request: FastifyRequest): string {
    return (request as any).correlationId;
}

function buildQueryString(query?: Record<string, any>): string {
    if (!query || Object.keys(query).length === 0) return '';
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
            value.forEach(item => params.append(key, String(item)));
        } else {
            params.append(key, String(value));
        }
    });
    return params.toString();
}

async function proxyGet(
    client: ServiceClient,
    servicePath: string,
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const queryString = buildQueryString(request.query as Record<string, any>);
        const fullPath = queryString ? `${servicePath}?${queryString}` : servicePath;
        const headers = await buildAuthHeaders(request);
        const data = await client.get(fullPath, undefined, getCorrelationId(request), headers);
        return reply.send(data);
    } catch (error: any) {
        return reply.status(error.statusCode || 500).send(
            error.jsonBody || { error: { code: 'PROXY_ERROR', message: error.message } }
        );
    }
}

async function proxyMutate(
    client: ServiceClient,
    method: 'post' | 'put' | 'patch' | 'delete',
    servicePath: string,
    request: FastifyRequest,
    reply: FastifyReply,
    successStatus = 200
) {
    try {
        const correlationId = getCorrelationId(request);
        const headers = await buildAuthHeaders(request);
        let data: any;

        if (method === 'delete') {
            data = await client.delete(servicePath, correlationId, headers);
        } else {
            data = await client[method](servicePath, request.body, correlationId, headers);
        }

        return reply.status(successStatus).send(data);
    } catch (error: any) {
        return reply.status(error.statusCode || 500).send(
            error.jsonBody || { error: { code: 'PROXY_ERROR', message: error.message } }
        );
    }
}

function registerCrudProxy(
    app: FastifyInstance,
    client: ServiceClient,
    resource: string,
    auth: AuthLevel
) {
    const gatewayBase = `/api/v3/${resource}`;
    const serviceBase = `/api/v3/${resource}`;
    const preHandler = getPreHandler(auth);
    const routeOpts = preHandler ? { preHandler } : {};

    // GET /api/v3/:resource — list
    app.get(gatewayBase, routeOpts, async (request, reply) => {
        return proxyGet(client, serviceBase, request, reply);
    });

    // GET /api/v3/:resource/:id — get by id
    app.get(`${gatewayBase}/:id`, routeOpts, async (request, reply) => {
        const { id } = request.params as { id: string };
        return proxyGet(client, `${serviceBase}/${id}`, request, reply);
    });

    // POST /api/v3/:resource — create
    app.post(gatewayBase, routeOpts, async (request, reply) => {
        return proxyMutate(client, 'post', serviceBase, request, reply, 201);
    });

    // PATCH /api/v3/:resource/:id — update
    app.patch(`${gatewayBase}/:id`, routeOpts, async (request, reply) => {
        const { id } = request.params as { id: string };
        return proxyMutate(client, 'patch', `${serviceBase}/${id}`, request, reply);
    });

    // DELETE /api/v3/:resource/:id — delete
    app.delete(`${gatewayBase}/:id`, routeOpts, async (request, reply) => {
        const { id } = request.params as { id: string };
        return proxyMutate(client, 'delete', `${serviceBase}/${id}`, request, reply);
    });
}

function registerSingleProxy(
    app: FastifyInstance,
    client: ServiceClient,
    route: V3RouteConfig
) {
    const gatewayPath = `/api/v3${route.path}`;
    const servicePath = `/api/v3${route.path}`;
    const preHandler = getPreHandler(route.auth);
    const routeOpts = preHandler ? { preHandler } : {};

    const resolveParams = (request: FastifyRequest) => {
        const params = request.params as Record<string, string>;
        let resolvedPath = servicePath;
        for (const [key, value] of Object.entries(params)) {
            resolvedPath = resolvedPath.replace(`:${key}`, value);
        }
        return resolvedPath;
    };

    switch (route.method) {
        case 'GET':
            app.get(gatewayPath, routeOpts, async (request, reply) => {
                return proxyGet(client, resolveParams(request), request, reply);
            });
            break;
        case 'POST':
            app.post(gatewayPath, routeOpts, async (request, reply) => {
                return proxyMutate(client, 'post', resolveParams(request), request, reply);
            });
            break;
        case 'PUT':
            app.put(gatewayPath, routeOpts, async (request, reply) => {
                return proxyMutate(client, 'put', resolveParams(request), request, reply);
            });
            break;
        case 'PATCH':
            app.patch(gatewayPath, routeOpts, async (request, reply) => {
                return proxyMutate(client, 'patch', resolveParams(request), request, reply);
            });
            break;
        case 'DELETE':
            app.delete(gatewayPath, routeOpts, async (request, reply) => {
                return proxyMutate(client, 'delete', resolveParams(request), request, reply);
            });
            break;
    }
}
