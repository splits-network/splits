import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceClient } from '../../src/clients';

const logger = {
    debug: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
};

describe('ServiceClient (unit)', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('sends JSON body with content-type when data provided', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            headers: { get: () => 'application/json' },
            text: async () => JSON.stringify({ ok: true }),
        });
        (global as any).fetch = fetchMock;

        const client = new ServiceClient('test', 'http://service', logger as any);
        await client.post('/api/v2/test', { hello: 'world' }, 'corr', { 'x-auth': '1' });

        const options = fetchMock.mock.calls[0][1];
        expect(options.method).toBe('POST');
        expect(options.headers['Content-Type']).toBe('application/json');
        expect(options.headers['x-auth']).toBe('1');
    });

    it('returns empty object for 204 response', async () => {
        (global as any).fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 204,
            headers: { get: () => null },
            text: async () => '',
        });

        const client = new ServiceClient('test', 'http://service', logger as any);
        const result = await client.get('/api/v2/empty');
        expect(result).toEqual({});
    });
});
