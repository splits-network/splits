import { CompanySourcerRepository } from './repository';
import { IEventPublisher } from '../shared/events';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCompany, CompanySourcerCreate, CompanySourcerFilters, CompanySourcerUpdate } from './types';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';

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

    async create(clerkUserId: string, data: CompanySourcerCreate): Promise<RecruiterCompany> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Validate inputs
        if (!data.company_id || !data.recruiter_id) {
            throw new Error('company_id and recruiter_id are required');
        }

        // Check if sourcer already exists
        const existing = await this.repository.findByCompany(data.company_id);
        if (existing) {
            throw new Error('This company already has a sourcer assigned');
        }

        // Only recruiters and admins can create sourcer records
        const isRecruiter = context.roles.includes('recruiter');
        const isAdmin = context.isPlatformAdmin;
        if (!isRecruiter && !isAdmin) {
            throw new Error('Only recruiters and administrators can assign sourcer credit');
        }

        // Recruiters can only assign themselves
        if (isRecruiter && data.recruiter_id !== context.recruiterId) {
            throw new Error('Recruiters can only assign sourcer credit to themselves');
        }

        // Create sourcer record
        const sourcer = await this.repository.create(data);

        // Publish event
        await this.eventPublisher.publish('company.sourced', {
            company_id: sourcer.company_id,
            sourcer_recruiter_id: sourcer.recruiter_id,
            sourced_at: sourcer.relationship_start_date,
            created_by: context.identityUserId,
        });

        return sourcer;
    }

    async update(id: string, clerkUserId: string, updates: CompanySourcerUpdate): Promise<RecruiterCompany> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Validate that sourcer exists and user has access
        const existing = await this.repository.findById(id, clerkUserId);
        if (!existing) {
            throw new Error('Company sourcer not found or access denied');
        }

        // Simple model - only sourced_at can be updated (if needed)
        const updated = await this.repository.update(id, clerkUserId, updates);

        // Publish event
        await this.eventPublisher.publish('company.sourcer_updated', {
            sourcer_id: id,
            company_id: updated.company_id,
            changes: Object.keys(updates).filter(k => updates[k as keyof CompanySourcerUpdate] !== undefined),
            updated_by: context.identityUserId,
        });

        return updated;
    }

    async delete(id: string, clerkUserId: string): Promise<void> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Get sourcer before deleting for event
        const sourcer = await this.repository.findById(id, clerkUserId);
        if (!sourcer) {
            throw new Error('Company sourcer not found');
        }

        await this.repository.delete(id, clerkUserId);

        // Publish event
        await this.eventPublisher.publish('company.sourcer_removed', {
            sourcer_id: id,
            company_id: sourcer.company_id,
            sourcer_recruiter_id: sourcer.recruiter_id,
            deleted_by: context.identityUserId,
        });
    }

    async checkProtection(company_id: string): Promise<{
        has_protection: boolean;
        sourcer_recruiter_id?: string;
        sourced_at?: Date;
    }> {
        return this.repository.checkProtectionStatus(company_id);
    }
}
