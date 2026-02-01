import { SupabaseClient } from '@supabase/supabase-js';

export interface RecruiterConnectRecord {
    id: string;
    stripe_connect_account_id: string | null;
    stripe_connect_onboarded: boolean | null;
    stripe_connect_onboarded_at: string | null;
}

export class StripeConnectRepository {
    constructor(private supabase: SupabaseClient) { }

    async getRecruiterById(recruiterId: string): Promise<RecruiterConnectRecord | null> {
        const { data, error } = await this.supabase
            .from('recruiters')
            .select('id, stripe_connect_account_id, stripe_connect_onboarded, stripe_connect_onboarded_at')
            .eq('id', recruiterId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to fetch recruiter: ${error.message}`);
        }

        return data as RecruiterConnectRecord;
    }

    async setConnectAccount(recruiterId: string, accountId: string): Promise<void> {
        const { error } = await this.supabase
            .from('recruiters')
            .update({
                stripe_connect_account_id: accountId,
                stripe_connect_onboarded: false,
                stripe_connect_onboarded_at: null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', recruiterId);

        if (error) {
            throw new Error(`Failed to update recruiter connect account: ${error.message}`);
        }
    }

    async updateConnectStatus(
        recruiterId: string,
        onboarded: boolean,
        onboardedAt: string | null
    ): Promise<void> {
        const { error } = await this.supabase
            .from('recruiters')
            .update({
                stripe_connect_onboarded: onboarded,
                stripe_connect_onboarded_at: onboardedAt,
                updated_at: new Date().toISOString(),
            })
            .eq('id', recruiterId);

        if (error) {
            throw new Error(`Failed to update recruiter connect status: ${error.message}`);
        }
    }
}
