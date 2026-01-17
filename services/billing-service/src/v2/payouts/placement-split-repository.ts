/**
 * PlacementSplitRepository - Attribution layer
 * Manages computed allocations (one row per payee/role)
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { PlacementSplit, PlacementSplitInsert } from './types';

export class PlacementSplitRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
     * Create multiple splits in a batch (typically 5 splits per placement)
     */
    async createBatch(splits: PlacementSplitInsert[]): Promise<PlacementSplit[]> {
        const { data, error } = await this.supabase
            .from('placement_splits')
            .insert(splits)
            .select();

        if (error) {
            throw new Error(`Failed to create placement splits: ${error.message}`);
        }

        return data as PlacementSplit[];
    }

    /**
     * Get all splits for a placement (typically 1-5 rows)
     */
    async getByPlacementId(placementId: string): Promise<PlacementSplit[]> {
        const { data, error } = await this.supabase
            .from('placement_splits')
            .select('*')
            .eq('placement_id', placementId)
            .order('created_at', { ascending: true });

        if (error) {
            throw new Error(`Failed to get placement splits: ${error.message}`);
        }

        return data as PlacementSplit[];
    }

    /**
     * Get splits for a specific recruiter across all placements
     */
    async getByRecruiterId(recruiterId: string): Promise<PlacementSplit[]> {
        const { data, error } = await this.supabase
            .from('placement_splits')
            .select('*')
            .eq('recruiter_id', recruiterId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to get recruiter splits: ${error.message}`);
        }

        return data as PlacementSplit[];
    }

    /**
     * Get single split by ID
     */
    async getById(id: string): Promise<PlacementSplit | null> {
        const { data, error } = await this.supabase
            .from('placement_splits')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to get placement split: ${error.message}`);
        }

        return data as PlacementSplit;
    }

    /**
     * Check if splits already exist for a placement
     */
    async existsForPlacement(placementId: string): Promise<boolean> {
        const { count, error } = await this.supabase
            .from('placement_splits')
            .select('*', { count: 'exact', head: true })
            .eq('placement_id', placementId);

        if (error) {
            throw new Error(`Failed to check placement splits: ${error.message}`);
        }

        return (count ?? 0) > 0;
    }
}
