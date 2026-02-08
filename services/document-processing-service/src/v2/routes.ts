import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { DocumentRepositoryV2 } from "./documents/repository";
import { DocumentServiceV2 } from "./documents/service";
import {
    DocumentFilters,
    DocumentUpdate,
    PaginationParams,
} from "./shared/types";

export async function registerV2Routes(
    app: FastifyInstance,
    repository: DocumentRepositoryV2,
    service: DocumentServiceV2,
) {
    // LIST - Get documents with filtering and pagination
    app.get(
        "/api/v2/documents",
        async (
            request: FastifyRequest<{
                Querystring: DocumentFilters & PaginationParams;
            }>,
            reply: FastifyReply,
        ) => {
            const clerkUserId = request.headers["x-clerk-user-id"] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: "Unauthorized" });
            }

            const result = await repository.list(clerkUserId, request.query);
            return reply.send(result);
        },
    );

    // GET BY ID - Single document
    app.get(
        "/api/v2/documents/:id",
        async (
            request: FastifyRequest<{
                Params: { id: string };
            }>,
            reply: FastifyReply,
        ) => {
            const clerkUserId = request.headers["x-clerk-user-id"] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: "Unauthorized" });
            }

            const document = await repository.get(
                request.params.id,
                clerkUserId,
            );
            return reply.send({ data: document });
        },
    );

    // UPDATE - Single method handles ALL updates
    app.patch(
        "/api/v2/documents/:id",
        async (
            request: FastifyRequest<{
                Params: { id: string };
                Body: DocumentUpdate;
            }>,
            reply: FastifyReply,
        ) => {
            const clerkUserId = request.headers["x-clerk-user-id"] as string;
            if (!clerkUserId) {
                return reply.code(401).send({ error: "Unauthorized" });
            }

            const updated = await service.update(
                request.params.id,
                clerkUserId,
                request.body,
            );
            return reply.send({ data: updated });
        },
    );

    // STATS - Processing statistics (system endpoint)
    app.get(
        "/api/v2/documents/stats",
        async (request: FastifyRequest, reply: FastifyReply) => {
            // This would be admin-only in a full implementation
            const pending = await repository.getPendingDocuments(1000); // Get count

            const stats = {
                pending: pending.length,
                // Could add more detailed stats here
            };

            return reply.send({ data: stats });
        },
    );
}
