import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';

/**
 * Email Lookup Helper
 * 
 * Centralized utility for resolving user IDs (UUID or Clerk ID) to email addresses.
 * Uses direct database queries instead of HTTP calls to other services.
 * 
 * This helper exists because:
 * 1. Authentication architecture uses Clerk user IDs as primary identifiers
 * 2. Different services store different ID types (internal UUID vs Clerk ID)
 * 3. Email addresses live in users table
 * 4. We need consistent error handling when emails aren't found
 */
export class EmailLookupHelper {
    constructor(
        private supabase: SupabaseClient,
        private logger: Logger
    ) {}

    /**
     * Get email address from internal user UUID
     * 
     * @param userId - Internal UUID from users.id
     * @returns Email address or null if not found
     */
    async getEmailByUserId(userId: string): Promise<string | null> {
        try {
            const { data: user, error } = await this.supabase
                .from('users')
                .select('email')
                .eq('id', userId)
                .single();

            if (error) {
                this.logger.error({ userId, error }, 'Failed to fetch user email from database');
                return null;
            }

            if (!user?.email) {
                this.logger.warn({ userId }, 'User found but no email address');
                return null;
            }

            return user.email;
        } catch (error) {
            this.logger.error(
                { userId, error: error instanceof Error ? error.message : String(error) },
                'Failed to fetch user email by ID'
            );
            return null;
        }
    }

    /**
     * Get email address from Clerk user ID
     * 
     * @param clerkUserId - Clerk user ID (format: user_XXXXXXXXXX)
     * @returns Email address or null if not found
     */
    async getEmailByClerkUserId(clerkUserId: string): Promise<string | null> {
        try {
            const { data: user, error } = await this.supabase
                .from('users')
                .select('email')
                .eq('clerk_user_id', clerkUserId)
                .single();

            if (error) {
                this.logger.error({ clerkUserId, error }, 'Failed to fetch user email from database');
                return null;
            }

            if (!user?.email) {
                this.logger.warn({ clerkUserId }, 'User found by Clerk ID but no email address');
                return null;
            }

            return user.email;
        } catch (error) {
            this.logger.error(
                { clerkUserId, error: error instanceof Error ? error.message : String(error) },
                'Failed to fetch user email by Clerk ID'
            );
            return null;
        }
    }

    /**
     * Get recruiter email address
     * 
     * Flow:
     * 1. Fetch recruiter to get user_id
     * 2. Fetch user email from users table
     * 
     * @param recruiterId - Recruiter ID from recruiters.id
     * @returns Email address or null if not found
     */
    async getRecruiterEmail(recruiterId: string): Promise<string | null> {
        try {
            const { data: recruiter, error } = await this.supabase
                .from('recruiters')
                .select('user_id')
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

            return await this.getEmailByUserId(recruiter.user_id);
        } catch (error) {
            this.logger.error(
                { recruiterId, error: error instanceof Error ? error.message : String(error) },
                'Failed to fetch recruiter email'
            );
            return null;
        }
    }

    /**
     * Get candidate email address
     * 
     * Flow:
     * 1. Fetch candidate to get user_id or email
     * 2. If candidate.user_id exists, fetch user email from users table
     * 3. Otherwise, use candidate.email directly (legacy candidates without accounts)
     * 
     * @param candidateId - Candidate ID from candidates.id
     * @returns Email address or null if not found
     */
    async getCandidateEmail(candidateId: string): Promise<string | null> {
        try {
            const { data: candidate, error } = await this.supabase
                .from('candidates')
                .select('user_id, email')
                .eq('id', candidateId)
                .single();

            if (error) {
                this.logger.error({ candidateId, error }, 'Failed to fetch candidate from database');
                return null;
            }

            // Check if candidate has user account
            if (candidate?.user_id) {
                return await this.getEmailByUserId(candidate.user_id);
            }

            // Fallback: candidate may have email directly (legacy data)
            if (candidate?.email) {
                this.logger.info({ candidateId }, 'Using candidate email directly (no user account)');
                return candidate.email;
            }

            this.logger.warn({ candidateId }, 'Candidate has no user account or email');
            return null;
        } catch (error) {
            this.logger.error(
                { candidateId, error: error instanceof Error ? error.message : String(error) },
                'Failed to fetch candidate email'
            );
            return null;
        }
    }

    /**
     * Get company admin emails
     * 
     * Flow:
     * 1. Fetch organization memberships
     * 2. Filter for company_admin role
     * 3. Fetch email for each admin user
     * 
     * @param organizationId - Organization ID from organizations.id
     * @returns Array of email addresses (empty if none found)
     */
    async getCompanyAdminEmails(organizationId: string): Promise<string[]> {
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

            // Fetch emails for all admins
            const emails: string[] = [];
            for (const membership of memberships) {
                if (membership.user_id) {
                    const email = await this.getEmailByUserId(membership.user_id);
                    if (email) {
                        emails.push(email);
                    }
                }
            }

            this.logger.info({ organizationId, adminCount: emails.length }, 'Fetched company admin emails');
            return emails;
        } catch (error) {
            this.logger.error(
                { organizationId, error: error instanceof Error ? error.message : String(error) },
                'Failed to fetch company admin emails'
            );
            return [];
        }
    }

    /**
     * Get user full name (for email display)
     * 
     * @param userId - Internal user UUID
     * @returns Full name or null if not found
     */
    async getUserName(userId: string): Promise<string | null> {
        try {
            const { data: user, error } = await this.supabase
                .from('users')
                .select('name')
                .eq('id', userId)
                .single();

            if (error) {
                this.logger.error({ userId, error }, 'Failed to fetch user name from database');
                return null;
            }

            return user?.name || null;
        } catch (error) {
            this.logger.error(
                { userId, error: error instanceof Error ? error.message : String(error) },
                'Failed to fetch user name'
            );
            return null;
        }
    }
}
