/**
 * One-time migration script: encrypt existing plaintext tokens in the database.
 *
 * Encrypts:
 *   - oauth_connections.access_token_enc
 *   - oauth_connections.refresh_token_enc
 *   - ats_integrations.api_key_encrypted
 *   - ats_integrations.webhook_secret
 *
 * Run with: npx tsx scripts/encrypt-existing-tokens.ts
 *
 * Safe to re-run — skips rows that are already encrypted (checks iv:authTag:ciphertext format).
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { getCryptoService, CryptoService } from '../packages/shared-config/src/crypto';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});

async function encryptOAuthConnections(crypto: CryptoService) {
    const { data: rows, error } = await supabase
        .from('oauth_connections')
        .select('id, access_token_enc, refresh_token_enc');

    if (error) throw new Error(`Failed to read oauth_connections: ${error.message}`);
    if (!rows?.length) {
        console.log('  No oauth_connections rows to process');
        return;
    }

    let encrypted = 0;
    let skipped = 0;

    for (const row of rows) {
        const updates: Record<string, string> = {};

        if (row.access_token_enc && !CryptoService.isEncrypted(row.access_token_enc)) {
            updates.access_token_enc = crypto.encrypt(row.access_token_enc);
        }
        if (row.refresh_token_enc && !CryptoService.isEncrypted(row.refresh_token_enc)) {
            updates.refresh_token_enc = crypto.encrypt(row.refresh_token_enc);
        }

        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
                .from('oauth_connections')
                .update(updates)
                .eq('id', row.id);

            if (updateError) {
                console.error(`  Failed to update row ${row.id}: ${updateError.message}`);
            } else {
                encrypted++;
            }
        } else {
            skipped++;
        }
    }

    console.log(`  oauth_connections: ${encrypted} encrypted, ${skipped} skipped (already encrypted)`);
}

async function encryptATSIntegrations(crypto: CryptoService) {
    const { data: rows, error } = await supabase
        .from('ats_integrations')
        .select('id, api_key_encrypted, webhook_secret');

    if (error) throw new Error(`Failed to read ats_integrations: ${error.message}`);
    if (!rows?.length) {
        console.log('  No ats_integrations rows to process');
        return;
    }

    let encrypted = 0;
    let skipped = 0;

    for (const row of rows) {
        const updates: Record<string, string> = {};

        if (row.api_key_encrypted && !CryptoService.isEncrypted(row.api_key_encrypted)) {
            updates.api_key_encrypted = crypto.encrypt(row.api_key_encrypted);
        }
        if (row.webhook_secret && !CryptoService.isEncrypted(row.webhook_secret)) {
            updates.webhook_secret = crypto.encrypt(row.webhook_secret);
        }

        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
                .from('ats_integrations')
                .update(updates)
                .eq('id', row.id);

            if (updateError) {
                console.error(`  Failed to update row ${row.id}: ${updateError.message}`);
            } else {
                encrypted++;
            }
        } else {
            skipped++;
        }
    }

    console.log(`  ats_integrations: ${encrypted} encrypted, ${skipped} skipped (already encrypted)`);
}

async function main() {
    console.log('Encrypting existing plaintext tokens...\n');

    const crypto = await getCryptoService();
    console.log('Encryption key loaded from Vault\n');

    console.log('Processing oauth_connections...');
    await encryptOAuthConnections(crypto);

    console.log('\nProcessing ats_integrations...');
    await encryptATSIntegrations(crypto);

    console.log('\nDone. All existing tokens are now encrypted at rest.');
}

main().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
