import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { TemplateServiceV2 } from './service';
import { NotificationTemplateRepository } from './repository';
import { TemplateCreateInput, TemplateUpdate } from './types';
import { requireUserContext, validatePaginationParams } from '../shared/helpers';
import { EventPublisher } from '../shared/events';
import { resolveAccessContext } from '../shared/access';

interface RegisterTemplateRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

export async function registerTemplateRoutes(
    app: FastifyInstance,
    config: RegisterTemplateRoutesConfig
) {
    const templateRepository = new NotificationTemplateRepository(
        config.supabaseUrl,
        config.supabaseKey
    );
    const accessClient = createClient(config.supabaseUrl, config.supabaseKey);
    const accessResolver = (clerkUserId: string) => resolveAccessContext(accessClient, clerkUserId);
    const templateService = new TemplateServiceV2(
        templateRepository,
        accessResolver,
        config.eventPublisher
    );

    app.get('/api/v2/templates', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);
            const result = await templateService.listTemplates(clerkUserId, {
                event_type: query.event_type,
                status: query.status,
                search: query.search,
                page: pagination.page,
                limit: pagination.limit,
            });
            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to fetch templates' },
            });
        }
    });

    app.get('/api/v2/templates/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const template = await templateService.getTemplate(clerkUserId, id);
            return reply.send({ data: template });
        } catch (error: any) {
            return reply.code(404).send({
                error: { message: error.message || 'Template not found' },
            });
        }
    });

    app.post('/api/v2/templates', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as TemplateCreateInput;

            if (!body?.event_type || !body.subject || !body.template_html) {
                return reply.code(400).send({
                    error: { message: 'event_type, subject, and template_html are required' },
                });
            }

            const template = await templateService.createTemplate(clerkUserId, body);
            return reply.code(201).send({ data: template });
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to create template' },
            });
        }
    });

    app.patch('/api/v2/templates/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as TemplateUpdate;
            const template = await templateService.updateTemplate(clerkUserId, id, updates);
            return reply.send({ data: template });
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to update template' },
            });
        }
    });

    app.delete('/api/v2/templates/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await templateService.archiveTemplate(clerkUserId, id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to archive template' },
            });
        }
    });
}
