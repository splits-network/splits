/**
 * auth-context.ts
 * Helper functions for extracting authentication context from request headers
 * Part of API Role-Based Scoping Migration
 * 
 * CRITICAL: User roles are determined by DATABASE RECORDS, not headers.
 * Services use SQL JOINs to resolve roles from:
 *   - network.recruiters (recruiter role)
 *   - identity.memberships (company_admin, hiring_manager, platform_admin)
 *   - ats.candidates (candidate role)
 * 
 * We only extract clerk_user_id. Repository/database functions do the rest.
 */

import { FastifyRequest } from 'fastify';

export interface UserContext {
  clerkUserId: string;
  organizationId?: string; // Optional: for context/logging only
}

/**
 * Extracts user context from request headers set by API Gateway.
 * 
 * IMPORTANT: We do NOT extract user role from headers. Role is determined
 * by database records using SQL JOINs in repository methods.
 * 
 * @param request - Fastify request with auth headers from gateway
 * @returns UserContext object with clerk_user_id, or null if not authenticated
 */
export function getUserContext(request: FastifyRequest): UserContext | null {
  const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
  const organizationId = request.headers['x-organization-id'] as string | undefined;

  // Return null if no auth context (for public endpoints)
  if (!clerkUserId) {
    return null;
  }

  return {
    clerkUserId,
    organizationId,
  };
}

/**
 * Gets user context and throws if not authenticated.
 * Use this for endpoints that require authentication.
 */
export function requireUserContext(request: FastifyRequest): UserContext {
  const context = getUserContext(request);
  
  if (!context) {
    throw new Error('Authentication required');
  }
  
  return context;
}
