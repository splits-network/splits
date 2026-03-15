/**
 * Fraud Detection Analyzer Orchestrator
 *
 * Runs all fraud analyzers against an event and returns any detected signals.
 * Only processes application.created events for fraud analysis.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CreateFraudSignalInput } from '../types';
import { analyzeRapidSubmission } from './rapid-submission';
import { analyzeDuplicateApplication } from './duplicate-application';

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
