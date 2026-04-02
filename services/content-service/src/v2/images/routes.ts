/**
 * Content Images Routes
 *
 * HTTP endpoints for admin image management.
 * All routes require platform_admin auth.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ImageServiceV2 } from './service.js';
import { requireUserContext } from '../shared/helpers.js';
import { ImageFilters, ImageUpdate } from './types.js';

interface RegisterConfig {
    imageService: ImageServiceV2;
}

export function registerImageRoutes(app: FastifyInstance, config: RegisterConfig) {
    const { imageService } = config;

    // ── ADMIN: List images ──────────────────────────────────────────────
    // GET /api/v2/content-images?search=hero&tags=marketing
    app.get('/api/v2/content-images', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const filters = request.query as ImageFilters;
        const result = await imageService.getImages(filters);
        return reply.send({ data: result.data, pagination: result.pagination });
    });

    // ── ADMIN: Get image by ID ──────────────────────────────────────────
    // GET /api/v2/content-images/:id
    app.get('/api/v2/content-images/:id', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };
        const image = await imageService.getImageById(id);

        if (!image) {
            return reply.code(404).send({ error: 'Image not found' });
        }

        return reply.send({ data: image });
    });

    // ── ADMIN: Upload image ─────────────────────────────────────────────
    // POST /api/v2/content-images (multipart/form-data)
    app.post('/api/v2/content-images', async (request: FastifyRequest, reply: FastifyReply) => {
        const { clerkUserId } = requireUserContext(request);

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
            clerkUserId,
            fileBuffer,
            fileName,
            contentType,
            altText,
            tags,
        );

        return reply.code(201).send({ data: image });
    });

    // ── ADMIN: Update image metadata ────────────────────────────────────
    // PATCH /api/v2/content-images/:id
    app.patch('/api/v2/content-images/:id', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };
        const updates = request.body as ImageUpdate;
        const image = await imageService.updateImage(id, updates, clerkUserId);
        return reply.send({ data: image });
    });

    // ── ADMIN: Delete image (soft) ──────────────────────────────────────
    // DELETE /api/v2/content-images/:id
    app.delete('/api/v2/content-images/:id', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };
        await imageService.deleteImage(id, clerkUserId);
        return reply.send({ data: { message: 'Image deleted successfully' } });
    });
}
