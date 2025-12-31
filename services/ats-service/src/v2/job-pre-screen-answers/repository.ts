import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class JobPreScreenAnswerRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async list(applicationId?: string) {
        if (!applicationId) {
            throw new Error('application_id query parameter is required');
        }

        const { data, error } = await this.supabase
            .schema('ats')
            .from('job_pre_screen_answers')
            .select(
                `
                *,
                question:job_pre_screen_questions(*)
            `
            )
            .eq('application_id', applicationId);

        if (error) throw error;
        return data || [];
    }

    async getById(id: string) {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('job_pre_screen_answers')
            .select(
                `
                *,
                question:job_pre_screen_questions(*)
            `
            )
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            throw new Error('Answer not found');
        }
        return data;
    }

    async upsertAnswers(answers: Array<{ application_id: string; question_id: string; answer: any }>) {
        if (!answers || answers.length === 0) {
            return [];
        }

        const { data, error } = await this.supabase
            .schema('ats')
            .from('job_pre_screen_answers')
            .upsert(answers, { onConflict: 'application_id,question_id' })
            .select();

        if (error) throw error;
        return data || [];
    }

    async updateAnswer(id: string, payload: { answer: any }) {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('job_pre_screen_answers')
            .update({ answer: payload.answer })
            .eq('id', id)
            .select()
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            throw new Error('Answer not found');
        }
        return data;
    }

    async deleteAnswer(id: string): Promise<void> {
        const { error } = await this.supabase
            .schema('ats')
            .from('job_pre_screen_answers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
