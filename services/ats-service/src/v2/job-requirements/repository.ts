import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { JobRequirementBulkItem } from '../types';

export class JobRequirementRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    async list(jobId?: string) {
        if (!jobId) {
            throw new Error('job_id query parameter is required');
        }

        const { data, error } = await this.supabase

            .from('job_requirements')
            .select('*')
            .eq('job_id', jobId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async getById(id: string) {
        const { data, error } = await this.supabase

            .from('job_requirements')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            throw new Error('Requirement not found');
        }
        return data;
    }

    async createRequirement(payload: any) {
        const { data, error } = await this.supabase

            .from('job_requirements')
            .insert(payload)
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }

    async updateRequirement(id: string, payload: any) {
        const { data, error } = await this.supabase

            .from('job_requirements')
            .update(payload)
            .eq('id', id)
            .select('*')
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            throw new Error('Requirement not found');
        }
        return data;
    }

    async deleteRequirement(id: string): Promise<void> {
        const { error } = await this.supabase

            .from('job_requirements')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    /**
     * Bulk replace all requirements for a job using stored procedure
     * This performs atomic delete + insert to avoid intermediate states
     */
    async bulkReplaceByJob(jobId: string, requirements: JobRequirementBulkItem[]): Promise<any[]> {
        // Validate job_id
        if (!jobId) {
            throw new Error('job_id is required');
        }

        // Use the stored procedure for atomic operation
        const { data, error } = await this.supabase
            .rpc('bulk_replace_job_requirements', {
                p_job_id: jobId,
                p_requirements: JSON.stringify(requirements)
            });

        if (error) {
            console.error('Bulk replace job requirements failed:', error);
            throw error;
        }

        return data || [];
    }
}
