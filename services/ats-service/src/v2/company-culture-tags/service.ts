import { CompanyCultureTagRepository } from './repository.js';

export class CompanyCultureTagService {
    constructor(private repository: CompanyCultureTagRepository) {}

    async listByCompanyId(companyId: string) {
        if (!companyId) throw new Error('company_id is required');
        return this.repository.listByCompanyId(companyId);
    }

    async bulkReplace(companyId: string, cultureTags: Array<{ culture_tag_id: string }>) {
        if (!companyId) throw new Error('company_id is required');
        if (!Array.isArray(cultureTags)) throw new Error('culture_tags must be an array');

        if (cultureTags.length > 20) {
            throw new Error('Maximum 20 culture tags per company');
        }

        for (let i = 0; i < cultureTags.length; i++) {
            if (!cultureTags[i].culture_tag_id) {
                throw new Error(`Culture tag ${i + 1}: culture_tag_id is required`);
            }
        }

        return this.repository.bulkReplace(companyId, cultureTags);
    }
}
