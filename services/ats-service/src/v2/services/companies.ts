/**
 * Companies Service - V2
 * Handles ALL company updates with smart validation
 */

import { RepositoryV2 } from '../repository';
import { EventPublisher } from '../shared/events';
import { CompanyFilters, CompanyUpdate, PaginationResponse } from '../types';
import { buildPaginationResponse, validatePaginationParams } from '../helpers';

export class CompanyServiceV2 {
    constructor(
        private repository: RepositoryV2,
        private eventPublisher?: EventPublisher
    ) {}

    async getCompanies(
        clerkUserId: string,
        filters: CompanyFilters
    ): Promise<{
        data: any[];
        pagination: PaginationResponse;
    }> {
        const { page, limit } = validatePaginationParams(filters.page, filters.limit);

        const { data, total } = await this.repository.findCompanies(clerkUserId, {
            ...filters,
            page,
            limit,
        });

        return {
            data,
            pagination: buildPaginationResponse(total, page, limit),
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

        const company = await this.repository.createCompany({
            ...data,
            status: data.status || 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Emit event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('company.created', {
                companyId: company.id,
                organizationId: company.identity_organization_id,
                createdBy: clerkUserId,
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

        const updatedCompany = await this.repository.updateCompany(id, updates);

        // Emit event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('company.updated', {
                companyId: id,
                updatedFields: Object.keys(updates),
                updatedBy: clerkUserId,
            });
        }

        return updatedCompany;
    }

    async deleteCompany(id: string, clerkUserId?: string): Promise<void> {
        const company = await this.repository.findCompany(id);
        if (!company) {
            throw new Error(`Company ${id} not found`);
        }

        await this.repository.deleteCompany(id);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('company.deleted', {
                companyId: id,
                deletedBy: clerkUserId,
            });
        }
    }
}
