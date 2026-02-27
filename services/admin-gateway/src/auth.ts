import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '@clerk/backend';
import { createClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { UnauthorizedError, ForbiddenError } from '@splits-network/shared-fastify';

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
        supabaseServiceRoleKey: string
    ) {
        this.clerkSecretKey = clerkSecretKey;
        // Use service role key — NOT anon key — so resolveAccessContext can bypass RLS
        this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    }

    createMiddleware() {
        return async (request: FastifyRequest, reply: FastifyReply) => {
            const authHeader = request.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                throw new UnauthorizedError('Missing authorization header');
            }

            const token = authHeader.substring(7);

            let verified: Awaited<ReturnType<typeof verifyToken>>;
            try {
                verified = await verifyToken(token, { secretKey: this.clerkSecretKey });
            } catch {
                throw new UnauthorizedError('Invalid or expired token');
            }

            if (!verified?.sub) {
                throw new UnauthorizedError('Invalid token: missing subject');
            }

            const context = await resolveAccessContext(this.supabase, verified.sub);

            if (!context.isPlatformAdmin) {
                throw new ForbiddenError('Platform admin access required');
            }

            (request as any).adminAuth = {
                clerkUserId: verified.sub,
                userId: context.identityUserId,
                isPlatformAdmin: true,
            } satisfies AdminAuthContext;
        };
    }
}
