import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver, AccessContext } from '@splits-network/shared-access-context';
import { SearchableEntityType, SearchResult, TypeaheadGroup, ENTITY_TYPE_LABELS } from './types';

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
        limit: number = 25
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
     * Apply role-based access control filters to a query
     */
    private applyAccessControl(
        queryBuilder: any,
        context: AccessContext
    ): any {
        // Platform admin: no filter (see all)
        if (context.isPlatformAdmin) {
            return queryBuilder;
        }

        // Has organizationIds (company users): see org-scoped entities + null-org entities + all jobs/companies
        if (context.organizationIds.length > 0) {
            const orgIds = context.organizationIds.join(',');
            return queryBuilder.or(`organization_id.in.(${orgIds}),organization_id.is.null,entity_type.in.(job,company)`);
        }

        // No organizationIds (recruiter/candidate): see null-org entities + all jobs/companies
        return queryBuilder.or(`organization_id.is.null,entity_type.in.(job,company)`);
    }
}
