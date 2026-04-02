import { SupabaseClient } from '@supabase/supabase-js';
import { FirmStripeAccount } from './types.js';

export class FirmStripeConnectRepository {
    constructor(private supabase: SupabaseClient) { }

    async getByFirmId(firmId: string): Promise<FirmStripeAccount | null> {
        const { data, error } = await this.supabase
            .from('firm_stripe_accounts')
            .select('*')
            .eq('firm_id', firmId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to fetch firm stripe account: ${error.message}`);
        }

        return data as FirmStripeAccount;
    }

    async create(firmId: string, accountId: string): Promise<FirmStripeAccount> {
        const { data, error } = await this.supabase
            .from('firm_stripe_accounts')
            .insert({
                firm_id: firmId,
                stripe_connect_account_id: accountId,
                stripe_connect_onboarded: false,
            })
            .select('*')
            .single();

        if (error) {
            throw new Error(`Failed to create firm stripe account: ${error.message}`);
        }

        return data as FirmStripeAccount;
    }

    async updateConnectStatus(
        firmId: string,
        onboarded: boolean,
        onboardedAt: string | null
    ): Promise<void> {
        const { error } = await this.supabase
            .from('firm_stripe_accounts')
            .update({
                stripe_connect_onboarded: onboarded,
                onboarded_at: onboardedAt,
                updated_at: new Date().toISOString(),
            })
            .eq('firm_id', firmId);

        if (error) {
            throw new Error(`Failed to update firm connect status: ${error.message}`);
        }
    }
}
