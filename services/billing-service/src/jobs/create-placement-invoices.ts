#!/usr/bin/env node
/**
 * Placement Invoice Creator
 *
 * Creates Stripe invoices once guarantee periods complete.
 */

import { createClient } from '@supabase/supabase-js';
import { PlacementInvoiceRepository } from '../v2/placement-invoices/repository';
import { PlacementSnapshotRepository } from '../v2/placement-snapshot/repository';
import { CompanyBillingProfileRepository } from '../v2/company-billing/repository';
import { CompanyBillingProfileService } from '../v2/company-billing/service';
import { PlacementInvoiceService } from '../v2/placement-invoices/service';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !STRIPE_SECRET_KEY) {
    console.error('Missing required environment variables');
    process.exit(1);
}

const supabaseUrl: string = SUPABASE_URL;
const supabaseKey: string = SUPABASE_KEY;
const stripeSecretKey: string = STRIPE_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const nowIso = new Date().toISOString();

    const { data: placements, error } = await supabase
        .from('placements')
        .select('id, state, guarantee_expires_at')
        .not('guarantee_expires_at', 'is', null)
        .lte('guarantee_expires_at', nowIso)
        .in('state', ['active', 'completed', 'hired'])
        .limit(200);

    if (error) {
        console.error('Failed to load placements:', error.message);
        process.exit(1);
    }

    const invoiceRepository = new PlacementInvoiceRepository(supabase);
    const snapshotRepository = new PlacementSnapshotRepository(supabase);
    const billingProfileRepository = new CompanyBillingProfileRepository(supabase);
    const billingProfileService = new CompanyBillingProfileService(
        billingProfileRepository,
        async () => ({
            identityUserId: 'system',
            candidateId: null,
            recruiterId: null,
            organizationIds: [],
            companyIds: [],
            roles: ['platform_admin'],
            isPlatformAdmin: true,
            error: '',
        }),
        stripeSecretKey
    );

    const invoiceService = new PlacementInvoiceService(
        supabase,
        invoiceRepository,
        snapshotRepository,
        billingProfileRepository,
        billingProfileService,
        async () => ({
            identityUserId: 'system',
            candidateId: null,
            recruiterId: null,
            organizationIds: [],
            companyIds: [],
            roles: ['platform_admin'],
            isPlatformAdmin: true,
            error: '',
        }),
        stripeSecretKey
    );

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const placement of placements || []) {
        try {
            const existing = await invoiceRepository.getByPlacementId(placement.id);
            if (existing) {
                skipped++;
                continue;
            }

            await invoiceService.createForPlacement(placement.id, 'system');
            created++;
        } catch (err: any) {
            failed++;
            console.error(
                `Failed to create invoice for placement ${placement.id}:`,
                err?.message || err
            );
        }
    }

    console.log(
        JSON.stringify({
            created,
            skipped,
            failed,
            total: placements?.length || 0,
        })
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
