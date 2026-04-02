/**
 * Badges V3 Service — Read-only Core CRUD
 *
 * Pure data access. Auth is enforced at the gateway level.
 * No access control, no enrichment — that belongs in views.
 */

import { NotFoundError } from "@splits-network/shared-fastify";
import { BadgeRepository } from "./repository.js";
import { BadgeListParams } from "./types.js";

export class BadgeService {
    constructor(private repository: BadgeRepository) {}

    async getAll(params: BadgeListParams) {
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
        const badge = await this.repository.findById(id);
        if (!badge) throw new NotFoundError("Badge", id);
        return badge;
    }
}
