import { AccessContext } from '../shared/access';
import { ConsentRepository } from './repository';
import { ConsentRecord, SaveConsentRequest } from './types';

export class ConsentServiceV2 {
    constructor(
        private repository: ConsentRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>
    ) {}

    private async requireIdentityUser(clerkUserId: string): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.identityUserId) {
            throw { statusCode: 404, message: 'Identity user not found' };
        }
        return access;
    }

    async getConsent(clerkUserId: string): Promise<ConsentRecord | null> {
        const access = await this.requireIdentityUser(clerkUserId);
        return this.repository.findConsentByUserId(access.identityUserId!);
    }

    async saveConsent(
        clerkUserId: string,
        request: SaveConsentRequest
    ): Promise<ConsentRecord> {
        const access = await this.requireIdentityUser(clerkUserId);
        if (!request.preferences) {
            throw { statusCode: 400, message: 'preferences are required' };
        }

        return this.repository.upsertConsent(access.identityUserId!, request);
    }

    async deleteConsent(clerkUserId: string): Promise<void> {
        const access = await this.requireIdentityUser(clerkUserId);
        await this.repository.deleteConsent(access.identityUserId!);
    }
}
