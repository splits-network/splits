/**
 * Placement Repository
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PlacementFilters, PlacementUpdate } from './types.js';
import { resolveAccessContext } from '../shared/access.js';

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

export class PlacementRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    /**
     * Build select clause with optional includes.
     * Supports: candidate, job, company, splits
     */
    private buildSelectClause(include?: string): string {
        const baseFields = `*`;

        if (!include) {
            return baseFields;
        }

        const includes = include.split(',').map(i => i.trim());
        let selectClause = baseFields;

        if (includes.includes('candidate')) {
            selectClause += `, candidate:candidates(id, full_name, email)`;
        }

        if (includes.includes('job') || includes.includes('company')) {
            selectClause += `, job:jobs!inner(id, title, company:companies!inner(id, name, logo_url, identity_organization_id))`;
        }

        if (includes.includes('splits')) {
            selectClause += `, splits:placement_splits(id, role, split_percentage, split_amount, recruiter_id, recruiter:recruiters(id, user:users!recruiters_user_id_fkey(name)))`;
        }

        return selectClause;
    }

    async findPlacements(
        clerkUserId: string,
        filters: PlacementFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        const organizationIds = accessContext.organizationIds;

        if (!accessContext.candidateId && !accessContext.recruiterId && !accessContext.isPlatformAdmin && organizationIds.length === 0) {
            return { data: [], total: 0 };
        }

        const selectClause = this.buildSelectClause(filters.include);

        let query = this.supabase
            .from('placements')
            .select(selectClause, { count: 'exact' });

        // Apply access control filter
        if (accessContext.candidateId) {
            query = query.eq('candidate_id', accessContext.candidateId);
        } else if (accessContext.recruiterId) {
            // Recruiters see placements where they are any recruiter role
            query = query.or(
                `candidate_recruiter_id.eq.${accessContext.recruiterId},` +
                `company_recruiter_id.eq.${accessContext.recruiterId},` +
                `job_owner_recruiter_id.eq.${accessContext.recruiterId},` +
                `candidate_sourcer_recruiter_id.eq.${accessContext.recruiterId},` +
                `company_sourcer_recruiter_id.eq.${accessContext.recruiterId}`
            );
        } else if (!accessContext.isPlatformAdmin && organizationIds.length > 0) {
            query = query.in('job.company.identity_organization_id', organizationIds);
        }

        // Apply filters
        if (filters.search) {
            const tsquery = filters.search.replace(/[@+._\-\/:]/g, ' ').trim().split(/\s+/).filter((t: string) => t).join(' & ');
            query = query.textSearch('search_vector', tsquery, {
                type: 'websearch',
                config: 'english'
            });
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.job_id) {
            query = query.eq('job_id', filters.job_id);
        }
        if (filters.candidate_id) {
            query = query.eq('candidate_id', filters.candidate_id);
        }

        // Salary range buckets
        if (filters.salary_range) {
            switch (filters.salary_range) {
                case 'under_50k': query = query.lt('salary', 50000); break;
                case '50k_100k': query = query.gte('salary', 50000).lt('salary', 100000); break;
                case '100k_150k': query = query.gte('salary', 100000).lt('salary', 150000); break;
                case '150k_200k': query = query.gte('salary', 150000).lt('salary', 200000); break;
                case 'over_200k': query = query.gte('salary', 200000); break;
            }
        }

        // Fee percentage range buckets
        if (filters.fee_range) {
            switch (filters.fee_range) {
                case 'under_15': query = query.lt('fee_percentage', 15); break;
                case '15_20': query = query.gte('fee_percentage', 15).lt('fee_percentage', 20); break;
                case '20_25': query = query.gte('fee_percentage', 20).lt('fee_percentage', 25); break;
                case 'over_25': query = query.gte('fee_percentage', 25); break;
            }
        }

        // Placement fee amount buckets
        if (filters.fee_amount_range) {
            switch (filters.fee_amount_range) {
                case 'under_10k': query = query.lt('placement_fee', 10000); break;
                case '10k_25k': query = query.gte('placement_fee', 10000).lt('placement_fee', 25000); break;
                case '25k_50k': query = query.gte('placement_fee', 25000).lt('placement_fee', 50000); break;
                case 'over_50k': query = query.gte('placement_fee', 50000); break;
            }
        }

        // Guarantee status
        if (filters.guarantee_status) {
            const now = new Date().toISOString();
            const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            switch (filters.guarantee_status) {
                case 'in_guarantee':
                    query = query.gte('guarantee_expires_at', now);
                    break;
                case 'expiring_soon':
                    query = query.gte('guarantee_expires_at', now).lte('guarantee_expires_at', thirtyDaysFromNow);
                    break;
                case 'expired':
                    query = query.lt('guarantee_expires_at', now);
                    break;
                case 'no_guarantee':
                    query = query.is('guarantee_expires_at', null);
                    break;
            }
        }

        // Is replacement placement
        if (filters.is_replacement === 'yes') {
            query = query.not('replacement_placement_id', 'is', null);
        } else if (filters.is_replacement === 'no') {
            query = query.is('replacement_placement_id', null);
        }

        // Has started (start_date <= today)
        if (filters.has_started) {
            const today = new Date().toISOString().split('T')[0];
            if (filters.has_started === 'yes') {
                query = query.lte('start_date', today);
            } else if (filters.has_started === 'no') {
                query = query.or(`start_date.gt.${today},start_date.is.null`);
            }
        }

        // Invoice status (subquery on placement_invoices)
        if (filters.invoice_status) {
            if (filters.invoice_status === 'no_invoice') {
                const { data: invoicedPlacements } = await this.supabase
                    .from('placement_invoices')
                    .select('placement_id');
                const invoicedIds = [...new Set((invoicedPlacements || []).map((i: any) => i.placement_id))];
                if (invoicedIds.length > 0) {
                    query = query.not('id', 'in', `(${invoicedIds.join(',')})`);
                }
            } else {
                const { data: matchingInvoices } = await this.supabase
                    .from('placement_invoices')
                    .select('placement_id')
                    .eq('invoice_status', filters.invoice_status);
                const matchingIds = [...new Set((matchingInvoices || []).map((i: any) => i.placement_id))];
                if (matchingIds.length > 0) {
                    query = query.in('id', matchingIds);
                } else {
                    return { data: [], total: 0 };
                }
            }
        }

        // Payout status (subquery on placement_payout_transactions)
        if (filters.payout_status) {
            if (filters.payout_status === 'no_payouts') {
                const { data: paidPlacements } = await this.supabase
                    .from('placement_payout_transactions')
                    .select('placement_id');
                const paidIds = [...new Set((paidPlacements || []).map((p: any) => p.placement_id))];
                if (paidIds.length > 0) {
                    query = query.not('id', 'in', `(${paidIds.join(',')})`);
                }
            } else {
                const { data: matchingPayouts } = await this.supabase
                    .from('placement_payout_transactions')
                    .select('placement_id')
                    .eq('status', filters.payout_status);
                const matchingIds = [...new Set((matchingPayouts || []).map((p: any) => p.placement_id))];
                if (matchingIds.length > 0) {
                    query = query.in('id', matchingIds);
                } else {
                    return { data: [], total: 0 };
                }
            }
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = filters.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy, { ascending: sortOrder });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        const placements = (data || []) as any[];

        // Enrich with the current recruiter's splits from placement_splits
        if (accessContext.recruiterId && placements.length > 0) {
            const placementIds = placements.map((p: any) => p.id);
            const { data: splits } = await this.supabase
                .from('placement_splits')
                .select('placement_id, role, split_percentage, split_amount')
                .eq('recruiter_id', accessContext.recruiterId)
                .in('placement_id', placementIds);

            if (splits && splits.length > 0) {
                const splitMap = new Map<string, { total: number; details: any[] }>();
                for (const s of splits) {
                    const existing = splitMap.get(s.placement_id) || { total: 0, details: [] };
                    existing.total += s.split_amount;
                    existing.details.push({ role: s.role, split_percentage: s.split_percentage, split_amount: s.split_amount });
                    splitMap.set(s.placement_id, existing);
                }
                for (const p of placements) {
                    const entry = splitMap.get(p.id);
                    if (entry) {
                        p.recruiter_share = entry.total;
                        p.your_splits = entry.details;
                    }
                }
            }
        }

        return {
            data: placements,
            total: count || 0,
        };
    }

    async findPlacement(id: string, clerkUserId?: string, include?: string): Promise<any | null> {
        const selectClause = this.buildSelectClause(include || 'candidate,job,company,splits');

        const { data, error } = await this.supabase
            .from('placements')
            .select(selectClause)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        const placement = data as any;

        // Enrich with the current recruiter's splits from placement_splits
        if (clerkUserId && placement) {
            const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
            if (accessContext.recruiterId) {
                const { data: splits } = await this.supabase
                    .from('placement_splits')
                    .select('role, split_percentage, split_amount')
                    .eq('placement_id', id)
                    .eq('recruiter_id', accessContext.recruiterId);

                if (splits && splits.length > 0) {
                    placement.recruiter_share = splits.reduce((sum: number, s: any) => sum + s.split_amount, 0);
                    placement.your_splits = splits.map((s: any) => ({
                        role: s.role, split_percentage: s.split_percentage, split_amount: s.split_amount
                    }));
                }
            }
        }

        return placement;
    }

    async createPlacement(placement: any): Promise<any> {
        const { data, error } = await this.supabase

            .from('placements')
            .insert(placement)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updatePlacement(id: string, updates: PlacementUpdate): Promise<any> {
        const { data, error } = await this.supabase

            .from('placements')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deletePlacement(id: string): Promise<void> {
        // Soft delete
        const { error } = await this.supabase

            .from('placements')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
