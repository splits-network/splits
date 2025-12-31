import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { JobPreScreenAnswerService } from './service';
import { requireUserContext } from '../shared/helpers';

interface RegisterAnswerRoutesConfig {
    service: JobPreScreenAnswerService;
}

export function registerJobPreScreenAnswerRoutes(
    app: FastifyInstance,
    config: RegisterAnswerRoutesConfig
) {
    app.get('/api/v2/job-pre-screen-answers', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { application_id } = request.query as { application_id?: string };
            const data = await config.service.listAnswers(application_id);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to load answers' } });
        }
    });

    app.get('/api/v2/job-pre-screen-answers/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { id } = request.params;
            const data = await config.service.getAnswer(id);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 404)
                .send({ error: { message: error.message || 'Answer not found' } });
        }
    });

    app.post('/api/v2/job-pre-screen-answers', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as
                | { answers: Array<{ application_id: string; question_id: string; answer: any }> }
                | Array<{ application_id: string; question_id: string; answer: any }>
                | { application_id: string; question_id: string; answer: any };
            let payload: Array<{ application_id: string; question_id: string; answer: any }> = [];

            if (Array.isArray(body)) {
                payload = body;
            } else if (body && 'answers' in body && Array.isArray(body.answers)) {
                payload = body.answers;
            } else if (body && 'application_id' in body) {
                payload = [body as any];
            }

            const data = await config.service.upsertAnswers(clerkUserId, payload);
            return reply.code(201).send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to save answers' } });
        }
    });

    app.patch('/api/v2/job-pre-screen-answers/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params;
            const body = request.body as { application_id: string; answer: any };
            const data = await config.service.updateAnswer(clerkUserId, id, body);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to update answer' } });
        }
    });

    app.delete('/api/v2/job-pre-screen-answers/:id', async (request: FastifyRequest<{ Params: { id: string }; Querystring?: { application_id?: string } }>, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params;
            const { application_id } = (request.query as { application_id?: string }) || {};
            if (!application_id) {
                throw new Error('application_id query parameter is required');
            }
            await config.service.deleteAnswer(clerkUserId, application_id, id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to delete answer' } });
        }
    });
}
