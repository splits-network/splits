#!/usr/bin/env node
/**
 * Escrow Release Processor - Automation Job
 * 
 * This job runs daily at 3am UTC to process all due escrow hold releases.
 * It should be executed by a Kubernetes CronJob.
 * 
 * Usage:
 *   node process-escrow-releases.js
 *   or via npm: npm run job:process-escrow
 */

import { createClient } from '@supabase/supabase-js';
import { EventPublisher } from '../v2/shared/events';
import { EscrowHoldServiceV2 } from '../v2/escrow-holds/service';
import { Logger } from 'pino';

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
    console.log('Escrow Release Processor Starting');
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

        // Initialize service
        const service = new EscrowHoldServiceV2(supabase, eventPublisher);

        // Process due releases
        console.log('Processing due escrow releases...\n');
        const results = await service.processDueReleases();

        // Log results
        console.log('\n====================================');
        console.log('Processing Complete');
        console.log('====================================');
        console.log(`Total Processed: ${results.processed}`);
        console.log(`Total Failed: ${results.failed}`);

        if (results.errors.length > 0) {
            console.log('\nErrors:');
            results.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. Hold ${error.holdId}: ${error.error}`);
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
