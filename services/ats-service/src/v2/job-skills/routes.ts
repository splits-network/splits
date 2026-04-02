import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { JobSkillService } from './service.js';
import { requireUserContext } from '../shared/helpers.js';

interface RegisterJobSkillRoutesConfig {
    service: JobSkillService;
}

export function registerJobSkillRoutes(
    app: FastifyInstance,
    config: RegisterJobSkillRoutesConfig
) {
    app.get('/api/v2/job-skills', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { job_id } = request.query as { job_id?: string };
            if (!job_id) {
                return reply.code(400).send({ error: { message: 'job_id query parameter is required' } });
            }
            const data = await config.service.listByJobId(job_id);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to load job skills' } });
        }
    });

    app.post('/api/v2/job-skills', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { job_id, skill_id, is_required } = request.body as { job_id: string; skill_id: string; is_required?: boolean };
            const data = await config.service.addSkill(job_id, skill_id, is_required ?? true);
            return reply.code(201).send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to add job skill' } });
        }
    });

    app.delete('/api/v2/job-skills/:jobId/:skillId', async (request: FastifyRequest<{
        Params: { jobId: string; skillId: string }
    }>, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { jobId, skillId } = request.params;
            await config.service.removeSkill(jobId, skillId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to remove job skill' } });
        }
    });

    app.put('/api/v2/job-skills/job/:jobId/bulk-replace', async (request: FastifyRequest<{
        Params: { jobId: string };
        Body: { skills: Array<{ skill_id: string; is_required: boolean }> };
    }>, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { jobId } = request.params;
            const { skills } = request.body;

            if (!skills) {
                return reply.code(400).send({ error: { message: 'skills array is required' } });
            }

            const data = await config.service.bulkReplace(jobId, skills);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to bulk replace job skills' } });
        }
    });
}
