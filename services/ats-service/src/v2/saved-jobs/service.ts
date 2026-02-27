import { SavedJobRepositoryV2 } from './repository';
import { CreateSavedJobInput } from './types';
import { EventPublisher } from '../shared/events';
import { resolveAccessContext } from '../shared/access';
import { Database } from '@splits-network/shared-types';
import { SupabaseClient } from '@supabase/supabase-js';

export class SavedJobServiceV2 {
    constructor(
        private repository: SavedJobRepositoryV2,
        private events: EventPublisher,
        private supabase: SupabaseClient<Database>
    ) { }

    async create(clerkUserId: string, data: CreateSavedJobInput) {
        if (!data.job_id || typeof data.job_id !== 'string') {
            throw new Error('job_id is required and must be a string');
        }

        // Find the candidate_id for the current user
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        if (!context.candidateId) {
            throw new Error('Candidate profile not found for user');
        }

        // Check if already saved
        const existing = await this.repository.getByJobId(clerkUserId, data.job_id);
        if (existing.data) {
            return existing.data; // Idempotent
        }

        const savedJob = await this.repository.create(clerkUserId, {
            candidate_id: context.candidateId,
            job_id: data.job_id
        });

        // Fire event (optional but good practice)
        await this.events.publish('candidate_saved_job.created', {
            savedJobId: savedJob.id,
            candidateId: savedJob.candidate_id,
            jobId: savedJob.job_id
        });

        return savedJob;
    }

    async delete(clerkUserId: string, id: string) {
        const deleted = await this.repository.delete(clerkUserId, id);

        await this.events.publish('candidate_saved_job.deleted', {
            savedJobId: deleted.id,
            candidateId: deleted.candidate_id,
            jobId: deleted.job_id
        });

        return deleted;
    }
}
