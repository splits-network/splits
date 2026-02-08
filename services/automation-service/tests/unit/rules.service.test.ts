import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AutomationRuleServiceV2 } from '../../src/v2/rules/service';

describe('AutomationRuleServiceV2 (unit)', () => {
    const repository = {
        findRules: vi.fn(),
        findRule: vi.fn(),
        createRule: vi.fn(),
        updateRule: vi.fn(),
        deleteRule: vi.fn(),
    };
    const resolver = vi.fn();
    const publisher = { publish: vi.fn() };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('rejects non-admin access', async () => {
        resolver.mockResolvedValue({ isPlatformAdmin: false });
        const service = new AutomationRuleServiceV2(repository as any, resolver, publisher as any);

        await expect(service.listRules('clerk-1', { page: 1, limit: 10 }))
            .rejects.toThrow('Platform admin permissions required');
    });

    it('creates rule and publishes event', async () => {
        resolver.mockResolvedValue({ isPlatformAdmin: true });
        repository.createRule.mockResolvedValue({ id: 'rule-1', trigger_type: 'event' });
        const service = new AutomationRuleServiceV2(repository as any, resolver, publisher as any);

        const result = await service.createRule('clerk-1', {
            name: 'Rule',
            trigger_type: 'event',
            condition: { foo: 'bar' },
            action: { type: 'notify' },
        } as any);

        expect(result.id).toBe('rule-1');
        expect(publisher.publish).toHaveBeenCalledWith(
            'automation.rules.created',
            expect.objectContaining({ rule_id: 'rule-1' })
        );
    });
});
