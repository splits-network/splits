import { buildPaginationResponse } from '../shared/helpers';
import { MatchFilters, MatchUpdate } from '../types';
import { CandidateMatchRepository, CreateMatchInput } from './repository';
import { EventPublisher } from '../shared/events';

export class CandidateMatchServiceV2 {
    constructor(
        private repository: CandidateMatchRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async listMatches(filters: MatchFilters) {
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

    async getMatch(id: string) {
        const match = await this.repository.findMatch(id);
        if (!match) {
            throw new Error('Match not found');
        }
        return match;
    }

    async createMatch(input: CreateMatchInput) {
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

    async updateMatch(id: string, updates: MatchUpdate) {
        await this.getMatch(id);
        const match = await this.repository.updateMatch(id, updates);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.matches.updated', {
                match_id: id,
                updates,
            });
        }
        return match;
    }

    async deleteMatch(id: string) {
        await this.getMatch(id);
        await this.repository.deleteMatch(id);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.matches.deleted', {
                match_id: id,
            });
        }
    }
}
