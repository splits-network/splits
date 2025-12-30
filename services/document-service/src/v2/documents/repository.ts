import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
    Document,
    DocumentFilters,
    DocumentUpdate,
    ProcessingStatus,
} from '../types';

export interface CreateDocumentRecord {
    entity_type: string;
    entity_id: string;
    document_type: string;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    storage_bucket: string;
    uploaded_by?: string;
    metadata?: Record<string, any>;
    processing_status?: ProcessingStatus;
}

export class DocumentRepositoryV2 {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    private mapRow(row: any): Document {
        return {
            id: row.id,
            entity_type: row.entity_type,
            entity_id: row.entity_id,
            document_type: row.document_type,
            file_name: row.filename,
            file_path: row.storage_path,
            file_size: row.file_size,
            mime_type: row.content_type,
            storage_bucket: row.bucket_name,
            uploaded_by: row.uploaded_by_user_id,
            status: row.deleted_at ? 'deleted' : 'active',
            processing_status: row.processing_status,
            metadata: row.metadata,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    async findDocuments(filters: DocumentFilters = {}): Promise<{
        data: Document[];
        total: number;
    }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .schema('documents')
            .from('documents')
            .select('*', { count: 'exact' });

        if (!filters.status || filters.status === 'active') {
            query = query.is('deleted_at', null);
        } else if (filters.status === 'deleted') {
            query = query.not('deleted_at', 'is', null);
        }

        if (filters.entity_type) {
            query = query.eq('entity_type', filters.entity_type);
        }
        if (filters.entity_id) {
            query = query.eq('entity_id', filters.entity_id);
        }
        if (filters.document_type) {
            query = query.eq('document_type', filters.document_type);
        }
        if (filters.uploaded_by) {
            query = query.eq('uploaded_by_user_id', filters.uploaded_by);
        }
        if (filters.search) {
            query = query.ilike('filename', `%${filters.search}%`);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        return {
            data: (data || []).map((doc) => this.mapRow(doc)),
            total: count || 0,
        };
    }

    async findDocument(id: string): Promise<Document | null> {
        const { data, error } = await this.supabase
            .schema('documents')
            .from('documents')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        return data ? this.mapRow(data) : null;
    }

    async createDocument(input: CreateDocumentRecord): Promise<Document> {
        const { data, error } = await this.supabase
            .schema('documents')
            .from('documents')
            .insert({
                entity_type: input.entity_type,
                entity_id: input.entity_id,
                document_type: input.document_type,
                filename: input.file_name,
                storage_path: input.file_path,
                bucket_name: input.storage_bucket,
                content_type: input.mime_type,
                file_size: input.file_size,
                uploaded_by_user_id: input.uploaded_by,
                metadata: input.metadata || {},
                processing_status: input.processing_status || 'pending',
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    async updateDocument(id: string, updates: DocumentUpdate): Promise<Document> {
        const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

        if (typeof updates.document_type !== 'undefined') {
            updateData.document_type = updates.document_type;
        }
        if (typeof updates.metadata !== 'undefined') {
            updateData.metadata = updates.metadata;
        }
        if (typeof updates.processing_status !== 'undefined') {
            updateData.processing_status = updates.processing_status;
        }
        if (typeof updates.status !== 'undefined') {
            updateData.deleted_at = updates.status === 'deleted' ? new Date().toISOString() : null;
        }

        const { data, error } = await this.supabase
            .schema('documents')
            .from('documents')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    async softDeleteDocument(id: string): Promise<void> {
        const { error } = await this.supabase
            .schema('documents')
            .from('documents')
            .update({
                deleted_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) {
            throw error;
        }
    }
}
