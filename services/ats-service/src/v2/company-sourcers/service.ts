import { CompanySourcerRepository } from './repository.js';
import { IEventPublisher } from '../shared/events.js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCompany, CompanySourcerFilters, CompanySourcerUpdate } from './types.js';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';

/**
 * Company Sourcers V2 Service
 *
 * Sourcer attribution is immutable — set once at onboarding via referral link/code.
 * Only read operations and notes updates are permitted.
 */
export class CompanySourcerServiceV2 {
    constructor(
        private repository: CompanySourcerRepository,
        private eventPublisher: IEventPublisher,
        private supabase: SupabaseClient
    ) { }

    async list(
        clerkUserId: string,
        params: StandardListParams & CompanySourcerFilters
    ): Promise<StandardListResponse<RecruiterCompany>> {
        return this.repository.list(clerkUserId, params);
    }

    async get(id: string, clerkUserId: string): Promise<RecruiterCompany> {
        const sourcer = await this.repository.findById(id, clerkUserId);
        if (!sourcer) {
            throw new Error('Company sourcer not found');
        }
        return sourcer;
    }

    /** Update notes only — sourcer attribution is immutable. */
    async update(id: string, clerkUserId: string, updates: CompanySourcerUpdate): Promise<RecruiterCompany> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        const existing = await this.repository.findById(id, clerkUserId);
        if (!existing) {
            throw new Error('Company sourcer not found or access denied');
        }

        // Only notes can be updated — attribution is immutable
        const allowedUpdates: CompanySourcerUpdate = {
            notes: (updates as any).notes,
        };

        const updated = await this.repository.update(id, clerkUserId, allowedUpdates);

        await this.eventPublisher.publish('company.sourcer_updated', {
            sourcer_id: id,
            company_id: updated.company_id,
            changes: ['notes'],
            updated_by: context.identityUserId,
        });

        return updated;
    }

    async checkProtection(company_id: string): Promise<{
        has_protection: boolean;
        sourcer_recruiter_id?: string;
        sourced_at?: Date;
    }> {
        return this.repository.checkProtectionStatus(company_id);
    }
}
