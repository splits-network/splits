import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PlacementCollaborationService } from '../../services/placements/collaboration-service';

/**
 * Phase 2: Multi-Recruiter Collaboration Routes
 * - Add collaborators to placements
 * - Manage split percentages
 * - Calculate split recommendations
 */
export function registerPlacementCollaborationRoutes(
    app: FastifyInstance,
    collaborationService: PlacementCollaborationService
) {
    // Add collaborator to placement
    app.post(
        '/placements/:placementId/collaborators',
        {
            schema: {
                tags: ['phase2-collaboration'],
                summary: 'Add a collaborator to a placement with role and split',
                body: {
                    type: 'object',
                    required: ['recruiter_user_id', 'role', 'split_percentage', 'split_amount'],
                    properties: {
                        recruiter_user_id: { type: 'string' },
                        role: { type: 'string', enum: ['sourcer', 'submitter', 'closer', 'support'] },
                        split_percentage: { type: 'number' },
                        split_amount: { type: 'number' },
                        notes: { type: 'string' }
                    }
                }
            }
        },
        async (
            request: FastifyRequest<{
                Params: { placementId: string };
                Body: {
                    recruiter_user_id: string;
                    role: 'sourcer' | 'submitter' | 'closer' | 'support';
                    split_percentage: number;
                    split_amount: number;
                    notes?: string;
                };
            }>,
            reply: FastifyReply
        ) => {
            const { placementId } = request.params;
            const { recruiter_user_id, role, split_percentage, split_amount, notes } = request.body;

            const collaborator = await collaborationService.addCollaborator(
                placementId,
                recruiter_user_id,
                role,
                split_percentage,
                split_amount,
                notes
            );

            return reply.status(201).send({ data: collaborator });
        }
    );

    // Get collaborators for placement
    app.get(
        '/placements/:placementId/collaborators',
        {
            schema: {
                tags: ['phase2-collaboration'],
                summary: 'Get all collaborators for a placement',
            }
        },
        async (
            request: FastifyRequest<{ Params: { placementId: string } }>,
            reply: FastifyReply
        ) => {
            const collaborators = await collaborationService.getPlacementCollaborators(
                request.params.placementId
            );
            return reply.send({ data: collaborators });
        }
    );

    // Calculate split recommendations
    app.post(
        '/placements/calculate-splits',
        {
            schema: {
                tags: ['phase2-collaboration'],
                summary: 'Calculate recommended splits for multi-recruiter collaboration',
                body: {
                    type: 'object',
                    required: ['total_recruiter_share', 'roles'],
                    properties: {
                        total_recruiter_share: { type: 'number' },
                        roles: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['role'],
                                properties: {
                                    role: { type: 'string', enum: ['sourcer', 'submitter', 'closer', 'support'] },
                                    weight: { type: 'number' }
                                }
                            }
                        }
                    }
                }
            }
        },
        async (
            request: FastifyRequest<{
                Body: {
                    total_recruiter_share: number;
                    roles: Array<{ role: 'sourcer' | 'submitter' | 'closer' | 'support'; weight?: number }>;
                };
            }>,
            reply: FastifyReply
        ) => {
            const { total_recruiter_share, roles } = request.body;

            const splits = collaborationService.calculateCollaboratorSplits(
                total_recruiter_share,
                roles
            );

            return reply.send({ data: splits });
        }
    );
}
