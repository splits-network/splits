import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver, AccessContext } from '@splits-network/shared-access-context';
import { SearchableEntityType, SearchResult, TypeaheadGroup, ENTITY_TYPE_LABELS, SearchFilters } from './types';

export class SearchRepository {
    private accessResolver: AccessContextResolver;

    constructor(private supabase: SupabaseClient) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    /**
     * Typeahead search - returns top 5 results per entity type, grouped
     */
    async searchTypeahead(
        clerkUserId: string,
        query: string,
        entityType?: SearchableEntityType
    ): Promise<TypeaheadGroup[]> {
        const context = await this.accessResolver.resolve(clerkUserId);

        // Define entity types to query
        const entityTypes: SearchableEntityType[] = entityType
            ? [entityType]
            : ['candidate', 'job', 'company', 'recruiter', 'application', 'placement', 'recruiter_candidate'];

        // Query each entity type in parallel (max 7 queries)
        const groupPromises = entityTypes.map(async (type) => {
            const results = await this.queryEntityType(context, query, type, 5);

            if (results.length === 0) {
                return null; // Filter out empty groups
            }

            return {
                entity_type: type,
                label: ENTITY_TYPE_LABELS[type],
                results,
            };
        });

        const groups = await Promise.all(groupPromises);

        // Filter out null groups (empty results)
        return groups.filter((group): group is TypeaheadGroup => group !== null);
    }

    /**
     * Full search - returns paginated results with total count
     */
    async searchFull(
        clerkUserId: string,
        query: string,
        entityType?: SearchableEntityType,
        page: number = 1,
        limit: number = 25,
        filters?: SearchFilters
    ): Promise<{ data: SearchResult[], total: number }> {
        const context = await this.accessResolver.resolve(clerkUserId);

        // Build base query
        let queryBuilder = this.supabase
            .schema('search')
            .from('search_index')
            .select('entity_type, entity_id, title, subtitle, context, metadata', { count: 'exact' })
            .textSearch('search_vector', query, { type: 'websearch' });

        // Apply access control
        queryBuilder = this.applyAccessControl(queryBuilder, context);

        // Apply entity type filter if specified
        if (entityType) {
            queryBuilder = queryBuilder.eq('entity_type', entityType);
        }

        // Apply metadata filters
        if (filters) {
            queryBuilder = this.applyMetadataFilters(queryBuilder, filters);
        }

        // Apply pagination
        const offset = (page - 1) * limit;
        queryBuilder = queryBuilder
            .order('updated_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data, error, count } = await queryBuilder;

        if (error) {
            throw new Error(`Search query failed: ${error.message}`);
        }

        // Map results to SearchResult format (rank placeholder - textSearch filters but doesn't sort by rank)
        const results: SearchResult[] = (data || []).map((row) => ({
            entity_type: row.entity_type,
            entity_id: row.entity_id,
            title: row.title,
            subtitle: row.subtitle,
            context: row.context,
            metadata: row.metadata || {},
            rank: 0, // Placeholder - Supabase JS doesn't expose ts_rank directly
        }));

        return {
            data: results,
            total: count || 0,
        };
    }

    /**
     * Query a single entity type with textSearch + access control + limit
     */
    private async queryEntityType(
        context: AccessContext,
        query: string,
        entityType: SearchableEntityType,
        limit: number
    ): Promise<SearchResult[]> {
        let queryBuilder = this.supabase
            .schema('search')
            .from('search_index')
            .select('entity_type, entity_id, title, subtitle, context, metadata')
            .textSearch('search_vector', query, { type: 'websearch' })
            .eq('entity_type', entityType);

        // Apply access control
        queryBuilder = this.applyAccessControl(queryBuilder, context);

        // Apply limit and sort
        queryBuilder = queryBuilder
            .order('updated_at', { ascending: false })
            .limit(limit);

        const { data, error } = await queryBuilder;

        if (error) {
            console.error(`Query failed for entity type ${entityType}:`, error);
            return [];
        }

        return (data || []).map((row) => ({
            entity_type: row.entity_type,
            entity_id: row.entity_id,
            title: row.title,
            subtitle: row.subtitle,
            context: row.context,
            metadata: row.metadata || {},
            rank: 0, // Placeholder
        }));
    }

    /**
     * Apply metadata-level field filters for advanced search.
     * Uses JSONB operators on the metadata column.
     */
    private applyMetadataFilters(
        queryBuilder: any,
        filters: SearchFilters
    ): any {
        // Text equality filters (metadata->> extracts as text)
        if (filters.employment_type) {
            queryBuilder = queryBuilder.eq('metadata->>employment_type', filters.employment_type);
        }
        if (filters.job_level) {
            queryBuilder = queryBuilder.eq('metadata->>job_level', filters.job_level);
        }
        if (filters.job_status) {
            queryBuilder = queryBuilder.eq('metadata->>status', filters.job_status);
        }
        if (filters.department) {
            queryBuilder = queryBuilder.eq('metadata->>department', filters.department);
        }
        if (filters.desired_job_type) {
            queryBuilder = queryBuilder.eq('metadata->>desired_job_type', filters.desired_job_type);
        }
        if (filters.availability) {
            queryBuilder = queryBuilder.eq('metadata->>availability', filters.availability);
        }
        if (filters.industry) {
            queryBuilder = queryBuilder.ilike('metadata->>company_industry', `%${filters.industry}%`);
        }
        if (filters.company_size) {
            queryBuilder = queryBuilder.eq('metadata->>company_size', filters.company_size);
        }

        // Boolean filters
        if (filters.open_to_remote === true) {
            queryBuilder = queryBuilder.eq('metadata->>open_to_remote', 'true');
        }
        if (filters.open_to_relocation === true) {
            queryBuilder = queryBuilder.eq('metadata->>open_to_relocation', 'true');
        }

        // Array containment (commute_types is a JSONB array)
        if (filters.commute_types && filters.commute_types.length > 0) {
            queryBuilder = queryBuilder.contains('metadata->commute_types', JSON.stringify(filters.commute_types));
        }

        // Salary range (metadata-> returns JSONB, numeric comparison works)
        if (filters.salary_min !== undefined) {
            // Jobs where salary_max >= user's minimum (job pays enough)
            queryBuilder = queryBuilder.gte('metadata->salary_max', filters.salary_min);
        }
        if (filters.salary_max !== undefined) {
            // Jobs where salary_min <= user's maximum (job isn't too expensive)
            queryBuilder = queryBuilder.lte('metadata->salary_min', filters.salary_max);
        }

        return queryBuilder;
    }

    /**
     * Apply role-based access control filters to a query.
     *
     * Access model:
     * - Platform admin: see everything
     * - Marketplace entities (candidate, job, company, recruiter): visible to all users
     * - Company-scoped entities (application, placement): filtered by company_id or organization_id
     * - Org-wide users (membership without company_id): see all entities in their orgs
     * - Company-scoped users (membership with company_id): see only their company's entities
     */
    private applyAccessControl(
        queryBuilder: any,
        context: AccessContext
    ): any {
        if (context.isPlatformAdmin) {
            return queryBuilder;
        }

        // Build OR filter clauses
        const filters: string[] = [
            // Everyone sees marketplace entities (candidates, jobs, companies, recruiters)
            'entity_type.in.(candidate,job,company,recruiter)',
        ];

        // Org-wide access: see all entities in those orgs (applications, placements, etc.)
        if (context.orgWideOrganizationIds && context.orgWideOrganizationIds.length > 0) {
            filters.push(`organization_id.in.(${context.orgWideOrganizationIds.join(',')})`);
        }

        // Company-scoped access: see entities for specific companies
        if (context.companyIds.length > 0) {
            filters.push(`company_id.in.(${context.companyIds.join(',')})`);
        }

        return queryBuilder.or(filters.join(','));
    }
}
