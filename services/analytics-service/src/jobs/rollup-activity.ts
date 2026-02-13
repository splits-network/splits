import { SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { ActivityService } from '../v2/activity/service';

/**
 * Snapshot current online activity to the analytics.activity_snapshots table.
 * Runs every 5 minutes via cron.
 */
export async function rollupActivitySnapshot(
    redis: Redis,
    supabase: SupabaseClient,
): Promise<void> {
    const activityService = new ActivityService(redis);
    const snapshot = await activityService.getSnapshot();

    const { error } = await supabase.schema('analytics').from('activity_snapshots').insert({
        total_online: snapshot.total_online,
        portal_online: snapshot.by_app.portal,
        candidate_online: snapshot.by_app.candidate,
        corporate_online: snapshot.by_app.corporate,
        authenticated_online: snapshot.authenticated,
        anonymous_online: snapshot.anonymous,
        snapshot_at: new Date().toISOString(),
    });

    if (error) {
        throw new Error(`Failed to insert activity snapshot: ${error.message}`);
    }
}
