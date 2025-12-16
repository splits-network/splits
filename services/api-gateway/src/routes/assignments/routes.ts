import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles } from '../../rbac';

/**
 * Assignments Routes
 * - Recruiter-to-job assignments
 */
export function registerAssignmentsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const networkService = () => services.get('network');

    // Create assignment (platform admins only)
    app.post('/api/assignments', {
        preHandler: requireRoles(['platform_admin']),
        schema: {
            description: 'Assign recruiter to job',
            tags: ['assignments'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const data = await networkService().post('/assignments', request.body);
        return reply.send(data);
    });

    // Delete assignment (platform admins only)
    app.delete('/api/assignments/:jobId/:recruiterId', {
        preHandler: requireRoles(['platform_admin']),
        schema: {
            description: 'Unassign recruiter from job',
            tags: ['assignments'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { jobId, recruiterId } = request.params as { jobId: string; recruiterId: string };
        await networkService().delete(`/assignments?job_id=${jobId}&recruiter_id=${recruiterId}`);
        return reply.status(204).send();
    });
}
