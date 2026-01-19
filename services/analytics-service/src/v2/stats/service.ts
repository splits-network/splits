import { StatsRepository } from './repository';
import { StatsQueryParams, StatsRange, StatsResponse } from './types';

function startOfYear(date: Date) {
    return new Date(date.getFullYear(), 0, 1);
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function parseRange(range?: string): StatsRange {
    const now = new Date();
    if (!range) {
        return { label: 'ytd', from: startOfYear(now), to: now };
    }

    const normalized = range.trim().toLowerCase();

    // Year-to-date
    if (normalized === 'ytd') {
        return { label: 'ytd', from: startOfYear(now), to: now, raw: range };
    }

    // This month
    if (normalized === 'mtd') {
        return { label: 'mtd', from: startOfMonth(now), to: now, raw: range };
    }

    // All time
    if (normalized === 'all') {
        const allTimeStart = new Date('2024-01-01'); // Platform launch date
        return { label: 'all', from: allTimeStart, to: now, raw: range };
    }

    // Parse formats like "7d", "30d", "90d", "2w", "6m"
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

    // Default to YTD if invalid format
    return { label: 'ytd', from: startOfYear(now), to: now, raw: range };
}

export class StatsServiceV2 {
    constructor(private repository: StatsRepository) { }

    async getStats(clerkUserId: string, params: StatsQueryParams): Promise<StatsResponse> {
        const scope = this.normalizeScope(params.scope || params.type || 'recruiter');
        const range = parseRange(params.range);

        switch (scope) {
            case 'recruiter': {
                const accessContext = await this.repository.getAccessContext(clerkUserId);
                if (!accessContext.recruiterId) {
                    throw new Error('Recruiter profile required to view recruiter stats');
                }
                const metrics = await this.repository.getRecruiterStats(
                    accessContext.recruiterId,
                    range
                );
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
                const metrics = await this.repository.getCandidateStats(
                    accessContext.candidateId,
                    range
                );
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

            case 'company': {
                const accessContext = await this.repository.getAccessContext(clerkUserId);
                
                if (accessContext.organizationIds.length === 0) {
                    throw new Error('Company membership required to view company stats');
                }
                
                const metrics = await this.repository.getCompanyStats(
                    accessContext.organizationIds,
                    range
                );
                
                return {
                    scope: 'company',
                    range: {
                        label: range.label,
                        from: range.from.toISOString(),
                        to: range.to.toISOString(),
                    },
                    metrics,
                };
            }

            case 'platform': {
                const accessContext = await this.repository.getAccessContext(clerkUserId);
                if (!accessContext.isPlatformAdmin) {
                    throw new Error('Platform admin access required to view platform stats');
                }
                const metrics = await this.repository.getPlatformStats(range);
                return {
                    scope: 'platform',
                    range: {
                        label: range.label,
                        from: range.from.toISOString(),
                        to: range.to.toISOString(),
                    },
                    metrics,
                };
            }

            default:
                throw new Error(`Invalid stats scope: ${scope}`);
        }
    }

    private normalizeScope(scope: string): 'recruiter' | 'candidate' | 'company' | 'platform' {
        const normalized = scope.toLowerCase().trim();
        if (
            normalized === 'recruiter' ||
            normalized === 'candidate' ||
            normalized === 'company' ||
            normalized === 'platform'
        ) {
            return normalized;
        }
        return 'recruiter'; // Default
    }
}
