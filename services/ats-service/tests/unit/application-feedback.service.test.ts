import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicationFeedbackServiceV2 } from '../../src/v2/application-feedback/service';
import { AccessContextResolver } from '@splits-network/shared-access-context';

function mockAccessContext(identityUserId = 'user-1') {
    vi.spyOn(AccessContextResolver.prototype, 'resolve').mockResolvedValue({
        identityUserId,
        candidateId: null,
        recruiterId: null,
        organizationIds: [],
        roles: [],
        isPlatformAdmin: false,
        error: '',
    });
}

describe('ApplicationFeedbackServiceV2 (unit)', () => {
    let repository: any;
    let service: ApplicationFeedbackServiceV2;
    const supabase = {} as any;
    const eventPublisher = { publish: vi.fn() };

    beforeEach(() => {
        vi.restoreAllMocks();
        repository = {
            list: vi.fn().mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 50, total_pages: 0 } }),
            getById: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({ id: 'fb-1', application_id: 'app-1', feedback_type: 'note', created_by_type: 'recruiter' }),
            update: vi.fn().mockResolvedValue({ id: 'fb-1', application_id: 'app-1' }),
            delete: vi.fn().mockResolvedValue(undefined),
        };
        service = new ApplicationFeedbackServiceV2(repository, supabase, eventPublisher as any);
    });

    it('rejects empty message text on create', async () => {
        mockAccessContext();
        await expect(
            service.create('clerk-1', { application_id: 'app-1', message_text: '  ' } as any)
        ).rejects.toThrow('Message text is required');
    });

    it('rejects empty message text on update', async () => {
        mockAccessContext();
        await expect(
            service.update('fb-1', 'clerk-1', { message_text: '' } as any)
        ).rejects.toThrow('Message text cannot be empty');
    });
});
