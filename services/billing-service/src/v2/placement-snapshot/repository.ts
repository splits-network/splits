import { SupabaseClient } from '@supabase/supabase-js';
import { PlacementSnapshot, PlacementSnapshotCreate, PlacementSnapshotFilters } from './types';

export class PlacementSnapshotRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
     * Create a new placement snapshot (immutable commission record)
     */
    async create(data: PlacementSnapshotCreate & {
        candidate_recruiter_rate: number | null;
        company_recruiter_rate: number | null;
        job_owner_rate: number | null;
        candidate_sourcer_rate: number | null;
        company_sourcer_rate: number | null;
    }): Promise<PlacementSnapshot> {
        const { data: snapshot, error } = await this.supabase
            .schema('billing')
            .from('placement_snapshot')
            .insert(data)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create placement snapshot: ${error.message}`);
        }

        return snapshot as PlacementSnapshot;
    }

    /**
     * Get placement snapshot by placement ID
     */
    async getByPlacementId(placementId: string): Promise<PlacementSnapshot | null> {
        const { data, error } = await this.supabase
            .schema('billing')
            .from('placement_snapshot')
            .select('*')
            .eq('placement_id', placementId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to fetch placement snapshot: ${error.message}`);
        }

        return data as PlacementSnapshot;
    }

    /**
     * List placement snapshots with optional filters
     */
    async list(filters: PlacementSnapshotFilters = {}): Promise<PlacementSnapshot[]> {
        let query = this.supabase
            .schema('billing')
            .from('placement_snapshot')
            .select('*');

        // Apply filters
        if (filters.placement_id) {
            query = query.eq('placement_id', filters.placement_id);
        }

        if (filters.subscription_tier) {
            query = query.eq('subscription_tier', filters.subscription_tier);
        }

        // Filter by any role ID (for recruiter commission lookup)
        if (filters.recruiter_id) {
            query = query.or(
                `candidate_recruiter_id.eq.${filters.recruiter_id},` +
                `company_recruiter_id.eq.${filters.recruiter_id},` +
                `job_owner_recruiter_id.eq.${filters.recruiter_id},` +
                `candidate_sourcer_recruiter_id.eq.${filters.recruiter_id},` +
                `company_sourcer_recruiter_id.eq.${filters.recruiter_id}`
            );
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to list placement snapshots: ${error.message}`);
        }

        return data as PlacementSnapshot[];
    }
}
