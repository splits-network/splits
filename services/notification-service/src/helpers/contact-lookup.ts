/**
 * Contact Lookup Helper
 * 
 * Centralized utility for resolving any entity ID (user, recruiter, candidate, etc.)
 * to a unified Contact object containing all contact information.
 * 
 * This replaces the scattered approach of fetching emails from one place,
 * names from another, etc. All contact resolution logic lives here.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';

/**
 * Unified contact information returned by all lookup methods
 */
export interface Contact {
    /** The user_id (used for notification logging) */
    id: string;
    /** The users.id if linked to a user account, null otherwise */
    user_id: string | null;
    /** Display name (resolved from user or entity) */
    name: string;
    /** Primary email address */
    email: string;
    /** Phone number if available */
    phone: string | null;
    /** Type of contact for context */
    type: 'user' | 'recruiter' | 'candidate' | 'company_admin';
    /** Original entity ID that was passed in */
    entity_id: string;
}

export class ContactLookupHelper {
    constructor(
        private supabase: SupabaseClient,
        private logger: Logger
    ) { }

    /**
     * Get contact by internal user UUID
     * 
     * @param userId - Internal UUID from users.id
     * @returns Contact or null if not found
     */
    async getContactByUserId(userId: string): Promise<Contact | null> {
        try {
            const { data: user, error } = await this.supabase
                .from('users')
                .select('id, email, name')
                .eq('id', userId)
                .single();

            if (error) {
                this.logger.error({ userId, error }, 'Failed to fetch user from database');
                return null;
            }

            if (!user) {
                this.logger.warn({ userId }, 'User not found');
                return null;
            }


            if (!user.email) {
                this.logger.warn({ userId }, 'User found but no email address');
                return null;
            }

            return {
                id: user.id,
                user_id: user.id,
                name: user.name,
                email: user.email,
                phone: null,
                type: 'user',
                entity_id: userId,
            };
        } catch (error) {
            this.logger.error(
                { userId, error: error instanceof Error ? error.message : String(error) },
                'Failed to fetch contact by user ID'
            );
            return null;
        }
    }

    /**
     * Get contact by Clerk user ID
     * 
     * @param clerkUserId - Clerk user ID (format: user_XXXXXXXXXX)
     * @returns Contact or null if not found
     */
    async getContactByClerkUserId(clerkUserId: string): Promise<Contact | null> {
        try {
            const { data: user, error } = await this.supabase
                .from('users')
                .select('id, email, name')
                .eq('clerk_user_id', clerkUserId)
                .single();

            if (error) {
                this.logger.error({ clerkUserId, error }, 'Failed to fetch user by Clerk ID');
                return null;
            }

            if (!user) {
                this.logger.warn({ clerkUserId }, 'User not found by Clerk ID');
                return null;
            }


            if (!user.email) {
                this.logger.warn({ clerkUserId }, 'User found but no email address');
                return null;
            }

            return {
                id: user.id,
                user_id: user.id,
                name: user.name,
                email: user.email,
                phone: null,
                type: 'user',
                entity_id: clerkUserId,
            };
        } catch (error) {
            this.logger.error(
                { clerkUserId, error: error instanceof Error ? error.message : String(error) },
                'Failed to fetch contact by Clerk ID'
            );
            return null;
        }
    }

    /**
     * Get recruiter contact
     * 
     * Flow:
     * 1. Fetch recruiter to get user_id
     * 2. Fetch user details from users table
     * 
     * @param recruiterId - Recruiter ID from recruiters.id
     * @returns Contact or null if not found
     */
    async getRecruiterContact(recruiterId: string): Promise<Contact | null> {
        try {
            const { data: recruiter, error } = await this.supabase
                .from('recruiters')
                .select('id, user_id, phone')
                .eq('id', recruiterId)
                .single();

            if (error) {
                this.logger.error({ recruiterId, error }, 'Failed to fetch recruiter from database');
                return null;
            }

            if (!recruiter?.user_id) {
                this.logger.warn({ recruiterId }, 'Recruiter found but no user_id');
                return null;
            }

            // Fetch user details
            const { data: user, error: userError } = await this.supabase
                .from('users')
                .select('id, email, name')
                .eq('id', recruiter.user_id)
                .single();

            if (userError || !user) {
                this.logger.error({ recruiterId, userId: recruiter.user_id, error: userError }, 'Failed to fetch recruiter user');
                return null;
            }

            if (!user.email) {
                this.logger.warn({ recruiterId }, 'Recruiter user found but no email address');
                return null;
            }

            return {
                id: user.id,
                user_id: user.id,
                name: user.name,
                email: user.email,
                phone: recruiter.phone || null,
                type: 'recruiter',
                entity_id: recruiterId,
            };
        } catch (error) {
            this.logger.error(
                { recruiterId, error: error instanceof Error ? error.message : String(error) },
                'Failed to fetch recruiter contact'
            );
            return null;
        }
    }

    /**
     * Get candidate contact
     * 
     * Flow:
     * 1. Fetch candidate to get user_id, email, full_name, phone
     * 2. If candidate.user_id exists, fetch user details from users table
     * 3. Otherwise, use candidate's direct fields (legacy candidates without accounts)
     * 
     * @param candidateId - Candidate ID from candidates.id
     * @returns Contact or null if not found
     */
    async getCandidateContact(candidateId: string): Promise<Contact | null> {
        try {
            const { data: candidate, error } = await this.supabase
                .from('candidates')
                .select('id, user_id, email, full_name, phone')
                .eq('id', candidateId)
                .single();

            if (error) {
                this.logger.error({ candidateId, error }, 'Failed to fetch candidate from database');
                return null;
            }

            if (!candidate) {
                this.logger.warn({ candidateId }, 'Candidate not found');
                return null;
            }

            // If candidate has a linked user account, get user details
            if (candidate.user_id) {
                const { data: user, error: userError } = await this.supabase
                    .from('users')
                    .select('id, email, name')
                    .eq('id', candidate.user_id)
                    .single();

                if (!userError && user) {
                    return {
                        id: user.id,
                        user_id: user.id,
                        name: user.name || candidate.full_name || 'Unknown',
                        email: user.email || candidate.email || '',
                        phone: candidate.phone || null,
                        type: 'candidate',
                        entity_id: candidateId,
                    };
                }
            }

            // Fallback: use candidate's direct fields (legacy candidates without accounts)
            if (!candidate.email) {
                this.logger.warn({ candidateId }, 'Candidate has no user account or email');
                return null;
            }

            this.logger.info({ candidateId }, 'Using candidate data directly (no user account)');
            return {
                id: candidateId,
                user_id: null,
                name: candidate.full_name || 'Unknown',
                email: candidate.email,
                phone: candidate.phone || null,
                type: 'candidate',
                entity_id: candidateId,
            };
        } catch (error) {
            this.logger.error(
                { candidateId, error: error instanceof Error ? error.message : String(error) },
                'Failed to fetch candidate contact'
            );
            return null;
        }
    }

    /**
     * Get company admin contacts
     * 
     * Flow:
     * 1. Fetch organization memberships with role 'company_admin'
     * 2. Fetch user details for each admin
     * 
     * @param organizationId - Organization ID from organizations.id
     * @returns Array of Contacts (empty if none found)
     */
    async getCompanyAdminContacts(organizationId: string): Promise<Contact[]> {
        try {
            const { data: memberships, error } = await this.supabase
                .from('organization_memberships')
                .select('user_id')
                .eq('organization_id', organizationId)
                .eq('role', 'company_admin');

            if (error) {
                this.logger.error({ organizationId, error }, 'Failed to fetch org memberships from database');
                return [];
            }

            if (!memberships || memberships.length === 0) {
                this.logger.warn({ organizationId }, 'No company admins found for organization');
                return [];
            }

            // Fetch contacts for all admins
            const contacts: Contact[] = [];
            for (const membership of memberships) {
                if (membership.user_id) {
                    const { data: user, error: userError } = await this.supabase
                        .from('users')
                        .select('id, email, name')
                        .eq('id', membership.user_id)
                        .single();

                    if (!userError && user && user.email) {
                        contacts.push({
                            id: user.id,
                            user_id: user.id,
                            name: user.name,
                            email: user.email,
                            phone: null,
                            type: 'company_admin',
                            entity_id: membership.user_id,
                        });
                    }
                }
            }

            this.logger.info({ organizationId, adminCount: contacts.length }, 'Fetched company admin contacts');
            return contacts;
        } catch (error) {
            this.logger.error(
                { organizationId, error: error instanceof Error ? error.message : String(error) },
                'Failed to fetch company admin contacts'
            );
            return [];
        }
    }
}

