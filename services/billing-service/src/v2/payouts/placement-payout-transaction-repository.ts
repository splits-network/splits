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
} from './types.js';

export interface TransactionListFilters {
    status?: TransactionStatus;
    recruiter_id?: string;
    placement_id?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export class PlacementPayoutTransactionRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
     * List transactions with pagination, filtering, and sorting
     */
    async listTransactions(
        filters: TransactionListFilters = {}
    ): Promise<{ data: PlacementPayoutTransaction[]; total: number }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = filters.sort_order === 'asc';

        let query = this.supabase
            .from('placement_payout_transactions')
            .select(`
                *,
                recruiters!recruiter_id (
                    id,
                    users!user_id ( name, email )
                ),
                placements!placement_id (
                    candidate_name,
                    company_name,
                    job_title,
                    salary,
                    fee_amount,
                    state
                ),
                placement_splits!placement_split_id (
                    role,
                    split_percentage
                )
            `, { count: 'exact' });

        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.recruiter_id) {
            query = query.eq('recruiter_id', filters.recruiter_id);
        }
        if (filters.placement_id) {
            query = query.eq('placement_id', filters.placement_id);
        }
        if (filters.search) {
            query = query.or(
                `placement_id.ilike.%${filters.search}%,recruiter_id.ilike.%${filters.search}%,stripe_transfer_id.ilike.%${filters.search}%`
            );
        }

        query = query
            .order(sortBy, { ascending: sortOrder })
            .range(offset, offset + limit - 1);

        const { data, count, error } = await query;

        if (error) {
            throw new Error(`Failed to list payout transactions: ${error.message}`);
        }

        // Flatten joined data into transaction records
        const flattenedData = (data || []).map((row: any) => ({
            id: row.id,
            placement_split_id: row.placement_split_id,
            placement_id: row.placement_id,
            recruiter_id: row.recruiter_id,
            amount: row.amount,
            status: row.status,
            transaction_type: row.transaction_type || null,
            firm_id: row.firm_id || null,
            stripe_transfer_id: row.stripe_transfer_id,
            stripe_payout_id: row.stripe_payout_id,
            stripe_connect_account_id: row.stripe_connect_account_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
            processing_started_at: row.processing_started_at,
            completed_at: row.completed_at,
            failed_at: row.failed_at,
            failure_reason: row.failure_reason,
            retry_count: row.retry_count,
            recruiter_name: row.recruiters?.users?.name || null,
            recruiter_email: row.recruiters?.users?.email || null,
            candidate_name: row.placements?.candidate_name || null,
            company_name: row.placements?.company_name || null,
            job_title: row.placements?.job_title || null,
            salary: row.placements?.salary || null,
            fee_amount: row.placements?.fee_amount || null,
            placement_state: row.placements?.state || null,
            split_role: row.placement_splits?.role || null,
            split_percentage: row.placement_splits?.split_percentage || null,
        }));

        return { data: flattenedData as PlacementPayoutTransaction[], total: count || 0 };
    }

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
