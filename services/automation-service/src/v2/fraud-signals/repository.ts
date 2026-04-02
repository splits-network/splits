import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FraudSignal, FraudSignalFilters, FraudSignalUpdate } from './types.js';

export interface CreateFraudSignalInput {
    signal_type: string;
    severity: FraudSignal['severity'];
    signal_data: Record<string, any>;
    confidence_score: number;
    recruiter_id?: string | null;
    job_id?: string | null;
    candidate_id?: string | null;
    application_id?: string | null;
    placement_id?: string | null;
    status?: FraudSignal['status'];
}

export class FraudSignalRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    private mapRow(row: any): FraudSignal {
        return {
            id: row.id,
            signal_type: row.signal_type,
            severity: row.severity,
            status: row.status,
            recruiter_id: row.recruiter_id,
            job_id: row.job_id,
            candidate_id: row.candidate_id,
            application_id: row.application_id,
            placement_id: row.placement_id,
            signal_data: row.signal_data || {},
            confidence_score: Number(row.confidence_score),
            reviewed_by: row.reviewed_by,
            reviewed_at: row.reviewed_at,
            resolution_notes: row.resolution_notes,
            action_taken: row.action_taken,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    async findSignals(filters: FraudSignalFilters = {}): Promise<{
        data: FraudSignal[];
        total: number;
    }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('fraud_signals')
            .select('*', { count: 'exact' });

        if (filters.recruiter_id) {
            query = query.eq('recruiter_id', filters.recruiter_id);
        }
        if (filters.candidate_id) {
            query = query.eq('candidate_id', filters.candidate_id);
        }
        if (filters.application_id) {
            query = query.eq('application_id', filters.application_id);
        }
        if (filters.severity) {
            query = query.eq('severity', filters.severity);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.signal_type) {
            query = query.eq('signal_type', filters.signal_type);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        return {
            data: (data || []).map((row) => this.mapRow(row)),
            total: count || 0,
        };
    }

    async findSignal(id: string): Promise<FraudSignal | null> {
        const { data, error } = await this.supabase
            .from('fraud_signals')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        return data ? this.mapRow(data) : null;
    }

    async createSignal(input: CreateFraudSignalInput): Promise<FraudSignal> {
        const { data, error } = await this.supabase
            .from('fraud_signals')
            .insert({
                signal_type: input.signal_type,
                severity: input.severity,
                signal_data: input.signal_data,
                confidence_score: input.confidence_score,
                recruiter_id: input.recruiter_id ?? null,
                job_id: input.job_id ?? null,
                candidate_id: input.candidate_id ?? null,
                application_id: input.application_id ?? null,
                placement_id: input.placement_id ?? null,
                status: input.status || 'active',
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    async updateSignal(id: string, updates: FraudSignalUpdate): Promise<FraudSignal> {
        const payload: Record<string, any> = {
            updated_at: new Date().toISOString(),
        };

        if (typeof updates.status !== 'undefined') payload.status = updates.status;
        if (typeof updates.severity !== 'undefined') payload.severity = updates.severity;
        if (typeof updates.signal_data !== 'undefined') payload.signal_data = updates.signal_data;
        if (typeof updates.confidence_score !== 'undefined') payload.confidence_score = updates.confidence_score;
        if (typeof updates.resolution_notes !== 'undefined') payload.resolution_notes = updates.resolution_notes;
        if (typeof updates.action_taken !== 'undefined') payload.action_taken = updates.action_taken;
        if (typeof updates.reviewed_by !== 'undefined') {
            payload.reviewed_by = updates.reviewed_by;
            payload.reviewed_at = updates.reviewed_by ? new Date().toISOString() : null;
        }

        const { data, error } = await this.supabase
            .from('fraud_signals')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    async deleteSignal(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('fraud_signals')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }
    }
}
