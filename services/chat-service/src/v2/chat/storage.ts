import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@splits-network/shared-logging';

const logger = createLogger({ serviceName: 'chat-service' });

export class ChatStorageClient {
    private supabase: SupabaseClient;
    private bucket: string;

    constructor(supabaseUrl: string, supabaseKey: string, bucket: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });
        this.bucket = bucket;
    }

    async createSignedUploadUrl(path: string, _expiresIn: number = 3600): Promise<string> {
        const { data, error } = await this.supabase.storage
            .from(this.bucket)
            .createSignedUploadUrl(path, { upsert: false });

        if (error) {
            logger.error({ error, path }, 'Failed to create signed upload URL');
            throw new Error(`Failed to create signed upload URL: ${error.message}`);
        }

        return data.signedUrl;
    }

    async createSignedDownloadUrl(path: string, expiresIn: number = 3600): Promise<string> {
        const { data, error } = await this.supabase.storage
            .from(this.bucket)
            .createSignedUrl(path, expiresIn);

        if (error) {
            logger.error({ error, path }, 'Failed to create signed download URL');
            throw new Error(`Failed to create signed download URL: ${error.message}`);
        }

        return data.signedUrl;
    }

    async removeFile(path: string): Promise<void> {
        const { error } = await this.supabase.storage
            .from(this.bucket)
            .remove([path]);
        if (error) {
            logger.error({ error, path }, 'Failed to delete attachment');
            throw new Error(`Failed to delete attachment: ${error.message}`);
        }
    }
}
