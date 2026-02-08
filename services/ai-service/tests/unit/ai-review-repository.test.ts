import { describe, it, expect, vi, beforeEach } from 'vitest';

const insertMock = vi.fn();
const selectMock = vi.fn();
const singleMock = vi.fn();
const fromMock = vi.fn();
const eqMock = vi.fn();
const orderMock = vi.fn();
const limitMock = vi.fn();
const gteMock = vi.fn();
const lteMock = vi.fn();
const rangeMock = vi.fn();

vi.mock('@supabase/supabase-js', () => {
    return {
        createClient: vi.fn(() => ({
            from: (...args: any[]) => fromMock(...args),
        })),
    };
});

import { AIReviewRepository } from '../../src/v2/reviews/repository';

function resetQueryMocks() {
    insertMock.mockReset();
    selectMock.mockReset();
    singleMock.mockReset();
    fromMock.mockReset();
    eqMock.mockReset();
    orderMock.mockReset();
    limitMock.mockReset();
    gteMock.mockReset();
    lteMock.mockReset();
    rangeMock.mockReset();
}

describe('AIReviewRepository (unit)', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        resetQueryMocks();

        fromMock.mockReturnValue({
            insert: insertMock.mockReturnThis(),
            upsert: insertMock.mockReturnThis(),
            select: selectMock.mockReturnThis(),
            single: singleMock.mockResolvedValue({ data: null, error: null }),
            eq: eqMock.mockReturnThis(),
            order: orderMock.mockReturnThis(),
            limit: limitMock.mockReturnThis(),
            gte: gteMock.mockReturnThis(),
            lte: lteMock.mockReturnThis(),
            range: rangeMock.mockReturnThis(),
        });
    });

    it('creates review and returns raw db row', async () => {
        const repo = new AIReviewRepository('http://supabase', 'key');
        const dbRow = { id: 'review-1', fit_score: 80 };
        singleMock.mockResolvedValueOnce({ data: dbRow, error: null });

        const result = await repo.create({
            application_id: 'app-1',
            fit_score: 80,
            recommendation: 'good_fit',
            overall_summary: 'summary',
            confidence_level: 80,
            strengths: [],
            concerns: [],
            matched_skills: [],
            missing_skills: [],
            skills_match_percentage: 80,
            location_compatibility: 'good',
            model_version: 'gpt-test',
            processing_time_ms: 1000,
        });

        expect(result).toEqual(dbRow);
        expect(fromMock).toHaveBeenCalledWith('ai_reviews');
        expect(insertMock).toHaveBeenCalled();
        expect(selectMock).toHaveBeenCalled();
        expect(singleMock).toHaveBeenCalled();
    });

    it('transforms db row into API shape on findById', async () => {
        const repo = new AIReviewRepository('http://supabase', 'key');
        const dbRow = {
            id: 'review-1',
            skills_match_percentage: 75,
            matched_skills: ['TypeScript'],
            missing_skills: ['GraphQL'],
            candidate_years: '3',
            required_years: 2,
            meets_experience_requirement: true,
        };
        singleMock.mockResolvedValueOnce({ data: dbRow, error: null });

        const result = await repo.findById('review-1');

        expect(result.skills_match.match_percentage).toBe(75);
        expect(result.skills_match.matched_skills).toEqual(['TypeScript']);
        expect(result.skills_match.missing_skills).toEqual(['GraphQL']);
        expect(result.experience_analysis.candidate_years).toBe(3);
        expect(result.experience_analysis.required_years).toBe(2);
        expect(result.experience_analysis.meets_requirement).toBe(true);
    });

    it('builds filters and pagination in findReviews', async () => {
        const repo = new AIReviewRepository('http://supabase', 'key');
        const data = [{ id: 'review-1' }];
        rangeMock.mockResolvedValueOnce({ data, error: null, count: 1 });

        const result = await repo.findReviews({
            application_id: 'app-1',
            fit_score_min: 60,
            fit_score_max: 90,
            recommendation: 'good_fit',
            page: 2,
            limit: 10,
        });

        expect(eqMock).toHaveBeenCalledWith('application_id', 'app-1');
        expect(gteMock).toHaveBeenCalledWith('fit_score', 60);
        expect(lteMock).toHaveBeenCalledWith('fit_score', 90);
        expect(eqMock).toHaveBeenCalledWith('recommendation', 'good_fit');
        expect(rangeMock).toHaveBeenCalledWith(10, 19);
        expect(result.total).toBe(1);
        expect(result.data).toHaveLength(1);
    });

    it('returns null when findById receives null row', async () => {
        const repo = new AIReviewRepository('http://supabase', 'key');
        singleMock.mockResolvedValueOnce({ data: null, error: null });

        const result = await repo.findById('review-1');

        expect(result).toBeNull();
    });

    it('defaults missing fields in transform to safe values', async () => {
        const repo = new AIReviewRepository('http://supabase', 'key');
        const dbRow = {
            id: 'review-1',
            skills_match_percentage: null,
            matched_skills: null,
            missing_skills: null,
            candidate_years: null,
            required_years: null,
            meets_experience_requirement: null,
        };
        singleMock.mockResolvedValueOnce({ data: dbRow, error: null });

        const result = await repo.findById('review-1');

        expect(result.skills_match.match_percentage).toBe(0);
        expect(result.skills_match.matched_skills).toEqual([]);
        expect(result.skills_match.missing_skills).toEqual([]);
        expect(result.experience_analysis.candidate_years).toBe(0);
        expect(result.experience_analysis.required_years).toBe(0);
        expect(result.experience_analysis.meets_requirement).toBe(false);
    });
});
