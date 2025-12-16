import { AtsRepository } from '../../repository';
import { Job } from '@splits-network/shared-types';

export class JobService {
    constructor(private repository: AtsRepository) {}

    async getJobs(filters?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<Job[]> {
        const jobs = await this.repository.findJobs(filters);

        // Enrich with company data
        const enrichedJobs = await Promise.all(
            jobs.map(async (job) => {
                const company = await this.repository.findCompanyById(job.company_id);
                return { ...job, company: company ?? undefined };
            })
        );

        return enrichedJobs;
    }

    async getJobById(id: string): Promise<Job> {
        const job = await this.repository.findJobById(id);
        if (!job) {
            throw new Error(`Job ${id} not found`);
        }

        // Enrich with company data
        const company = await this.repository.findCompanyById(job.company_id);
        return { ...job, company: company ?? undefined };
    }

    async getJobsByCompanyId(companyId: string): Promise<Job[]> {
        return await this.repository.findJobsByCompanyId(companyId);
    }

    async getJobsByIds(ids: string[]): Promise<Job[]> {
        return await this.repository.findJobsByIds(ids);
    }

    async createJob(
        companyId: string,
        title: string,
        feePercentage: number,
        options: {
            department?: string;
            location?: string;
            salary_min?: number;
            salary_max?: number;
            description?: string;
            status?: 'active' | 'paused' | 'filled' | 'closed';
        } = {}
    ): Promise<Job> {
        return await this.repository.createJob({
            company_id: companyId,
            title,
            fee_percentage: feePercentage,
            department: options.department,
            location: options.location,
            salary_min: options.salary_min,
            salary_max: options.salary_max,
            description: options.description,
            status: options.status || 'active',
        });
    }

    async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
        return await this.repository.updateJob(id, updates);
    }
}
