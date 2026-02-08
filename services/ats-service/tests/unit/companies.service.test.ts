import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompanyServiceV2 } from '../../src/v2/companies/service';
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

describe('CompanyServiceV2 (unit)', () => {
    let repository: any;
    let service: CompanyServiceV2;
    const supabase = {} as any;
    const eventPublisher = { publish: vi.fn() };

    beforeEach(() => {
        vi.restoreAllMocks();
        repository = {
            findCompanies: vi.fn().mockResolvedValue({ data: [], total: 0 }),
            findCompany: vi.fn(),
            createCompany: vi.fn(),
            updateCompany: vi.fn(),
            deleteCompany: vi.fn(),
        };
        service = new CompanyServiceV2(repository, supabase, eventPublisher as any);
    });

    it('validates required fields on create', async () => {
        mockAccessContext();
        await expect(service.createCompany({ identity_organization_id: 'org-1' } as any, 'clerk-1')).rejects.toThrow(
            'Company name is required'
        );
        await expect(service.createCompany({ name: 'Acme' } as any, 'clerk-1')).rejects.toThrow(
            'Organization ID is required'
        );
    });

    it('rejects empty company name on update', async () => {
        mockAccessContext();
        repository.findCompany.mockResolvedValue({ id: 'comp-1' });

        await expect(service.updateCompany('comp-1', { name: '  ' } as any, 'clerk-1')).rejects.toThrow(
            'Company name cannot be empty'
        );
    });
});
