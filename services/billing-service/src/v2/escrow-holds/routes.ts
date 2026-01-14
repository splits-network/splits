// EscrowHold Routes - V2 5-route CRUD pattern + release actions

import { FastifyInstance } from 'fastify';
import { StandardListParams } from '@splits-network/shared-types';
import { EscrowHoldServiceV2 } from './service';
import { EscrowHoldFilters, EscrowHoldUpdate } from './types';

export async function escrowHoldRoutes(
    app: FastifyInstance,
    service: EscrowHoldServiceV2
) {
    // LIST - Get all escrow holds with filters
    app.get<{
        Querystring: StandardListParams & { filters?: string };
    }>('/escrow-holds', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const { filters: filtersStr, ...params } = request.query;
            let filters: EscrowHoldFilters | undefined;

            if (filtersStr) {
                try {
                    filters = JSON.parse(filtersStr);
                } catch {
                    return reply.code(400).send({ error: 'Invalid filters format' });
                }
            }

            const result = await service.list(clerkUserId, { ...params, filters });
            return reply.send(result);
        } catch (error) {
            console.error('Error listing escrow holds:', error);
            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });

    // GET BY ID - Get a single escrow hold
    app.get<{
        Params: { id: string };
    }>('/escrow-holds/:id', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const { id } = request.params;
            const hold = await service.getById(id, clerkUserId);

            if (!hold) {
                return reply.code(404).send({ error: 'Escrow hold not found' });
            }

            return reply.send({ data: hold });
        } catch (error) {
            console.error('Error getting escrow hold:', error);
            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });

    // CREATE - Create a new escrow hold (admin only)
    app.post<{
        Body: {
            placement_id: string;
            payout_id?: string;
            hold_amount: number;
            hold_reason: string;
            release_scheduled_date: string;
        };
    }>('/escrow-holds', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const hold = await service.create(clerkUserId, request.body);
            return reply.code(201).send({ data: hold });
        } catch (error) {
            console.error('Error creating escrow hold:', error);

            if (error instanceof Error) {
                if (error.message.includes('Only platform administrators')) {
                    return reply.code(403).send({ error: error.message });
                }
                if (error.message.includes('required') || error.message.includes('Invalid')) {
                    return reply.code(400).send({ error: error.message });
                }
            }

            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });

    // UPDATE - Update an escrow hold (admin only)
    app.patch<{
        Params: { id: string };
        Body: {
            hold_amount?: number;
            hold_reason?: string;
            release_scheduled_date?: string;
            status?: 'pending' | 'held' | 'released' | 'cancelled';
            released_at?: string;
            released_by?: string;
        };
    }>('/escrow-holds/:id', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const { id } = request.params;
            const hold = await service.update(id, clerkUserId, request.body as EscrowHoldUpdate);
            return reply.send({ data: hold });
        } catch (error) {
            console.error('Error updating escrow hold:', error);

            if (error instanceof Error) {
                if (error.message.includes('Only platform administrators')) {
                    return reply.code(403).send({ error: error.message });
                }
                if (error.message.includes('Invalid')) {
                    return reply.code(400).send({ error: error.message });
                }
            }

            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });

    // DELETE - Cancel an escrow hold (admin only - soft delete)
    app.delete<{
        Params: { id: string };
    }>('/escrow-holds/:id', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const { id } = request.params;
            await service.delete(id, clerkUserId);
            return reply.send({ data: { message: 'Escrow hold deleted successfully' } });
        } catch (error) {
            console.error('Error deleting escrow hold:', error);

            if (error instanceof Error) {
                if (error.message.includes('Only platform administrators')) {
                    return reply.code(403).send({ error: error.message });
                }
            }

            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });

    // ADMIN ACTION - Release an escrow hold manually
    app.post<{
        Params: { id: string };
    }>('/escrow-holds/:id/release', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const { id } = request.params;
            const hold = await service.release(id, clerkUserId);
            return reply.send({ data: hold });
        } catch (error) {
            console.error('Error releasing escrow hold:', error);

            if (error instanceof Error) {
                if (error.message.includes('Only platform administrators')) {
                    return reply.code(403).send({ error: error.message });
                }
                if (error.message.includes('not found')) {
                    return reply.code(404).send({ error: error.message });
                }
                if (error.message.includes('Cannot release')) {
                    return reply.code(400).send({ error: error.message });
                }
            }

            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });

    // ADMIN ACTION - Cancel an escrow hold
    app.post<{
        Params: { id: string };
    }>('/escrow-holds/:id/cancel', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const { id } = request.params;
            const hold = await service.cancel(id, clerkUserId);
            return reply.send({ data: hold });
        } catch (error) {
            console.error('Error cancelling escrow hold:', error);

            if (error instanceof Error) {
                if (error.message.includes('Only platform administrators')) {
                    return reply.code(403).send({ error: error.message });
                }
                if (error.message.includes('not found')) {
                    return reply.code(404).send({ error: error.message });
                }
                if (error.message.includes('Cannot cancel')) {
                    return reply.code(400).send({ error: error.message });
                }
            }

            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });

    // ADMIN ACTION - Process all due releases (automation endpoint)
    app.post('/escrow-holds/process-due', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            // This endpoint should be called by the automation job or admin only
            // Additional authentication check would be ideal here (e.g., API key)

            const results = await service.processDueReleases();
            return reply.send({ data: results });
        } catch (error) {
            console.error('Error processing due releases:', error);
            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });

    // GET PLACEMENT HOLDS - Get active holds for a placement
    app.get<{
        Params: { placementId: string };
    }>('/placements/:placementId/escrow-holds', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const { placementId } = request.params;
            const holds = await service.getActiveHoldsForPlacement(placementId, clerkUserId);
            return reply.send({ data: holds });
        } catch (error) {
            console.error('Error getting placement holds:', error);
            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });

    // GET PLACEMENT HOLD TOTAL - Get total active hold amount for a placement
    app.get<{
        Params: { placementId: string };
    }>('/placements/:placementId/escrow-holds/total', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const { placementId } = request.params;
            const total = await service.getTotalActiveHolds(placementId, clerkUserId);
            return reply.send({ data: { total } });
        } catch (error) {
            console.error('Error getting placement hold total:', error);
            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });
}
