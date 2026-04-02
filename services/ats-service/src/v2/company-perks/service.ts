import { CompanyPerkRepository } from './repository.js';

export class CompanyPerkService {
    constructor(private repository: CompanyPerkRepository) {}

    async listByCompanyId(companyId: string) {
        if (!companyId) throw new Error('company_id is required');
        return this.repository.listByCompanyId(companyId);
    }

    async bulkReplace(companyId: string, perks: Array<{ perk_id: string }>) {
        if (!companyId) throw new Error('company_id is required');
        if (!Array.isArray(perks)) throw new Error('perks must be an array');

        if (perks.length > 30) {
            throw new Error('Maximum 30 perks per company');
        }

        for (let i = 0; i < perks.length; i++) {
            if (!perks[i].perk_id) {
                throw new Error(`Perk ${i + 1}: perk_id is required`);
            }
        }

        return this.repository.bulkReplace(companyId, perks);
    }
}
