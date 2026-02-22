import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
    ATSIntegration,
    ATSPlatform,
    ExternalEntityMap,
    SyncLog,
    SyncQueueItem,
    SyncEntityType,
} from '@splits-network/shared-types';

export class ATSRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    /* ── Integrations ─────────────────────────────────────────────────── */

    async listByCompany(companyId: string): Promise<ATSIntegration[]> {
        const { data, error } = await this.supabase
            .from('ats_integrations')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data ?? [];
    }

    async findById(id: string): Promise<ATSIntegration | null> {
        const { data, error } = await this.supabase
            .from('ats_integrations')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async findByCompanyAndPlatform(companyId: string, platform: ATSPlatform): Promise<ATSIntegration | null> {
        const { data, error } = await this.supabase
            .from('ats_integrations')
            .select('*')
            .eq('company_id', companyId)
            .eq('platform', platform)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async create(integration: Omit<ATSIntegration, 'id' | 'created_at' | 'updated_at'>): Promise<ATSIntegration> {
        const { data, error } = await this.supabase
            .from('ats_integrations')
            .insert(integration)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, updates: Partial<ATSIntegration>): Promise<ATSIntegration> {
        const { data, error } = await this.supabase
            .from('ats_integrations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('ats_integrations')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    /* ── Entity Mapping ───────────────────────────────────────────────── */

    async findMapping(
        integrationId: string,
        entityType: SyncEntityType,
        internalId: string,
    ): Promise<ExternalEntityMap | null> {
        const { data, error } = await this.supabase
            .from('ats_entity_map')
            .select('*')
            .eq('integration_id', integrationId)
            .eq('entity_type', entityType)
            .eq('internal_id', internalId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async findMappingByExternal(
        integrationId: string,
        entityType: SyncEntityType,
        externalId: string,
    ): Promise<ExternalEntityMap | null> {
        const { data, error } = await this.supabase
            .from('ats_entity_map')
            .select('*')
            .eq('integration_id', integrationId)
            .eq('entity_type', entityType)
            .eq('external_id', externalId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async upsertMapping(mapping: Omit<ExternalEntityMap, 'id' | 'created_at' | 'updated_at'>): Promise<ExternalEntityMap> {
        const { data, error } = await this.supabase
            .from('ats_entity_map')
            .upsert(mapping, { onConflict: 'integration_id,entity_type,internal_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /* ── Sync Log ─────────────────────────────────────────────────────── */

    async createSyncLog(log: Omit<SyncLog, 'id' | 'synced_at'>): Promise<SyncLog> {
        const { data, error } = await this.supabase
            .from('ats_sync_log')
            .insert(log)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async listSyncLogs(
        integrationId: string,
        opts: { limit?: number; offset?: number; status?: string } = {},
    ): Promise<SyncLog[]> {
        let query = this.supabase
            .from('ats_sync_log')
            .select('*')
            .eq('integration_id', integrationId)
            .order('synced_at', { ascending: false });

        if (opts.status) query = query.eq('status', opts.status);
        if (opts.limit) query = query.limit(opts.limit);
        if (opts.offset) query = query.range(opts.offset, opts.offset + (opts.limit ?? 50) - 1);

        const { data, error } = await query;
        if (error) throw error;
        return data ?? [];
    }

    /* ── Sync Queue ───────────────────────────────────────────────────── */

    async enqueue(item: Omit<SyncQueueItem, 'id' | 'created_at'>): Promise<SyncQueueItem> {
        const { data, error } = await this.supabase
            .from('ats_sync_queue')
            .insert(item)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async dequeuePending(integrationId: string, limit: number = 10): Promise<SyncQueueItem[]> {
        const { data, error } = await this.supabase
            .from('ats_sync_queue')
            .select('*')
            .eq('integration_id', integrationId)
            .eq('status', 'pending')
            .order('priority')
            .order('scheduled_at')
            .limit(limit);

        if (error) throw error;
        return data ?? [];
    }

    async updateQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
        const { error } = await this.supabase
            .from('ats_sync_queue')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    }

    /* ── Stats ────────────────────────────────────────────────────────── */

    async getSyncStats(integrationId: string): Promise<{
        total_syncs: number;
        successful_syncs: number;
        failed_syncs: number;
        pending_queue_items: number;
    }> {
        const [logsRes, pendingRes] = await Promise.all([
            this.supabase
                .from('ats_sync_log')
                .select('status', { count: 'exact' })
                .eq('integration_id', integrationId),
            this.supabase
                .from('ats_sync_queue')
                .select('*', { count: 'exact', head: true })
                .eq('integration_id', integrationId)
                .eq('status', 'pending'),
        ]);

        const logs = logsRes.data ?? [];
        const total = logsRes.count ?? 0;
        const successful = logs.filter(l => l.status === 'success').length;
        const failed = logs.filter(l => l.status === 'failed').length;

        return {
            total_syncs: total,
            successful_syncs: successful,
            failed_syncs: failed,
            pending_queue_items: pendingRes.count ?? 0,
        };
    }
}
