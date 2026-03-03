import { CandidateSkillRepository } from './repository';

export class CandidateSkillService {
    constructor(private repository: CandidateSkillRepository) {}

    async listByCandidateId(candidateId: string) {
        if (!candidateId) throw new Error('candidate_id is required');
        return this.repository.listByCandidateId(candidateId);
    }

    async addSkill(candidateId: string, skillId: string, source: string = 'manual') {
        if (!candidateId) throw new Error('candidate_id is required');
        if (!skillId) throw new Error('skill_id is required');
        return this.repository.add(candidateId, skillId, source);
    }

    async removeSkill(candidateId: string, skillId: string) {
        if (!candidateId) throw new Error('candidate_id is required');
        if (!skillId) throw new Error('skill_id is required');
        return this.repository.remove(candidateId, skillId);
    }

    async bulkReplace(candidateId: string, skills: Array<{ skill_id: string; source?: string }>) {
        if (!candidateId) throw new Error('candidate_id is required');
        if (!Array.isArray(skills)) throw new Error('skills must be an array');

        for (let i = 0; i < skills.length; i++) {
            if (!skills[i].skill_id) {
                throw new Error(`Skill ${i + 1}: skill_id is required`);
            }
        }

        return this.repository.bulkReplace(candidateId, skills);
    }
}
