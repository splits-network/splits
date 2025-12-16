/**
 * Users Service
 * Handles user profile and Clerk synchronization
 */

import { IdentityRepository } from '../../repository';
import { User } from '@splits-network/shared-types';
import { UserProfileDTO, MembershipDTO } from '@splits-network/shared-types';

export class UsersService {
    constructor(private repository: IdentityRepository) {}

    async syncClerkUser(
        clerkUserId: string,
        email: string,
        name: string
    ): Promise<User> {
        // Check if user already exists
        let user = await this.repository.findUserByClerkId(clerkUserId);

        if (user) {
            // Update if email or name changed
            if (user.email !== email || user.name !== name) {
                user = await this.repository.updateUser(user.id, { email, name });
            }
            return user;
        }

        // Create new user
        return await this.repository.createUser({
            clerk_user_id: clerkUserId,
            email,
            name,
        });
    }

    async getUserProfile(userId: string): Promise<UserProfileDTO> {
        const user = await this.repository.findUserById(userId);
        if (!user) {
            throw new Error(`User ${userId} not found`);
        }

        const memberships = await this.repository.findMembershipsByUserId(userId);

        const membershipDTOs: MembershipDTO[] = [];
        for (const membership of memberships) {
            const org = await this.repository.findOrganizationById(
                membership.organization_id
            );
            if (org) {
                membershipDTOs.push({
                    id: membership.id,
                    organization_id: org.id,
                    organization_name: org.name,
                    role: membership.role,
                });
            }
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            memberships: membershipDTOs,
        };
    }
}
