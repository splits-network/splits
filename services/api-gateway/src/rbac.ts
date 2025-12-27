import { FastifyRequest, FastifyReply } from 'fastify';
import { ForbiddenError, UnauthorizedError } from '@splits-network/shared-fastify';
import { AuthContext, UserRole } from './auth';
import { ServiceRegistry } from './clients';

export interface AuthenticatedRequest extends FastifyRequest {
    auth: AuthContext;
}

/**
 * RBAC middleware factory
 * Checks if the authenticated user has at least one of the required roles
 */
export function requireRoles(allowedRoles: UserRole[], services?: ServiceRegistry) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;

        if (!req.auth) {
            throw new UnauthorizedError('Authentication required');
        }

        // Special case: 'candidate' role is available to all authenticated users without memberships
        // Candidates are external users who don't belong to organizations
        if (allowedRoles.includes('candidate')) {
            // If user has no memberships, they're a candidate
            if (!req.auth.memberships || req.auth.memberships.length === 0) {
                request.log.debug({ userId: req.auth.userId }, 'Access granted: candidate role (no memberships)');
                return;
            }
        }

        // Special case: 'recruiter' role requires checking network service
        // Recruiters are independent contractors stored in network.recruiters, not in memberships
        if (allowedRoles.includes('recruiter') && services) {
            if (!req.auth.memberships || req.auth.memberships.length === 0) {
                try {
                    const correlationId = (request as any).correlationId;
                    const networkService = services.get('network');
                    const recruiterResponse: any = await networkService.get(
                        `/recruiters/by-user/${req.auth.userId}`,
                        undefined,
                        correlationId
                    );

                    if (recruiterResponse?.data && recruiterResponse.data.status === 'active') {
                        request.log.debug({ userId: req.auth.userId }, 'Access granted: active recruiter');
                        return;
                    }
                } catch (error) {
                    request.log.debug({ error, userId: req.auth.userId }, 'User is not a recruiter');
                    // Fall through to membership check
                }
            }
        }

        // For all other roles, check memberships
        if (!req.auth.memberships || req.auth.memberships.length === 0) {
            throw new ForbiddenError('No organization memberships found. Please contact an administrator.');
        }

        // Check if user has any of the allowed roles across their memberships
        const userRoles = req.auth.memberships.map(m => m.role);
        const hasAllowedRole = allowedRoles.some(role => userRoles.includes(role));

        if (!hasAllowedRole) {
            request.log.warn({
                userId: req.auth.userId,
                userRoles,
                requiredRoles: allowedRoles,
                path: request.url,
            }, 'Access denied: insufficient permissions');

            const isDevelopment = process.env.NODE_ENV === 'development';
            const errorMessage = isDevelopment
                ? `Access denied. Required roles: ${allowedRoles.join(' or ')}. Your roles: ${userRoles.join(', ')}`
                : 'Access denied: insufficient permissions';

            throw new ForbiddenError(errorMessage);
        }
    };
}

/**
 * Check if user has a specific role
 */
export function hasRole(auth: AuthContext, role: UserRole): boolean {
    return auth.memberships.some(m => m.role === role);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(auth: AuthContext, roles: UserRole[]): boolean {
    return auth.memberships.some(m => roles.includes(m.role));
}

/**
 * Check if user is a platform admin
 */
export function isAdmin(auth: AuthContext): boolean {
    return hasRole(auth, 'platform_admin');
}

/**
 * Check if user is a recruiter
 * For recruiters without organization memberships, queries network service
 */
export async function isRecruiter(auth: AuthContext, services?: ServiceRegistry, correlationId?: string): Promise<boolean> {
    // Check memberships first
    if (hasRole(auth, 'recruiter')) {
        return true;
    }

    // If no memberships and services provided, check network service
    if (services && (!auth.memberships || auth.memberships.length === 0)) {
        try {
            const networkService = services.get('network');
            const recruiterResponse: any = await networkService.get(
                `/recruiters/by-user/${auth.userId}`,
                undefined,
                correlationId
            );
            return recruiterResponse?.data?.status === 'active';
        } catch (error) {
            return false;
        }
    }

    return false;
}

/**
 * Check if user is a company user (admin or hiring manager)
 */
export function isCompanyUser(auth: AuthContext): boolean {
    return hasAnyRole(auth, ['company_admin', 'hiring_manager']);
}

/**
 * Get user's organization IDs
 */
export function getUserOrganizationIds(auth: AuthContext): string[] {
    return auth.memberships.map(m => m.organization_id);
}

/**
 * Check if user belongs to a specific organization
 */
export function belongsToOrganization(auth: AuthContext, organizationId: string): boolean {
    return auth.memberships.some(m => m.organization_id === organizationId);
}
