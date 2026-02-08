import { describe, it, expect, vi, beforeEach } from 'vitest';

const selectMock = vi.fn();
const fromMock = vi.fn();
const eqMock = vi.fn();

vi.mock('@supabase/supabase-js', () => {
    return {
        createClient: vi.fn(() => ({
            from: (...args: any[]) => fromMock(...args),
        })),
    };
});

import { AIReviewRepository } from '../../src/v2/reviews/repository';

describe('AIReviewRepository stats (unit)', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        selectMock.mockReset();
        fromMock.mockReset();
        eqMock.mockReset();

        fromMock.mockReturnValue({
            select: selectMock.mockReturnThis(),
            eq: eqMock.mockReturnThis(),
        });
    });

    it('returns zeroed stats when no reviews exist', async () => {
        const repo = new AIReviewRepository('http://supabase', 'key');
        eqMock.mockResolvedValueOnce({ data: [], error: null });

        const result = await repo.getStatsByJobId('job-1');

        expect(result.total_applications).toBe(0);
        expect(result.ai_reviewed_count).toBe(0);
        expect(result.average_fit_score).toBe(0);
        expect(result.recommendation_breakdown.strong_fit).toBe(0);
        expect(result.most_matched_skills).toEqual([]);
        expect(result.most_missing_skills).toEqual([]);
    });

    it('aggregates stats and top skills from reviews', async () => {
        const repo = new AIReviewRepository('http://supabase', 'key');
        eqMock.mockResolvedValueOnce({
            data: [
                {
                    fit_score: 80,
                    recommendation: 'good_fit',
                    matched_skills: ['TypeScript', 'GraphQL'],
                    missing_skills: ['AWS'],
                },
                {
                    fit_score: 90,
                    recommendation: 'strong_fit',
                    matched_skills: ['TypeScript'],
                    missing_skills: ['AWS', 'Docker'],
                },
            ],
            error: null,
        });

        const result = await repo.getStatsByJobId('job-1');

        expect(result.total_applications).toBe(2);
        expect(result.ai_reviewed_count).toBe(2);
        expect(result.average_fit_score).toBe(85);
        expect(result.recommendation_breakdown.strong_fit).toBe(1);
        expect(result.recommendation_breakdown.good_fit).toBe(1);
        expect(result.most_matched_skills[0]).toBe('TypeScript');
        expect(result.most_missing_skills[0]).toBe('AWS');
    });
});
