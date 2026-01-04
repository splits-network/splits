import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { buildQueryString, getCorrelationId } from './common';

type DocumentUploadResponse = {
    data?: {
        id?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
};

export function registerDocumentRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const documentService = () => services.get('document');

    app.get(
        '/api/v2/documents',
        {
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/documents?${queryString}` : '/api/v2/documents';

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
        }
    );

    app.get(
        '/api/v2/documents/:id',
        {
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await documentService().get(
                    `/api/v2/documents/${id}`,
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
        }
    );

    app.post(
        '/api/v2/documents',
        {
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                request.log.info({
                    correlationId,
                    contentType: request.headers['content-type'],
                    method: request.method,
                    url: request.url
                }, 'V2 document upload request started - proxying to document service');

                // Proxy the original multipart request directly to the document service
                const documentServiceUrl = process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3006';
                
                const proxyHeaders = {
                    ...authHeaders,
                    'x-correlation-id': correlationId,
                    'content-type': request.headers['content-type'],
                    'content-length': request.headers['content-length'],
                };

                request.log.info({
                    correlationId,
                    documentServiceUrl,
                    headers: Object.keys(proxyHeaders)
                }, 'Proxying multipart request to document service');

                const response = await fetch(`${documentServiceUrl}/api/v2/documents`, {
                    method: 'POST',
                    body: request.raw,
                    headers: proxyHeaders,
                    duplex: 'half',
                } as RequestInit);

                if (!response.ok) {
                    const errorText = await response.text();
                    request.log.error(
                        { correlationId, status: response.status, error: errorText },
                        'Document service V2 upload failed'
                    );
                    return reply.status(response.status).send({ error: { message: 'Upload failed' } });
                }

                const result = (await response.json()) as DocumentUploadResponse;
                request.log.info({
                    correlationId,
                    documentId: result.data?.id
                }, 'Document upload successful');
                
                return reply.status(201).send(result);
            } catch (error: any) {
                request.log.error({ error: error.message, correlationId }, 'Failed to upload V2 document');
                return reply.status(500).send({ error: { message: 'Upload failed' } });
            }
        }
    );

    app.patch(
        '/api/v2/documents/:id',
        {
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await documentService().patch(
                    `/api/v2/documents/${id}`,
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
        }
    );

    app.delete(
        '/api/v2/documents/:id',
        {
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                await documentService().delete(`/api/v2/documents/${id}`, correlationId, authHeaders);
                return reply.status(204).send();
            } catch (error: any) {
                request.log.error({ error, id, correlationId }, 'Failed to delete V2 document');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to delete document' });
            }
        }
    );
}
