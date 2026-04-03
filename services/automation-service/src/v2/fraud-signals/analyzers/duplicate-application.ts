/**
 * Duplicate Application Analyzer
 *
 * Detects when the same candidate has an existing non-terminal application
 * for the same job, which may indicate duplicate submissions.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CreateFraudSignalInput } from '../repository.js';

const TERMINAL_STAGES = ['hired', 'rejected', 'withdrawn'];

export async function analyzeDuplicateApplication(
    supabase: SupabaseClient,
    eventPayload: Record<string, any>,
): Promise<CreateFraudSignalInput | null> {
    const candidateId = eventPayload.candidate_id;
    const jobId = eventPayload.job_id;
    const applicationId = eventPayload.application_id;

    if (!candidateId || !jobId || !applicationId) return null;

    // Check for existing active applications for the same candidate + job
    const { data: existing, error } = await supabase
        .from('applications')
        .select('id, stage')
        .eq('candidate_id', candidateId)
        .eq('job_id', jobId)
        .not('id', 'eq', applicationId)
        .not('stage', 'in', `(${TERMINAL_STAGES.join(',')})`)
        .is('expired_at', null);

    if (error || !existing || existing.length === 0) return null;

    return {
        signal_type: 'duplicate_application',
        severity: 'low',
        signal_data: {
            candidate_id: candidateId,
            job_id: jobId,
            new_application_id: applicationId,
            existing_application_ids: existing.map(a => a.id),
            existing_stages: existing.map(a => a.stage),
        },
        confidence_score: 85,
        candidate_id: candidateId,
        application_id: applicationId,
        job_id: jobId,
    };
}
