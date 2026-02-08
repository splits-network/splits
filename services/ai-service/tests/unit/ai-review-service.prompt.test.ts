import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('AIReviewServiceV2 prompt + validation (unit)', () => {
    const repository = {} as any;
    const eventPublisher = undefined;
    const logger = createLoggerMock();

    beforeEach(() => {
        vi.restoreAllMocks();
        process.env.OPENAI_API_KEY = 'test-key';
    });

    it('builds prompt with required and preferred requirements and pre-screen answers', () => {
        const service = new AIReviewServiceV2(repository, eventPublisher, logger);
        const buildPrompt = (service as any).buildPrompt.bind(service) as (input: any) => string;

        const prompt = buildPrompt({
            job_title: 'Engineer',
            job_description: 'Build things',
            required_skills: ['TypeScript'],
            preferred_skills: ['GraphQL'],
            required_years: 3,
            job_location: 'Remote',
            candidate_location: 'Remote',
            resume_text: 'Resume text',
            job_requirements: [
                { requirement_text: '5+ years TS', is_required: true, category: 'experience' },
                { requirement_text: 'GraphQL', is_required: false, category: 'skills' },
            ],
            pre_screen_answers: [
                { question_text: 'Years of experience?', answer_text: '5' },
            ],
        });

        expect(prompt).toContain('**Required Qualifications:**');
        expect(prompt).toContain('5+ years TS (experience)');
        expect(prompt).toContain('**Preferred Qualifications:**');
        expect(prompt).toContain('GraphQL (skills)');
        expect(prompt).toContain('**Candidate Pre-Screen Responses:**');
        expect(prompt).toContain('Q1: Years of experience?');
        expect(prompt).toContain('A: 5');
    });

    it('uses document count message when resume text is missing but documents exist', () => {
        const service = new AIReviewServiceV2(repository, eventPublisher, logger);
        const buildPrompt = (service as any).buildPrompt.bind(service) as (input: any) => string;

        const prompt = buildPrompt({
            job_title: 'Engineer',
            job_description: 'Build things',
            required_skills: ['TypeScript'],
            preferred_skills: [],
            documents_count: 2,
            candidate_location: 'Remote',
            job_location: 'Remote',
        });

        expect(prompt).toContain('Resume: 2 document(s) attached');
        expect(prompt).toContain('text extraction is pending');
    });

    it('rejects invalid location_compatibility in validateResult', () => {
        const service = new AIReviewServiceV2(repository, eventPublisher, logger);
        const validateResult = (service as any).validateResult.bind(service) as (result: any) => void;

        expect(() =>
            validateResult({
                fit_score: 80,
                recommendation: 'good_fit',
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
                location_compatibility: 'somewhere',
            })
        ).toThrow('Invalid location_compatibility value');
    });
});
