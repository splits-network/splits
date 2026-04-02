/**
 * Fraud Detection Analyzer Orchestrator
 *
 * Runs all fraud analyzers against an event and returns any detected signals.
 * Only processes application.created events for fraud analysis.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CreateFraudSignalInput } from '../types.js';
import { analyzeRapidSubmission } from './rapid-submission.js';
import { analyzeDuplicateApplication } from './duplicate-application.js';

export async function runFraudAnalysis(
  supabase: SupabaseClient,
  eventType: string,
  eventPayload: Record<string, any>,
): Promise<CreateFraudSignalInput[]> {
  if (eventType !== 'application.created') {
    return [];
  }

  const results = await Promise.allSettled([
    analyzeRapidSubmission(supabase, eventPayload),
    analyzeDuplicateApplication(supabase, eventPayload),
  ]);

  const signals: CreateFraudSignalInput[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      signals.push(result.value);
    }
  }

  return signals;
}
