import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class JobPreScreenQuestionRepository {
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
            .from('job_pre_screen_questions')
            .select('*')
            .eq('job_id', jobId)
            .order('sort_order', { ascending: true });

        if (error) throw error;

        return (data || []).map(question => ({
            ...question,
            question_text: question.question,
        }));
    }

    async getById(id: string) {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('job_pre_screen_questions')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            throw new Error('Question not found');
        }

        return {
            ...data,
            question_text: data.question,
        };
    }

    async createQuestion(payload: any) {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('job_pre_screen_questions')
            .insert(payload)
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }

    async updateQuestion(id: string, payload: any) {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('job_pre_screen_questions')
            .update(payload)
            .eq('id', id)
            .select('*')
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            throw new Error('Question not found');
        }
        return data;
    }

    async deleteQuestion(id: string): Promise<void> {
        const { error } = await this.supabase
            .schema('ats')
            .from('job_pre_screen_questions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
