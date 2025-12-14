import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@splits-network/shared-logging';

const logger = createLogger({ serviceName: 'document-service' });

export interface Document {
    id: string;
    entity_type: string;
    entity_id: string;
    document_type: string;
    filename: string;
    storage_path: string;
    bucket_name: string;
    content_type: string;
    file_size: number;
    uploaded_by_user_id?: string;
    processing_status: 'pending' | 'processing' | 'processed' | 'failed';
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface CreateDocumentInput {
    entity_type: string;
    entity_id: string;
    document_type: string;
    filename: string;
    storage_path: string;
    bucket_name: string;
    content_type: string;
    file_size: number;
    uploaded_by_user_id?: string;
    metadata?: Record<string, any>;
}

export interface ListDocumentsFilters {
    entity_type?: string;
    entity_id?: string;
    document_type?: string;
    uploaded_by_user_id?: string;
    limit?: number;
    offset?: number;
}

export class DocumentRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    /**
     * Create a new document record
     */
    async create(input: CreateDocumentInput): Promise<Document> {
        logger.info({ input }, 'Creating document record');

        const { data, error } = await this.supabase
            .schema('documents')
            .from('documents')
            .insert({
                entity_type: input.entity_type,
                entity_id: input.entity_id,
                document_type: input.document_type,
                filename: input.filename,
                storage_path: input.storage_path,
                bucket_name: input.bucket_name,
                content_type: input.content_type,
                file_size: input.file_size,
                uploaded_by_user_id: input.uploaded_by_user_id,
                metadata: input.metadata || {},
                processing_status: 'pending',
            })
            .select()
            .single();

        if (error) {
            logger.error({ error }, 'Failed to create document record');
            throw new Error(`Database error: ${error.message}`);
        }

        logger.info({ id: data.id }, 'Document record created');
        return data as Document;
    }

    /**
     * Get a document by ID
     */
    async getById(id: string): Promise<Document | null> {
        logger.info({ id }, 'Getting document by ID');

        const { data, error } = await this.supabase
            .schema('documents')
            .from('documents')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                logger.info({ id }, 'Document not found');
                return null;
            }
            logger.error({ error, id }, 'Failed to get document');
            throw new Error(`Database error: ${error.message}`);
        }

        return data as Document;
    }

    /**
     * List documents with filters
     */
    async list(filters: ListDocumentsFilters = {}): Promise<{
        documents: Document[];
        total: number;
    }> {
        logger.info({ filters }, 'Listing documents');

        let query = this.supabase
            .schema('documents')
            .from('documents')
            .select('*', { count: 'exact' })
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (filters.entity_type) {
            query = query.eq('entity_type', filters.entity_type);
        }

        if (filters.entity_id) {
            query = query.eq('entity_id', filters.entity_id);
        }

        if (filters.document_type) {
            query = query.eq('document_type', filters.document_type);
        }

        if (filters.uploaded_by_user_id) {
            query = query.eq('uploaded_by_user_id', filters.uploaded_by_user_id);
        }

        const limit = filters.limit || 50;
        const offset = filters.offset || 0;
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            logger.error({ error, filters }, 'Failed to list documents');
            throw new Error(`Database error: ${error.message}`);
        }

        return {
            documents: (data || []) as Document[],
            total: count || 0,
        };
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

        const updateData: any = {
            processing_status: status,
        };

        if (metadata) {
            updateData.metadata = metadata;
        }

        const { data, error } = await this.supabase
            .schema('documents')
            .from('documents')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            logger.error({ error, id }, 'Failed to update document');
            throw new Error(`Failed to update document: ${error.message}`);
        }

        logger.info({ id }, 'Document updated');
        return data as Document;
    }

    /**
     * Soft delete a document
     */
    async softDelete(id: string): Promise<void> {
        logger.info({ id }, 'Soft deleting document');

        const { error } = await this.supabase
            .schema('documents')
            .from('documents')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            logger.error({ error, id }, 'Failed to delete document');
            throw new Error(`Failed to delete document: ${error.message}`);
        }

        logger.info({ id }, 'Document deleted');
    }

    /**
     * Get documents by entity
     */
    async getByEntity(
        entityType: string,
        entityId: string
    ): Promise<Document[]> {
        logger.info({ entityType, entityId }, 'Getting documents by entity');

        const { data, error } = await this.supabase
            .schema('documents')
            .from('documents')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) {
            logger.error({
                error,
                entityType,
                entityId,
            }, 'Failed to get documents by entity');
            throw new Error(`Database error: ${error.message}`);
        }

        return (data || []) as Document[];
    }
}

