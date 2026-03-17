/**
 * Content Images V3 Service — Business Logic
 *
 * Admin-only. Image upload is multipart (handled via V2 action).
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { AccessContextResolver } from "@splits-network/shared-access-context";
import { NotFoundError, ForbiddenError } from "@splits-network/shared-fastify";
import { ImageRepository } from "./repository";
import { ImageListParams, UpdateImageInput } from "./types";

export class ImageService {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: ImageRepository,
        private supabase: SupabaseClient,
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    private async requireAdmin(
        clerkUserId: string,
        headers?: Record<string, unknown>,
    ) {
        const context = await this.accessResolver.resolve(clerkUserId, headers);
        if (!context.isPlatformAdmin) {
            throw new ForbiddenError("Only admins can manage content images");
        }
        return context;
    }

    async getAll(
        params: ImageListParams,
        clerkUserId: string,
        headers?: Record<string, unknown>,
    ) {
        await this.requireAdmin(clerkUserId, headers);
        const { data, total } = await this.repository.findAll(params);
        const page = params.page || 1;
        const limit = Math.min(params.limit || 25, 100);
        return {
            data,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    async getById(
        id: string,
        clerkUserId: string,
        headers?: Record<string, unknown>,
    ) {
        await this.requireAdmin(clerkUserId, headers);
        const image = await this.repository.findById(id);
        if (!image) throw new NotFoundError("Image", id);
        return image;
    }

    async update(
        id: string,
        input: UpdateImageInput,
        clerkUserId: string,
        headers?: Record<string, unknown>,
    ) {
        await this.requireAdmin(clerkUserId, headers);
        const existing = await this.repository.findById(id);
        if (!existing) throw new NotFoundError("Image", id);
        return this.repository.update(id, input);
    }

    async delete(
        id: string,
        clerkUserId: string,
        headers?: Record<string, unknown>,
    ) {
        await this.requireAdmin(clerkUserId, headers);
        const existing = await this.repository.findById(id);
        if (!existing) throw new NotFoundError("Image", id);
        await this.repository.delete(id);
    }
}
