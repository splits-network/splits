/**
 * Recruiter Activity Repository
 * Direct Supabase queries for recruiter activity feed
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RecruiterActivity, CreateActivityInput } from './types';

export class RecruiterActivityRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    async findByRecruiterId(recruiterId: string, limit: number = 5): Promise<RecruiterActivity[]> {
        const { data, error } = await this.supabase
            .from('recruiter_activity')
            .select('id, recruiter_id, activity_type, description, metadata, created_at')
            .eq('recruiter_id', recruiterId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return (data || []) as RecruiterActivity[];
    }

    async createActivity(input: CreateActivityInput): Promise<RecruiterActivity> {
        const { data, error } = await this.supabase
            .from('recruiter_activity')
            .insert({
                recruiter_id: input.recruiter_id,
                activity_type: input.activity_type,
                description: input.description,
                metadata: input.metadata || {},
            })
            .select()
            .single();

        if (error) throw error;
        return data as RecruiterActivity;
    }
}
