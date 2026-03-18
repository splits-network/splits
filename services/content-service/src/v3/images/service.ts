/**
 * Content Images V3 Service — Business Logic
 *
 * Pure CRUD service. Admin enforcement is handled at the gateway level
 * (all content-images routes use auth: 'required').
 * No HTTP concepts. Typed errors only.
 */

import { NotFoundError } from "@splits-network/shared-fastify";
import { ImageRepository } from "./repository";
import { ImageListParams, UpdateImageInput } from "./types";

export class ImageService {
    constructor(private repository: ImageRepository) {}

    async getAll(params: ImageListParams) {
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

    async getById(id: string) {
        const image = await this.repository.findById(id);
        if (!image) throw new NotFoundError("Image", id);
        return image;
    }

    async update(id: string, input: UpdateImageInput) {
        const existing = await this.repository.findById(id);
        if (!existing) throw new NotFoundError("Image", id);
        return this.repository.update(id, input);
    }

    async delete(id: string) {
        const existing = await this.repository.findById(id);
        if (!existing) throw new NotFoundError("Image", id);
        await this.repository.delete(id);
    }
}
