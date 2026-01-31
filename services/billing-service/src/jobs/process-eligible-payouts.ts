#!/usr/bin/env node
/**
 * Payout Eligibility Processor
 * 
 * For placements with collectible invoices, trigger payout schedule processing.
 */

import { createClient } from '@supabase/supabase-js';
import { EventPublisher } from '../v2/shared/events';
import { PayoutScheduleServiceV2 } from '../v2/payout-schedules/service';
import { PayoutAuditRepository } from '../v2/audit/repository';
import { PayoutRepository } from '../v2/payouts/repository';
import { PayoutServiceV2 } from '../v2/payouts/service';
import { PlacementSnapshotRepository } from '../v2/placement-snapshot/repository';
import { PlacementSplitRepository } from '../v2/payouts/placement-split-repository';
import { PlacementPayoutTransactionRepository } from '../v2/payouts/placement-payout-transaction-repository';
import { RecruiterConnectRepository } from '../v2/payouts/recruiter-connect-repository';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RABBITMQ_URL = process.env.RABBITMQ_URL;

if (!SUPABASE_URL || !SUPABASE_KEY || !RABBITMQ_URL) {
    console.error('Missing required environment variables');
    process.exit(1);
}

const supabaseUrl: string = SUPABASE_URL;
const supabaseKey: string = SUPABASE_KEY;
const rabbitMqUrl: string = RABBITMQ_URL;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: invoices, error } = await supabase
        .from('placement_invoices')
        .select('placement_id, invoice_status, collectible_at')
        .or('invoice_status.eq.paid,invoice_status.eq.open')
        .limit(200);

    if (error) {
        console.error('Failed to load placement invoices:', error.message);
        process.exit(1);
    }

    const logger = {
        info: (obj: any, msg?: string) => console.log(JSON.stringify({ level: 'info', ...obj, msg })),
        error: (obj: any, msg?: string) => console.error(JSON.stringify({ level: 'error', ...obj, msg })),
        warn: (obj: any, msg?: string) => console.warn(JSON.stringify({ level: 'warn', ...obj, msg })),
        debug: (obj: any, msg?: string) => console.log(JSON.stringify({ level: 'debug', ...obj, msg })),
    } as any;

    const eventPublisher = new EventPublisher(rabbitMqUrl, logger);
    await eventPublisher.connect();

    const auditRepository = new PayoutAuditRepository(supabase);
    const payoutRepository = new PayoutRepository(supabaseUrl, supabaseKey);
    const snapshotRepository = new PlacementSnapshotRepository(supabase);
    const splitRepository = new PlacementSplitRepository(supabase);
    const transactionRepository = new PlacementPayoutTransactionRepository(supabase);
    const recruiterConnectRepository = new RecruiterConnectRepository(supabase);

    const payoutService = new PayoutServiceV2(
        payoutRepository,
        snapshotRepository,
        splitRepository,
        transactionRepository,
        recruiterConnectRepository,
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
        eventPublisher
    );

    const payoutScheduleService = new PayoutScheduleServiceV2(
        supabase,
        eventPublisher,
        auditRepository,
        payoutService
    );

    for (const invoice of invoices || []) {
        if (!invoice.placement_id) continue;
        const collectible =
            invoice.invoice_status === 'paid' ||
            (invoice.collectible_at && new Date(invoice.collectible_at) <= new Date());

        if (!collectible) continue;

        await payoutScheduleService.processDueSchedulesForPlacement(invoice.placement_id);
    }

    await eventPublisher.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
