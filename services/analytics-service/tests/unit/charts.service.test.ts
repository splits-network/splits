import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChartServiceV2 } from '../../src/v2/charts/service';

vi.mock('../../src/v2/shared/access', () => ({
    resolveAccessContext: vi.fn(),
}));

import { resolveAccessContext } from '../../src/v2/shared/access';

describe('ChartServiceV2 (unit)', () => {
    const repository = {
        getChartData: vi.fn(),
        getTimeRange: vi.fn(),
    };
    const supabase = {} as any;

    beforeEach(() => {
        vi.resetAllMocks();
        repository.getChartData.mockResolvedValue([
            { metric_type: 'applications_submitted', time_value: new Date().toISOString(), value: 5 },
        ]);
        repository.getTimeRange.mockReturnValue({
            start: new Date('2025-01-01'),
            end: new Date('2025-02-01'),
        });
        (resolveAccessContext as any).mockResolvedValue({
            role: 'platform',
            userId: 'user-1',
            isRecruiter: false,
        });
    });

    it('passes chart params to repository', async () => {
        (resolveAccessContext as any).mockResolvedValue({
            role: 'recruiter',
            userId: 'rec-1',
            isRecruiter: true,
        });
        const service = new ChartServiceV2(repository as any, supabase);

        await service.getChartData('clerk-1', 'recruiter-activity' as any, { months: 3 });

        expect(repository.getChartData).toHaveBeenCalledWith(
            'recruiter-activity',
            expect.objectContaining({ months: 3 })
        );
    });

    it('returns chart response with time range', async () => {
        (resolveAccessContext as any).mockResolvedValue({
            role: 'platform',
            userId: 'user-1',
            isRecruiter: false,
        });
        const service = new ChartServiceV2(repository as any, supabase);

        const result = await service.getChartData('clerk-1', 'recruiter-activity' as any, { months: 3 });

        expect(result.time_range).toEqual({
            start: '2025-01-01',
            end: '2025-02-01',
        });
        expect(result.data.labels.length).toBe(3);
    });
});
