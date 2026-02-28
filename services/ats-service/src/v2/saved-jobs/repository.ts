import { Database } from '@splits-network/shared-types';
import { SupabaseClient } from '@supabase/supabase-js';
import { SavedJobFilters } from './types';
import { resolveAccessContext } from '../shared/access';

export class SavedJobRepositoryV2 {
    constructor(private supabase: SupabaseClient<Database>) { }

    async list(clerkUserId: string, filters: SavedJobFilters) {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        const query = this.supabase
            .from('candidate_saved_jobs')
            .select(`
                *,
                job:jobs(
                    *,
                    company:companies(*)
                )
            `, { count: 'exact' });

        // Only candidates should be accessing their saved jobs, essentially.   
        // Even if role is different, filter by user id for own viewing.        
        if (context.roles.includes('candidate')) {
            if (context.candidateId) {
                query.eq('candidate_id', context.candidateId);
            } else {
                query.eq('candidate_id', '00000000-0000-0000-0000-000000000000'); // Force none if no candidate profile
            }
        } else if (context.roles.includes('recruiter') || context.roles.includes('company_admin') || context.roles.includes('hiring_manager')) {
            // Probably doesn't make sense for a recruiter to see personal saves,
            // but just in case, block it or limit access
            if (filters.candidate_id) {
                query.eq('candidate_id', filters.candidate_id);
            }
        } else if (!context.isPlatformAdmin) {
            // Default fallback: you can only see saves linked to candidates you own.
            if (context.candidateId) {
                query.eq('candidate_id', context.candidateId);
            } else {
                query.eq('candidate_id', '00000000-0000-0000-0000-000000000000');
            }
        }

        if (filters.job_id) {
            query.eq('job_id', filters.job_id);
        }

        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const rangeStart = (page - 1) * limit;
        const rangeEnd = rangeStart + limit - 1;

        if (filters.sort_by) {
            query.order(filters.sort_by as any, { ascending: filters.sort_order === 'asc' });
        } else {
            query.order('created_at', { ascending: false });
        }

        query.range(rangeStart, rangeEnd);

        const result = await query;
        console.log(`[SavedJobs] List fetched for ${clerkUserId}, count: ${result.data?.length}, total: ${result.count}`);
        if (result.error) console.error(`[SavedJobs] DB error:`, result.error);

        return {
            data: result.data || [],
            total: result.count || 0
        };
    }

    async getById(clerkUserId: string, id: string) {
        // Find by id
        const context = await resolveAccessContext(this.supabase, clerkUserId);
        const query = this.supabase
            .from('candidate_saved_jobs')
            .select(`*, job:jobs(*, company:companies(*))`)
            .eq('id', id);

        if (context.roles.includes('candidate')) {
            if (context.candidateId) {
                query.eq('candidate_id', context.candidateId);
            } else {
                query.eq('candidate_id', '00000000-0000-0000-0000-000000000000');
            }
        } else if (!context.isPlatformAdmin) {
            if (context.candidateId) query.eq('candidate_id', context.candidateId);
        }

        const result = await query.single();
        return { data: result.data, error: result.error };
    }

    async getByJobId(clerkUserId: string, job_id: string) {
        const result = await this.list(clerkUserId, { job_id, page: 1, limit: 1 });
        const item = result.data.length > 0 ? result.data[0] : null;
        return { data: item, error: item ? null : new Error('Not found') };
    }

    async create(clerkUserId: string, data: { candidate_id: string; job_id: string }) {
        const result = await this.supabase
            .from('candidate_saved_jobs')
            .insert({
                candidate_id: data.candidate_id,
                job_id: data.job_id
            } as any)
            .select()
            .single();

        if (result.error) {
            throw new Error('Failed to create saved job: ' + result.error.message);
        }

        return result.data;
    }

    async delete(clerkUserId: string, id: string) {
        // Enforce ownership by getting first
        const savedJob = await this.getById(clerkUserId, id);
        if (!savedJob.data) {
            throw new Error('Not found or forbidden');
        }

        const result = await this.supabase
            .from('candidate_saved_jobs')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (result.error) {
            throw new Error('Failed to delete saved job: ' + result.error.message);
        }

        return result.data;
    }
}
