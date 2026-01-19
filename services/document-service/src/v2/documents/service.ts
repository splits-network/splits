import { fileTypeFromBuffer } from 'file-type';
import { randomUUID } from 'crypto';
import { StorageClient } from '../../storage';
import { DocumentFilters, DocumentUpdate, DocumentCreateInput } from './types';
import { buildPaginationResponse } from '../shared/helpers';
import { DocumentRepositoryV2 } from './repository';
import { EventPublisher } from '../shared/events';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
];

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
        private eventPublisher?: EventPublisher
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    private async validateFile(
        file: Buffer,
        filename: string
    ): Promise<string> {
        if (file.length > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
        }

        const detectedType = await fileTypeFromBuffer(file);
        let contentType = detectedType?.mime;

        if (!contentType) {
            const extension = filename.split('.').pop()?.toLowerCase();
            switch (extension) {
                case 'pdf':
                    contentType = 'application/pdf';
                    break;
                case 'doc':
                    contentType = 'application/msword';
                    break;
                case 'docx':
                    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    break;
                case 'txt':
                    contentType = 'text/plain';
                    break;
                case 'rtf':
                    contentType = 'application/rtf';
                    break;
                default:
                    throw new Error('Unsupported file type. Allowed: PDF, DOC, DOCX, TXT, RTF');
            }
        }

        if (!ALLOWED_MIME_TYPES.includes(contentType)) {
            throw new Error(`File type ${contentType} is not allowed`);
        }

        return contentType;
    }

    private generateStoragePath(entityType: string, entityId: string, filename: string): string {
        const timestamp = Date.now();
        const slug = randomUUID().split('-')[0];
        const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        return `${entityType}/${entityId}/${timestamp}-${slug}-${sanitized}`;
    }

    async listDocuments(clerkUserId: string, filters: DocumentFilters) {
        const result = await this.repository.findDocuments(clerkUserId, filters);
        return {
            data: result.data,
            pagination: buildPaginationResponse(
                filters.page ?? 1,
                filters.limit ?? 25,
                result.total
            ),
        };
    }

    async getDocument(id: string, clerkUserId: string) {
        const document = await this.repository.findDocument(id, clerkUserId);
        if (!document) {
            throw new Error('Document not found');
        }

        const downloadUrl = await this.storage.getSignedUrl(
            document.storage_bucket,
            document.file_path,
            3600
        );

        return {
            ...document,
            download_url: downloadUrl,
        };
    }

    async createDocument(clerkUserId: string, payload: CreateDocumentPayload) {
        const mimeType = await this.validateFile(payload.file, payload.originalFileName);
        const storageBucket = this.storage.getBucketName(payload.entity_type);
        const storagePath = this.generateStoragePath(
            payload.entity_type,
            payload.entity_id,
            payload.originalFileName
        );

        const userContext = await this.accessResolver.resolve(clerkUserId);
        await this.storage.uploadFile(
            storageBucket,
            storagePath,
            payload.file,
            mimeType
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
            processing_status: 'pending',
        });
        
        if (this.eventPublisher) {
            await this.eventPublisher.publish('document.uploaded', {
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

    async updateDocument(id: string, updates: DocumentUpdate, clerkUserId: string) {
        const updated = await this.repository.updateDocument(id, clerkUserId, updates);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('updated', {
                document_id: id,
                updates,
            });
        }

        return updated;
    }

    async deleteDocument(id: string, clerkUserId: string) {
        const existing = await this.repository.findDocument(id, clerkUserId);
        if (!existing) {
            throw new Error('Document not found');
        }

        // Only soft delete the database record - DO NOT delete the file from storage
        // Files may be attached to applications/entities that need to remain accessible
        await this.repository.softDeleteDocument(id, clerkUserId);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('deleted', {
                document_id: id,
                entity_type: existing.entity_type,
                entity_id: existing.entity_id,
            });
        }
    }
}
