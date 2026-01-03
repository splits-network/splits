import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { ResourceDefinition, registerResourceRoutes } from './common';

const BILLING_RESOURCES: ResourceDefinition[] = [
    {
        name: 'plans',
        service: 'billing',
        basePath: '/plans',
        tag: 'billing',
    },
    {
        name: 'subscriptions',
        service: 'billing',
        basePath: '/subscriptions',
        tag: 'billing',
    },
    {
        name: 'payouts',
        service: 'billing',
        basePath: '/payouts',
        tag: 'billing',
    },
];

export function registerBillingRoutes(app: FastifyInstance, services: ServiceRegistry) {
    BILLING_RESOURCES.forEach(resource => registerResourceRoutes(app, services, resource));
}
