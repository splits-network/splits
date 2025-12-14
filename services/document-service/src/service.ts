import { v4 as uuidv4 } from 'uuid';
import { fileTypeFromBuffer } from 'file-type';
import { createLogger } from '@splits-network/shared-logging';
import { StorageClient } from './storage.js';
import { DocumentRepository, Document, ListDocumentsFilters } from './repository.js';

const logger = createLogger({ serviceName: 'document-service' });

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
];

export interface UploadDocumentInput {
    file: Buffer;
    filename: string;
    entityType: string;
    entityId: string;
    documentType: string;
    uploadedByUserId?: string;
    metadata?: Record<string, any>;
}

export class DocumentService {
    constructor(
        private repository: DocumentRepository,
        private storage: StorageClient
    ) {}

    /**
     * Validate file size and type
     */
    private async validateFile(
        file: Buffer,
        filename: string
    ): Promise<{ valid: boolean; error?: string; contentType?: string }> {
        // Check file size
        if (file.length > MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            };
        }

        // Detect MIME type from buffer
        const fileType = await fileTypeFromBuffer(file);
        
        // If detection failed, try to infer from extension
        let contentType = fileType?.mime;
        if (!contentType) {
            const ext = filename.split('.').pop()?.toLowerCase();
            switch (ext) {
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
                    return {
                        valid: false,
                        error: 'Unsupported file type. Allowed: PDF, DOC, DOCX, TXT, RTF',
                    };
            }
        }

        // Check if MIME type is allowed
        if (!ALLOWED_MIME_TYPES.includes(contentType)) {
            return {
                valid: false,
                error: `File type ${contentType} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
            };
        }

        return { valid: true, contentType };
    }

    /**
     * Generate a unique storage path for the file
     */
    private generateStoragePath(
        entityType: string,
        entityId: string,
        filename: string
    ): string {
        const timestamp = Date.now();
        const uuid = uuidv4().split('-')[0];
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        return `${entityType}/${entityId}/${timestamp}-${uuid}-${sanitizedFilename}`;
    }

    /**
     * Upload a document
     */
    async uploadDocument(input: UploadDocumentInput): Promise<Document> {
        logger.info({
            filename: input.filename,
            entityType: input.entityType,
            entityId: input.entityId,
        }, 'Processing document upload');

        // Validate file
        const validation = await this.validateFile(input.file, input.filename);
        if (!validation.valid) {
            logger.error({ error: validation.error }, 'File validation failed');
            throw new Error(validation.error);
        }

        const contentType = validation.contentType!;

        // Get bucket name
        const bucketName = this.storage.getBucketName(input.entityType);

        // Generate storage path
        const storagePath = this.generateStoragePath(
            input.entityType,
            input.entityId,
            input.filename
        );

        // Upload to Supabase Storage
        await this.storage.uploadFile(
            bucketName,
            storagePath,
            input.file,
            contentType
        );

        // Create database record
        const document = await this.repository.create({
            entity_type: input.entityType,
            entity_id: input.entityId,
            document_type: input.documentType,
            filename: input.filename,
            storage_path: storagePath,
            bucket_name: bucketName,
            content_type: contentType,
            file_size: input.file.length,
            uploaded_by_user_id: input.uploadedByUserId,
            metadata: input.metadata || {},
        });

        logger.info({ id: document.id }, 'Document uploaded successfully');

        return document;
    }

    /**
     * Get a document with signed download URL
     */
    async getDocument(
        id: string
    ): Promise<(Document & { downloadUrl: string }) | null> {
        logger.info({ id }, 'Getting document');

        const document = await this.repository.getById(id);
        if (!document) {
            return null;
        }

        // Generate signed URL for download
        const downloadUrl = await this.storage.getSignedUrl(
            document.bucket_name,
            document.storage_path,
            3600 // 1 hour expiry
        );

        return {
            ...document,
            downloadUrl,
        };
    }

    /**
     * List documents
     */
    async listDocuments(filters: ListDocumentsFilters = {}): Promise<{
        documents: Document[];
        total: number;
    }> {
        logger.info({ filters }, 'Listing documents');
        return this.repository.list(filters);
    }

    /**
     * Delete a document
     */
    async deleteDocument(id: string): Promise<void> {
        logger.info({ id }, 'Deleting document');

        const document = await this.repository.getById(id);
        if (!document) {
            throw new Error('Document not found');
        }

        // Delete from storage
        await this.storage.deleteFile(document.bucket_name, document.storage_path);

        // Soft delete from database
        await this.repository.softDelete(id);

        logger.info({ id }, 'Document deleted successfully');
    }

    /**
     * Get documents by entity
     */
    async getDocumentsByEntity(
        entityType: string,
        entityId: string
    ): Promise<Document[]> {
        logger.info({ entityType, entityId }, 'Getting documents by entity');
        return this.repository.getByEntity(entityType, entityId);
    }

    /**
     * Update document processing status
     */
    async updateProcessingStatus(
        id: string,
        status: 'pending' | 'processing' | 'processed' | 'failed',
        metadata?: Record<string, any>
    ): Promise<Document> {
        logger.info({ id, status }, 'Updating document processing status');
        return this.repository.updateProcessingStatus(id, status, metadata);
    }
}
