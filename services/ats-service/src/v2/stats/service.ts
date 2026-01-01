import { StatsRepository } from './repository';
import {
    CandidateStatsResponse,
    RecruiterStatsResponse,
    StatsQueryParams,
    StatsRange,
    StatsResponse,
    StatsScope,
} from './types';

function startOfYear(date: Date) {
    return new Date(date.getFullYear(), 0, 1);
}

function parseRange(range?: string): StatsRange {
    const now = new Date();
    if (!range) {
        return { label: 'ytd', from: startOfYear(now), to: now };
    }

    const normalized = range.trim().toLowerCase();
    if (normalized === 'ytd') {
        return { label: 'ytd', from: startOfYear(now), to: now, raw: range };
    }

    const match = normalized.match(/^(\d+)(d|w|m)$/);
    if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2];
        const from = new Date(now);
        if (unit === 'd') {
            from.setDate(from.getDate() - value);
        } else if (unit === 'w') {
            from.setDate(from.getDate() - value * 7);
        } else if (unit === 'm') {
            from.setMonth(from.getMonth() - value);
        }
        return { label: normalized, from, to: now, raw: range };
    }

    return { label: 'ytd', from: startOfYear(now), to: now, raw: range };
}

export class StatsServiceV2 {
    constructor(private repository: StatsRepository) {}

    async getStats(clerkUserId: string, params: StatsQueryParams): Promise<StatsResponse> {
        const scope = this.normalizeScope(params.scope || params.type || 'recruiter');
        const range = parseRange(params.range);

        switch (scope) {
            case 'recruiter': {
                const accessContext = await this.repository.getAccessContext(clerkUserId);
                if (!accessContext.recruiterId) {
                    throw new Error('Recruiter profile required to view recruiter stats');
                }
                const metrics = await this.repository.getRecruiterStats(accessContext.recruiterId);
                return {
                    scope: 'recruiter',
                    range: {
                        label: range.label,
                        from: range.from.toISOString(),
                        to: range.to.toISOString(),
                    },
                    metrics,
                };
            }
            case 'candidate': {
                const accessContext = await this.repository.getAccessContext(clerkUserId);
                if (!accessContext.candidateId) {
                    throw new Error('Candidate profile required to view candidate stats');
                }
                const metrics = await this.repository.getCandidateStats(accessContext.candidateId);
                return {
                    scope: 'candidate',
                    range: {
                        label: range.label,
                        from: range.from.toISOString(),
                        to: range.to.toISOString(),
                    },
                    metrics,
                };
            }
            default:
                throw new Error(`Unsupported stats scope: ${scope}`);
        }
    }

    private normalizeScope(scope: string): StatsScope {
        const normalized = scope.trim().toLowerCase();
        if (normalized === 'recruiter') return 'recruiter';
        if (normalized === 'candidate') return 'candidate';
        if (normalized === 'company') return 'company';
        if (normalized === 'platform' || normalized === 'admin') return 'platform';
        throw new Error(`Unknown stats scope: ${scope}`);
    }
}
