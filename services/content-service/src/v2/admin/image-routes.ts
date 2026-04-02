/**
 * Admin Image Routes
 *
 * CRUD routes for content images via admin-gateway.
 * Auth is enforced by admin-gateway — these routes trust x-clerk-user-id header.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ImageServiceV2 } from '../images/service.js';
import { getUserContext } from '../shared/helpers.js';
import { ImageFilters, ImageUpdate } from '../images/types.js';

interface ImageRoutesConfig {
    imageService: ImageServiceV2;
}

export function registerAdminImageRoutes(
    app: FastifyInstance,
    config: ImageRoutesConfig,
) {
    const { imageService } = config;

    // GET /admin/content-images — list images
    app.get('/admin/content-images', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const filters = request.query as ImageFilters;
            const result = await imageService.getImages(filters);
            reply.send({ data: result.data, pagination: result.pagination });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list images' } });
        }
    });

    // GET /admin/content-images/:id — get image by ID
    app.get('/admin/content-images/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const image = await imageService.getImageById(id);

            if (!image) {
                return reply.code(404).send({ error: { message: 'Image not found' } });
            }

            reply.send({ data: image });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to get image' } });
        }
    });

    // POST /admin/content-images — upload image (multipart/form-data)
    app.post('/admin/content-images', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const context = getUserContext(request);
            if (!context) {
                return reply.code(401).send({ error: { message: 'Missing x-clerk-user-id header' } });
            }

            if (!(request as any).isMultipart || !(request as any).isMultipart()) {
                return reply.code(400).send({
                    error: { message: 'multipart/form-data is required' },
                });
            }

            let fileBuffer: Buffer | null = null;
            let fileName: string | undefined;
            let contentType: string | undefined;
            let altText: string | undefined;
            let tags: string[] | undefined;

            for await (const part of (request as any).parts()) {
                if (part.type === 'file' && part.fieldname === 'file') {
                    fileBuffer = await part.toBuffer();
                    fileName = part.filename;
                    contentType = part.mimetype;
                } else if (part.type === 'field') {
                    if (part.fieldname === 'alt_text') altText = part.value as string;
                    if (part.fieldname === 'tags') {
                        const val = part.value as string;
                        tags = val ? val.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
                    }
                }
            }

            if (!fileBuffer || !fileName || !contentType) {
                return reply.code(400).send({
                    error: { message: 'Image file is required' },
                });
            }

            const image = await imageService.uploadImage(
                context.clerkUserId,
                fileBuffer,
                fileName,
                contentType,
                altText,
                tags,
            );

            reply.code(201).send({ data: image });
        } catch (error: any) {
            const msg = error.message || 'Failed to upload image';
            const status = msg.includes('Invalid file type') || msg.includes('File too large') ? 400 : 500;
            reply.code(status).send({ error: { message: msg } });
        }
    });

    // PATCH /admin/content-images/:id — update image metadata
    app.patch('/admin/content-images/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const context = getUserContext(request);
            if (!context) {
                return reply.code(401).send({ error: { message: 'Missing x-clerk-user-id header' } });
            }

            const { id } = request.params as { id: string };
            const updates = request.body as ImageUpdate;
            const image = await imageService.updateImage(id, updates, context.clerkUserId);
            reply.send({ data: image });
        } catch (error: any) {
            const msg = error.message || 'Failed to update image';
            const status = msg.includes('not found') ? 404 : 500;
            reply.code(status).send({ error: { message: msg } });
        }
    });

    // DELETE /admin/content-images/:id — soft-delete image
    app.delete('/admin/content-images/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const context = getUserContext(request);
            if (!context) {
                return reply.code(401).send({ error: { message: 'Missing x-clerk-user-id header' } });
            }

            const { id } = request.params as { id: string };
            await imageService.deleteImage(id, context.clerkUserId);
            reply.send({ data: { message: 'Image deleted successfully' } });
        } catch (error: any) {
            const msg = error.message || 'Failed to delete image';
            const status = msg.includes('not found') ? 404 : 500;
            reply.code(status).send({ error: { message: msg } });
        }
    });
}
