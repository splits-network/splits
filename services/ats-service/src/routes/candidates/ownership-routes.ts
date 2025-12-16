import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CandidateOwnershipService } from '../../services/candidates/ownership-service';

/**
 * Phase 2: Candidate Ownership & Sourcing Routes
 * - Candidate sourcing and ownership
 * - Outreach tracking
 * - Protection windows
 */
export function registerCandidateOwnershipRoutes(
    app: FastifyInstance,
    ownershipService: CandidateOwnershipService
) {
    // List all candidate sourcers (admin)
    app.get(
        '/candidates/sourcers',
        {
            schema: {
                tags: ['phase2-ownership'],
                summary: 'Get all candidate sourcing records (admin)',
                querystring: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['active', 'expired', 'all'], default: 'all' }
                    }
                }
            }
        },
        async (
            request: FastifyRequest<{ Querystring: { status?: string } }>,
            reply: FastifyReply
        ) => {
            const sourcers = await ownershipService.getAllSourcers(request.query.status);
            return reply.send({ data: sourcers });
        }
    );

    // Establish sourcing for a candidate
    app.post(
        '/candidates/:candidateId/source',
        {
            schema: {
                tags: ['phase2-ownership'],
                summary: 'Establish sourcing ownership of a candidate',
                params: {
                    type: 'object',
                    properties: {
                        candidateId: { type: 'string' }
                    }
                },
                body: {
                    type: 'object',
                    required: ['sourcer_user_id'],
                    properties: {
                        sourcer_user_id: { type: 'string' },
                        sourcer_type: { type: 'string', enum: ['recruiter', 'tsn'], default: 'recruiter' },
                        protection_window_days: { type: 'number', default: 365 },
                        notes: { type: 'string' }
                    }
                }
            }
        },
        async (
            request: FastifyRequest<{
                Params: { candidateId: string };
                Body: {
                    sourcer_user_id: string;
                    sourcer_type?: 'recruiter' | 'tsn';
                    protection_window_days?: number;
                    notes?: string;
                };
            }>,
            reply: FastifyReply
        ) => {
            const { candidateId } = request.params;
            const { sourcer_user_id, sourcer_type, protection_window_days, notes } = request.body;

            const sourcer = await ownershipService.sourceCandidate(
                candidateId,
                sourcer_user_id,
                sourcer_type,
                protection_window_days,
                notes
            );

            return reply.status(201).send({ data: sourcer });
        }
    );

    // Get candidate sourcer/ownership info
    app.get(
        '/candidates/:candidateId/sourcer',
        {
            schema: {
                tags: ['phase2-ownership'],
                summary: 'Get sourcing/ownership information for a candidate',
            }
        },
        async (
            request: FastifyRequest<{ Params: { candidateId: string } }>,
            reply: FastifyReply
        ) => {
            const sourcer = await ownershipService.getCandidateSourcer(request.params.candidateId);
            if (!sourcer) {
                return reply.send({ data: null, message: 'No sourcer established' });
            }
            return reply.send({ data: sourcer });
        }
    );

    // Check if user can work with candidate
    app.get(
        '/candidates/:candidateId/can-work/:userId',
        {
            schema: {
                tags: ['phase2-ownership'],
                summary: 'Check if a user can work with a candidate (ownership check)',
            }
        },
        async (
            request: FastifyRequest<{ Params: { candidateId: string; userId: string } }>,
            reply: FastifyReply
        ) => {
            const { candidateId, userId } = request.params;
            const canWork = await ownershipService.canUserWorkWithCandidate(candidateId, userId);
            return reply.send({ data: { can_work: canWork } });
        }
    );

    // Record outreach to candidate
    app.post(
        '/candidates/:candidateId/outreach',
        {
            schema: {
                tags: ['phase2-ownership'],
                summary: 'Record outreach email to candidate (establishes ownership if first contact)',
                body: {
                    type: 'object',
                    required: ['recruiter_user_id', 'email_subject', 'email_body'],
                    properties: {
                        recruiter_user_id: { type: 'string' },
                        job_id: { type: 'string' },
                        email_subject: { type: 'string' },
                        email_body: { type: 'string' }
                    }
                }
            }
        },
        async (
            request: FastifyRequest<{
                Params: { candidateId: string };
                Body: {
                    recruiter_user_id: string;
                    job_id?: string;
                    email_subject: string;
                    email_body: string;
                };
            }>,
            reply: FastifyReply
        ) => {
            const { candidateId } = request.params;
            const { recruiter_user_id, job_id, email_subject, email_body } = request.body;

            const outreach = await ownershipService.recordOutreach(
                candidateId,
                recruiter_user_id,
                email_subject,
                email_body,
                job_id
            );

            return reply.status(201).send({ data: outreach });
        }
    );

    // Get outreach history for candidate
    app.get(
        '/candidates/:candidateId/outreach',
        {
            schema: {
                tags: ['phase2-ownership'],
                summary: 'Get outreach history for a candidate',
            }
        },
        async (
            request: FastifyRequest<{ Params: { candidateId: string } }>,
            reply: FastifyReply
        ) => {
            const outreach = await ownershipService.getCandidateOutreach(request.params.candidateId);
            return reply.send({ data: outreach });
        }
    );
}
