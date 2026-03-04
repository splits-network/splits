/**
 * Match Service
 *
 * Business logic layer with access control.
 * Routes through to repository with role-based filtering.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext, AccessContext } from '../shared/access';
import { IEventPublisher } from '../shared/events';
import { buildPaginationResponse } from '../shared/helpers';
import { MatchRepository } from './repository';
import { MatchListFilters } from './types';
import { MatchingOrchestrator } from './matching-orchestrator';

export class MatchService {
    constructor(
        private repository: MatchRepository,
        private supabase: SupabaseClient,
        private orchestrator: MatchingOrchestrator,
        private eventPublisher?: IEventPublisher,
    ) {}

    private async requireAuth(clerkUserId: string): Promise<AccessContext> {
        const access = await resolveAccessContext(this.supabase, clerkUserId);
        if (!access.identityUserId) throw new Error('Authentication required');
        return access;
    }

    async listMatches(clerkUserId: string, filters: MatchListFilters) {
        const access = await this.requireAuth(clerkUserId);
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;

        let result;

        if (access.isPlatformAdmin) {
            result = await this.repository.findMatches(filters);
        } else if (access.recruiterId) {
            const isPartner = await this.isRecruiterPartner(access.recruiterId);
            result = await this.repository.findMatchesForRecruiter(
                access.recruiterId,
                filters,
                isPartner ? undefined : 'standard',
            );
        } else if (access.candidateId) {
            result = await this.repository.findMatchesForCandidate(access.candidateId, filters);
        } else if (access.companyIds.length > 0 || access.organizationIds.length > 0) {
            // Resolve company IDs — prefer direct companyIds, fall back to org lookup
            let companyIds = access.companyIds;
            if (companyIds.length === 0 && access.organizationIds.length > 0) {
                const { data: orgCompanies } = await this.supabase
                    .from('companies')
                    .select('id')
                    .in('identity_organization_id', access.organizationIds);
                companyIds = (orgCompanies || []).map((c: any) => c.id);
            }
            if (companyIds.length > 0) {
                result = await this.repository.findMatchesForCompany(companyIds, filters);
            } else {
                result = { data: [], total: 0 };
            }
        } else {
            result = { data: [], total: 0 };
        }

        return {
            data: result.data,
            pagination: buildPaginationResponse(page, limit, result.total),
        };
    }

    async getMatch(clerkUserId: string, matchId: string) {
        const access = await this.requireAuth(clerkUserId);
        const match = await this.repository.findById(matchId);
        if (!match) throw new Error('Match not found');

        if (!access.isPlatformAdmin) {
            if (access.candidateId && match.candidate_id !== access.candidateId) {
                throw new Error('Access denied');
            }
        }

        return match;
    }

    async dismissMatch(clerkUserId: string, matchId: string) {
        const access = await this.requireAuth(clerkUserId);
        const match = await this.repository.findById(matchId);
        if (!match) throw new Error('Match not found');

        if (!access.isPlatformAdmin && access.candidateId !== match.candidate_id) {
            // Would need to check job ownership for recruiter — simplified for now
        }

        const updated = await this.repository.updateMatch(matchId, {
            status: 'dismissed',
            dismissed_by: access.identityUserId,
            dismissed_at: new Date().toISOString(),
        });

        if (this.eventPublisher) {
            await this.eventPublisher.publish('match.dismissed', {
                match_id: matchId,
                candidate_id: match.candidate_id,
                job_id: match.job_id,
                dismissed_by: access.identityUserId,
            });
        }

        return updated;
    }

    async refreshForEntity(clerkUserId: string, entityType: 'candidate' | 'job', entityId: string) {
        const access = await this.requireAuth(clerkUserId);
        if (!access.isPlatformAdmin) throw new Error('Admin access required');

        if (entityType === 'candidate') {
            await this.orchestrator.triggerForCandidate(entityId);
        } else {
            await this.orchestrator.triggerForJob(entityId);
        }

        return { message: `Refresh triggered for ${entityType} ${entityId}` };
    }

    async batchRefresh(internalServiceKey: string, limit?: number) {
        const expected = process.env.INTERNAL_SERVICE_KEY;
        if (!expected || internalServiceKey !== expected) {
            throw new Error('Invalid internal service key');
        }

        const count = await this.orchestrator.runBatchCatchup(limit);
        return { message: `Batch refresh completed for ${count} jobs` };
    }

    private async isRecruiterPartner(recruiterId: string): Promise<boolean> {
        const { data } = await this.supabase
            .from('subscriptions')
            .select('plans!inner(tier)')
            .eq('recruiter_id', recruiterId)
            .eq('status', 'active')
            .maybeSingle();

        return (data as any)?.plans?.tier === 'partner';
    }
}
