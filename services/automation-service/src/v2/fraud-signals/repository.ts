import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FraudSignal, FraudSignalFilters, FraudSignalUpdate } from '../types';

export interface CreateFraudSignalInput {
    event_id: string;
    event_type: string;
    entity_type: FraudSignal['entity_type'];
    entity_id: string;
    signal_type: string;
    severity: FraudSignal['severity'];
    details: Record<string, any>;
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
            event_id: row.event_id,
            event_type: row.event_type,
            entity_type: row.entity_type,
            entity_id: row.entity_id,
            signal_type: row.signal_type,
            severity: row.severity,
            details: row.details || {},
            status: row.status,
            reviewed_by: row.reviewed_by,
            reviewed_at: row.reviewed_at,
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
            .schema('platform')
            .from('fraud_signals')
            .select('*', { count: 'exact' });

        if (filters.entity_type) {
            query = query.eq('entity_type', filters.entity_type);
        }
        if (filters.entity_id) {
            query = query.eq('entity_id', filters.entity_id);
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
            .schema('platform')
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
            .schema('platform')
            .from('fraud_signals')
            .insert({
                event_id: input.event_id,
                event_type: input.event_type,
                entity_type: input.entity_type,
                entity_id: input.entity_id,
                signal_type: input.signal_type,
                severity: input.severity,
                details: input.details,
                status: input.status || 'open',
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

        if (typeof updates.status !== 'undefined') {
            payload.status = updates.status;
        }
        if (typeof updates.severity !== 'undefined') {
            payload.severity = updates.severity;
        }
        if (typeof updates.details !== 'undefined') {
            payload.details = updates.details;
        }
        if (typeof updates.reviewed_by !== 'undefined') {
            payload.reviewed_by = updates.reviewed_by;
            payload.reviewed_at = updates.reviewed_by ? new Date().toISOString() : null;
        }

        const { data, error } = await this.supabase
            .schema('platform')
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
            .schema('platform')
            .from('fraud_signals')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }
    }
}
