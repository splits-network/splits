import { ServiceRegistry } from '../clients';
import { Logger } from '@splits-network/shared-logging';

/**
 * Email Lookup Helper
 * 
 * Centralized utility for resolving user IDs (UUID or Clerk ID) to email addresses.
 * Handles the complexity of querying identity service, network service, and ATS service
 * to find user email addresses for sending notifications.
 * 
 * This helper exists because:
 * 1. Authentication architecture uses Clerk user IDs as primary identifiers
 * 2. Different services store different ID types (internal UUID vs Clerk ID)
 * 3. Email addresses live in identity.users table
 * 4. We need consistent error handling when emails aren't found
 */
export class EmailLookupHelper {
    constructor(
        private services: ServiceRegistry,
        private logger: Logger
    ) {}

    /**
     * Get email address from internal user UUID
     * Queries: GET /users/:id
     * 
     * @param userId - Internal UUID from identity.users.id
     * @returns Email address or null if not found
     */
    async getEmailByUserId(userId: string): Promise<string | null> {
        try {
            const response = await this.services.getIdentityService()
                .get<any>(`/users/${userId}`);
            
            const user = response.data || response;
            
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
     * Queries: GET /users/by-clerk-id/:clerkUserId
     * 
     * @param clerkUserId - Clerk user ID (format: user_XXXXXXXXXX)
     * @returns Email address or null if not found
     */
    async getEmailByClerkUserId(clerkUserId: string): Promise<string | null> {
        try {
            const response = await this.services.getIdentityService()
                .get<any>(`/users/by-clerk-id/${clerkUserId}`);
            
            const user = response.data || response;
            
            if (!user?.email) {
                this.logger.warn(
                    { clerkUserId },
                    'User found by Clerk ID but no email address'
                );
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
     * 1. Fetch recruiter from network service (GET /recruiters/:id)
     * 2. Extract user_id from recruiter
     * 3. Fetch user email from identity service (GET /users/:id)
     * 
     * @param recruiterId - Recruiter ID from network.recruiters.id
     * @returns Email address or null if not found
     */
    async getRecruiterEmail(recruiterId: string): Promise<string | null> {
        try {
            // Fetch recruiter
            const recruiterResponse = await this.services.getNetworkService()
                .get<any>(`/recruiters/${recruiterId}`);
            const recruiter = recruiterResponse.data || recruiterResponse;

            if (!recruiter?.user_id) {
                this.logger.warn({ recruiterId }, 'Recruiter found but no user_id');
                return null;
            }

            // Fetch user email by internal UUID
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
     * 1. Fetch candidate from ATS service (GET /candidates/:id)
     * 2. If candidate.user_id exists, fetch user email from identity service
     * 3. Otherwise, use candidate.email directly (legacy candidates without accounts)
     * 
     * @param candidateId - Candidate ID from ats.candidates.id
     * @returns Email address or null if not found
     */
    async getCandidateEmail(candidateId: string): Promise<string | null> {
        try {
            // Fetch candidate
            const candidateResponse = await this.services.getAtsService()
                .get<any>(`/candidates/${candidateId}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Check if candidate has user account
            if (candidate?.user_id) {
                return await this.getEmailByUserId(candidate.user_id);
            }

            // Fallback: candidate may have email directly (legacy data)
            if (candidate?.email) {
                this.logger.info(
                    { candidateId },
                    'Using candidate email directly (no user account)'
                );
                return candidate.email;
            }

            this.logger.warn(
                { candidateId },
                'Candidate has no user account or email'
            );
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
     * 1. Fetch organization memberships (GET /organizations/:id/memberships)
     * 2. Filter for company_admin role
     * 3. Fetch email for each admin user
     * 
     * @param organizationId - Organization ID from identity.organizations.id
     * @returns Array of email addresses (empty if none found)
     */
    async getCompanyAdminEmails(organizationId: string): Promise<string[]> {
        try {
            // Fetch organization memberships
            const membershipsResponse = await this.services.getIdentityService()
                .get<any>(`/organizations/${organizationId}/memberships`);
            
            const memberships = membershipsResponse.data || membershipsResponse;

            if (!Array.isArray(memberships)) {
                this.logger.warn(
                    { organizationId },
                    'No memberships found for organization'
                );
                return [];
            }

            // Filter for company_admin role
            const adminMemberships = memberships.filter(
                (m: any) => m.role === 'company_admin'
            );

            if (adminMemberships.length === 0) {
                this.logger.warn(
                    { organizationId },
                    'No company admins found for organization'
                );
                return [];
            }

            // Fetch emails for all admins
            const emails: string[] = [];
            for (const membership of adminMemberships) {
                if (membership.user_id) {
                    const email = await this.getEmailByUserId(membership.user_id);
                    if (email) {
                        emails.push(email);
                    }
                }
            }

            this.logger.info(
                { organizationId, adminCount: emails.length },
                'Fetched company admin emails'
            );

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
            const response = await this.services.getIdentityService()
                .get<any>(`/users/${userId}`);
            
            const user = response.data || response;
            
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
