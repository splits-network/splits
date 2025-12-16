import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles } from '../../rbac';

/**
 * Documents Routes
 * - Document upload and management
 */
export function registerDocumentsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const documentService = () => services.get('document');

    // Upload document
    app.post('/api/documents/upload', {
        schema: {
            description: 'Upload document',
            tags: ['documents'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        // Note: Multipart handling will be done by document-service
        // Gateway just proxies the request
        const data = await documentService().post('/documents/upload', request.body);
        return reply.send(data);
    });

    // Get document by ID
    app.get('/api/documents/:id', {
        schema: {
            description: 'Get document by ID',
            tags: ['documents'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const data = await documentService().get(`/documents/${id}`);
        return reply.send(data);
    });

    // List documents with filters
    app.get('/api/documents', {
        schema: {
            description: 'List documents',
            tags: ['documents'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = queryString ? `/documents?${queryString}` : '/documents';
        const data = await documentService().get(path);
        return reply.send(data);
    });

    // Get documents by entity
    app.get('/api/documents/entity/:entityType/:entityId', {
        schema: {
            description: 'Get documents by entity',
            tags: ['documents'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { entityType, entityId } = request.params as { entityType: string; entityId: string };
        const data = await documentService().get(`/documents/entity/${entityType}/${entityId}`);
        return reply.send(data);
    });

    // Delete document
    app.delete('/api/documents/:id', {
        preHandler: requireRoles(['recruiter', 'company_admin', 'platform_admin']),
        schema: {
            description: 'Delete document',
            tags: ['documents'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        await documentService().delete(`/documents/${id}`);
        return reply.status(204).send();
    });
}
