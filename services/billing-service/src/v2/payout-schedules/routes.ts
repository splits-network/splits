// PayoutSchedule Routes - V2 5-route CRUD pattern + admin trigger

import { FastifyInstance } from 'fastify';
import { StandardListParams } from '@splits-network/shared-types';
import { PayoutScheduleServiceV2 } from './service';
import { PayoutScheduleFilters, PayoutScheduleCreate, PayoutScheduleUpdate } from './types';

export async function payoutScheduleRoutes(
    app: FastifyInstance,
    service: PayoutScheduleServiceV2
) {
    // LIST - Get all payout schedules with filters
    app.get<{
        Querystring: StandardListParams & { filters?: string };
    }>('/payout-schedules', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const { filters: filtersStr, ...params } = request.query;
            let filters: PayoutScheduleFilters | undefined;

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
            console.error('Error listing payout schedules:', error);
            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });

    // GET BY ID - Get a single payout schedule
    app.get<{
        Params: { id: string };
    }>('/payout-schedules/:id', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const { id } = request.params;
            const schedule = await service.getById(id, clerkUserId);

            if (!schedule) {
                return reply.code(404).send({ error: 'Payout schedule not found' });
            }

            return reply.send({ data: schedule });
        } catch (error) {
            console.error('Error getting payout schedule:', error);
            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });

    // CREATE - Create a new payout schedule (admin only)
    app.post<{
        Body: {
            placement_id: string;
            payout_id?: string;
            scheduled_date: string;
            guarantee_completion_date?: string;
            trigger_event: string;
            status?: 'scheduled' | 'triggered' | 'cancelled' | 'pending' | 'processing' | 'processed' | 'failed';
        };
    }>('/payout-schedules', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const schedule = await service.create(clerkUserId, request.body as PayoutScheduleCreate);
            return reply.code(201).send({ data: schedule });
        } catch (error) {
            console.error('Error creating payout schedule:', error);

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

    // UPDATE - Update a payout schedule (admin only)
    app.patch<{
        Params: { id: string };
        Body: {
            scheduled_date?: string;
            guarantee_completion_date?: string;
            status?: 'scheduled' | 'triggered' | 'cancelled' | 'pending' | 'processing' | 'processed' | 'failed';
            triggered_at?: string;
            cancelled_at?: string;
            cancellation_reason?: string;
            processed_at?: string;
            failure_reason?: string;
            retry_count?: number;
            last_retry_at?: string;
        };
    }>('/payout-schedules/:id', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const { id } = request.params;
            const schedule = await service.update(id, clerkUserId, request.body as PayoutScheduleUpdate);
            return reply.send({ data: schedule });
        } catch (error) {
            console.error('Error updating payout schedule:', error);

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

    // DELETE - Cancel a payout schedule (admin only - soft delete)
    app.delete<{
        Params: { id: string };
    }>('/payout-schedules/:id', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const { id } = request.params;
            await service.delete(id, clerkUserId);
            return reply.send({ data: { message: 'Payout schedule deleted successfully' } });
        } catch (error) {
            console.error('Error deleting payout schedule:', error);

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

    // ADMIN ACTION - Trigger manual processing of a schedule
    app.post<{
        Params: { id: string };
    }>('/payout-schedules/:id/trigger', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const { id } = request.params;
            const schedule = await service.triggerProcessing(id, clerkUserId);
            return reply.send({ data: schedule });
        } catch (error) {
            console.error('Error triggering schedule processing:', error);

            if (error instanceof Error) {
                if (error.message.includes('Only platform administrators')) {
                    return reply.code(403).send({ error: error.message });
                }
                if (error.message.includes('not found')) {
                    return reply.code(404).send({ error: error.message });
                }
                if (error.message.includes('Cannot process')) {
                    return reply.code(400).send({ error: error.message });
                }
            }

            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });

    // ADMIN ACTION - Process all due schedules (automation endpoint)
    app.post('/payout-schedules/process-due', async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            // This endpoint should be called by the automation job or admin only
            // Additional authentication check would be ideal here (e.g., API key)

            const results = await service.processDueSchedules();
            return reply.send({ data: results });
        } catch (error) {
            console.error('Error processing due schedules:', error);
            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });
}
