import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIReviewServiceV2 } from '../../src/v2/reviews/service';
import { Logger } from '@splits-network/shared-logging';

function createLoggerMock(): Logger {
    return {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        fatal: vi.fn(),
        child: vi.fn(() => createLoggerMock()),
    } as unknown as Logger;
}

describe('AIReviewServiceV2 (unit)', () => {
    const repository = {} as any;
    const eventPublisher = undefined;
    const logger = createLoggerMock();

    beforeEach(() => {
        vi.restoreAllMocks();
        process.env.OPENAI_API_KEY = 'test-key';
        process.env.OPENAI_MODEL = 'gpt-test';
        process.env.ATS_SERVICE_URL = 'http://ats-service:3003';
    });

    afterEach(() => {
        delete process.env.OPENAI_API_KEY;
        delete process.env.OPENAI_MODEL;
        delete process.env.ATS_SERVICE_URL;
        delete process.env.INTERNAL_SERVICE_KEY;
    });

    it('returns input as-is when required fields are present (no fetch)', async () => {
        const service = new AIReviewServiceV2(repository, eventPublisher, logger);
        const fetchSpy = vi.spyOn(globalThis, 'fetch' as any);

        const input = {
            application_id: 'app-1',
            job_title: 'Engineer',
            job_description: 'Build things',
            required_skills: ['TypeScript'],
            preferred_skills: ['GraphQL'],
        };

        const enriched = await service.enrichApplicationData(input);

        expect(enriched).toEqual(input);
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('enriches minimal input by fetching ATS data and combines document text', async () => {
        const service = new AIReviewServiceV2(repository, eventPublisher, logger);

        const mockApplication = {
            candidate_id: 'cand-1',
            job_id: 'job-1',
            job: {
                title: 'Senior Engineer',
                recruiter_description: 'Lead engineering',
            },
            job_requirements: [
                { requirement_type: 'mandatory', description: 'TypeScript' },
                { requirement_type: 'preferred', description: 'GraphQL' },
            ],
            documents: [
                {
                    id: 'doc-1',
                    filename: 'resume.pdf',
                    metadata: { extracted_text: 'Resume text A' },
                    processing_status: 'complete',
                },
                {
                    id: 'doc-2',
                    filename: 'portfolio.pdf',
                    metadata: { extracted_text: 'Resume text B' },
                    processing_status: 'complete',
                },
            ],
            pre_screen_answers: [
                { question: { question_text: 'Years of experience?' }, answer: '5' },
            ],
            candidate: { location: 'Remote' },
        };

        vi.spyOn(globalThis, 'fetch' as any).mockResolvedValue({
            ok: true,
            json: async () => ({ data: mockApplication }),
        } as Response);

        const enriched = await service.enrichApplicationData({
            application_id: 'app-1',
        });

        expect(enriched.application_id).toBe('app-1');
        expect(enriched.candidate_id).toBe('cand-1');
        expect(enriched.job_id).toBe('job-1');
        expect(enriched.job_title).toBe('Senior Engineer');
        expect(enriched.job_description).toBe('Lead engineering');
        expect(enriched.required_skills).toEqual(['TypeScript']);
        expect(enriched.preferred_skills).toEqual(['GraphQL']);
        expect(enriched.pre_screen_answers?.[0].question_text).toBe('Years of experience?');
        expect(enriched.pre_screen_answers?.[0].answer_text).toBe('5');
        expect(enriched.resume_text).toContain('Resume text A');
        expect(enriched.resume_text).toContain('=== NEXT DOCUMENT ===');
        expect(enriched.resume_text).toContain('Resume text B');
    });

    it('throws when validateResult receives invalid recommendation', () => {
        const service = new AIReviewServiceV2(repository, eventPublisher, logger);
        const validateResult = (service as any).validateResult.bind(service) as (result: any) => void;

        expect(() =>
            validateResult({
                fit_score: 80,
                recommendation: 'invalid',
                overall_summary: 'summary',
                confidence_level: 80,
                strengths: [],
                concerns: [],
                matched_skills: [],
                missing_skills: [],
                skills_match_percentage: 80,
                required_years: 3,
                candidate_years: 4,
                meets_experience_requirement: true,
                location_compatibility: 'good',
            })
        ).toThrow('Invalid recommendation value');
    });
});
