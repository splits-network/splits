import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { ResourceDefinition, registerResourceRoutes } from './common';
import { AUTOMATION_ADMIN_ROLES } from './roles';

const AUTOMATION_RESOURCES: ResourceDefinition[] = [
    {
        name: 'automation-rules',
        service: 'automation',
        basePath: '/automation-rules',
        serviceBasePath: '/v2/automation-rules',
        tag: 'automation',
        roles: {
            list: AUTOMATION_ADMIN_ROLES,
            get: AUTOMATION_ADMIN_ROLES,
            create: AUTOMATION_ADMIN_ROLES,
            update: AUTOMATION_ADMIN_ROLES,
            delete: AUTOMATION_ADMIN_ROLES,
        },
    },
    {
        name: 'matches',
        service: 'automation',
        basePath: '/matches',
        serviceBasePath: '/v2/matches',
        tag: 'automation',
        roles: {
            list: AUTOMATION_ADMIN_ROLES,
            get: AUTOMATION_ADMIN_ROLES,
            create: AUTOMATION_ADMIN_ROLES,
            update: AUTOMATION_ADMIN_ROLES,
            delete: AUTOMATION_ADMIN_ROLES,
        },
    },
    {
        name: 'fraud-signals',
        service: 'automation',
        basePath: '/fraud-signals',
        serviceBasePath: '/v2/fraud-signals',
        tag: 'automation',
        roles: {
            list: AUTOMATION_ADMIN_ROLES,
            get: AUTOMATION_ADMIN_ROLES,
            create: AUTOMATION_ADMIN_ROLES,
            update: AUTOMATION_ADMIN_ROLES,
            delete: AUTOMATION_ADMIN_ROLES,
        },
    },
    {
        name: 'marketplace-metrics',
        service: 'automation',
        basePath: '/marketplace-metrics',
        serviceBasePath: '/v2/marketplace-metrics',
        tag: 'automation',
        roles: {
            list: AUTOMATION_ADMIN_ROLES,
            get: AUTOMATION_ADMIN_ROLES,
            create: AUTOMATION_ADMIN_ROLES,
            update: AUTOMATION_ADMIN_ROLES,
            delete: AUTOMATION_ADMIN_ROLES,
        },
    },
];

export function registerAutomationRoutes(app: FastifyInstance, services: ServiceRegistry) {
    AUTOMATION_RESOURCES.forEach(resource => registerResourceRoutes(app, services, resource));
}
