import { buildPaginationResponse } from '../shared/helpers';
import { MatchFilters, MatchUpdate } from './types';
import { CandidateMatchRepository, CreateMatchInput } from './repository';
import { IEventPublisher } from '../shared/events';
import type { AccessContext } from '../shared/access';

export class CandidateMatchServiceV2 {
    constructor(
        private repository: CandidateMatchRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: IEventPublisher
    ) {}

    private async requirePlatformAdmin(clerkUserId: string): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.isPlatformAdmin) {
            throw new Error('Platform admin permissions required');
        }
        return access;
    }

    async listMatches(clerkUserId: string, filters: MatchFilters) {
        await this.requirePlatformAdmin(clerkUserId);
        const result = await this.repository.findMatches(filters);
        return {
            data: result.data,
            pagination: buildPaginationResponse(
                filters.page ?? 1,
                filters.limit ?? 25,
                result.total
            ),
        };
    }

    async getMatch(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        const match = await this.repository.findMatch(id);
        if (!match) {
            throw new Error('Match not found');
        }
        return match;
    }

    async createMatch(clerkUserId: string, input: CreateMatchInput) {
        await this.requirePlatformAdmin(clerkUserId);
        const match = await this.repository.createMatch(input);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.matches.created', {
                match_id: match.id,
                candidate_id: match.candidate_id,
                job_id: match.job_id,
            });
        }
        return match;
    }

    async updateMatch(clerkUserId: string, id: string, updates: MatchUpdate) {
        await this.requirePlatformAdmin(clerkUserId);
        await this.getMatch(clerkUserId, id);
        const match = await this.repository.updateMatch(id, updates);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.matches.updated', {
                match_id: id,
                updates,
            });
        }
        return match;
    }

    async deleteMatch(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        await this.getMatch(clerkUserId, id);
        await this.repository.deleteMatch(id);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.matches.deleted', {
                match_id: id,
            });
        }
    }
}
