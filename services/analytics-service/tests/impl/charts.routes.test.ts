import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { registerChartRoutes } from '../../src/v2/charts/routes';

describe('Chart routes (integration)', () => {
    const chartService = {
        getChartData: vi.fn(),
    };

    it('rejects without user context', async () => {
        const app = Fastify();
        await registerChartRoutes(app, { chartService: chartService as any });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/charts/recruiter-activity',
        });

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body).error.message).toContain('User context required for analytics access');
    });

    it('returns chart data', async () => {
        chartService.getChartData.mockResolvedValue({ chart_type: 'recruiter-activity', data: { labels: [], datasets: [] }, time_range: { start: '2025-01-01', end: '2025-02-01' } });
        const app = Fastify();
        await registerChartRoutes(app, { chartService: chartService as any });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/charts/recruiter-activity?months=6',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(chartService.getChartData).toHaveBeenCalledWith(
            'clerk-1',
            'recruiter-activity',
            expect.objectContaining({ months: 6 })
        );
    });
});
