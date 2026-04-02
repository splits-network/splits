/**
 * Rapid Submission Analyzer
 *
 * Detects when a recruiter submits more than a threshold number of
 * applications within a short time window, which may indicate
 * automated/spam submissions.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CreateFraudSignalInput } from '../types.js';

const MAX_SUBMISSIONS_IN_WINDOW = parseInt(process.env.FRAUD_RAPID_SUBMISSION_THRESHOLD || '10', 10);
const WINDOW_MINUTES = parseInt(process.env.FRAUD_RAPID_SUBMISSION_WINDOW_MINUTES || '30', 10);

export async function analyzeRapidSubmission(
  supabase: SupabaseClient,
  eventPayload: Record<string, any>,
): Promise<CreateFraudSignalInput | null> {
  const recruiterId = eventPayload.recruiter_id || eventPayload.candidate_recruiter_id;
  if (!recruiterId) return null;

  const windowStart = new Date();
  windowStart.setMinutes(windowStart.getMinutes() - WINDOW_MINUTES);

  const { count, error } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('candidate_recruiter_id', recruiterId)
    .gte('created_at', windowStart.toISOString());

  if (error || count === null) return null;

  if (count >= MAX_SUBMISSIONS_IN_WINDOW) {
    return {
      signal_type: 'rapid_submission',
      severity: count >= MAX_SUBMISSIONS_IN_WINDOW * 2 ? 'high' : 'medium',
      signal_data: {
        recruiter_id: recruiterId,
        submission_count: count,
        window_minutes: WINDOW_MINUTES,
        threshold: MAX_SUBMISSIONS_IN_WINDOW,
        application_id: eventPayload.application_id,
      },
      confidence_score: Math.min(95, 60 + (count - MAX_SUBMISSIONS_IN_WINDOW) * 5),
      recruiter_id: recruiterId,
      application_id: eventPayload.application_id || undefined,
    };
  }

  return null;
}
