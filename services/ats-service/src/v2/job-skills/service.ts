import { JobSkillRepository } from './repository.js';

export class JobSkillService {
    constructor(private repository: JobSkillRepository) {}

    async listByJobId(jobId: string) {
        if (!jobId) throw new Error('job_id is required');
        return this.repository.listByJobId(jobId);
    }

    async addSkill(jobId: string, skillId: string, isRequired: boolean = true) {
        if (!jobId) throw new Error('job_id is required');
        if (!skillId) throw new Error('skill_id is required');
        return this.repository.add(jobId, skillId, isRequired);
    }

    async removeSkill(jobId: string, skillId: string) {
        if (!jobId) throw new Error('job_id is required');
        if (!skillId) throw new Error('skill_id is required');
        return this.repository.remove(jobId, skillId);
    }

    async bulkReplace(jobId: string, skills: Array<{ skill_id: string; is_required: boolean }>) {
        if (!jobId) throw new Error('job_id is required');
        if (!Array.isArray(skills)) throw new Error('skills must be an array');

        for (let i = 0; i < skills.length; i++) {
            if (!skills[i].skill_id) {
                throw new Error(`Skill ${i + 1}: skill_id is required`);
            }
        }

        return this.repository.bulkReplace(jobId, skills);
    }
}
