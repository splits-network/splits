import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NotificationPreference, PreferenceUpdate } from './types';

export class PreferenceRepositoryV2 {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' },
        });
    }

    async findByUserId(userId: string): Promise<NotificationPreference[]> {
        const { data, error } = await this.supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', userId)
            .order('category');

        if (error) throw error;
        return data || [];
    }

    async upsertPreference(
        userId: string,
        category: string,
        update: PreferenceUpdate,
    ): Promise<NotificationPreference> {
        const { data, error } = await this.supabase
            .from('notification_preferences')
            .upsert(
                {
                    user_id: userId,
                    category,
                    email_enabled: update.email_enabled ?? true,
                    in_app_enabled: update.in_app_enabled ?? true,
                },
                { onConflict: 'user_id,category' },
            )
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async bulkUpsert(
        userId: string,
        updates: Array<{ category: string; email_enabled: boolean; in_app_enabled: boolean }>,
    ): Promise<NotificationPreference[]> {
        const rows = updates.map((u) => ({
            user_id: userId,
            category: u.category,
            email_enabled: u.email_enabled,
            in_app_enabled: u.in_app_enabled,
        }));

        const { data, error } = await this.supabase
            .from('notification_preferences')
            .upsert(rows, { onConflict: 'user_id,category' })
            .select();

        if (error) throw error;
        return data || [];
    }
}
