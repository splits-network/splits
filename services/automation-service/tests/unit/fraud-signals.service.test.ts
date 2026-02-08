import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FraudSignalServiceV2 } from '../../src/v2/fraud-signals/service';

describe('FraudSignalServiceV2 (unit)', () => {
    const repository = {
        findSignals: vi.fn(),
        findSignal: vi.fn(),
        createSignal: vi.fn(),
        updateSignal: vi.fn(),
        deleteSignal: vi.fn(),
    };
    const resolver = vi.fn();
    const publisher = { publish: vi.fn() };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('rejects non-admin access', async () => {
        resolver.mockResolvedValue({ isPlatformAdmin: false });
        const service = new FraudSignalServiceV2(repository as any, resolver, publisher as any);

        await expect(service.listSignals('clerk-1', { page: 1, limit: 10 }))
            .rejects.toThrow('Platform admin permissions required');
    });

    it('creates signal and publishes event', async () => {
        resolver.mockResolvedValue({ isPlatformAdmin: true });
        repository.createSignal.mockResolvedValue({ id: 'sig-1', entity_type: 'job', entity_id: 'job-1', severity: 'high' });
        const service = new FraudSignalServiceV2(repository as any, resolver, publisher as any);

        const result = await service.createSignal('clerk-1', {
            event_id: 'evt-1',
            event_type: 'job.created',
            entity_type: 'job',
            entity_id: 'job-1',
            signal_type: 'suspicious',
            severity: 'high',
            details: { reason: 'test' },
        } as any);

        expect(result.id).toBe('sig-1');
        expect(publisher.publish).toHaveBeenCalledWith(
            'automation.fraud.created',
            expect.objectContaining({ signal_id: 'sig-1' })
        );
    });
});
