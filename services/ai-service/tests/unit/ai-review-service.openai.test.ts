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

describe('AIReviewServiceV2 OpenAI handling (unit)', () => {
    const repository = {
        create: vi.fn(),
    } as any;
    const logger = createLoggerMock();

    beforeEach(() => {
        vi.restoreAllMocks();
        process.env.OPENAI_API_KEY = 'test-key';
    });

    afterEach(() => {
        delete process.env.OPENAI_API_KEY;
        delete process.env.OPENAI_MODEL;
    });

    it('throws when OpenAI API returns non-OK', async () => {
        const service = new AIReviewServiceV2(repository, undefined, logger);
        vi.spyOn(globalThis, 'fetch' as any).mockResolvedValue({
            ok: false,
            status: 429,
            text: async () => 'rate limited',
        } as Response);

        await expect(
            service.createReview({
                application_id: 'app-1',
                candidate_id: 'cand-1',
                job_id: 'job-1',
                job_title: 'Engineer',
                job_description: 'Build things',
                required_skills: ['TypeScript'],
            } as any)
        ).rejects.toThrow('OpenAI API error: 429');
    });

    it('throws when OpenAI returns invalid JSON payload', async () => {
        const service = new AIReviewServiceV2(repository, undefined, logger);
        vi.spyOn(globalThis, 'fetch' as any).mockResolvedValue({
            ok: true,
            json: async () => ({
                choices: [{ message: { content: '{invalid json' } }],
            }),
        } as Response);

        await expect(
            service.createReview({
                application_id: 'app-1',
                candidate_id: 'cand-1',
                job_id: 'job-1',
                job_title: 'Engineer',
                job_description: 'Build things',
                required_skills: ['TypeScript'],
            } as any)
        ).rejects.toThrow();
    });
});
