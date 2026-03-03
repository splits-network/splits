import { CompanySkillRepository } from './repository';

export class CompanySkillService {
    constructor(private repository: CompanySkillRepository) {}

    async listByCompanyId(companyId: string) {
        if (!companyId) throw new Error('company_id is required');
        return this.repository.listByCompanyId(companyId);
    }

    async bulkReplace(companyId: string, skills: Array<{ skill_id: string }>) {
        if (!companyId) throw new Error('company_id is required');
        if (!Array.isArray(skills)) throw new Error('skills must be an array');

        if (skills.length > 50) {
            throw new Error('Maximum 50 skills per company');
        }

        for (let i = 0; i < skills.length; i++) {
            if (!skills[i].skill_id) {
                throw new Error(`Skill ${i + 1}: skill_id is required`);
            }
        }

        return this.repository.bulkReplace(companyId, skills);
    }
}
