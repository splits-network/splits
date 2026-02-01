import { SupabaseClient } from '@supabase/supabase-js';
import { PlacementInvoice, PlacementInvoiceCreate, PlacementInvoiceUpdate } from './types';

interface PlacementInvoiceListResult {
    data: PlacementInvoice[];
    total: number;
}

export class PlacementInvoiceRepository {
    constructor(private supabase: SupabaseClient) { }

    async listByCompany(companyId: string, page: number, limit: number): Promise<PlacementInvoiceListResult> {
        const offset = (page - 1) * limit;
        const { data, error, count } = await this.supabase
            .from('placement_invoices')
            .select('*', { count: 'exact' })
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw new Error(`Failed to list placement invoices: ${error.message}`);
        }

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async getByPlacementId(placementId: string): Promise<PlacementInvoice | null> {
        const { data, error } = await this.supabase
            .from('placement_invoices')
            .select('*')
            .eq('placement_id', placementId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to get placement invoice: ${error.message}`);
        }

        return data as PlacementInvoice;
    }

    async create(payload: PlacementInvoiceCreate): Promise<PlacementInvoice> {
        const { data, error } = await this.supabase
            .from('placement_invoices')
            .insert(payload)
            .select('*')
            .single();

        if (error) {
            throw new Error(`Failed to create placement invoice: ${error.message}`);
        }

        return data as PlacementInvoice;
    }

    async updateByStripeInvoiceId(stripeInvoiceId: string, updates: PlacementInvoiceUpdate): Promise<void> {
        const { error } = await this.supabase
            .from('placement_invoices')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('stripe_invoice_id', stripeInvoiceId);

        if (error) {
            throw new Error(`Failed to update placement invoice: ${error.message}`);
        }
    }
}
