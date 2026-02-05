import { fileTypeFromBuffer } from "file-type";
import { randomUUID } from "crypto";
import { StorageClient } from "../../storage";
import { DocumentFilters, DocumentUpdate, DocumentCreateInput } from "./types";
import { buildPaginationResponse } from "../shared/helpers";
import { DocumentRepositoryV2 } from "./repository";
import { EventPublisher } from "../shared/events";
import { AccessContextResolver } from "@splits-network/shared-access-context";
import { SupabaseClient } from "@supabase/supabase-js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/rtf",
];

// Profile image constants
const PROFILE_IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const PROFILE_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface CreateDocumentPayload extends DocumentCreateInput {
    file: Buffer;
    originalFileName: string;
}

export class DocumentServiceV2 {
    private accessResolver: AccessContextResolver;

    constructor(
        supabase: SupabaseClient,
        private repository: DocumentRepositoryV2,
        private storage: StorageClient,
        private eventPublisher?: EventPublisher,
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    private async validateFile(
        file: Buffer,
        filename: string,
    ): Promise<string> {
        if (file.length > MAX_FILE_SIZE) {
            throw new Error(
                `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
            );
        }

        const detectedType = await fileTypeFromBuffer(file);
        let contentType = detectedType?.mime;

        if (!contentType) {
            const extension = filename.split(".").pop()?.toLowerCase();
            switch (extension) {
                case "pdf":
                    contentType = "application/pdf";
                    break;
                case "doc":
                    contentType = "application/msword";
                    break;
                case "docx":
                    contentType =
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    break;
                case "txt":
                    contentType = "text/plain";
                    break;
                case "rtf":
                    contentType = "application/rtf";
                    break;
                default:
                    throw new Error(
                        "Unsupported file type. Allowed: PDF, DOC, DOCX, TXT, RTF",
                    );
            }
        }

        if (!ALLOWED_MIME_TYPES.includes(contentType)) {
            throw new Error(`File type ${contentType} is not allowed`);
        }

        return contentType;
    }

    private generateStoragePath(
        entityType: string,
        entityId: string,
        filename: string,
    ): string {
        const timestamp = Date.now();
        const slug = randomUUID().split("-")[0];
        const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
        return `${entityType}/${entityId}/${timestamp}-${slug}-${sanitized}`;
    }

    async listDocuments(clerkUserId: string, filters: DocumentFilters) {
        const result = await this.repository.findDocuments(
            clerkUserId,
            filters,
        );
        return {
            data: result.data,
            pagination: buildPaginationResponse(
                filters.page ?? 1,
                filters.limit ?? 25,
                result.total,
            ),
        };
    }

    async getDocument(id: string, clerkUserId: string) {
        const document = await this.repository.findDocument(id, clerkUserId);
        if (!document) {
            throw new Error("Document not found");
        }

        const downloadUrl = await this.storage.getSignedUrl(
            document.storage_bucket,
            document.file_path,
            3600,
        );

        return {
            ...document,
            download_url: downloadUrl,
        };
    }

    async createDocument(clerkUserId: string, payload: CreateDocumentPayload) {
        const mimeType = await this.validateFile(
            payload.file,
            payload.originalFileName,
        );
        const storageBucket = this.storage.getBucketName(
            payload.entity_type,
            payload.document_type,
        );
        const storagePath = this.generateStoragePath(
            payload.entity_type,
            payload.entity_id,
            payload.originalFileName,
        );

        const userContext = await this.accessResolver.resolve(clerkUserId);
        await this.storage.uploadFile(
            storageBucket,
            storagePath,
            payload.file,
            mimeType,
        );

        const document = await this.repository.createDocument(clerkUserId, {
            entity_type: payload.entity_type,
            entity_id: payload.entity_id,
            document_type: payload.document_type,
            file_name: payload.originalFileName,
            file_path: storagePath,
            file_size: payload.file.length,
            mime_type: mimeType,
            storage_bucket: storageBucket,
            metadata: payload.metadata,
            processing_status: "pending",
        });

        if (this.eventPublisher) {
            await this.eventPublisher.publish("document.uploaded", {
                document_id: document.id,
                entity_type: document.entity_type,
                entity_id: document.entity_id,
                file_path: document.file_path,
                bucket_name: document.storage_bucket,
                filename: document.file_name,
                mime_type: document.mime_type,
                file_size: document.file_size,
                uploaded_at: document.created_at,
                uploaded_by: userContext.identityUserId,
            });
        }

        return this.getDocument(document.id, clerkUserId);
    }

    async updateDocument(
        id: string,
        updates: DocumentUpdate,
        clerkUserId: string,
    ) {
        // Handle primary resume logic
        if (updates.metadata?.is_primary_for_candidate === true) {
            // Get the document to check if it's a resume
            const document = await this.repository.findDocument(
                id,
                clerkUserId,
            );
            if (document && document.document_type === "resume") {
                await this.clearOtherPrimaryResumes(id, clerkUserId);
            }
        }

        const updated = await this.repository.updateDocument(
            id,
            clerkUserId,
            updates,
        );

        if (this.eventPublisher) {
            await this.eventPublisher.publish("updated", {
                document_id: id,
                updates,
            });
        }

        return updated;
    }
    private async clearOtherPrimaryResumes(
        documentId: string,
        clerkUserId: string,
    ) {
        const accessContext = await this.accessResolver.resolve(clerkUserId);
        if (!accessContext.identityUserId) {
            throw new Error(
                "User context required for primary resume management",
            );
        }

        // Get candidate ID from the document being updated
        const document = await this.repository.findDocument(
            documentId,
            clerkUserId,
        );
        if (!document || document.entity_type !== "candidate") {
            throw new Error("Document not found or not a candidate document");
        }

        // Clear primary flag from all other resumes for this candidate
        const candidateResumes = await this.repository.findDocuments(
            clerkUserId,
            {
                entity_type: "candidate",
                entity_id: document.entity_id,
                document_type: "resume",
            },
        );

        for (const resume of candidateResumes.data) {
            if (
                resume.id !== documentId &&
                resume.metadata?.is_primary_for_candidate
            ) {
                const clearedMetadata = { ...resume.metadata };
                delete clearedMetadata.is_primary_for_candidate;

                await this.repository.updateDocument(resume.id, clerkUserId, {
                    metadata: clearedMetadata,
                });
            }
        }
    }
    async deleteDocument(id: string, clerkUserId: string) {
        const existing = await this.repository.findDocument(id, clerkUserId);
        if (!existing) {
            throw new Error("Document not found");
        }

        // Only soft delete the database record - DO NOT delete the file from storage
        // Files may be attached to applications/entities that need to remain accessible
        await this.repository.softDeleteDocument(id, clerkUserId);

        if (this.eventPublisher) {
            await this.eventPublisher.publish("deleted", {
                document_id: id,
                entity_type: existing.entity_type,
                entity_id: existing.entity_id,
            });
        }
    }

    // Profile Image Upload Methods
    async uploadProfileImage(
        clerkUserId: string,
        file: Buffer,
        originalFileName: string,
    ) {
        // Validate image file
        const mimeType = await this.validateImageFile(file, originalFileName);

        // Get user context
        const userContext = await this.accessResolver.resolve(clerkUserId);

        if (!userContext.identityUserId) {
            throw new Error("User not found in identity system");
        }

        // Delete old profile image if it exists (clean up storage)
        try {
            const existingImage =
                await this.repository.findProfileImageByUserId(
                    userContext.identityUserId,
                );
            if (existingImage) {
                // Delete from Supabase Storage
                await this.storage.deleteProfileImage(existingImage.file_path);
                // Soft-delete the document record
                await this.repository.softDeleteDocumentInternal(
                    existingImage.id,
                );
            }
        } catch (error) {
            // Log but don't fail - cleanup is best effort
            console.error("Failed to cleanup old profile image:", error);
        }

        // Generate storage path: profile-images/{userId}/{timestamp}-{filename}
        const timestamp = Date.now();
        const sanitizedName = this.sanitizeFilename(originalFileName);
        const storagePath = `${userContext.identityUserId}/${timestamp}-${sanitizedName}`;

        // Upload to Supabase Storage profile-images bucket
        await this.storage.uploadToProfileImagesBucket(
            storagePath,
            file,
            mimeType,
        );

        // Get public URL
        const publicUrl =
            await this.storage.getProfileImagePublicUrl(storagePath);

        // Create document record
        const document = await this.repository.createDocument(clerkUserId, {
            entity_type: "profile_image",
            entity_id: userContext.identityUserId,
            document_type: "profile_image",
            file_name: originalFileName,
            file_path: storagePath,
            file_size: file.length,
            mime_type: mimeType,
            storage_bucket: "profile-images",
            metadata: {
                is_profile_image: true,
                public_url: publicUrl,
            },
            processing_status: "processed", // Profile images don't need text extraction
        });

        if (this.eventPublisher) {
            await this.eventPublisher.publish("profile_image.uploaded", {
                document_id: document.id,
                user_id: userContext.identityUserId,
                public_url: publicUrl,
                file_path: storagePath,
                uploaded_by: userContext.identityUserId,
            });
        }

        return {
            ...document,
            public_url: publicUrl,
        };
    }

    private async validateImageFile(
        file: Buffer,
        filename: string,
    ): Promise<string> {
        if (file.length > PROFILE_IMAGE_MAX_SIZE) {
            throw new Error(
                `Image size exceeds ${PROFILE_IMAGE_MAX_SIZE / 1024 / 1024}MB limit`,
            );
        }

        const detectedType = await fileTypeFromBuffer(file);
        let contentType = detectedType?.mime;

        if (!contentType) {
            const extension = filename.split(".").pop()?.toLowerCase();
            switch (extension) {
                case "jpg":
                case "jpeg":
                    contentType = "image/jpeg";
                    break;
                case "png":
                    contentType = "image/png";
                    break;
                case "webp":
                    contentType = "image/webp";
                    break;
                default:
                    throw new Error(
                        "Unsupported image type. Allowed: JPEG, PNG, WebP",
                    );
            }
        }

        if (!PROFILE_IMAGE_MIME_TYPES.includes(contentType)) {
            throw new Error(
                `Image type ${contentType} is not allowed. Allowed: JPEG, PNG, WebP`,
            );
        }

        return contentType;
    }

    private sanitizeFilename(filename: string): string {
        return filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    }
}
