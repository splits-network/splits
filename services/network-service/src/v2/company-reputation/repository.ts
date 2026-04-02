/**
 * Company Reputation Repository
 * Direct Supabase queries for company reputation domain
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CompanyReputationFilters, RepositoryListResponse } from './types.js';

export class CompanyReputationRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    async findReputations(
        clerkUserId: string,
        filters: CompanyReputationFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('company_reputation')
            .select(`
                *,
                company:companies(id, name)
            `, { count: 'exact' });

        if (filters.company_id) {
            query = query.eq('company_id', filters.company_id);
        }

        const sortBy = filters.sort_by || 'reputation_score';
        const sortOrder = filters.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy, { ascending: sortOrder });

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async findReputationByCompanyId(companyId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('company_reputation')
            .select(`
                *,
                company:companies(id, name)
            `)
            .eq('company_id', companyId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }
}
