/**
 * Recruiter Response Metrics Computation Job
 *
 * Computes daily response rate and average response time per recruiter
 * from application_notes (info_request / info_response pairs).
 * Stores results in analytics.recruiter_response_metrics.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@splits-network/shared-logging';

const logger = createLogger('analytics-service:recruiter-response-metrics');

const BATCH_SIZE = 50;

export async function computeRecruiterResponseMetrics(supabase: SupabaseClient): Promise<void> {
    const startTime = Date.now();
    logger.info('Starting recruiter response metrics computation');

    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const metricDate = yesterday.toISOString().split('T')[0];

        logger.info(`Computing recruiter response metrics for ${metricDate}`);

        // Get all distinct recruiters who have applications
        const recruiterIds = await getActiveRecruiterIds(supabase);

        if (recruiterIds.length === 0) {
            logger.info('No active recruiters found, skipping computation');
            return;
        }

        logger.info(`Processing ${recruiterIds.length} recruiters in batches of ${BATCH_SIZE}`);

        let processed = 0;

        for (let i = 0; i < recruiterIds.length; i += BATCH_SIZE) {
            const batch = recruiterIds.slice(i, i + BATCH_SIZE);
            const metrics = await computeBatchMetrics(supabase, batch);

            if (metrics.length > 0) {
                const rows = metrics.map((m) => ({
                    recruiter_id: m.recruiterId,
                    response_rate: m.responseRate,
                    avg_response_time_hours: m.avgResponseTimeHours,
                    total_requests: m.totalRequests,
                    total_responses: m.totalResponses,
                    metric_date: metricDate,
                    updated_at: new Date().toISOString(),
                }));

                const { error } = await supabase
                    .schema('analytics')
                    .from('recruiter_response_metrics')
                    .upsert(rows, { onConflict: 'recruiter_id,metric_date' });

                if (error) {
                    throw new Error(`Failed to upsert response metrics: ${error.message}`);
                }

                processed += metrics.length;
            }
        }

        const duration = Date.now() - startTime;
        logger.info(
            `Recruiter response metrics complete in ${duration}ms - date: ${metricDate}, recruiters: ${processed}`
        );
    } catch (error: any) {
        logger.error(`Recruiter response metrics computation failed: ${error.message}`);
        throw error;
    }
}

/**
 * Get all recruiter IDs that have at least one application
 */
async function getActiveRecruiterIds(supabase: SupabaseClient): Promise<string[]> {
    const { data, error } = await supabase
        .from('applications')
        .select('candidate_recruiter_id')
        .not('candidate_recruiter_id', 'is', null);

    if (error) throw new Error(`Failed to fetch recruiter IDs: ${error.message}`);

    const unique = new Set((data || []).map((a) => a.candidate_recruiter_id));
    return Array.from(unique);
}

interface RecruiterMetrics {
    recruiterId: string;
    responseRate: number | null;
    avgResponseTimeHours: number | null;
    totalRequests: number;
    totalResponses: number;
}

/**
 * Compute response metrics for a batch of recruiters.
 *
 * Algorithm (mirrors automation-service reputation calculator):
 * 1. Get all application IDs for the batch of recruiters
 * 2. Query application_notes with note_type in ('info_request', 'info_response')
 * 3. Build request-time map, match responses via in_response_to_id
 * 4. Calculate response_rate and avg_response_time per recruiter
 */
async function computeBatchMetrics(
    supabase: SupabaseClient,
    recruiterIds: string[]
): Promise<RecruiterMetrics[]> {
    // Get all applications for this batch
    const { data: applications, error: appError } = await supabase
        .from('applications')
        .select('id, candidate_recruiter_id')
        .in('candidate_recruiter_id', recruiterIds);

    if (appError) throw new Error(`Failed to fetch applications: ${appError.message}`);
    if (!applications || applications.length === 0) return [];

    // Build recruiter → application IDs map
    const recruiterAppMap = new Map<string, string[]>();
    for (const app of applications) {
        const rid = app.candidate_recruiter_id;
        if (!recruiterAppMap.has(rid)) recruiterAppMap.set(rid, []);
        recruiterAppMap.get(rid)!.push(app.id);
    }

    const allAppIds = applications.map((a) => a.id);

    // Query notes in chunks (Supabase IN filter limit)
    const notes = await fetchNotesInChunks(supabase, allAppIds);

    if (notes.length === 0) {
        return recruiterIds.map((id) => ({
            recruiterId: id,
            responseRate: null,
            avgResponseTimeHours: null,
            totalRequests: 0,
            totalResponses: 0,
        }));
    }

    // Group notes by application_id for efficient lookup
    const notesByApp = new Map<string, typeof notes>();
    for (const note of notes) {
        if (!notesByApp.has(note.application_id)) notesByApp.set(note.application_id, []);
        notesByApp.get(note.application_id)!.push(note);
    }

    // Compute metrics per recruiter
    const results: RecruiterMetrics[] = [];

    for (const recruiterId of recruiterIds) {
        const appIds = recruiterAppMap.get(recruiterId) || [];
        const recruiterNotes = appIds.flatMap((aid) => notesByApp.get(aid) || []);

        if (recruiterNotes.length === 0) {
            results.push({
                recruiterId,
                responseRate: null,
                avgResponseTimeHours: null,
                totalRequests: 0,
                totalResponses: 0,
            });
            continue;
        }

        // Build map of request IDs → timestamps
        const requestTimes = new Map<string, Date>();
        for (const note of recruiterNotes) {
            if (note.note_type === 'info_request') {
                requestTimes.set(note.id, new Date(note.created_at));
            }
        }

        const totalRequests = requestTimes.size;

        if (totalRequests === 0) {
            results.push({
                recruiterId,
                responseRate: null,
                avgResponseTimeHours: null,
                totalRequests: 0,
                totalResponses: 0,
            });
            continue;
        }

        // Match responses to requests and compute response times
        const responseTimes: number[] = [];
        const answeredRequests = new Set<string>();

        for (const note of recruiterNotes) {
            if (note.note_type === 'info_response' && note.in_response_to_id) {
                const requestTime = requestTimes.get(note.in_response_to_id);
                if (requestTime) {
                    const responseTime = new Date(note.created_at);
                    const diffHours =
                        (responseTime.getTime() - requestTime.getTime()) / (1000 * 60 * 60);
                    responseTimes.push(diffHours);
                    answeredRequests.add(note.in_response_to_id);
                }
            }
        }

        const totalResponses = answeredRequests.size;
        const responseRate = Math.round((totalResponses / totalRequests) * 10000) / 100;
        const avgResponseTimeHours =
            responseTimes.length > 0
                ? Math.round((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 100) / 100
                : null;

        results.push({
            recruiterId,
            responseRate,
            avgResponseTimeHours,
            totalRequests,
            totalResponses,
        });
    }

    return results;
}

interface NoteRow {
    id: string;
    application_id: string;
    note_type: string;
    in_response_to_id: string | null;
    created_at: string;
}

/**
 * Fetch notes in chunks to avoid Supabase IN filter limits
 */
async function fetchNotesInChunks(
    supabase: SupabaseClient,
    applicationIds: string[]
): Promise<NoteRow[]> {
    const CHUNK_SIZE = 200;
    const allNotes: NoteRow[] = [];

    for (let i = 0; i < applicationIds.length; i += CHUNK_SIZE) {
        const chunk = applicationIds.slice(i, i + CHUNK_SIZE);
        const { data, error } = await supabase
            .from('application_notes')
            .select('id, application_id, note_type, in_response_to_id, created_at')
            .in('application_id', chunk)
            .in('note_type', ['info_request', 'info_response'])
            .order('created_at', { ascending: true });

        if (error) throw new Error(`Failed to fetch application notes: ${error.message}`);
        if (data) allNotes.push(...data);
    }

    return allNotes;
}
