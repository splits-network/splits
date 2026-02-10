import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { JobPreScreenQuestionBulkItem } from '../types';

export class JobPreScreenQuestionRepository {
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

            .from('job_pre_screen_questions')
            .insert(payload)
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }

    async updateQuestion(id: string, payload: any) {
        const { data, error } = await this.supabase

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

            .from('job_pre_screen_questions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    /**
     * Bulk replace all pre-screen questions for a job using stored procedure
     * This performs atomic delete + insert to avoid intermediate states
     */
    async bulkReplaceByJob(jobId: string, questions: JobPreScreenQuestionBulkItem[]): Promise<any[]> {
        // Validate job_id
        if (!jobId) {
            throw new Error('job_id is required');
        }

        // Use the stored procedure for atomic operation
        const { data, error } = await this.supabase
            .rpc('bulk_replace_job_pre_screen_questions', {
                p_job_id: jobId,
                p_questions: JSON.stringify(questions)
            });

        if (error) {
            console.error('Bulk replace job pre-screen questions failed:', error);
            throw error;
        }

        // Map to include question_text for API compatibility
        return (data || []).map((question: any) => ({
            ...question,
            question_text: question.question,
        }));
    }
}
