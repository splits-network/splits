/**
 * Content Image Storage
 *
 * Lightweight wrapper around Supabase Storage for the content-images bucket.
 * Public bucket — images are served directly via public URL.
 */

import { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'content-images';

export class ContentImageStorage {
    constructor(private supabase: SupabaseClient) {}

    /**
     * Upload a file to the content-images bucket.
     * Returns the storage path.
     */
    async upload(path: string, file: Buffer, contentType: string): Promise<string> {
        const { error } = await this.supabase.storage
            .from(BUCKET)
            .upload(path, file, {
                contentType,
                cacheControl: '3600',
                upsert: false,
            });

        if (error) throw new Error(`Failed to upload image: ${error.message}`);

        return path;
    }

    /**
     * Get the public URL for a stored image.
     */
    getPublicUrl(path: string): string {
        const { data } = this.supabase.storage
            .from(BUCKET)
            .getPublicUrl(path);

        return data.publicUrl;
    }

    /**
     * Delete a file from the content-images bucket.
     */
    async deleteFile(path: string): Promise<void> {
        const { error } = await this.supabase.storage
            .from(BUCKET)
            .remove([path]);

        if (error) throw new Error(`Failed to delete image from storage: ${error.message}`);
    }
}
