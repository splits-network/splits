import { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'interview-recordings';

interface SignedUrlResult {
    url: string;
    expires_at: string;
}

interface SignedUrlOptions {
    storagePath: string;
    expiresInSeconds?: number;
    download?: boolean | string;
}

/**
 * Generate a time-limited signed URL for a recording in Supabase Storage.
 */
export async function generateSignedUrl(
    supabase: SupabaseClient,
    options: SignedUrlOptions,
): Promise<SignedUrlResult> {
    const expiresIn = options.expiresInSeconds ?? 3600; // 1 hour default

    const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(options.storagePath, expiresIn, {
            download: options.download,
        });

    if (error || !data?.signedUrl) {
        throw Object.assign(
            new Error(`Failed to generate signed URL: ${error?.message || 'Unknown error'}`),
            { statusCode: 500 },
        );
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
        url: data.signedUrl,
        expires_at: expiresAt.toISOString(),
    };
}

/**
 * Extract the storage path from a recording blob URL or path.
 * Handles both full URLs and relative paths like "recordings/id/file.mp4".
 */
export function extractStoragePath(blobUrl: string): string {
    if (!blobUrl.startsWith('http')) {
        return blobUrl;
    }

    try {
        const parsed = new URL(blobUrl);
        // Supabase storage URLs: /storage/v1/object/public/bucket/path
        const pathParts = parsed.pathname.split('/');
        const bucketIndex = pathParts.indexOf(BUCKET);
        if (bucketIndex !== -1) {
            return pathParts.slice(bucketIndex + 1).join('/');
        }
        // Fallback: last segments after bucket-like path
        return pathParts.slice(-3).join('/');
    } catch {
        return blobUrl;
    }
}
