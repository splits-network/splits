import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { ResourceDefinition, registerResourceRoutes } from './common';

const AUTOMATION_RESOURCES: ResourceDefinition[] = [
    {
        name: 'automation-rules',
        service: 'automation',
        basePath: '/automation-rules',
        serviceBasePath: '/v2/automation-rules',
        tag: 'automation',
    },
    {
        name: 'matches',
        service: 'automation',
        basePath: '/matches',
        serviceBasePath: '/v2/matches',
        tag: 'automation',
    },
    {
        name: 'fraud-signals',
        service: 'automation',
        basePath: '/fraud-signals',
        serviceBasePath: '/v2/fraud-signals',
        tag: 'automation',
    },
    {
        name: 'marketplace-metrics',
        service: 'automation',
        basePath: '/marketplace-metrics',
        serviceBasePath: '/v2/marketplace-metrics',
        tag: 'automation',
    },
];

export function registerAutomationRoutes(app: FastifyInstance, services: ServiceRegistry) {
    AUTOMATION_RESOURCES.forEach(resource => registerResourceRoutes(app, services, resource));
}
