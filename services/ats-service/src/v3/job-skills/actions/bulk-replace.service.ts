/**
 * Bulk Replace Job Skills Action Service
 */

import { BadRequestError } from '@splits-network/shared-fastify';
import { BulkReplaceSkillsRepository, BulkSkillItem } from './bulk-replace.repository.js';

export class BulkReplaceSkillsService {
  constructor(private repository: BulkReplaceSkillsRepository) {}

  async bulkReplace(jobId: string, skills: BulkSkillItem[]) {
    if (!jobId) throw new BadRequestError('job_id is required');
    if (!Array.isArray(skills)) throw new BadRequestError('skills must be an array');

    for (let i = 0; i < skills.length; i++) {
      if (!skills[i].skill_id) {
        throw new BadRequestError(`Skill ${i + 1}: skill_id is required`);
      }
    }

    return this.repository.bulkReplace(jobId, skills);
  }
}
