import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConsentRecord, SaveConsentRequest } from './types';

export class ConsentRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async findConsentByUserId(userId: string): Promise<ConsentRecord | null> {
        const { data, error } = await this.supabase
            .schema('identity')
            .from('user_consent')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return (data as ConsentRecord) || null;
    }

    async upsertConsent(userId: string, request: SaveConsentRequest): Promise<ConsentRecord> {
        const { data, error } = await this.supabase
            .schema('identity')
            .from('user_consent')
            .upsert(
                {
                    user_id: userId,
                    necessary: true,
                    functional: request.preferences.functional,
                    analytics: request.preferences.analytics,
                    marketing: request.preferences.marketing,
                    ip_address: request.ip_address || null,
                    user_agent: request.user_agent || null,
                    consent_source: request.consent_source || 'web',
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id' }
            )
            .select()
            .single();

        if (error) throw error;
        return data as ConsentRecord;
    }

    async deleteConsent(userId: string): Promise<void> {
        const { error } = await this.supabase
            .schema('identity')
            .from('user_consent')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
    }
}
