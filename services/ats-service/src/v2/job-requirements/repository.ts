import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class JobRequirementRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async list(jobId?: string) {
        if (!jobId) {
            throw new Error('job_id query parameter is required');
        }

        const { data, error } = await this.supabase
            .schema('ats')
            .from('job_requirements')
            .select('*')
            .eq('job_id', jobId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async getById(id: string) {
        const { data, error } = await this.supabase
            .schema('ats')
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
            .schema('ats')
            .from('job_requirements')
            .insert(payload)
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }

    async updateRequirement(id: string, payload: any) {
        const { data, error } = await this.supabase
            .schema('ats')
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
            .schema('ats')
            .from('job_requirements')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
