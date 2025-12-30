/**
 * V2 Organization Service - Identity Service
 * Handles organization lifecycle and events
 */

import { Logger } from '@splits-network/shared-logging';
import { RepositoryV2 } from '../repository';
import { EventPublisherV2 } from '../shared/events';
import { OrganizationUpdate } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class OrganizationServiceV2 {
    constructor(
        private repository: RepositoryV2,
        private eventPublisher: EventPublisherV2,
        private logger: Logger
    ) {}

    /**
     * Find all organizations with pagination and filters
     */
    async findOrganizations(filters: any) {
        this.logger.info({ filters }, 'OrganizationService.findOrganizations');
        const result = await this.repository.findOrganizations(filters);
        return result;
    }

    /**
     * Find organization by ID
     */
    async findOrganizationById(id: string) {
        this.logger.info({ id }, 'OrganizationService.findOrganizationById');
        const org = await this.repository.findOrganizationById(id);
        if (!org) {
            throw new Error(`Organization not found: ${id}`);
        }
        return org;
    }

    /**
     * Create a new organization
     */
    async createOrganization(orgData: any) {
        this.logger.info({ name: orgData.name }, 'OrganizationService.createOrganization');

        if (!orgData.name) {
            throw new Error('Organization name is required');
        }

        if (!orgData.slug) {
            throw new Error('Organization slug is required');
        }

        const org = await this.repository.createOrganization({
            id: uuidv4(),
            name: orgData.name,
            slug: orgData.slug,
            description: orgData.description || null,
            logo_url: orgData.logo_url || null,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        await this.eventPublisher.publish('organization.created', {
            organization_id: org.id,
            name: org.name,
            slug: org.slug,
        });

        this.logger.info({ id: org.id }, 'OrganizationService.createOrganization - org created');
        return org;
    }

    /**
     * Update organization
     */
    async updateOrganization(id: string, updates: OrganizationUpdate) {
        this.logger.info({ id, updates }, 'OrganizationService.updateOrganization');

        await this.findOrganizationById(id);

        const updateData: any = {
            ...updates,
            updated_at: new Date().toISOString(),
        };

        const updated = await this.repository.updateOrganization(id, updateData);

        await this.eventPublisher.publish('organization.updated', {
            organization_id: id,
            changes: updateData,
        });

        this.logger.info({ id }, 'OrganizationService.updateOrganization - org updated');
        return updated;
    }

    /**
     * Delete organization (soft delete)
     */
    async deleteOrganization(id: string) {
        this.logger.info({ id }, 'OrganizationService.deleteOrganization');

        await this.findOrganizationById(id);
        await this.repository.deleteOrganization(id);

        await this.eventPublisher.publish('organization.deleted', {
            organization_id: id,
        });

        this.logger.info({ id }, 'OrganizationService.deleteOrganization - org deleted');
    }
}
