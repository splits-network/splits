import { CandidateSourcerRepository } from './repository';
import { EventPublisher } from '../shared/events';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';
import { CandidateSourcer, CandidateSourcerCreate, CandidateSourcerFilters, CandidateSourcerUpdate } from './types';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';

export class CandidateSourcerServiceV2 {
    constructor(
        private repository: CandidateSourcerRepository,
        private eventPublisher: EventPublisher,
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

    async create(clerkUserId: string, data: CandidateSourcerCreate): Promise<CandidateSourcer> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Validate inputs
        if (!data.candidate_id || !data.sourcer_recruiter_id) {
            throw new Error('candidate_id and sourcer_recruiter_id are required');
        }

        // Check if sourcer already exists
        const existing = await this.repository.findByCandidate(data.candidate_id);
        if (existing) {
            throw new Error('This candidate already has a sourcer assigned');
        }

        // Only recruiters and admins can create sourcer records
        const isRecruiter = context.roles.includes('recruiter');
        const isAdmin = context.isPlatformAdmin;
        if (!isRecruiter && !isAdmin) {
            throw new Error('Only recruiters and administrators can assign sourcer credit');
        }

        // Recruiters can only assign themselves
        if (isRecruiter && data.sourcer_recruiter_id !== context.recruiterId) {
            throw new Error('Recruiters can only assign sourcer credit to themselves');
        }

        // Create sourcer record
        const sourcer = await this.repository.create(data);

        // Publish event
        await this.eventPublisher.publish('candidate.sourced', {
            candidate_id: sourcer.candidate_id,
            sourcer_recruiter_id: sourcer.sourcer_recruiter_id,
            sourcer_type: sourcer.sourcer_type,
            sourced_at: sourcer.sourced_at,
            protection_expires_at: sourcer.protection_expires_at,
            created_by: context.identityUserId,
        });

        return sourcer;
    }

    async update(id: string, clerkUserId: string, updates: CandidateSourcerUpdate): Promise<CandidateSourcer> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Validate that sourcer exists and user has access
        const existing = await this.repository.findById(id, clerkUserId);
        if (!existing) {
            throw new Error('Candidate sourcer not found or access denied');
        }

        // Only allow updating notes and protection window
        const allowedUpdates: CandidateSourcerUpdate = {
            notes: updates.notes,
            protection_window_days: updates.protection_window_days,
            protection_expires_at: updates.protection_expires_at,
        };

        const updated = await this.repository.update(id, clerkUserId, allowedUpdates);

        // Publish event
        await this.eventPublisher.publish('candidate.sourcer_updated', {
            sourcer_id: id,
            candidate_id: updated.candidate_id,
            changes: Object.keys(allowedUpdates).filter(k => updates[k as keyof CandidateSourcerUpdate] !== undefined),
            updated_by: context.identityUserId,
        });

        return updated;
    }

    async delete(id: string, clerkUserId: string): Promise<void> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Get sourcer before deleting for event
        const sourcer = await this.repository.findById(id, clerkUserId);
        if (!sourcer) {
            throw new Error('Candidate sourcer not found');
        }

        await this.repository.delete(id, clerkUserId);

        // Publish event
        await this.eventPublisher.publish('candidate.sourcer_removed', {
            sourcer_id: id,
            candidate_id: sourcer.candidate_id,
            sourcer_recruiter_id: sourcer.sourcer_recruiter_id,
            deleted_by: context.identityUserId,
        });
    }

    async checkProtection(candidate_id: string): Promise<{
        has_protection: boolean;
        sourcer_recruiter_id?: string;
        protection_expires_at?: Date;
    }> {
        return this.repository.checkProtectionStatus(candidate_id);
    }
}
