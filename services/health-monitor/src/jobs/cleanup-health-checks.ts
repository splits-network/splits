#!/usr/bin/env node
/**
 * Health Checks Cleanup Job
 *
 * Deletes raw health_checks rows older than 7 days.
 * The health_incidents table retains the important event history;
 * raw checks are only needed for short-term timeline graphs.
 *
 * Runs as a K8s CronJob once daily at 03:00 UTC.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RETENTION_DAYS = Number(process.env.RETENTION_DAYS) || 7;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(
        "Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY",
    );
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function log(level: string, obj: Record<string, unknown>, msg?: string) {
    console[level === "error" ? "error" : "log"](
        JSON.stringify({ level, ...obj, msg }),
    );
}

async function main() {
    const cutoff = new Date(
        Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );
    const cutoffIso = cutoff.toISOString();

    log("info", { cutoff: cutoffIso, retentionDays: RETENTION_DAYS }, "Starting health_checks cleanup");

    try {
        // Delete in batches to avoid long-running transactions
        let totalDeleted = 0;
        let batchDeleted: number;
        const BATCH_SIZE = 5000;

        do {
            const { data, error } = await supabase
                .from("health_checks")
                .delete()
                .lt("checked_at", cutoffIso)
                .select("id")
                .limit(BATCH_SIZE);

            if (error) {
                log("error", { err: error.message }, "Failed to delete health_checks batch");
                process.exit(1);
            }

            batchDeleted = data?.length || 0;
            totalDeleted += batchDeleted;

            if (batchDeleted > 0) {
                log("info", { batchDeleted, totalDeleted }, "Deleted health_checks batch");
            }
        } while (batchDeleted === BATCH_SIZE);

        log("info", { totalDeleted }, "Health checks cleanup complete");
    } catch (err: any) {
        log("error", { err: err?.message || err }, "Health checks cleanup failed");
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
