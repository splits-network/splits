import { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";
import { resolveAccessContext } from "@splits-network/shared-access-context";
import {
    UnauthorizedError,
    ForbiddenError,
} from "@splits-network/shared-fastify";

export interface AdminAuthContext {
    clerkUserId: string;
    userId: string | null;
    isPlatformAdmin: true;
}

export class AdminAuthMiddleware {
    private clerkSecretKey: string;
    private supabase: ReturnType<typeof createClient>;

    constructor(
        clerkSecretKey: string,
        supabaseUrl: string,
        supabaseServiceRoleKey: string,
    ) {
        this.clerkSecretKey = clerkSecretKey;
        // Use service role key — NOT anon key — so resolveAccessContext can bypass RLS
        this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    }

    createMiddleware() {
        return async (request: FastifyRequest, reply: FastifyReply) => {
            const authHeader = request.headers.authorization;
            if (!authHeader?.startsWith("Bearer ")) {
                throw new UnauthorizedError("Missing authorization header");
            }

            const token = authHeader.substring(7);

            let verified: Awaited<ReturnType<typeof verifyToken>>;
            try {
                verified = await verifyToken(token, {
                    secretKey: this.clerkSecretKey,
                });
            } catch {
                throw new UnauthorizedError("Invalid or expired token");
            }

            if (!verified?.sub) {
                throw new UnauthorizedError("Invalid token: missing subject");
            }

            const context = await resolveAccessContext(
                this.supabase,
                verified.sub,
            );
            let isPlatformAdmin = context.isPlatformAdmin;
            let identityUserId = context.identityUserId;

            if (!isPlatformAdmin) {
                console.warn(
                    "[admin-gateway] resolveAccessContext returned non-admin",
                    {
                        clerkUserId: verified.sub,
                        identityUserId: context.identityUserId,
                        roles: context.roles,
                        contextError: context.error,
                    },
                );
            }

            if (!isPlatformAdmin) {
                const { data: userRow, error: userError } = await this.supabase
                    .from("users")
                    .select("id")
                    .eq("clerk_user_id", verified.sub)
                    .maybeSingle();

                if (userError) {
                    console.error("[admin-gateway] user lookup failed", {
                        clerkUserId: verified.sub,
                        error: userError,
                    });
                    throw new ForbiddenError("Platform admin access required");
                }

                if (userRow?.id) {
                    identityUserId = userRow.id;

                    const { data: roleRows, error: roleError } =
                        await this.supabase
                            .from("user_roles")
                            .select("id")
                            .eq("user_id", userRow.id)
                            .eq("role_name", "platform_admin")
                            .limit(1);

                    if (roleError) {
                        console.error(
                            "[admin-gateway] user_roles lookup failed",
                            {
                                clerkUserId: verified.sub,
                                identityUserId: userRow.id,
                                error: roleError,
                            },
                        );
                    } else {
                        isPlatformAdmin =
                            Array.isArray(roleRows) && roleRows.length > 0;
                    }

                    if (!isPlatformAdmin) {
                        const { data: membershipRows, error: membershipError } =
                            await this.supabase
                                .from("memberships")
                                .select("id")
                                .eq("user_id", userRow.id)
                                .eq("role_name", "platform_admin")
                                .limit(1);

                        if (membershipError) {
                            console.warn(
                                "[admin-gateway] memberships platform_admin fallback lookup failed",
                                {
                                    clerkUserId: verified.sub,
                                    identityUserId: userRow.id,
                                    error: membershipError,
                                },
                            );
                        } else {
                            isPlatformAdmin =
                                Array.isArray(membershipRows) &&
                                membershipRows.length > 0;
                        }
                    }
                } else {
                    console.warn(
                        "[admin-gateway] no users row found for clerk user",
                        {
                            clerkUserId: verified.sub,
                        },
                    );
                }
            }

            if (!isPlatformAdmin) {
                throw new ForbiddenError("Platform admin access required");
            }

            (request as any).adminAuth = {
                clerkUserId: verified.sub,
                userId: identityUserId,
                isPlatformAdmin: true,
            } satisfies AdminAuthContext;
        };
    }
}
