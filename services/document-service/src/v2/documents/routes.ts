import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import multipart from '@fastify/multipart';
import { DocumentServiceV2 } from './service';
import { requireUserContext, validatePaginationParams } from '../shared/helpers';
import { DocumentRepositoryV2 } from './repository';
import { DocumentUpdate } from './types';
import { StorageClient } from '../../storage';
import { EventPublisher } from '../shared/events';

interface RegisterDocumentRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    storage: StorageClient;
    eventPublisher?: EventPublisher;
}

export async function registerDocumentRoutes(
    app: FastifyInstance,
    config: RegisterDocumentRoutesConfig
) {
    if (!app.hasContentTypeParser('multipart/form-data')) {
        await app.register(multipart as any, {
            limits: {
                fileSize: 10 * 1024 * 1024,
            },
        });
    }

    const repository = new DocumentRepositoryV2(config.supabaseUrl, config.supabaseKey);
    const service = new DocumentServiceV2(repository, config.storage, config.eventPublisher);

    app.get('/v2/documents', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);

            const result = await service.listDocuments(clerkUserId, {
                entity_type: query.entity_type,
                entity_id: query.entity_id,
                document_type: query.document_type,
                status: query.status,
                uploaded_by: query.uploaded_by,
                search: query.search,
                page: pagination.page,
                limit: pagination.limit,
            });

            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to list documents' },
            });
        }
    });

    app.get('/v2/documents/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const document = await service.getDocument(id, clerkUserId);
            return reply.send({ data: document });
        } catch (error: any) {
            return reply.code(404).send({
                error: { message: error.message || 'Document not found' },
            });
        }
    });

    app.post('/v2/documents', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);

            if (!(request as any).isMultipart || !(request as any).isMultipart()) {
                return reply.code(400).send({
                    error: { message: 'multipart/form-data is required' },
                });
            }

            let fileBuffer: Buffer | null = null;
            let fileName: string | undefined;
            const fields: Record<string, any> = {};

            for await (const part of (request as any).parts()) {
                if (part.type === 'file') {
                    fileBuffer = await part.toBuffer();
                    fileName = part.filename;
                } else if (part.type === 'field') {
                    fields[part.fieldname] = (part as any).value;
                }
            }

            if (!fileBuffer || !fileName) {
                return reply.code(400).send({
                    error: { message: 'File is required' },
                });
            }

            const { entity_type, entity_id, document_type, metadata } = fields;

            if (!entity_type || !entity_id || !document_type) {
                return reply.code(400).send({
                    error: { message: 'entity_type, entity_id, and document_type are required' },
                });
            }

            let parsedMetadata: Record<string, any> | undefined;
            if (metadata) {
                try {
                    parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
                } catch {
                    return reply.code(400).send({
                        error: { message: 'metadata must be valid JSON' },
                    });
                }
            }

            const document = await service.createDocument(clerkUserId, {
                file: fileBuffer,
                originalFileName: fileName,
                entity_type,
                entity_id,
                document_type,
                metadata: parsedMetadata,
            });

            return reply.code(201).send({ data: document });
        } catch (error: any) {
            request.log.error({ error: error.message, stack: error.stack }, 'Document upload failed');
            return reply.code(400).send({
                error: { message: error.message || 'Failed to upload document' },
            });
        }
    });

    app.patch('/v2/documents/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as DocumentUpdate;
            const document = await service.updateDocument(id, body, clerkUserId);
            return reply.send({ data: document });
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to update document' },
            });
        }
    });

    app.delete('/v2/documents/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await service.deleteDocument(id, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to delete document' },
            });
        }
    });
}
