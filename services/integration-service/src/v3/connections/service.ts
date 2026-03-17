/**
 * Connections V3 Service
 * OAuth connection management
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { AccessContextResolver } from "@splits-network/shared-access-context";
import { NotFoundError, ForbiddenError } from "@splits-network/shared-fastify";
import { IEventPublisher } from "../../v2/shared/events";
import { ConnectionRepository } from "./repository";
import { ConnectionListParams } from "./types";

export class ConnectionService {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: ConnectionRepository,
        private supabase: SupabaseClient,
        private eventPublisher?: IEventPublisher,
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    async getAll(
        params: ConnectionListParams,
        clerkUserId: string,
        headers?: Record<string, unknown>,
    ) {
        await this.accessResolver.resolve(clerkUserId, headers);
        const { data, total } = await this.repository.findAllForUser(
            clerkUserId,
            params,
        );
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
        await this.accessResolver.resolve(clerkUserId, headers);
        const connection = await this.repository.findById(id);
        if (!connection) throw new NotFoundError("Connection", id);
        if (connection.clerk_user_id !== clerkUserId) {
            throw new ForbiddenError(
                "You do not have access to this connection",
            );
        }
        return connection;
    }

    async delete(
        id: string,
        clerkUserId: string,
        headers?: Record<string, unknown>,
    ) {
        await this.accessResolver.resolve(clerkUserId, headers);
        const existing = await this.repository.findById(id);
        if (!existing) throw new NotFoundError("Connection", id);
        if (existing.clerk_user_id !== clerkUserId) {
            throw new ForbiddenError(
                "You do not have access to this connection",
            );
        }
        await this.repository.delete(id);

        await this.eventPublisher?.publish(
            "connection.disconnected",
            {
                connection_id: id,
                clerk_user_id: clerkUserId,
            },
            "integration-service",
        );
    }
}
