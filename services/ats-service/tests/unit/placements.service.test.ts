import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlacementServiceV2 } from '../../src/v2/placements/service';
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

describe('PlacementServiceV2 (unit)', () => {
    let repository: any;
    let service: PlacementServiceV2;
    const supabase = {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null }),
            update: vi.fn().mockReturnThis(),
        })),
    } as any;
    const eventPublisher = { publish: vi.fn() };
    const companySourcerRepo = {
        getByCompanyId: vi.fn().mockResolvedValue(null),
        isSourcerActive: vi.fn().mockResolvedValue(false),
    };
    const candidateSourcerRepo = {
        getByCandidateId: vi.fn().mockResolvedValue(null),
        isSourcerActive: vi.fn().mockResolvedValue(false),
    };

    beforeEach(() => {
        vi.restoreAllMocks();
        repository = {
            findPlacements: vi.fn().mockResolvedValue({ data: [], total: 0 }),
            findPlacement: vi.fn(),
            createPlacement: vi.fn(),
            updatePlacement: vi.fn(),
            deletePlacement: vi.fn(),
        };
        service = new PlacementServiceV2(
            supabase,
            repository,
            companySourcerRepo as any,
            candidateSourcerRepo as any,
            eventPublisher as any
        );
    });

    it('validates required fields on create', async () => {
        mockAccessContext();
        await expect(service.createPlacement({} as any, 'clerk-1')).rejects.toThrow('Job ID is required');
        await expect(service.createPlacement({ job_id: 'job-1' } as any, 'clerk-1')).rejects.toThrow(
            'Candidate ID is required'
        );
    });

    it('rejects fee percentage outside bounds', async () => {
        mockAccessContext();
        await expect(
            service.createPlacement(
                { job_id: 'job-1', candidate_id: 'cand-1', application_id: 'app-1', start_date: '2025-01-01', salary: 100, fee_percentage: 120 },
                'clerk-1'
            )
        ).rejects.toThrow('Fee percentage must be between 0 and 100');
    });

    it('rejects invalid status transition on update', async () => {
        mockAccessContext();
        repository.findPlacement.mockResolvedValue({ id: 'pl-1', status: 'pending' });

        await expect(
            service.updatePlacement('pl-1', { status: 'completed' } as any, 'clerk-1', 'hiring_manager')
        ).rejects.toThrow('Invalid status transition: pending -> completed');
    });
});
