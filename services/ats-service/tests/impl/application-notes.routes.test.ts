import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { registerApplicationNoteRoutes } from '../../src/v2/application-notes/routes.js';

describe('Application notes routes (integration)', () => {
    let service: any;

    beforeEach(() => {
        vi.restoreAllMocks();
        service = {
            list: vi.fn().mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 50, total_pages: 0 } }),
            getById: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({ id: 'fb-1' }),
            update: vi.fn().mockResolvedValue({ id: 'fb-1' }),
            delete: vi.fn().mockResolvedValue(undefined),
        };
    });

    it('returns 404 when note not found', async () => {
        const app = Fastify();
        await registerApplicationNoteRoutes(app, service);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/application-notes/fb-1',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(404);
    });

    it('validates input on create', async () => {
        const app = Fastify();
        await registerApplicationNoteRoutes(app, service);
        service.create.mockRejectedValue(new Error('Message text is required'));

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/applications/app-1/notes',
            headers: { 'x-clerk-user-id': 'clerk-1' },
            payload: { message_text: '' },
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.code).toBe('INVALID_INPUT');
    });
});
