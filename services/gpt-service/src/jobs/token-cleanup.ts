#!/usr/bin/env node
/**
 * GPT Token Cleanup Job
 *
 * Deletes expired authorization codes, revoked refresh tokens,
 * and expired sessions older than 30 days.
 *
 * Runs as a K8s CronJob every 6 hours.
 */

import { createClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabaseUrl: string = SUPABASE_URL;
const supabaseKey: string = SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const logger: Logger = {
        info: (obj: any, msg?: string) => console.log(JSON.stringify({ level: 'info', ...obj, msg })),
        error: (obj: any, msg?: string) => console.error(JSON.stringify({ level: 'error', ...obj, msg })),
        warn: (obj: any, msg?: string) => console.warn(JSON.stringify({ level: 'warn', ...obj, msg })),
        debug: (obj: any, msg?: string) => console.log(JSON.stringify({ level: 'debug', ...obj, msg })),
    } as Logger;

    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const cutoffIso = cutoff.toISOString();

    logger.info({ cutoff: cutoffIso }, 'Starting GPT token cleanup');

    let expiredAuthCodesDeleted = 0;
    let revokedTokensDeleted = 0;
    let expiredSessionsDeleted = 0;

    // 1. Delete expired authorization codes (expired more than 30 days ago)
    try {
        const { data, error } = await supabase
            .from('gpt_authorization_codes')
            .delete()
            .lt('expires_at', cutoffIso)
            .select('id')
            .limit(1000);

        if (error) {
            logger.error({ err: error.message }, 'Failed to delete expired authorization codes');
        } else {
            expiredAuthCodesDeleted = data?.length || 0;
            logger.info({ count: expiredAuthCodesDeleted }, 'Deleted expired authorization codes');
        }
    } catch (err: any) {
        logger.error({ err: err?.message || err }, 'Error deleting expired authorization codes');
    }

    // 2. Delete revoked refresh tokens (revoked more than 30 days ago)
    try {
        const { data, error } = await supabase
            .from('gpt_refresh_tokens')
            .delete()
            .lt('revoked_at', cutoffIso)
            .not('revoked_at', 'is', null)
            .select('id')
            .limit(1000);

        if (error) {
            logger.error({ err: error.message }, 'Failed to delete revoked refresh tokens');
        } else {
            revokedTokensDeleted = data?.length || 0;
            logger.info({ count: revokedTokensDeleted }, 'Deleted revoked refresh tokens');
        }
    } catch (err: any) {
        logger.error({ err: err?.message || err }, 'Error deleting revoked refresh tokens');
    }

    // 3. Delete expired sessions where the associated refresh token is expired
    try {
        // Find sessions with expired refresh tokens (expired more than 30 days ago)
        const { data: expiredSessions, error: findError } = await supabase
            .from('gpt_sessions')
            .select('id, refresh_token_id, gpt_refresh_tokens!inner(expires_at)')
            .lt('gpt_refresh_tokens.expires_at', cutoffIso)
            .limit(1000);

        if (findError) {
            logger.error({ err: findError.message }, 'Failed to find expired sessions');
        } else if (expiredSessions && expiredSessions.length > 0) {
            const sessionIds = expiredSessions.map((s: any) => s.id);

            const { error: deleteError } = await supabase
                .from('gpt_sessions')
                .delete()
                .in('id', sessionIds);

            if (deleteError) {
                logger.error({ err: deleteError.message }, 'Failed to delete expired sessions');
            } else {
                expiredSessionsDeleted = sessionIds.length;
                logger.info({ count: expiredSessionsDeleted }, 'Deleted expired sessions');
            }
        } else {
            logger.info({ count: 0 }, 'No expired sessions to delete');
        }
    } catch (err: any) {
        logger.error({ err: err?.message || err }, 'Error deleting expired sessions');
    }

    // Final summary
    console.log(JSON.stringify({
        expired_auth_codes_deleted: expiredAuthCodesDeleted,
        revoked_tokens_deleted: revokedTokensDeleted,
        expired_sessions_deleted: expiredSessionsDeleted,
    }));

    logger.info('GPT token cleanup complete');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
