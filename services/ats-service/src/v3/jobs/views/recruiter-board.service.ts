/**
 * Recruiter Board View Service
 * Subscription tier gating, assigned filter, skill/app enrichment
 */

import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterBoardRepository } from './recruiter-board.repository.js';
import { RecruiterSavedJobRepository } from '../../recruiter-saved-jobs/repository.js';
import { JobListParams } from '../types.js';

export class RecruiterBoardService {
    private accessResolver: AccessContextResolver;
    private savedJobRepo: RecruiterSavedJobRepository;

    constructor(
        private repository: RecruiterBoardRepository,
        supabase: SupabaseClient
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
        this.savedJobRepo = new RecruiterSavedJobRepository(supabase);
    }

    async getBoard(params: JobListParams, clerkUserId: string) {
        const context = await this.accessResolver.resolve(clerkUserId);

        // Debug logging to help with access issues
        console.log('[RecruiterBoard] Access context debug:', {
            clerkUserId,
            identityUserId: context.identityUserId,
            roles: context.roles,
            recruiterId: context.recruiterId,
            hasRecruiterRole: context.roles.includes('recruiter'),
            error: context.error
        });

        if (!context.recruiterId || !context.roles.includes('recruiter')) {
            // Provide more specific error messages for debugging
            if (!context.roles.includes('recruiter')) {
                throw new ForbiddenError('User does not have recruiter role. Current roles: ' + context.roles.join(', '));
            }
            if (!context.recruiterId) {
                throw new ForbiddenError('User has recruiter role but no recruiterId found');
            }
            throw new ForbiddenError('Recruiter role required for this view');
        }

        // Determine early access visibility based on subscription tier
        const tier = await this.repository.getRecruiterTier(context.recruiterId);
        const excludeEarlyAccess = tier !== 'partner';

        // Get involved job IDs and firm IDs for assigned filter
        let involvedJobIds: string[] | undefined;
        let recruiterFirmIds: string[] | undefined;
        if (params.job_owner_filter === 'assigned') {
            [involvedJobIds, recruiterFirmIds] = await Promise.all([
                this.repository.getInvolvedJobIds(context.recruiterId),
                this.repository.getRecruiterFirmIds(context.recruiterId),
            ]);
        }

        // Get saved job IDs for saved filter
        let savedJobIds: string[] | undefined;
        if (params.job_owner_filter === 'saved') {
            savedJobIds = await this.savedJobRepo.findJobIdsByRecruiter(context.recruiterId);
            if (savedJobIds.length === 0) {
                const page = params.page || 1;
                const limit = Math.min(params.limit || 25, 100);
                return {
                    data: [],
                    pagination: { total: 0, page, limit, total_pages: 0 },
                };
            }
        }

        const { data: jobs, total } = await this.repository.findForBoard(
            params, context.recruiterId, excludeEarlyAccess, involvedJobIds, savedJobIds, recruiterFirmIds
        );

        // Batch-fetch enrichments
        const jobIds = jobs.map((j: any) => j.id);
        const [skillsMap, appCounts, savedMap] = await Promise.all([
            this.repository.batchFetchSkills(jobIds),
            this.repository.batchFetchApplicationCounts(jobIds),
            this.savedJobRepo.findSavedMapForJobs(context.recruiterId, jobIds),
        ]);

        const enriched = jobs.map((job: any) => ({
            ...job,
            skills: skillsMap[job.id] || [],
            application_count: appCounts[job.id] || 0,
            is_saved: savedMap.has(job.id),
            saved_record_id: savedMap.get(job.id) || null,
        }));

        const page = params.page || 1;
        const limit = Math.min(params.limit || 25, 100);
        return {
            data: enriched,
            pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
        };
    }
}
