import { AtsRepository } from '../../repository';
import { EventPublisher } from '../../events';
import { Placement } from '@splits-network/shared-types';
import { ApplicationService } from '../applications/service';

export class PlacementService {
    constructor(
        private repository: AtsRepository,
        private eventPublisher: EventPublisher,
        private applicationService: ApplicationService
    ) {}

    async getPlacements(filters?: {
        recruiter_id?: string;
        company_id?: string;
        date_from?: string;
        date_to?: string;
    }): Promise<Placement[]> {
        return await this.repository.findAllPlacements(filters);
    }

    async getPlacementById(id: string): Promise<Placement> {
        const placement = await this.repository.findPlacementById(id);
        if (!placement) {
            throw new Error(`Placement ${id} not found`);
        }
        return placement;
    }

    async getPlacementsByRecruiterId(recruiterId: string): Promise<Placement[]> {
        return await this.repository.findPlacementsByRecruiterId(recruiterId);
    }

    async getPlacementsByCompanyId(companyId: string): Promise<Placement[]> {
        return await this.repository.findPlacementsByCompanyId(companyId);
    }

    async createPlacement(
        applicationId: string,
        salary: number,
        feePercentage: number
    ): Promise<Placement> {
        const application = await this.applicationService.getApplicationById(applicationId);
        const job = await this.repository.findJobById(application.job_id);
        
        if (!job) {
            throw new Error(`Job ${application.job_id} not found`);
        }

        if (!application.recruiter_id) {
            throw new Error('Application has no recruiter assigned');
        }

        // Calculate fee split (for Phase 1, simple 50/50 split)
        const feeAmount = (salary * feePercentage) / 100;
        const recruiterShare = feeAmount * 0.5;
        const platformShare = feeAmount * 0.5;

        const placement = await this.repository.createPlacement({
            job_id: job.id,
            candidate_id: application.candidate_id,
            company_id: job.company_id,
            recruiter_id: application.recruiter_id,
            application_id: applicationId,
            hired_at: new Date(),
            salary,
            fee_percentage: feePercentage,
            fee_amount: feeAmount,
            recruiter_share: recruiterShare,
            platform_share: platformShare,
        });

        // Update application stage to hired
        await this.applicationService.updateApplicationStage(applicationId, 'hired');

        // Publish event
        await this.eventPublisher.publish(
            'placement.created',
            {
                placement_id: placement.id,
                job_id: job.id,
                candidate_id: application.candidate_id,
                company_id: job.company_id,
                recruiter_id: application.recruiter_id,
                salary,
                fee_amount: feeAmount,
                recruiter_share: recruiterShare,
            },
            'ats-service'
        );

        return placement;
    }
}
