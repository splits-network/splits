import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { AuthenticatedRequest } from '../../rbac';
import { buildAuthHeaders } from '../../helpers/auth-headers';

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
        const clerkUserId = req.auth?.clerkUserId;

        if (!clerkUserId) {
            return reply.status(401).send({ error: 'Unauthorized' });
        }

        try {
            // Get candidate profile using Clerk user ID
            let candidateResponse: any;
            try {
                candidateResponse = await atsService().get(
                    '/candidates/me',
                    undefined,
                    correlationId,
                    {
                        'x-clerk-user-id': clerkUserId,
                    }
                );
            } catch (error: any) {
                // If candidate profile doesn't exist (404), return empty documents list
                if (error.message?.includes('404')) {
                    return reply.send({ data: [] });
                }
                throw error;
            }
            
            if (!candidateResponse.data) {
                return reply.send({ data: [] });
            }

            const candidateId = candidateResponse.data.id;

            // Get documents for this candidate
            const response = await documentService().get<{ data: any[] }>(
                `/documents/entity/candidate/${candidateId}`,
                undefined,
                correlationId
            );
            
            // Document service now returns { data: [...] } per API response format standard
            const documents = response.data || [];
            return reply.send({ data: documents });
        } catch (error: any) {
            request.log.error({ error, clerkUserId }, 'Failed to get candidate documents');
            return reply.status(500).send({ error: 'Failed to load documents' });
        }
    });

    // Upload document
    app.post('/api/documents/upload', {
        schema: {
            description: 'Upload document',
            tags: ['documents'],
            security: [{ clerkAuth: [] }],
            consumes: ['multipart/form-data'],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        
        try {
            // Parse multipart form data - iterate once through all parts
            let fileBuffer: Buffer | null = null;
            let filename: string | null = null;
            let mimetype: string | null = null;
            const fields: Record<string, any> = {};
            
            for await (const part of request.parts()) {
                if (part.type === 'file') {
                    // Read file into buffer
                    request.log.info({ filename: part.filename, mimetype: part.mimetype }, 'File part found');
                    fileBuffer = await part.toBuffer();
                    filename = part.filename;
                    mimetype = part.mimetype;
                } else {
                    // Store field value
                    request.log.info({ fieldname: part.fieldname, value: (part as any).value }, 'Field part found');
                    fields[part.fieldname] = (part as any).value;
                }
            }
            
            request.log.info({ hasFile: !!fileBuffer, fileSize: fileBuffer?.length, fields }, 'Parsed multipart data');
            
            if (!fileBuffer || !filename) {
                return reply.status(400).send({ error: 'No file uploaded' });
            }

            // Create FormData to send to document service
            const FormData = (await import('form-data')).default;
            const formData = new FormData();
            
            // Add file as buffer
            formData.append('file', fileBuffer, {
                filename: filename,
                contentType: mimetype || 'application/octet-stream',
            });

            // Add other fields to form data
            Object.entries(fields).forEach(([key, value]) => {
                formData.append(key, value);
            });

            // Forward to document service
            const documentServiceUrl = process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3006';
            
            request.log.info('Converting FormData to buffer...');
            
            // Use getBuffer() if available, otherwise stream
            let formDataBuffer: Buffer;
            if (typeof (formData as any).getBuffer === 'function') {
                formDataBuffer = (formData as any).getBuffer();
            } else {
                // Read stream as Buffer (not string)
                formDataBuffer = await new Promise<Buffer>((resolve, reject) => {
                    const chunks: Buffer[] = [];
                    
                    formData.on('data', (chunk: Buffer | string) => {
                        // Ensure chunk is a Buffer
                        const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                        chunks.push(bufferChunk);
                    });
                    
                    formData.on('end', () => {
                        const buffer = Buffer.concat(chunks);
                        request.log.info({ totalSize: buffer.length }, 'FormData buffer ready');
                        resolve(buffer);
                    });
                    
                    formData.on('error', (err) => {
                        request.log.error({ error: err }, 'FormData error');
                        reject(err);
                    });
                });
            }
            
            const headers = formData.getHeaders();
            
            request.log.info({ 
                contentType: headers['content-type'],
                contentLength: formDataBuffer.length,
                hasFile: true 
            }, 'Forwarding to document service');
            
            const response = await fetch(`${documentServiceUrl}/documents/upload`, {
                method: 'POST',
                body: formDataBuffer,
                headers: {
                    ...headers,
                    'x-correlation-id': correlationId,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                request.log.error({ status: response.status, error: errorText }, 'Document service upload failed');
                return reply.status(response.status).send({ error: 'Upload failed' });
            }

            const result = await response.json();
            return reply.send(result);
        } catch (error: any) {
            request.log.error({ error: error.message, correlationId }, 'Failed to upload document');
            return reply.status(500).send({ error: 'Upload failed' });
        }
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

                // Find candidate by Clerk user ID
                const candidateResponse: any = await atsService().get(
                    `/candidates/me`,
                    undefined,
                    correlationId,
                    { 'x-clerk-user-id': req.auth.clerkUserId }
                );
                const candidate = candidateResponse.data;
                
                if (!candidate || candidate.id !== document.entity_id) {
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

    // ---------------------------------------------------------------------
    // V2 document routes - scoped entirely by downstream access resolver
    // ---------------------------------------------------------------------
    app.get('/api/v2/documents', {
        schema: {
            description: 'List documents with access-context scoping',
            tags: ['documents'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = queryString ? `/v2/documents?${queryString}` : '/v2/documents';

        try {
            const data = await documentService().get(
                path,
                undefined,
                correlationId,
                authHeaders
            );
            return reply.send(data);
        } catch (error: any) {
            request.log.error({ error, correlationId }, 'Failed to list V2 documents');
            return reply
                .status(error.statusCode || 500)
                .send(error.jsonBody || { error: 'Failed to list documents' });
        }
    });

    app.get('/api/v2/documents/:id', {
        schema: {
            description: 'Fetch a single document via V2 API',
            tags: ['documents'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);

        try {
            const data = await documentService().get(
                `/v2/documents/${id}`,
                undefined,
                correlationId,
                authHeaders
            );
            return reply.send(data);
        } catch (error: any) {
            request.log.error({ error, id, correlationId }, 'Failed to fetch V2 document');
            return reply
                .status(error.statusCode || 500)
                .send(error.jsonBody || { error: 'Failed to fetch document' });
        }
    });

    app.post('/api/v2/documents', {
        schema: {
            description: 'Upload document via V2 API',
            tags: ['documents'],
            security: [{ clerkAuth: [] }],
            consumes: ['multipart/form-data'],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;

        try {
            if (!request.isMultipart || !request.isMultipart()) {
                return reply.status(400).send({
                    error: { message: 'multipart/form-data is required' },
                });
            }

            let fileBuffer: Buffer | null = null;
            let fileName: string | undefined;
            let mimeType: string | undefined;
            const fields: Record<string, any> = {};

            for await (const part of request.parts()) {
                if (part.type === 'file') {
                    fileBuffer = await part.toBuffer();
                    fileName = part.filename;
                    mimeType = part.mimetype;
                } else if (part.type === 'field') {
                    fields[part.fieldname] = (part as any).value;
                }
            }

            if (!fileBuffer || !fileName) {
                return reply.status(400).send({
                    error: { message: 'File is required' },
                });
            }

            const { entity_type, entity_id, document_type, metadata } = fields;
            if (!entity_type || !entity_id || !document_type) {
                return reply.status(400).send({
                    error: { message: 'entity_type, entity_id, and document_type are required' },
                });
            }

            let parsedMetadata: Record<string, any> | undefined;
            if (metadata) {
                try {
                    parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
                } catch {
                    return reply.status(400).send({
                        error: { message: 'metadata must be valid JSON' },
                    });
                }
            }

            const FormData = (await import('form-data')).default;
            const formData = new FormData();
            formData.append('file', fileBuffer, {
                filename: fileName,
                contentType: mimeType || 'application/octet-stream',
            });
            formData.append('entity_type', entity_type);
            formData.append('entity_id', entity_id);
            formData.append('document_type', document_type);
            if (parsedMetadata) {
                formData.append('metadata', JSON.stringify(parsedMetadata));
            }

            const documentServiceUrl = process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3006';
            const headers = formData.getHeaders();
            headers['x-correlation-id'] = correlationId;
            if (clerkUserId) {
                headers['x-clerk-user-id'] = clerkUserId;
            }

            const response = await fetch(`${documentServiceUrl}/v2/documents`, {
                method: 'POST',
                body: formData,
                headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                request.log.error({ status: response.status, error: errorText }, 'Document service V2 upload failed');
                return reply.status(response.status).send({ error: 'Upload failed' });
            }

            const result = await response.json();
            return reply.status(201).send(result);
        } catch (error: any) {
            request.log.error({ error: error.message, correlationId }, 'Failed to upload V2 document');
            return reply.status(500).send({ error: 'Upload failed' });
        }
    });

    app.patch('/api/v2/documents/:id', {
        schema: {
            description: 'Update document metadata via V2 API',
            tags: ['documents'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);

        try {
            const data = await documentService().patch(
                `/v2/documents/${id}`,
                request.body,
                correlationId,
                authHeaders
            );
            return reply.send(data);
        } catch (error: any) {
            request.log.error({ error, id, correlationId }, 'Failed to update V2 document');
            return reply
                .status(error.statusCode || 500)
                .send(error.jsonBody || { error: 'Failed to update document' });
        }
    });

    app.delete('/api/v2/documents/:id', {
        schema: {
            description: 'Delete document via V2 API',
            tags: ['documents'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);

        try {
            await documentService().delete(`/v2/documents/${id}`, correlationId, authHeaders);
            return reply.status(204).send();
        } catch (error: any) {
            request.log.error({ error, id, correlationId }, 'Failed to delete V2 document');
            return reply
                .status(error.statusCode || 500)
                .send(error.jsonBody || { error: 'Failed to delete document' });
        }
    });
}
