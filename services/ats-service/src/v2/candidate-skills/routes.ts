import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CandidateSkillService } from './service';
import { requireUserContext } from '../shared/helpers';

interface RegisterCandidateSkillRoutesConfig {
    service: CandidateSkillService;
}

export function registerCandidateSkillRoutes(
    app: FastifyInstance,
    config: RegisterCandidateSkillRoutesConfig
) {
    app.get('/api/v2/candidate-skills', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { candidate_id } = request.query as { candidate_id?: string };
            if (!candidate_id) {
                return reply.code(400).send({ error: { message: 'candidate_id query parameter is required' } });
            }
            const data = await config.service.listByCandidateId(candidate_id);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to load candidate skills' } });
        }
    });

    app.post('/api/v2/candidate-skills', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { candidate_id, skill_id, source } = request.body as { candidate_id: string; skill_id: string; source?: string };
            const data = await config.service.addSkill(candidate_id, skill_id, source);
            return reply.code(201).send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to add candidate skill' } });
        }
    });

    app.delete('/api/v2/candidate-skills/:candidateId/:skillId', async (request: FastifyRequest<{
        Params: { candidateId: string; skillId: string }
    }>, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { candidateId, skillId } = request.params;
            await config.service.removeSkill(candidateId, skillId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to remove candidate skill' } });
        }
    });

    app.put('/api/v2/candidate-skills/candidate/:candidateId/bulk-replace', async (request: FastifyRequest<{
        Params: { candidateId: string };
        Body: { skills: Array<{ skill_id: string; source?: string }> };
    }>, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { candidateId } = request.params;
            const { skills } = request.body;

            if (!skills) {
                return reply.code(400).send({ error: { message: 'skills array is required' } });
            }

            const data = await config.service.bulkReplace(candidateId, skills);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to bulk replace candidate skills' } });
        }
    });
}
