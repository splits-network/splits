/**
 * Webhooks Service
 * Handles Clerk webhook event processing
 */

import { IdentityRepository } from '../../repository';
import { UsersService } from '../users/service';

export class WebhooksService {
    private usersService: UsersService;

    constructor(private repository: IdentityRepository) {
        this.usersService = new UsersService(repository);
    }

    async handleUserCreatedOrUpdated(
        id: string,
        email: string,
        firstName: string | null,
        lastName: string | null
    ): Promise<void> {
        const name = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];
        await this.usersService.syncClerkUser(id, email, name);
    }

    async handleUserDeleted(id: string): Promise<void> {
        // For now, we just log it. In production, consider soft-delete or anonymization
        // TODO: Implement user deletion or anonymization if required
        console.log(`User deleted in Clerk: ${id} (consider cleanup)`);
    }
}
