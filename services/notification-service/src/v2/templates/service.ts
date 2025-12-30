import { buildPaginationResponse } from '../shared/helpers';
import { EventPublisher } from '../shared/events';
import { NotificationTemplateRepository } from './repository';
import { EmailTemplate, TemplateCreateInput, TemplateFilters, TemplateUpdate } from './types';

export class TemplateServiceV2 {
    constructor(
        private repository: NotificationTemplateRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async listTemplates(filters: TemplateFilters) {
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

    async getTemplate(id: string): Promise<EmailTemplate> {
        const template = await this.repository.findTemplate(id);
        if (!template) {
            throw new Error('Template not found');
        }
        return template;
    }

    async createTemplate(input: TemplateCreateInput) {
        const template = await this.repository.createTemplate(input);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('notification_templates.created', {
                template_id: template.id,
                event_type: template.event_type,
            });
        }

        return template;
    }

    async updateTemplate(id: string, updates: TemplateUpdate) {
        await this.getTemplate(id);
        const template = await this.repository.updateTemplate(id, updates);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('notification_templates.updated', {
                template_id: id,
                updates,
            });
        }

        return template;
    }

    async archiveTemplate(id: string) {
        await this.getTemplate(id);
        await this.repository.archiveTemplate(id);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('notification_templates.archived', {
                template_id: id,
            });
        }
    }
}
