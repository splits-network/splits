/**
 * Fraud Detection Analyzer Orchestrator
 *
 * Runs all fraud analyzers against an event and returns any detected signals.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CreateFraudSignalInput } from '../repository.js';
import { analyzeRapidSubmission } from './rapid-submission.js';
import { analyzeDuplicateApplication } from './duplicate-application.js';

export async function runFraudAnalysis(
    supabase: SupabaseClient,
    eventType: string,
    eventPayload: Record<string, any>,
): Promise<CreateFraudSignalInput[]> {
    const signals: CreateFraudSignalInput[] = [];

    // Only run fraud analysis on application creation events
    if (eventType !== 'application.created') {
        return signals;
    }

    const results = await Promise.allSettled([
        analyzeRapidSubmission(supabase, eventPayload),
        analyzeDuplicateApplication(supabase, eventPayload),
    ]);

    for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
            signals.push(result.value);
        }
    }

    return signals;
}
