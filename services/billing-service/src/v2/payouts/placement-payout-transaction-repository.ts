/**
 * PlacementPayoutTransactionRepository - Execution layer
 * Manages Stripe transfer tracking (one transaction per split)
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
    PlacementPayoutTransaction,
    PlacementPayoutTransactionInsert,
    PlacementPayoutTransactionUpdate,
    TransactionStatus
} from './types';

export class PlacementPayoutTransactionRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
     * Create multiple transactions in a batch (typically 5 transactions per placement)
     */
    async createBatch(transactions: PlacementPayoutTransactionInsert[]): Promise<PlacementPayoutTransaction[]> {
        const { data, error } = await this.supabase
            .from('placement_payout_transactions')
            .insert(transactions)
            .select();

        if (error) {
            throw new Error(`Failed to create payout transactions: ${error.message}`);
        }

        return data as PlacementPayoutTransaction[];
    }

    /**
     * Get all transactions for a placement
     */
    async getByPlacementId(placementId: string): Promise<PlacementPayoutTransaction[]> {
        const { data, error } = await this.supabase
            .from('placement_payout_transactions')
            .select('*')
            .eq('placement_id', placementId)
            .order('created_at', { ascending: true });

        if (error) {
            throw new Error(`Failed to get placement transactions: ${error.message}`);
        }

        return data as PlacementPayoutTransaction[];
    }

    /**
     * Get transactions for a specific recruiter
     */
    async getByRecruiterId(
        recruiterId: string,
        status?: TransactionStatus
    ): Promise<PlacementPayoutTransaction[]> {
        let query = this.supabase
            .from('placement_payout_transactions')
            .select('*')
            .eq('recruiter_id', recruiterId);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to get recruiter transactions: ${error.message}`);
        }

        return data as PlacementPayoutTransaction[];
    }

    /**
     * Get single transaction by ID
     */
    async getById(id: string): Promise<PlacementPayoutTransaction | null> {
        const { data, error } = await this.supabase
            .from('placement_payout_transactions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to get payout transaction: ${error.message}`);
        }

        return data as PlacementPayoutTransaction;
    }

    /**
     * Update transaction status and related fields
     */
    async updateStatus(
        id: string,
        status: TransactionStatus,
        updates: PlacementPayoutTransactionUpdate
    ): Promise<PlacementPayoutTransaction> {
        const updateData: any = {
            status,
            ...updates,
            updated_at: new Date().toISOString()
        };

        // Set timestamp fields based on status
        if (status === 'processing' && !updates.processing_started_at) {
            updateData.processing_started_at = new Date().toISOString();
        }
        if (status === 'paid' && !updates.completed_at) {
            updateData.completed_at = new Date().toISOString();
        }
        if (status === 'failed' && !updates.failed_at) {
            updateData.failed_at = new Date().toISOString();
        }

        const { data, error } = await this.supabase
            .from('placement_payout_transactions')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update payout transaction: ${error.message}`);
        }

        return data as PlacementPayoutTransaction;
    }

    /**
     * Get pending transactions ready for processing
     */
    async getPendingTransactions(limit?: number): Promise<PlacementPayoutTransaction[]> {
        let query = this.supabase
            .from('placement_payout_transactions')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to get pending transactions: ${error.message}`);
        }

        return data as PlacementPayoutTransaction[];
    }

    /**
     * Check if transaction already exists for a split
     */
    async existsForSplit(placementSplitId: string): Promise<boolean> {
        const { count, error } = await this.supabase
            .from('placement_payout_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('placement_split_id', placementSplitId);

        if (error) {
            throw new Error(`Failed to check transaction existence: ${error.message}`);
        }

        return (count ?? 0) > 0;
    }
}
