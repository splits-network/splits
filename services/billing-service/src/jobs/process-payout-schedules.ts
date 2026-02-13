#!/usr/bin/env node
/**
 * Payout Schedule Processor - Automation Job
 * 
 * This job runs daily at 2am UTC to process all due payout schedules.
 * It should be executed by a Kubernetes CronJob.
 * 
 * Usage:
 *   node process-payout-schedules.js
 *   or via npm: npm run job:process-schedules
 */

import { createClient } from '@supabase/supabase-js';
import { EventPublisher } from '../v2/shared/events';
import { PayoutScheduleServiceV2 } from '../v2/payout-schedules/service';
import { PayoutAuditRepository } from '../v2/audit/repository';
import { createLogger, Logger } from '@splits-network/shared-logging';
import { PayoutRepository } from '../v2/payouts/repository';
import { PayoutServiceV2 } from '../v2/payouts/service';
import { PlacementSnapshotRepository } from '../v2/placement-snapshot/repository';
import { PlacementSplitRepository } from '../v2/payouts/placement-split-repository';
import { PlacementPayoutTransactionRepository } from '../v2/payouts/placement-payout-transaction-repository';
import { RecruiterConnectRepository } from '../v2/payouts/recruiter-connect-repository';

// Load and validate environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RABBITMQ_URL = process.env.RABBITMQ_URL;

if (!SUPABASE_URL || !SUPABASE_KEY || !RABBITMQ_URL) {
    console.error('Missing required environment variables');
    process.exit(1);
}

// Type-safe constants after validation
const supabaseUrl: string = SUPABASE_URL;
const supabaseKey: string = SUPABASE_KEY;
const rabbitMqUrl: string = RABBITMQ_URL;

async function main() {
    console.log('====================================');
    console.log('Payout Schedule Processor Starting');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('====================================\n');

    try {
        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Initialize event publisher
        const logger: Logger = {
            info: (obj: any, msg?: string) => console.log(JSON.stringify({ level: 'info', ...obj, msg })),
            error: (obj: any, msg?: string) => console.error(JSON.stringify({ level: 'error', ...obj, msg })),
            warn: (obj: any, msg?: string) => console.warn(JSON.stringify({ level: 'warn', ...obj, msg })),
            debug: (obj: any, msg?: string) => console.log(JSON.stringify({ level: 'debug', ...obj, msg })),
        } as Logger;
        const eventPublisher = new EventPublisher(rabbitMqUrl, logger);
        await eventPublisher.connect();

        // Initialize audit repository
        const auditRepository = new PayoutAuditRepository(supabase);

        // Initialize payout service dependencies
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
                orgWideOrganizationIds: [],
                companyIds: [],
                roles: ['platform_admin'],
                isPlatformAdmin: true,
                error: '',
            }),
            eventPublisher
        );

        // Initialize service
        const service = new PayoutScheduleServiceV2(supabase, eventPublisher, auditRepository, payoutService);

        // Process due schedules
        console.log('Processing due payout schedules...\n');
        const results = await service.processDueSchedules();

        // Log results
        console.log('\n====================================');
        console.log('Processing Complete');
        console.log('====================================');
        console.log(`Total Processed: ${results.processed}`);
        console.log(`Total Failed: ${results.failed}`);

        if (results.errors.length > 0) {
            console.log('\nErrors:');
            results.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. Schedule ${error.scheduleId}: ${error.error}`);
            });
        }

        // Close event publisher
        await eventPublisher.close();

        // Exit with appropriate code
        const exitCode = results.failed > 0 ? 1 : 0;
        console.log(`\nExiting with code ${exitCode}`);
        process.exit(exitCode);
    } catch (error) {
        console.error('\n====================================');
        console.error('FATAL ERROR');
        console.error('====================================');
        console.error(error);
        process.exit(1);
    }
}

// Run the job
main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
