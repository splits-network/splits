import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Document, DocumentFilters, DocumentUpdate, ProcessingStatus } from './types';
import { resolveAccessContext, AccessContext } from '../shared/access';

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

type DocumentRow = {
    id: string;
    entity_type: string;
    entity_id: string;
    document_type: string;
    filename: string;
    storage_path: string;
    file_size: number;
    content_type: string;
    bucket_name: string;
    uploaded_by_user_id?: string | null;
    status?: string;
    processing_status?: ProcessingStatus;
    metadata?: Record<string, any> | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

export class DocumentRepositoryV2 {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    private mapRow(row: DocumentRow): Document {
        return {
            id: row.id,
            entity_type: row.entity_type as Document['entity_type'],
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

    async findDocuments(
        clerkUserId: string,
        filters: DocumentFilters = {}
    ): Promise<{
        data: Document[];
        total: number;
    }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

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
        if (filters.search) {
            query = query.ilike('filename', `%${filters.search}%`);
        }

        if (!accessContext.isPlatformAdmin) {
            if (accessContext.candidateId) {
                query = query.eq('entity_type', 'candidate').eq('entity_id', accessContext.candidateId);
            } else if (accessContext.organizationIds.length > 0) {
                query = query.eq('entity_type', 'company').in('entity_id', accessContext.organizationIds);
            } else {
                return { data: [], total: 0 };
            }
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        const rows = data || [];
        const filteredRows = accessContext.isPlatformAdmin
            ? rows
            : rows.filter((row) => this.canAccessDocument(row, accessContext));

        return {
            data: filteredRows.map((doc) => this.mapRow(doc)),
            total: count || filteredRows.length,
        };
    }

    async findDocument(id: string, clerkUserId: string): Promise<Document | null> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

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

        if (!data || !this.canAccessDocument(data as DocumentRow, accessContext)) {
            return null;
        }

        return this.mapRow(data as DocumentRow);
    }

    async createDocument(clerkUserId: string, input: CreateDocumentRecord): Promise<Document> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        if (!accessContext.identityUserId) {
            throw new Error('Unable to resolve identity user for document upload');
        }

        if (!this.canModifyEntity(input.entity_type, input.entity_id, accessContext)) {
            throw new Error('Not authorized to upload document for this entity');
        }

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
                uploaded_by_user_id: accessContext.identityUserId,
                metadata: input.metadata || {},
                processing_status: input.processing_status || 'pending',
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data as DocumentRow);
    }

    async updateDocument(id: string, clerkUserId: string, updates: DocumentUpdate): Promise<Document> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        const existing = await this.findDocument(id, clerkUserId);
        if (!existing) {
            throw new Error('Document not found or access denied');
        }

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

        return this.mapRow(data as DocumentRow);
    }

    async softDeleteDocument(id: string, clerkUserId: string): Promise<void> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        const existing = await this.findDocument(id, clerkUserId);
        if (!existing) {
            throw new Error('Document not found or access denied');
        }

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

    private canAccessDocument(row: DocumentRow, context: AccessContext): boolean {
        if (context.isPlatformAdmin) {
            return true;
        }

        // Candidates can see their own documents
        if (context.candidateId && row.entity_type === 'candidate' && row.entity_id === context.candidateId) {
            return true;
        }

        // Company users can see company documents (not candidate documents)
        if (
            context.organizationIds.length > 0 &&
            row.entity_type === 'company' &&
            context.organizationIds.includes(row.entity_id)
        ) {
            return true;
        }

        // Company users can see application documents for their company jobs
        if (
            context.organizationIds.length > 0 &&
            row.entity_type === 'application'
            // Note: We would need to validate that the application belongs to their company
            // This requires looking up the application and checking the job's company_id
        ) {
            return true;
        }

        // Recruiters can see candidate resumes that are marked as primary
        if (
            context.recruiterId &&
            row.entity_type === 'candidate' &&
            row.document_type === 'resume' &&
            row.metadata &&
            (row.metadata as any).is_primary === true
        ) {
            return true;
        }

        // Recruiters can see documents attached to applications
        if (
            context.recruiterId &&
            row.entity_type === 'application'
            // Note: We would need to validate that the recruiter has access to this application
            // This requires checking if the recruiter is assigned to the job/candidate
        ) {
            return true;
        }

        return false;
    }

    private canModifyEntity(entityType: string, entityId: string, context: AccessContext): boolean {
        if (context.isPlatformAdmin) {
            return true;
        }

        // Candidates can upload to their own profile
        if (context.candidateId && entityType === 'candidate' && entityId === context.candidateId) {
            return true;
        }

        // Company users can upload to company entities
        if (context.organizationIds.length > 0 && entityType === 'company') {
            return context.organizationIds.includes(entityId);
        }

        return false;
    }
}
