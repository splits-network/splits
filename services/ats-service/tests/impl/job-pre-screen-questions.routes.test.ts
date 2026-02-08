import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { registerJobPreScreenQuestionRoutes } from '../../src/v2/job-pre-screen-questions/routes';

describe('Job pre-screen questions routes (integration)', () => {
    let service: any;

    beforeEach(() => {
        vi.restoreAllMocks();
        service = {
            listQuestions: vi.fn().mockResolvedValue([]),
            getQuestion: vi.fn().mockResolvedValue({ id: 'q-1' }),
            createQuestion: vi.fn().mockResolvedValue({ id: 'q-1' }),
            updateQuestion: vi.fn().mockResolvedValue({ id: 'q-1' }),
            deleteQuestion: vi.fn().mockResolvedValue(undefined),
        };
    });

    it('rejects list without user context', async () => {
        const app = Fastify();
        registerJobPreScreenQuestionRoutes(app, { service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/job-pre-screen-questions',
        });

        expect(response.statusCode).toBe(400);
    });

    it('creates question with auth', async () => {
        const app = Fastify();
        registerJobPreScreenQuestionRoutes(app, { service });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/job-pre-screen-questions',
            headers: { 'x-clerk-user-id': 'clerk-1' },
            payload: { job_id: 'job-1', question_text: 'Why?' },
        });

        expect(response.statusCode).toBe(201);
        expect(JSON.parse(response.body).data.id).toBe('q-1');
    });
});
