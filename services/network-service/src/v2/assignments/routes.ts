import { FastifyInstance } from 'fastify';
import { AssignmentServiceV2 } from './service';
import { requireUserContext } from '../shared/helpers';
import { validatePaginationParams } from '../shared/pagination';

interface RegisterAssignmentRoutesConfig {
    assignmentService: AssignmentServiceV2;
}

export function registerAssignmentRoutes(
    app: FastifyInstance,
    config: RegisterAssignmentRoutesConfig
) {
    app.get('/api/v2/assignments', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;

            const pagination = validatePaginationParams(query.page, query.limit);
            const filters = {
                ...pagination,
                status: query.status,
                recruiter_id: query.recruiter_id,
                job_id: query.job_id,
                sort_by: query.sort_by,
                sort_order: query.sort_order,
            };

            const result = await config.assignmentService.getAssignments(clerkUserId, filters);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.get('/api/v2/assignments/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const assignment = await config.assignmentService.getAssignment(id);
            return reply.send({ data: assignment });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.post('/api/v2/assignments', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            const assignment = await config.assignmentService.createAssignment(body, clerkUserId);
            return reply.code(201).send({ data: assignment });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.patch('/api/v2/assignments/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as any;
            const assignment = await config.assignmentService.updateAssignment(id, updates, clerkUserId);
            return reply.send({ data: assignment });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.delete('/api/v2/assignments/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await config.assignmentService.deleteAssignment(id, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });
}
