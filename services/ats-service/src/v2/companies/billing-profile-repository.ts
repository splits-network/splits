import { SupabaseClient } from '@supabase/supabase-js';

export interface BillingProfileSeed {
    company_id: string;
    billing_terms: 'immediate' | 'net_30' | 'net_60' | 'net_90';
    billing_email: string;
    invoice_delivery_method: 'email' | 'none';
}

export class BillingProfileRepository {
    constructor(private supabase: SupabaseClient) { }

    async upsert(profile: BillingProfileSeed): Promise<void> {
        const { error } = await this.supabase
            .from('company_billing_profiles')
            .upsert(profile, { onConflict: 'company_id' });

        if (error) {
            throw new Error(`Failed to upsert billing profile: ${error.message}`);
        }
    }
}
