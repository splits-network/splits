import { CandidateSourcerRepository } from './repository.js';
import { IEventPublisher } from '../shared/events.js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';
import { CandidateSourcer, CandidateSourcerFilters, CandidateSourcerUpdate } from './types.js';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';

/**
 * Candidate Sourcers V2 Service
 *
 * Sourcer attribution is immutable — set once at signup via referral link/code.
 * Only read operations and notes updates are permitted.
 */
export class CandidateSourcerServiceV2 {
    constructor(
        private repository: CandidateSourcerRepository,
        private eventPublisher: IEventPublisher,
        private supabase: SupabaseClient
    ) { }

    async list(
        clerkUserId: string,
        params: StandardListParams & CandidateSourcerFilters
    ): Promise<StandardListResponse<CandidateSourcer>> {
        return this.repository.list(clerkUserId, params);
    }

    async get(id: string, clerkUserId: string): Promise<CandidateSourcer> {
        const sourcer = await this.repository.findById(id, clerkUserId);
        if (!sourcer) {
            throw new Error('Candidate sourcer not found');
        }
        return sourcer;
    }

    /** Update notes only — sourcer attribution is immutable. */
    async update(id: string, clerkUserId: string, updates: CandidateSourcerUpdate): Promise<CandidateSourcer> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        const existing = await this.repository.findById(id, clerkUserId);
        if (!existing) {
            throw new Error('Candidate sourcer not found or access denied');
        }

        // Only notes can be updated — attribution and protection window are immutable
        const allowedUpdates: CandidateSourcerUpdate = {
            notes: updates.notes,
        };

        const updated = await this.repository.update(id, clerkUserId, allowedUpdates);

        await this.eventPublisher.publish('candidate.sourcer_updated', {
            sourcer_id: id,
            candidate_id: updated.candidate_id,
            changes: ['notes'],
            updated_by: context.identityUserId,
        });

        return updated;
    }

    async checkProtection(candidate_id: string): Promise<{
        has_protection: boolean;
        sourcer_recruiter_id?: string;
        protection_expires_at?: Date;
    }> {
        return this.repository.checkProtectionStatus(candidate_id);
    }
}
