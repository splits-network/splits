import { buildPaginationResponse } from '../shared/helpers';
import { IEventPublisher } from '../shared/events';
import { NotificationTemplateRepository } from './repository';
import { EmailTemplate, TemplateCreateInput, TemplateFilters, TemplateUpdate } from './types';
import type { AccessContext } from '../shared/access';

export class TemplateServiceV2 {
    constructor(
        private repository: NotificationTemplateRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: IEventPublisher
    ) {}

    private async requirePlatformAdmin(clerkUserId: string): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.isPlatformAdmin) {
            throw new Error('Platform admin permissions required');
        }
        return access;
    }

    async listTemplates(clerkUserId: string, filters: TemplateFilters) {
        await this.requirePlatformAdmin(clerkUserId);
        const result = await this.repository.findTemplates(filters);
        return {
            data: result.data,
            pagination: buildPaginationResponse(
                filters.page ?? 1,
                filters.limit ?? 25,
                result.total
            ),
        };
    }

    async getTemplate(clerkUserId: string, id: string): Promise<EmailTemplate> {
        await this.requirePlatformAdmin(clerkUserId);
        const template = await this.repository.findTemplate(id);
        if (!template) {
            throw new Error('Template not found');
        }
        return template;
    }

    async createTemplate(clerkUserId: string, input: TemplateCreateInput) {
        await this.requirePlatformAdmin(clerkUserId);
        const template = await this.repository.createTemplate(input);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('notification_templates.created', {
                template_id: template.id,
                event_type: template.event_type,
            });
        }

        return template;
    }

    async updateTemplate(clerkUserId: string, id: string, updates: TemplateUpdate) {
        await this.requirePlatformAdmin(clerkUserId);
        await this.getTemplate(clerkUserId, id);
        const template = await this.repository.updateTemplate(id, updates);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('notification_templates.updated', {
                template_id: id,
                updates,
            });
        }

        return template;
    }

    async archiveTemplate(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        await this.getTemplate(clerkUserId, id);
        await this.repository.archiveTemplate(id);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('notification_templates.archived', {
                template_id: id,
            });
        }
    }
}
