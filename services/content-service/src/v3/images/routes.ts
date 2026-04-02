/**
 * Content Images V3 Routes — list, get, update, delete
 *
 * Auth is enforced at the gateway level (auth: 'required').
 * POST/upload is multipart and remains in V2.
 */

import { FastifyInstance } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { ImageRepository } from "./repository.js";
import { ImageService } from "./service.js";
import {
    ImageListParams,
    UpdateImageInput,
    listQuerySchema,
    updateSchema,
    idParamSchema,
} from "./types.js";

export function registerImageRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
) {
    const repository = new ImageRepository(supabase);
    const service = new ImageService(repository);

    // GET /api/v3/content-images — list
    app.get(
        "/api/v3/content-images",
        { schema: { querystring: listQuerySchema } },
        async (request, reply) => {
            const result = await service.getAll(
                request.query as ImageListParams,
            );
            return reply.send({
                data: result.data,
                pagination: result.pagination,
            });
        },
    );

    // GET /api/v3/content-images/:id
    app.get(
        "/api/v3/content-images/:id",
        { schema: { params: idParamSchema } },
        async (request, reply) => {
            const { id } = request.params as { id: string };
            const data = await service.getById(id);
            return reply.send({ data });
        },
    );

    // PATCH /api/v3/content-images/:id
    app.patch(
        "/api/v3/content-images/:id",
        { schema: { params: idParamSchema, body: updateSchema } },
        async (request, reply) => {
            const { id } = request.params as { id: string };
            const data = await service.update(
                id,
                request.body as UpdateImageInput,
            );
            return reply.send({ data });
        },
    );

    // DELETE /api/v3/content-images/:id
    app.delete(
        "/api/v3/content-images/:id",
        { schema: { params: idParamSchema } },
        async (request, reply) => {
            const { id } = request.params as { id: string };
            await service.delete(id);
            return reply.send({
                data: { message: "Image deleted successfully" },
            });
        },
    );
}
