/**
 * Recruiter Activity V3 Service — Business Logic
 *
 * Internal-only service (no routes). Used by other services
 * to record and retrieve recruiter activity.
 */

import { RecruiterActivityRepository } from './repository.js';
import { RecruiterActivity, CreateActivityInput } from './types.js';

export class RecruiterActivityService {
  constructor(private repository: RecruiterActivityRepository) {}

  async getRecentActivity(recruiterId: string, limit = 5): Promise<RecruiterActivity[]> {
    return this.repository.findByRecruiterId(recruiterId, limit);
  }

  async recordActivity(input: CreateActivityInput): Promise<RecruiterActivity> {
    return this.repository.create(input);
  }
}
