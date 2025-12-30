import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles } from '../../rbac';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { UserRole } from '../../auth';

type ServiceName = 'ats' | 'network' | 'billing';

interface ResourceRoles {
    list?: UserRole[];
    get?: UserRole[];
    create?: UserRole[];
    update?: UserRole[];
    delete?: UserRole[];
}

interface ResourceDefinition {
    name: string;
    service: ServiceName;
    basePath: string;
    tag: string;
    roles: ResourceRoles;
}

const ATS_VIEW_ROLES: UserRole[] = [
    'candidate',
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];
const ATS_COMPANY_VIEW_ROLES: UserRole[] = [
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];
const ATS_CANDIDATE_VIEW_ROLES: UserRole[] = [
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];
const ATS_MANAGE_ROLES: UserRole[] = ['company_admin', 'hiring_manager', 'platform_admin'];
const ATS_DELETE_ROLES: UserRole[] = ['company_admin', 'platform_admin'];
const ATS_CANDIDATE_MANAGE_ROLES: UserRole[] = ['recruiter', 'company_admin', 'platform_admin'];
const ATS_PLACEMENT_ROLES: UserRole[] = ['recruiter', 'company_admin', 'platform_admin'];

const NETWORK_VIEW_ROLES: UserRole[] = [
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];
const NETWORK_ASSIGNMENT_ROLES: UserRole[] = ['company_admin', 'platform_admin'];
const NETWORK_ADMIN_ROLES: UserRole[] = ['platform_admin'];

const BILLING_VIEW_ROLES: UserRole[] = ['platform_admin'];
const BILLING_SUBSCRIPTION_ROLES: UserRole[] = ['recruiter', 'company_admin', 'platform_admin'];

const RESOURCES: ResourceDefinition[] = [
    // ATS
    {
        name: 'jobs',
        service: 'ats',
        basePath: '/jobs',
        tag: 'jobs',
        roles: {
            list: ATS_VIEW_ROLES,
            get: ATS_VIEW_ROLES,
            create: ATS_MANAGE_ROLES,
            update: ATS_MANAGE_ROLES,
            delete: ATS_DELETE_ROLES,
        },
    },
    {
        name: 'companies',
        service: 'ats',
        basePath: '/companies',
        tag: 'companies',
        roles: {
            list: ATS_COMPANY_VIEW_ROLES,
            get: ATS_COMPANY_VIEW_ROLES,
            create: ['company_admin', 'platform_admin'],
            update: ['company_admin', 'platform_admin'],
            delete: ['company_admin', 'platform_admin'],
        },
    },
    {
        name: 'candidates',
        service: 'ats',
        basePath: '/candidates',
        tag: 'candidates',
        roles: {
            list: ATS_CANDIDATE_VIEW_ROLES,
            get: ATS_CANDIDATE_VIEW_ROLES,
            create: ATS_CANDIDATE_MANAGE_ROLES,
            update: ATS_CANDIDATE_MANAGE_ROLES,
            delete: ['platform_admin'],
        },
    },
    {
        name: 'applications',
        service: 'ats',
        basePath: '/applications',
        tag: 'applications',
        roles: {
            list: ATS_VIEW_ROLES,
            get: ATS_VIEW_ROLES,
            create: ATS_VIEW_ROLES,
            update: ATS_VIEW_ROLES,
            delete: ATS_DELETE_ROLES,
        },
    },
    {
        name: 'placements',
        service: 'ats',
        basePath: '/placements',
        tag: 'placements',
        roles: {
            list: ATS_PLACEMENT_ROLES,
            get: ATS_PLACEMENT_ROLES,
            create: ATS_PLACEMENT_ROLES,
            update: ATS_PLACEMENT_ROLES,
            delete: ATS_DELETE_ROLES,
        },
    },
    // Network
    {
        name: 'recruiters',
        service: 'network',
        basePath: '/recruiters',
        tag: 'recruiters',
        roles: {
            list: NETWORK_VIEW_ROLES,
            get: NETWORK_VIEW_ROLES,
            create: ['recruiter', 'platform_admin'],
            update: ['recruiter', 'platform_admin'],
            delete: NETWORK_ADMIN_ROLES,
        },
    },
    {
        name: 'assignments',
        service: 'network',
        basePath: '/assignments',
        tag: 'assignments',
        roles: {
            list: NETWORK_ASSIGNMENT_ROLES,
            get: NETWORK_ASSIGNMENT_ROLES,
            create: NETWORK_ASSIGNMENT_ROLES,
            update: NETWORK_ASSIGNMENT_ROLES,
            delete: NETWORK_ADMIN_ROLES,
        },
    },
    {
        name: 'recruiter-candidates',
        service: 'network',
        basePath: '/recruiter-candidates',
        tag: 'recruiter-candidates',
        roles: {
            list: ['recruiter', 'company_admin', 'platform_admin'],
            get: ['recruiter', 'company_admin', 'platform_admin'],
            create: ['recruiter', 'platform_admin'],
            update: ['recruiter', 'platform_admin'],
            delete: NETWORK_ADMIN_ROLES,
        },
    },
    {
        name: 'reputation',
        service: 'network',
        basePath: '/reputation',
        tag: 'reputation',
        roles: {
            list: NETWORK_ADMIN_ROLES,
            get: NETWORK_ADMIN_ROLES,
            create: NETWORK_ADMIN_ROLES,
            update: NETWORK_ADMIN_ROLES,
            delete: NETWORK_ADMIN_ROLES,
        },
    },
    {
        name: 'proposals',
        service: 'network',
        basePath: '/proposals',
        tag: 'proposals',
        roles: {
            list: ATS_VIEW_ROLES,
            get: ATS_VIEW_ROLES,
            create: ['recruiter', 'company_admin', 'hiring_manager', 'platform_admin'],
            update: ['recruiter', 'company_admin', 'hiring_manager', 'platform_admin'],
            delete: ['company_admin', 'platform_admin'],
        },
    },
    // Billing
    {
        name: 'plans',
        service: 'billing',
        basePath: '/plans',
        tag: 'billing',
        roles: {
            list: BILLING_VIEW_ROLES,
            get: BILLING_VIEW_ROLES,
            create: BILLING_VIEW_ROLES,
            update: BILLING_VIEW_ROLES,
            delete: BILLING_VIEW_ROLES,
        },
    },
    {
        name: 'subscriptions',
        service: 'billing',
        basePath: '/subscriptions',
        tag: 'billing',
        roles: {
            list: BILLING_SUBSCRIPTION_ROLES,
            get: BILLING_SUBSCRIPTION_ROLES,
            create: BILLING_SUBSCRIPTION_ROLES,
            update: BILLING_SUBSCRIPTION_ROLES,
            delete: BILLING_SUBSCRIPTION_ROLES,
        },
    },
    {
        name: 'payouts',
        service: 'billing',
        basePath: '/payouts',
        tag: 'billing',
        roles: {
            list: BILLING_VIEW_ROLES,
            get: BILLING_VIEW_ROLES,
            create: BILLING_VIEW_ROLES,
            update: BILLING_VIEW_ROLES,
            delete: BILLING_VIEW_ROLES,
        },
    },
];

export function registerV2GatewayRoutes(app: FastifyInstance, services: ServiceRegistry) {
    RESOURCES.forEach(resource => {
        registerResourceRoutes(app, services, resource);
    });
}

function registerResourceRoutes(
    app: FastifyInstance,
    services: ServiceRegistry,
    resource: ResourceDefinition
) {
    const serviceClient = () => services.get(resource.service);
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;
    const apiBase = `/api/v2${resource.basePath}`;
    const serviceBase = `/v2${resource.basePath}`;

    const routeOptions = (description: string, roles?: UserRole[]) => {
        const options: Record<string, any> = {
            schema: {
                description,
                tags: [resource.tag],
                security: [{ clerkAuth: [] }],
            },
        };

        if (roles && roles.length > 0) {
            options.preHandler = requireRoles(roles, services);
        }

        return options;
    };

    // LIST
    app.get(
        apiBase,
        routeOptions(`List ${resource.name}`, resource.roles.list),
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

    // GET BY ID
    app.get(
        `${apiBase}/:id`,
        routeOptions(`Get ${resource.name} by ID`, resource.roles.get),
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const data = await serviceClient().get(
                `${serviceBase}/${id}`,
                undefined,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.send(data);
        }
    );

    // CREATE
    app.post(
        apiBase,
        routeOptions(`Create ${resource.name}`, resource.roles.create),
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

    // UPDATE
    app.patch(
        `${apiBase}/:id`,
        routeOptions(`Update ${resource.name}`, resource.roles.update),
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

    // DELETE
    app.delete(
        `${apiBase}/:id`,
        routeOptions(`Delete ${resource.name}`, resource.roles.delete),
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
