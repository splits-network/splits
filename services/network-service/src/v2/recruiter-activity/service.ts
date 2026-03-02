/**
 * Recruiter Activity Service - Business logic for recruiter activity feed
 */

import { RecruiterActivityRepository } from './repository';
import { RecruiterActivity, CreateActivityInput } from './types';

export class RecruiterActivityService {
    constructor(private repository: RecruiterActivityRepository) {}

    async getRecentActivity(recruiterId: string, limit: number = 5): Promise<RecruiterActivity[]> {
        return this.repository.findByRecruiterId(recruiterId, limit);
    }

    async recordActivity(input: CreateActivityInput): Promise<RecruiterActivity> {
        return this.repository.createActivity(input);
    }
}
