import { SupabaseClient } from '@supabase/supabase-js';
import { PlacementInvoice } from '../placement-invoices/types';

export class InvoiceEligibilityRepository {
    constructor(private supabase: SupabaseClient) { }

    async getInvoiceByPlacementId(placementId: string): Promise<PlacementInvoice | null> {
        const { data, error } = await this.supabase
            .from('placement_invoices')
            .select('*')
            .eq('placement_id', placementId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to load placement invoice: ${error.message}`);
        }

        return data as PlacementInvoice;
    }
}
