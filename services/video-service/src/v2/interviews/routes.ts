import { FastifyInstance } from 'fastify';
import { InterviewRepository } from './repository';
import { InterviewService } from './service';
import { requireUserContext } from '../shared/helpers';
import { IEventPublisher } from '../shared/events';

interface RegisterInterviewRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher: IEventPublisher;
}

export async function registerInterviewRoutes(
    app: FastifyInstance,
    config: RegisterInterviewRoutesConfig,
) {
    const repository = new InterviewRepository(
        config.supabaseUrl,
        config.supabaseKey,
    );
    const service = new InterviewService(repository, config.eventPublisher);

    // POST /api/v2/interviews - Create interview
    app.post('/api/v2/interviews', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;

            const interview = await service.createInterview(
                {
                    application_id: body.application_id,
                    interview_type: body.interview_type,
                    title: body.title,
                    scheduled_at: body.scheduled_at,
                    scheduled_duration_minutes: body.scheduled_duration_minutes,
                    participants: body.participants || [],
                },
                clerkUserId,
            );

            return reply.code(201).send({ data: interview });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // GET /api/v2/interviews/:id - Get interview with participants
    app.get('/api/v2/interviews/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };

            const interview = await service.getInterview(id);
            return reply.send({ data: interview });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // GET /api/v2/interviews - List by application_id
    app.get('/api/v2/interviews', async (request, reply) => {
        try {
            requireUserContext(request);
            const query = request.query as any;
            const applicationId = query.application_id as string;

            if (!applicationId) {
                return reply.code(400).send({ error: 'application_id query parameter is required' });
            }

            const limit = Math.min(parseInt(query.limit || '25', 10), 100);
            const page = Math.max(parseInt(query.page || '1', 10), 1);
            const offset = (page - 1) * limit;
            const status = query.status as string | undefined;

            const result = await service.listByApplication(applicationId, {
                status,
                limit,
                offset,
            });

            return reply.send({
                data: result.data,
                pagination: {
                    total: result.total,
                    page,
                    limit,
                    total_pages: Math.ceil(result.total / limit),
                },
            });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // PATCH /api/v2/interviews/:id/cancel - Cancel interview
    app.patch('/api/v2/interviews/:id/cancel', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = (request.body as any) || {};

            const interview = await service.cancelInterview(
                id,
                body.reason,
                clerkUserId,
            );

            return reply.send({ data: interview });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });
}
