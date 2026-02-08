import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { registerJobPreScreenAnswerRoutes } from '../../src/v2/job-pre-screen-answers/routes';

describe('Job pre-screen answers routes (integration)', () => {
    let service: any;

    beforeEach(() => {
        vi.restoreAllMocks();
        service = {
            listAnswers: vi.fn().mockResolvedValue([]),
            getAnswer: vi.fn().mockResolvedValue({ id: 'a-1' }),
            upsertAnswers: vi.fn().mockResolvedValue([{ id: 'a-1' }]),
            updateAnswer: vi.fn().mockResolvedValue({ id: 'a-1' }),
            deleteAnswer: vi.fn().mockResolvedValue(undefined),
        };
    });

    it('rejects list without user context', async () => {
        const app = Fastify();
        registerJobPreScreenAnswerRoutes(app, { service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/job-pre-screen-answers',
        });

        expect(response.statusCode).toBe(400);
    });

    it('upserts answers with auth', async () => {
        const app = Fastify();
        registerJobPreScreenAnswerRoutes(app, { service });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/job-pre-screen-answers',
            headers: { 'x-clerk-user-id': 'clerk-1' },
            payload: { answers: [{ application_id: 'app-1', question_id: 'q-1', answer: 'Yes' }] },
        });

        expect(response.statusCode).toBe(201);
        expect(JSON.parse(response.body).data[0].id).toBe('a-1');
    });
});
