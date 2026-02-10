import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createLogger } from "@splits-network/shared-logging";

const logger = createLogger({ serviceName: "document-service" });

export class StorageClient {
    private supabase: SupabaseClient;
    private readonly buckets = {
        candidates: "candidate-documents",
        companies: "company-documents",
        system: "system-documents",
        profiles: "profile-images", // Add profile images bucket
    };

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }

    /**
     * Get the appropriate bucket name for an entity type and document type
     */
    getBucketName(entityType: string, documentType?: string): string {
        switch (entityType) {
            case "candidate":
                return this.buckets.candidates;
            case "application":
                // Company documents go to company bucket, candidate docs go to candidate bucket
                const companyDocTypes = [
                    "offer_letter",
                    "employment_contract",
                    "benefits_summary",
                    "company_handbook",
                    "nda",
                    "company_document",
                ];
                return companyDocTypes.includes(documentType || "")
                    ? this.buckets.companies
                    : this.buckets.candidates;
            case "job":
            case "company":
                return this.buckets.companies;
            case "contract":
            case "invoice":
            case "placement":
                return this.buckets.system;
            default:
                return this.buckets.system;
        }
    }

    /**
     * Upload a file to Supabase Storage
     */
    async uploadFile(
        bucket: string,
        path: string,
        file: Buffer,
        contentType: string,
    ): Promise<{ path: string; publicUrl?: string }> {
        logger.info(`Uploading file to bucket: ${bucket}, path: ${path}`);

        const { data, error } = await this.supabase.storage
            .from(bucket)
            .upload(path, file, {
                contentType,
                upsert: false,
            });

        if (error) {
            logger.error({ error, bucket, path }, "Storage upload failed");
            throw new Error(`Failed to upload file: ${error.message}`);
        }

        logger.info({ bucket, path: data.path }, "File uploaded successfully");

        return {
            path: data.path,
        };
    }

    /**
     * Generate a signed URL for downloading a file
     */
    async getSignedUrl(
        bucket: string,
        path: string,
        expiresIn: number = 3600,
    ): Promise<string> {
        logger.info(`Generating signed URL for: ${bucket}/${path}`);

        const { data, error } = await this.supabase.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);

        if (error) {
            logger.error(
                { error, bucket, path },
                "Failed to generate signed URL",
            );
            throw new Error(`Failed to generate signed URL: ${error.message}`);
        }

        return data.signedUrl;
    }

    /**
     * Delete a file from storage
     */
    async deleteFile(bucket: string, path: string): Promise<void> {
        logger.info(`Deleting file from bucket: ${bucket}, path: ${path}`);

        const { error } = await this.supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) {
            logger.error({ error, bucket, path }, "Storage delete failed");
            throw new Error(`Failed to delete file: ${error.message}`);
        }

        logger.info({ bucket, path }, "File deleted successfully");
    }

    /**
     * Get file metadata
     */
    async getFileMetadata(
        bucket: string,
        path: string,
    ): Promise<{
        name: string;
        size: number;
        contentType: string;
        lastModified: Date;
    } | null> {
        logger.info(`Getting file metadata for: ${bucket}/${path}`);

        const { data, error } = await this.supabase.storage
            .from(bucket)
            .list(path.split("/").slice(0, -1).join("/"), {
                search: path.split("/").pop(),
            });

        if (error || !data || data.length === 0) {
            logger.error(
                { error, bucket, path },
                "Failed to get file metadata",
            );
            return null;
        }

        const file = data[0];
        return {
            name: file.name,
            size: file.metadata?.size || 0,
            contentType: file.metadata?.mimetype || "application/octet-stream",
            lastModified: new Date(file.updated_at || file.created_at),
        };
    }

    /**
     * Ensure buckets exist (for development/setup)
     */
    async ensureBucketsExist(): Promise<void> {
        logger.info("Ensuring storage buckets exist");

        for (const [key, bucketName] of Object.entries(this.buckets)) {
            try {
                const { data: buckets } =
                    await this.supabase.storage.listBuckets();
                const exists = buckets?.some((b) => b.name === bucketName);

                if (!exists) {
                    logger.info(`Creating bucket: ${bucketName}`);
                    const isPublicBucket = bucketName === this.buckets.profiles; // Profile images should be public
                    await this.supabase.storage.createBucket(bucketName, {
                        public: isPublicBucket,
                        fileSizeLimit: 10 * 1024 * 1024, // 10MB
                    });
                    logger.info(
                        `Bucket created: ${bucketName} (public: ${isPublicBucket})`,
                    );
                }
            } catch (error) {
                logger.error(
                    { error },
                    `Failed to ensure bucket exists: ${bucketName}`,
                );
            }
        }
    }

    /**
     * Profile Image Methods
     */
    async uploadToProfileImagesBucket(
        path: string,
        file: Buffer,
        contentType: string,
    ): Promise<void> {
        logger.info(`Uploading profile image: ${path}`);

        const { error } = await this.supabase.storage
            .from(this.buckets.profiles)
            .upload(path, file, {
                contentType,
                cacheControl: "3600",
                upsert: true,
            });

        if (error) {
            logger.error({ error, path }, "Failed to upload profile image");
            throw new Error(`Upload failed: ${error.message}`);
        }

        logger.info(`Profile image uploaded successfully: ${path}`);
    }

    async getProfileImagePublicUrl(path: string): Promise<string> {
        const { data } = this.supabase.storage
            .from(this.buckets.profiles)
            .getPublicUrl(path);

        return data.publicUrl;
    }

    async deleteProfileImage(path: string): Promise<void> {
        logger.info(`Deleting profile image: ${path}`);

        const { error } = await this.supabase.storage
            .from(this.buckets.profiles)
            .remove([path]);

        if (error) {
            logger.error({ error, path }, "Failed to delete profile image");
            throw new Error(`Delete failed: ${error.message}`);
        }

        logger.info(`Profile image deleted successfully: ${path}`);
    }

    /**
     * Health check method for storage connectivity
     */
    async healthCheck(): Promise<boolean> {
        try {
            // Test storage connectivity by listing buckets
            const { data, error } = await this.supabase.storage.listBuckets();
            return !error;
        } catch (error) {
            logger.error({ error }, "Storage health check failed");
            return false;
        }
    }
}

// Export the class, not an instance
// Instantiate in index.ts with proper config
