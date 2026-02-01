import { SupabaseClient } from '@supabase/supabase-js';

export interface RecruiterConnectStatus {
    id: string;
    stripe_connect_account_id: string | null;
    stripe_connect_onboarded: boolean | null;
}

export class RecruiterConnectRepository {
    constructor(private supabase: SupabaseClient) { }

    async getStatus(recruiterId: string): Promise<RecruiterConnectStatus | null> {
        const { data, error } = await this.supabase
            .from('recruiters')
            .select('id, stripe_connect_account_id, stripe_connect_onboarded')
            .eq('id', recruiterId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to fetch recruiter connect status: ${error.message}`);
        }

        return data as RecruiterConnectStatus;
    }
}
