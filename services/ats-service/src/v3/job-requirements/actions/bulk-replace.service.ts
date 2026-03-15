/**
 * Bulk Replace Requirements Action Service
 */

import { BadRequestError } from '@splits-network/shared-fastify';
import { BulkReplaceRequirementsRepository, BulkRequirementItem } from './bulk-replace.repository';

export class BulkReplaceRequirementsService {
  constructor(private repository: BulkReplaceRequirementsRepository) {}

  async bulkReplace(jobId: string, requirements: BulkRequirementItem[]) {
    if (!jobId) throw new BadRequestError('job_id is required');
    if (!Array.isArray(requirements)) throw new BadRequestError('requirements must be an array');

    for (let i = 0; i < requirements.length; i++) {
      const r = requirements[i];
      if (!r.requirement_type) {
        throw new BadRequestError(`Requirement ${i + 1}: requirement_type is required`);
      }
      if (!r.description) {
        throw new BadRequestError(`Requirement ${i + 1}: description is required`);
      }
      if (r.sort_order === undefined || r.sort_order === null) {
        throw new BadRequestError(`Requirement ${i + 1}: sort_order is required`);
      }
    }

    return this.repository.bulkReplace(jobId, requirements);
  }
}
