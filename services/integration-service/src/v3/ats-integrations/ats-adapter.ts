/**
 * ATS Repository V3 Adapter — Integration & Entity Mapping
 *
 * Provides the same interface as V2 ATSRepository but uses a shared
 * SupabaseClient. Allows V2 ATSService to work with V3 infrastructure.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type {
  ATSIntegration,
  ATSPlatform,
  ExternalEntityMap,
  SyncEntityType,
} from '@splits-network/shared-types';
import { ATSSyncAdapter } from './ats-sync-adapter.js';

export class ATSRepositoryAdapter extends ATSSyncAdapter {
  constructor(supabase: SupabaseClient) {
    super(supabase);
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
}
