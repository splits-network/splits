import { NetworkRepository } from '../../repository';
import { RoleAssignment } from '@splits-network/shared-types';

/**
 * Assignment Service
 * Handles job-recruiter role assignments and access control
 */
export class AssignmentService {
    constructor(private repository: NetworkRepository) {}

    async getAssignedJobsForRecruiter(recruiterId: string): Promise<string[]> {
        const assignments = await this.repository.findRoleAssignmentsByRecruiterId(recruiterId);
        return assignments.map((a) => a.job_id);
    }

    async getAssignedRecruitersForJob(jobId: string): Promise<string[]> {
        const assignments = await this.repository.findRoleAssignmentsByJobId(jobId);
        return assignments.map((a) => a.recruiter_id);
    }

    async isRecruiterAssignedToJob(jobId: string, recruiterId: string): Promise<boolean> {
        const assignment = await this.repository.findRoleAssignment(jobId, recruiterId);
        return assignment !== null;
    }

    async assignRecruiterToJob(
        jobId: string,
        recruiterId: string,
        assignedBy?: string
    ): Promise<RoleAssignment> {
        // Verify recruiter exists and is active
        const recruiter = await this.repository.findRecruiterById(recruiterId);
        if (!recruiter) {
            throw new Error(`Recruiter ${recruiterId} not found`);
        }
        if (recruiter.status !== 'active') {
            throw new Error(`Recruiter ${recruiterId} is not active`);
        }

        // Check if already assigned
        const existing = await this.repository.findRoleAssignment(jobId, recruiterId);
        if (existing) {
            return existing;
        }

        return await this.repository.createRoleAssignment({
            job_id: jobId,
            recruiter_id: recruiterId,
            assigned_by: assignedBy,
        });
    }

    async unassignRecruiterFromJob(jobId: string, recruiterId: string): Promise<void> {
        await this.repository.deleteRoleAssignment(jobId, recruiterId);
    }
}
