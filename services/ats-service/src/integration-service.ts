/**
 * ATS Integration Service (Phase 4C)
 * Manages ATS platform integrations and orchestrates syncs
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import type {
  ATSIntegration,
  ATSIntegrationWithStats,
  SyncLog,
  ExternalEntityMap,
  SyncQueueItem,
  SyncResult,
  ATSPlatform,
  SyncDirection,
} from '@splits-network/shared-types';
import { GreenhouseClient, GreenhouseSyncService } from './greenhouse-client';

export class ATSIntegrationService {
  private supabase: SupabaseClient;
  private encryptionKey: Buffer;

  constructor(supabaseUrl: string, supabaseKey: string, encryptionSecret: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    // Derive encryption key from secret (use first 32 bytes)
    this.encryptionKey = Buffer.from(encryptionSecret.padEnd(32, '0').slice(0, 32));
  }

  /**
   * Create new ATS integration
   */
  async createIntegration(params: {
    company_id: string;
    platform: ATSPlatform;
    api_key: string;
    api_base_url?: string;
    webhook_url?: string;
    config?: any;
  }): Promise<ATSIntegration> {
    // Encrypt API key
    const encryptedKey = this.encryptApiKey(params.api_key);

    const { data, error } = await this.supabase
      .from('ats.integrations')
      .insert({
        company_id: params.company_id,
        platform: params.platform,
        api_key_encrypted: encryptedKey,
        api_base_url: params.api_base_url,
        webhook_url: params.webhook_url,
        config: params.config || {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create integration: ${error.message}`);
    return data;
  }

  /**
   * Get integration by ID
   */
  async getIntegration(integrationId: string): Promise<ATSIntegration | null> {
    const { data, error } = await this.supabase
      .from('ats.integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get integration: ${error.message}`);
    }

    return data;
  }

  /**
   * Get integration by company and platform
   */
  async getIntegrationByCompanyPlatform(
    companyId: string,
    platform: ATSPlatform
  ): Promise<ATSIntegration | null> {
    const { data, error } = await this.supabase
      .from('ats.integrations')
      .select('*')
      .eq('company_id', companyId)
      .eq('platform', platform)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get integration: ${error.message}`);
    }

    return data;
  }

  /**
   * List integrations for a company
   */
  async listCompanyIntegrations(companyId: string): Promise<ATSIntegrationWithStats[]> {
    const { data, error } = await this.supabase
      .from('ats.integrations')
      .select('*')
      .eq('company_id', companyId);

    if (error) throw new Error(`Failed to list integrations: ${error.message}`);

    // Fetch stats for each integration
    const integrationsWithStats = await Promise.all(
      data.map(async (integration) => {
        const stats = await this.getIntegrationStats(integration.id);
        return {
          ...integration,
          ...stats,
        };
      })
    );

    return integrationsWithStats;
  }

  /**
   * Update integration
   */
  async updateIntegration(
    integrationId: string,
    updates: {
      sync_enabled?: boolean;
      sync_roles?: boolean;
      sync_candidates?: boolean;
      sync_applications?: boolean;
      webhook_url?: string;
      config?: any;
    }
  ): Promise<ATSIntegration> {
    const { data, error } = await this.supabase
      .from('ats.integrations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update integration: ${error.message}`);
    return data;
  }

  /**
   * Delete integration
   */
  async deleteIntegration(integrationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('ats.integrations')
      .delete()
      .eq('id', integrationId);

    if (error) throw new Error(`Failed to delete integration: ${error.message}`);
  }

  /**
   * Trigger sync for integration
   */
  async triggerSync(
    integrationId: string,
    direction: SyncDirection
  ): Promise<{ queued: number }> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) throw new Error('Integration not found');
    if (!integration.sync_enabled) throw new Error('Sync is disabled for this integration');

    // Queue sync items based on enabled sync types
    let queued = 0;

    if (integration.sync_roles && direction === 'inbound') {
      await this.queueSync({
        integration_id: integrationId,
        entity_type: 'role',
        entity_id: integrationId, // Bulk sync
        action: 'update',
        direction: 'inbound',
        priority: 5,
        payload: { bulk: true },
      });
      queued++;
    }

    return { queued };
  }

  /**
   * Execute sync for a queue item
   */
  async executeSync(queueItemId: string): Promise<SyncResult> {
    // Mark as processing
    await this.updateQueueItem(queueItemId, { status: 'processing' });

    try {
      // Fetch queue item
      const { data: queueItem, error: queueError } = await this.supabase
        .from('ats.sync_queue')
        .select('*')
        .eq('id', queueItemId)
        .single();

      if (queueError || !queueItem) throw new Error(`Failed to get queue item: ${queueError?.message || 'Not found'}`);

      // Fetch integration separately
      const { data: integration, error: integrationError } = await this.supabase
        .from('ats.integrations')
        .select('*')
        .eq('id', queueItem.integration_id)
        .single();

      if (integrationError || !integration) throw new Error(`Failed to get integration: ${integrationError?.message || 'Not found'}`);
      let result: SyncResult;

      // Execute sync based on platform
      switch (integration.platform) {
        case 'greenhouse':
          result = await this.executeGreenhouseSync(integration, queueItem);
          break;
        default:
          result = {
            success: false,
            entity_id: null,
            external_id: null,
            action: 'skipped',
            error: {
              code: 'UNSUPPORTED_PLATFORM',
              message: `Platform ${integration.platform} not supported`,
            },
          };
      }

      // Log sync result
      await this.logSync({
        integration_id: integration.id,
        entity_type: queueItem.entity_type,
        entity_id: result.entity_id || null,
        external_id: result.external_id || null,
        action: result.action,
        direction: queueItem.direction,
        status: result.success ? 'success' : 'failed',
        error_message: result.error?.message || null,
        error_code: result.error?.code || null,
        request_payload: queueItem.payload,
        response_payload: result.metadata,
        retry_count: queueItem.retry_count,
      });

      // Update queue item
      await this.updateQueueItem(queueItemId, {
        status: result.success ? 'completed' : 'failed',
        processed_at: new Date().toISOString(),
        last_error: result.error?.message,
      });

      // Update integration last sync time if successful
      if (result.success) {
        await this.updateIntegration(integration.id, {});
        await this.supabase
          .from('ats.integrations')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', integration.id);
      }

      return result;
    } catch (error: any) {
      // Mark as failed
      await this.updateQueueItem(queueItemId, {
        status: 'failed',
        last_error: error.message,
        retry_count: await this.incrementRetryCount(queueItemId),
      });

      throw error;
    }
  }

  /**
   * Map external ID to internal ID
   */
  async mapExternalToInternal(
    integrationId: string,
    entityType: string,
    externalId: string
  ): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('ats.external_entity_map')
      .select('internal_id')
      .eq('integration_id', integrationId)
      .eq('entity_type', entityType)
      .eq('external_id', externalId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to map external ID: ${error.message}`);
    }

    return data.internal_id;
  }

  /**
   * Map internal ID to external ID
   */
  async mapInternalToExternal(
    integrationId: string,
    entityType: string,
    internalId: string
  ): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('ats.external_entity_map')
      .select('external_id')
      .eq('integration_id', integrationId)
      .eq('entity_type', entityType)
      .eq('internal_id', internalId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to map internal ID: ${error.message}`);
    }

    return data.external_id;
  }

  /**
   * Create or update entity mapping
   */
  async upsertEntityMap(params: {
    integration_id: string;
    entity_type: string;
    internal_id: string;
    external_id: string;
    metadata?: any;
  }): Promise<ExternalEntityMap> {
    const { data, error } = await this.supabase
      .from('ats.external_entity_map')
      .upsert(
        {
          integration_id: params.integration_id,
          entity_type: params.entity_type,
          internal_id: params.internal_id,
          external_id: params.external_id,
          metadata: params.metadata || {},
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'integration_id,entity_type,internal_id',
        }
      )
      .select()
      .single();

    if (error) throw new Error(`Failed to upsert entity map: ${error.message}`);
    return data;
  }

  /**
   * Get sync logs for integration
   */
  async getSyncLogs(
    integrationId: string,
    options?: {
      limit?: number;
      entity_type?: string;
      status?: string;
    }
  ): Promise<SyncLog[]> {
    let query = this.supabase
      .from('ats.sync_logs')
      .select('*')
      .eq('integration_id', integrationId)
      .order('synced_at', { ascending: false });

    if (options?.entity_type) {
      query = query.eq('entity_type', options.entity_type);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get sync logs: ${error.message}`);
    return data;
  }

  // Private helper methods

  private async executeGreenhouseSync(
    integration: ATSIntegration,
    queueItem: SyncQueueItem
  ): Promise<SyncResult> {
    const apiKey = this.decryptApiKey(integration.api_key_encrypted);
    const config = integration.config as any;

    const client = new GreenhouseClient({
      apiKey,
      harvestApiKey: config.harvest_api_key,
    });

    const syncService = new GreenhouseSyncService(client, integration);

    if (queueItem.direction === 'inbound' && queueItem.entity_type === 'role') {
      // Bulk role sync
      const results = await syncService.syncRolesInbound();
      return results[0] || { success: true, entity_id: null, external_id: null, action: 'updated' };
    }

    return {
      success: false,
      entity_id: null,
      external_id: null,
      action: 'skipped',
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Sync type not yet implemented',
      },
    };
  }

  private async queueSync(params: {
    integration_id: string;
    entity_type: string;
    entity_id: string;
    action: 'create' | 'update' | 'delete';
    direction: SyncDirection;
    priority: number;
    payload: any;
  }): Promise<SyncQueueItem> {
    const { data, error } = await this.supabase
      .from('ats.sync_queue')
      .insert(params)
      .select()
      .single();

    if (error) throw new Error(`Failed to queue sync: ${error.message}`);
    return data;
  }

  private async updateQueueItem(
    queueItemId: string,
    updates: Partial<SyncQueueItem>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('ats.sync_queue')
      .update(updates)
      .eq('id', queueItemId);

    if (error) throw new Error(`Failed to update queue item: ${error.message}`);
  }

  private async incrementRetryCount(queueItemId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('ats.sync_queue')
      .select('retry_count')
      .eq('id', queueItemId)
      .single();

    if (error) throw new Error(`Failed to get retry count: ${error.message}`);

    const newCount = (data.retry_count || 0) + 1;

    await this.supabase
      .from('ats.sync_queue')
      .update({ retry_count: newCount })
      .eq('id', queueItemId);

    return newCount;
  }

  private async logSync(params: Omit<SyncLog, 'id' | 'synced_at'>): Promise<void> {
    const { error } = await this.supabase.from('ats.sync_logs').insert(params);

    if (error) throw new Error(`Failed to log sync: ${error.message}`);
  }

  private async getIntegrationStats(integrationId: string): Promise<{
    total_syncs: number;
    successful_syncs: number;
    failed_syncs: number;
    last_24h_syncs: number;
    pending_queue_items: number;
  }> {
    // Get total syncs
    const { count: totalSyncs } = await this.supabase
      .from('ats.sync_logs')
      .select('*', { count: 'exact', head: true })
      .eq('integration_id', integrationId);

    // Get successful syncs
    const { count: successfulSyncs } = await this.supabase
      .from('ats.sync_logs')
      .select('*', { count: 'exact', head: true })
      .eq('integration_id', integrationId)
      .eq('status', 'success');

    // Get failed syncs
    const { count: failedSyncs } = await this.supabase
      .from('ats.sync_logs')
      .select('*', { count: 'exact', head: true })
      .eq('integration_id', integrationId)
      .eq('status', 'failed');

    // Get last 24h syncs
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: last24hSyncs } = await this.supabase
      .from('ats.sync_logs')
      .select('*', { count: 'exact', head: true })
      .eq('integration_id', integrationId)
      .gte('synced_at', yesterday);

    // Get pending queue items
    const { count: pendingQueueItems } = await this.supabase
      .from('ats.sync_queue')
      .select('*', { count: 'exact', head: true })
      .eq('integration_id', integrationId)
      .eq('status', 'pending');

    return {
      total_syncs: totalSyncs || 0,
      successful_syncs: successfulSyncs || 0,
      failed_syncs: failedSyncs || 0,
      last_24h_syncs: last24hSyncs || 0,
      pending_queue_items: pendingQueueItems || 0,
    };
  }

  private encryptApiKey(apiKey: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private decryptApiKey(encrypted: string): string {
    const [ivHex, encryptedData] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
