/**
 * auth-headers.ts
 * Helper functions for building authentication headers for backend service requests
 * Part of API Role-Based Scoping Migration
 * 
 * CRITICAL: Roles are determined by DATABASE RECORDS, not Clerk or these headers.
 * Backend services use SQL JOINs to resolve user roles from:
 *   - network.recruiters (recruiter role)
 *   - identity.memberships (company_admin, hiring_manager, platform_admin)
 *   - ats.candidates (candidate role)
 * 
 * We only pass clerk_user_id. Backend resolves role + filters data in single query.
 */

import { FastifyRequest } from 'fastify';
import { AuthContext } from '../auth';

export interface AuthHeaders extends Record<string, string> {
  'x-clerk-user-id': string;
}

export type OptionalAuthHeaders = Partial<AuthHeaders>;

// Extend FastifyRequest to include auth property
declare module 'fastify' {
  interface FastifyRequest {
    auth?: AuthContext;
  }
}

/**
 * Builds authentication headers from request auth context for backend service calls.
 * 
 * IMPORTANT: We do NOT pass user role in headers. Backend services determine role
 * from database records using SQL JOINs for 10-25x better performance.
 * 
 * For public endpoints (e.g., jobs listing), this returns empty headers when no auth
 * is present, allowing backend services to handle optional authentication.
 * 
 * @param request - Fastify request with optional auth context populated by Clerk middleware
 * @returns Object with auth headers to pass to backend services (empty if no auth)
 */
export function buildAuthHeaders(request: FastifyRequest): Partial<AuthHeaders> {
  const auth = request.auth;

  if (!auth) {
    // Return empty headers for public/unauthenticated requests
    return {};
  }

  const headers: AuthHeaders = {
    'x-clerk-user-id': auth.clerkUserId,
  };

  // Include organization ID if user has memberships (for context/logging only)
  // Backend will resolve actual company access via database JOINs
  if (auth.memberships && auth.memberships.length > 0) {
    // Use first membership's org (for now - Phase 1 simplification)
    // TODO: Handle multi-org users in Phase 2
    headers['x-organization-id'] = auth.memberships[0].organization_id;
  }

  return headers;
}
