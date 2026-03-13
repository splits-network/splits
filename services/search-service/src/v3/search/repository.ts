/**
 * Search V3 Repository
 * Direct table queries against search.search_index with access control.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContext } from '@splits-network/shared-access-context';

const ENTITY_TYPE_LABELS: Record<string, string> = {
  candidate: 'Candidates',
  job: 'Jobs',
  company: 'Companies',
  recruiter: 'Recruiters',
  application: 'Applications',
  placement: 'Placements',
  recruiter_candidate: 'Recruiter Candidates',
};

const MARKETPLACE_ENTITY_TYPES = ['candidate', 'job', 'company', 'recruiter'];
const ALL_ENTITY_TYPES = ['candidate', 'job', 'company', 'recruiter', 'application', 'placement', 'recruiter_candidate'];

export class SearchRepository {
  constructor(private supabase: SupabaseClient) {}

  async typeaheadSearch(
    query: string,
    context: AccessContext,
    entityType?: string,
    limit: number = 5,
  ): Promise<any[]> {
    const entityTypes = entityType ? [entityType] : ALL_ENTITY_TYPES;

    const groupPromises = entityTypes.map(async (type) => {
      let qb = this.supabase
        .schema('search')
        .from('search_index')
        .select('entity_type, entity_id, title, subtitle, context, metadata')
        .textSearch('search_vector', query, { type: 'websearch' })
        .eq('entity_type', type);

      qb = this.applyAccessControl(qb, context);
      qb = qb.order('updated_at', { ascending: false }).limit(limit);

      const { data, error } = await qb;
      if (error || !data || data.length === 0) return null;

      return {
        entity_type: type,
        label: ENTITY_TYPE_LABELS[type] || type,
        results: data.map((row: any) => ({
          entity_type: row.entity_type,
          entity_id: row.entity_id,
          title: row.title,
          subtitle: row.subtitle,
          context: row.context,
          metadata: row.metadata || {},
          rank: 0,
        })),
      };
    });

    const groups = await Promise.all(groupPromises);
    return groups.filter(Boolean);
  }

  async fullSearch(
    query: string,
    context: AccessContext,
    entityType?: string,
    page: number = 1,
    limit: number = 25,
    filters?: Record<string, any>,
  ): Promise<{ data: any[]; total: number }> {
    let qb = this.supabase
      .schema('search')
      .from('search_index')
      .select('entity_type, entity_id, title, subtitle, context, metadata', { count: 'exact' })
      .textSearch('search_vector', query, { type: 'websearch' });

    qb = this.applyAccessControl(qb, context);

    if (entityType) qb = qb.eq('entity_type', entityType);
    if (filters) qb = this.applyMetadataFilters(qb, filters);

    const offset = (page - 1) * limit;
    qb = qb.order('updated_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await qb;
    if (error) throw new Error(`Search query failed: ${error.message}`);

    const results = (data || []).map((row: any) => ({
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      title: row.title,
      subtitle: row.subtitle,
      context: row.context,
      metadata: row.metadata || {},
      rank: 0,
    }));

    return { data: results, total: count || 0 };
  }

  private applyAccessControl(qb: any, context: AccessContext): any {
    if (context.isPlatformAdmin) return qb;

    const filters: string[] = [
      `entity_type.in.(${MARKETPLACE_ENTITY_TYPES.join(',')})`,
    ];

    if (context.orgWideOrganizationIds && context.orgWideOrganizationIds.length > 0) {
      filters.push(`organization_id.in.(${context.orgWideOrganizationIds.join(',')})`);
    }
    if (context.companyIds.length > 0) {
      filters.push(`company_id.in.(${context.companyIds.join(',')})`);
    }

    return qb.or(filters.join(','));
  }

  private applyMetadataFilters(qb: any, filters: Record<string, any>): any {
    if (filters.employment_type) qb = qb.eq('metadata->>employment_type', filters.employment_type);
    if (filters.job_level) qb = qb.eq('metadata->>job_level', filters.job_level);
    if (filters.job_status) qb = qb.eq('metadata->>status', filters.job_status);
    if (filters.department) qb = qb.eq('metadata->>department', filters.department);
    if (filters.desired_job_type) qb = qb.eq('metadata->>desired_job_type', filters.desired_job_type);
    if (filters.availability) qb = qb.eq('metadata->>availability', filters.availability);
    if (filters.industry) qb = qb.ilike('metadata->>company_industry', `%${filters.industry}%`);
    if (filters.company_size) qb = qb.eq('metadata->>company_size', filters.company_size);
    if (filters.open_to_remote === true) qb = qb.eq('metadata->>open_to_remote', 'true');
    if (filters.open_to_relocation === true) qb = qb.eq('metadata->>open_to_relocation', 'true');
    if (filters.commute_types && filters.commute_types.length > 0) {
      qb = qb.contains('metadata->commute_types', JSON.stringify(filters.commute_types));
    }
    if (filters.salary_min !== undefined) qb = qb.gte('metadata->salary_max', filters.salary_min);
    if (filters.salary_max !== undefined) qb = qb.lte('metadata->salary_min', filters.salary_max);
    return qb;
  }
}
