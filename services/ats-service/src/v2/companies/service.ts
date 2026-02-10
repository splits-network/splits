/**
 * Companies Service - V2
 * Handles ALL company updates with smart validation
 */

import { CompanyRepository } from './repository';
import { CompanyFilters, CompanyUpdate } from './types';
import { EventPublisher } from '../shared/events';
import { PaginationResponse, buildPaginationResponse, validatePaginationParams } from '../shared/pagination';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';
import { BillingProfileRepository } from './billing-profile-repository';

export class CompanyServiceV2 {
    private accessResolver: AccessContextResolver;
    private billingProfileRepository: BillingProfileRepository;

    constructor(
        private repository: CompanyRepository,
        supabase: SupabaseClient,
        private eventPublisher?: EventPublisher
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
        this.billingProfileRepository = new BillingProfileRepository(supabase);
    }

    async getCompanies(
        clerkUserId: string,
        filters: CompanyFilters
    ): Promise<{
        data: any[];
        pagination: PaginationResponse<any>['pagination'];
    }> {
        const { page, limit } = validatePaginationParams(filters.page, filters.limit);

        const { data, total } = await this.repository.findCompanies(clerkUserId, {
            ...filters,
            page,
            limit,
        });

        return {
            data,
            pagination: buildPaginationResponse<any>(data, total, page, limit).pagination,
        };
    }

    async getCompany(id: string): Promise<any> {
        const company = await this.repository.findCompany(id);
        if (!company) {
            throw new Error(`Company ${id} not found`);
        }
        return company;
    }

    async createCompany(data: any, clerkUserId?: string): Promise<any> {
        // Validation
        if (!data.name) {
            throw new Error('Company name is required');
        }
        if (!data.identity_organization_id) {
            throw new Error('Organization ID is required');
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);
        const company = await this.repository.createCompany({
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        if (data.billing_terms && data.billing_email) {
            await this.billingProfileRepository.upsert({
                company_id: company.id,
                billing_terms: data.billing_terms,
                billing_email: data.billing_email,
                invoice_delivery_method: 'email',
            });
        }

        // Emit event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('company.created', {
                companyId: company.id,
                organizationId: company.identity_organization_id,
                createdBy: userContext.identityUserId,
            });
        }

        return company;
    }

    async updateCompany(
        id: string,
        updates: CompanyUpdate,
        clerkUserId?: string
    ): Promise<any> {
        const currentCompany = await this.repository.findCompany(id);
        if (!currentCompany) {
            throw new Error(`Company ${id} not found`);
        }

        // Validation
        if (updates.name !== undefined && !updates.name.trim()) {
            throw new Error('Company name cannot be empty');
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);
        const updatedCompany = await this.repository.updateCompany(id, updates);

        // Emit event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('company.updated', {
                companyId: id,
                updatedFields: Object.keys(updates),
                updatedBy: userContext.identityUserId,
            });
        }

        return updatedCompany;
    }

    async getCompanyContacts(companyId: string, clerkUserId: string): Promise<any[]> {
        const company = await this.repository.findCompany(companyId);
        if (!company) {
            throw new Error(`Company ${companyId} not found`);
        }

        return this.repository.findCompanyContacts(companyId);
    }

    async deleteCompany(id: string, clerkUserId?: string): Promise<void> {
        const company = await this.repository.findCompany(id);
        if (!company) {
            throw new Error(`Company ${id} not found`);
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);
        await this.repository.deleteCompany(id);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('company.deleted', {
                companyId: id,
                deletedBy: userContext.identityUserId,
            });
        }
    }
}
