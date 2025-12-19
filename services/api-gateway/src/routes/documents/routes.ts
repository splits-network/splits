import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { AuthenticatedRequest } from '../../rbac';

/**
 * Documents Routes
 * - Document upload and management
 */
export function registerDocumentsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const documentService = () => services.get('document');
    const atsService = () => services.get('ats');
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

    // Get candidate's own documents
    app.get('/api/candidates/me/documents', {
        schema: {
            description: 'Get my candidate documents',
            tags: ['documents'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as any;
        const correlationId = getCorrelationId(request);
        const userEmail = req.auth?.email;

        if (!userEmail) {
            return reply.status(401).send({ error: 'Unauthorized' });
        }

        try {
            // Find candidate by email
            const candidatesResponse: any = await atsService().get(
                `/candidates?email=${encodeURIComponent(userEmail)}`,
                undefined,
                correlationId
            );
            const candidates = candidatesResponse.data || [];
            
            if (candidates.length === 0) {
                return reply.send({ data: [] });
            }

            const candidateId = candidates[0].id;

            // Get documents for this candidate
            const data = await documentService().get(
                `/documents/entity/candidate/${candidateId}`,
                undefined,
                correlationId
            );
            return reply.send(data);
        } catch (error: any) {
            request.log.error({ error, email: userEmail }, 'Failed to get candidate documents');
            return reply.status(500).send({ error: 'Failed to load documents' });
        }
    });

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

    // Delete document (candidates can delete their own, or roles with permission)
    app.delete('/api/documents/:id', {
        schema: {
            description: 'Delete document',
            tags: ['documents'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const req = request as any;
        const correlationId = getCorrelationId(request);

        // Check if user has permission
        const hasRole = req.auth?.memberships?.some((m: any) => 
            ['recruiter', 'company_admin', 'platform_admin'].includes(m.role)
        );

        if (!hasRole) {
            // Candidates can only delete their own documents
            const userEmail = req.auth?.email;
            if (!userEmail) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            try {
                // Get document details
                const docResponse: any = await documentService().get(`/documents/${id}`, undefined, correlationId);
                const document = docResponse.data;

                // Verify this is a candidate document
                if (document.entity_type !== 'candidate') {
                    return reply.status(403).send({ error: 'Permission denied' });
                }

                // Find candidate by email
                const candidatesResponse: any = await atsService().get(
                    `/candidates?email=${encodeURIComponent(userEmail)}`,
                    undefined,
                    correlationId
                );
                const candidates = candidatesResponse.data || [];
                
                if (candidates.length === 0 || candidates[0].id !== document.entity_id) {
                    return reply.status(403).send({ error: 'Permission denied' });
                }
            } catch (error: any) {
                request.log.error({ error, documentId: id }, 'Failed to verify document ownership');
                return reply.status(403).send({ error: 'Permission denied' });
            }
        }

        await documentService().delete(`/documents/${id}`, correlationId);
        return reply.status(204).send();
    });
}
