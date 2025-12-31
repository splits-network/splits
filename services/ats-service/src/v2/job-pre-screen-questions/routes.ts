import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { JobPreScreenQuestionService } from './service';
import { requireUserContext } from '../shared/helpers';

interface RegisterQuestionRoutesConfig {
    service: JobPreScreenQuestionService;
}

export function registerJobPreScreenQuestionRoutes(
    app: FastifyInstance,
    config: RegisterQuestionRoutesConfig
) {
    app.get('/api/v2/job-pre-screen-questions', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { job_id } = request.query as { job_id?: string };
            const data = await config.service.listQuestions(job_id);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to load questions' } });
        }
    });

    app.get('/api/v2/job-pre-screen-questions/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { id } = request.params;
            const data = await config.service.getQuestion(id);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 404)
                .send({ error: { message: error.message || 'Question not found' } });
        }
    });

    app.post('/api/v2/job-pre-screen-questions', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const data = await config.service.createQuestion(request.body);
            return reply.code(201).send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to create question' } });
        }
    });

    app.patch('/api/v2/job-pre-screen-questions/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { id } = request.params;
            const data = await config.service.updateQuestion(id, request.body);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to update question' } });
        }
    });

    app.delete('/api/v2/job-pre-screen-questions/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { id } = request.params;
            await config.service.deleteQuestion(id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to delete question' } });
        }
    });
}
