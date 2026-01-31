#!/usr/bin/env node
/**
 * Invoice Finalization Job
 * 
 * Finds placement invoices that are still in draft/open status and
 * finalizes them in Stripe. This ensures collectible_at/due_date get set
 * for net terms and triggers payout schedules.
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !STRIPE_SECRET_KEY) {
    console.error('Missing required environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' });

async function main() {
    const { data, error } = await supabase
        .from('placement_invoices')
        .select('id, stripe_invoice_id, invoice_status')
        .in('invoice_status', ['draft', 'open'])
        .limit(100);

    if (error) {
        console.error('Failed to load placement invoices:', error.message);
        process.exit(1);
    }

    for (const invoice of data || []) {
        if (!invoice.stripe_invoice_id) continue;

        try {
            const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id);
            if (stripeInvoice.status === 'draft') {
                await stripe.invoices.finalizeInvoice(invoice.stripe_invoice_id);
                console.log(`Finalized invoice ${invoice.stripe_invoice_id}`);
            }
        } catch (err: any) {
            console.error(`Failed to finalize invoice ${invoice.stripe_invoice_id}:`, err.message || err);
        }
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
