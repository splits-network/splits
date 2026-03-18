import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Singleton Supabase client per (url, key) pair.
 *
 * Every backend service should call `createSupabaseClient()` once at startup
 * and pass the returned instance to all repositories, workers, and route
 * handlers.  This avoids the previous pattern of creating hundreds of
 * independent clients across the cluster, each holding its own HTTP
 * connection pool and (when realtime is enabled) WebSocket.
 *
 * Options applied automatically for server-side usage:
 *   - `auth.persistSession: false`  — no session storage on the server
 *   - `auth.autoRefreshToken: false` — service-role keys don't expire
 */

const instanceCache = new Map<string, SupabaseClient>();

function cacheKey(url: string, key: string, schema: string): string {
    return `${url}|${key.slice(0, 8)}|${schema}`;
}

export interface CreateSupabaseClientOptions {
    /** Supabase project URL (e.g. https://xxx.supabase.co) */
    url: string;
    /** Service-role key (preferred) or anon key */
    key: string;
    /** Postgres schema — defaults to 'public' */
    schema?: string;
}

/**
 * Returns a singleton SupabaseClient for the given (url, key, schema) tuple.
 * Safe to call multiple times — subsequent calls return the cached instance.
 */
export function createSupabaseClient(opts: CreateSupabaseClientOptions): SupabaseClient {
    const schema = opts.schema ?? 'public';
    const key = cacheKey(opts.url, opts.key, schema);

    const existing = instanceCache.get(key);
    if (existing) return existing;

    const client = createClient(opts.url, opts.key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
        db: { schema: schema as 'public' },
    });

    instanceCache.set(key, client as SupabaseClient);
    return client as SupabaseClient;
}
