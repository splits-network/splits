import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { NetworkService } from '../../service';
import { NotFoundError, BadRequestError } from '@splits-network/shared-fastify';

interface CreateRecruiterBody {
    user_id: string;
    bio?: string;
}

interface UpdateRecruiterStatusBody {
    status: 'pending' | 'active' | 'suspended';
}

/**
 * Recruiter Routes
 * - Recruiter CRUD operations
 * - Recruiter stats and profiles
 */
export function registerRecruiterRoutes(app: FastifyInstance, service: NetworkService) {
    // Get all recruiters
    app.get('/recruiters', async (request: FastifyRequest, reply: FastifyReply) => {
        const recruiters = await service.getAllRecruiters();
        return reply.send({ data: recruiters });
    });

    // Get recruiter stats (MUST come before :id route to avoid matching "stats" as an ID)
    app.get(
        '/recruiters/:id/stats',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            try {
                const stats = await service.getRecruiterStats(request.params.id);
                return reply.send({ data: stats });
            } catch (error: any) {
                if (error.message.includes('not found')) {
                    throw new NotFoundError('Recruiter', request.params.id);
                }
                throw error;
            }
        }
    );

    // Get recruiter by user ID (MUST come before :id route to avoid matching "by-user" as an ID)
    app.get(
        '/recruiters/by-user/:userId',
        async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
            const recruiter = await service.getRecruiterByUserId(request.params.userId);
            if (!recruiter) {
                throw new NotFoundError('Recruiter for user', request.params.userId);
            }
            return reply.send({ data: recruiter });
        }
    );

    // Get recruiter by ID
    app.get(
        '/recruiters/:id',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            try {
                const recruiter = await service.getRecruiterById(request.params.id);
                return reply.send({ data: recruiter });
            } catch (error: any) {
                if (error.message.includes('not found')) {
                    throw new NotFoundError('Recruiter', request.params.id);
                }
                throw error;
            }
        }
    );

    // Create recruiter
    app.post(
        '/recruiters',
        async (request: FastifyRequest<{ Body: CreateRecruiterBody }>, reply: FastifyReply) => {
            const { user_id, bio } = request.body;

            if (!user_id) {
                throw new BadRequestError('user_id is required');
            }

            const recruiter = await service.createRecruiter(user_id, bio);
            return reply.status(201).send({ data: recruiter });
        }
    );

    // Update recruiter status
    app.patch(
        '/recruiters/:id/status',
        async (
            request: FastifyRequest<{ Params: { id: string }; Body: UpdateRecruiterStatusBody }>,
            reply: FastifyReply
        ) => {
            const { status } = request.body;

            if (!status) {
                throw new BadRequestError('status is required');
            }

            const recruiter = await service.updateRecruiterStatus(request.params.id, status);
            return reply.send({ data: recruiter });
        }
    );
}
