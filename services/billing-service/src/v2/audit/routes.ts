// Placement Payout Audit Log Routes - Read-only API for admin audit trail

import { FastifyInstance } from 'fastify';
import { StandardListParams } from '@splits-network/shared-types';
import { PayoutAuditRepository } from './repository';
import { PlacementPayoutAuditFilters } from './types';

export async function placementPayoutAuditRoutes(
    app: FastifyInstance,
    auditRepository: PayoutAuditRepository
) {
    const basePath = '/api/v2';

    // LIST - Get audit log entries with filters
    app.get<{
        Querystring: StandardListParams & PlacementPayoutAuditFilters;
    }>(`${basePath}/placement-payout-audit-log`, async (request, reply) => {
        try {
            const clerkUserId = request.headers['x-clerk-user-id'] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const {
                page, limit, search, sort_by, sort_order,
                placement_id, schedule_id, transaction_id,
                event_type, action, changed_by, date_from, date_to,
            } = request.query;

            const result = await auditRepository.list(clerkUserId, {
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 25,
                search,
                sort_by,
                sort_order,
                filters: {
                    placement_id,
                    schedule_id,
                    transaction_id,
                    event_type,
                    action,
                    changed_by,
                    date_from,
                    date_to,
                },
            });

            return reply.send(result);
        } catch (error) {
            console.error('Error listing audit log:', error);
            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });

    // GET BY PLACEMENT - Get audit log for a specific placement
    app.get<{
        Params: { placementId: string };
    }>(`${basePath}/placement-payout-audit-log/placement/:placementId`, async (request, reply) => {
        try {
            const entries = await auditRepository.getByPlacementId(request.params.placementId);
            return reply.send({ data: entries });
        } catch (error) {
            console.error('Error getting audit log by placement:', error);
            return reply.code(500).send({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });
}
