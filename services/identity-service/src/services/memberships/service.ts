/**
 * Memberships Service
 * Handles user-organization membership relationships
 */

import { IdentityRepository } from '../../repository';
import { Membership } from '@splits-network/shared-types';

export class MembershipsService {
    constructor(private repository: IdentityRepository) {}

    async addMembership(
        userId: string,
        organizationId: string,
        role: 'recruiter' | 'company_admin' | 'hiring_manager' | 'platform_admin'
    ): Promise<Membership> {
        return await this.repository.createMembership({
            user_id: userId,
            organization_id: organizationId,
            role,
        });
    }

    async removeMembership(membershipId: string): Promise<void> {
        await this.repository.deleteMembership(membershipId);
    }
}
