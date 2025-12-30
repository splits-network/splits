export interface Document {
    id: string;
    entity_type: string;
    entity_id: string;
    document_type?: string | null;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type?: string;
    storage_bucket?: string;
    status?: string;
    processing_status?: string;
    metadata?: Record<string, any> | null;
    created_at?: string;
    updated_at?: string;
    download_url?: string;
}

const fallbackString = (value?: string | null, defaultValue = ''): string => {
    if (typeof value === 'string' && value.trim().length > 0) {
        return value;
    }
    return defaultValue;
};

const fallbackNumber = (
    value: number | undefined | null,
    defaultValue = 0
): number => {
    if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
    }
    return defaultValue;
};

export function normalizeDocument(raw: any): Document {
    return {
        id: raw.id,
        entity_type: fallbackString(raw.entity_type || raw.entityType, 'candidate'),
        entity_id: fallbackString(raw.entity_id || raw.entityId, ''),
        document_type: raw.document_type || raw.documentType || raw.type || 'other',
        file_name: fallbackString(raw.file_name || raw.filename || raw.name, 'Document'),
        file_path: fallbackString(raw.file_path || raw.storage_path || raw.path, ''),
        file_size: fallbackNumber(raw.file_size ?? raw.fileSize ?? raw.size),
        mime_type: raw.mime_type || raw.content_type || raw.mimeType,
        storage_bucket: raw.storage_bucket || raw.bucket_name || raw.bucket,
        status: raw.status || (raw.deleted_at ? 'deleted' : 'active'),
        processing_status: raw.processing_status || raw.processingStatus,
        metadata: raw.metadata || null,
        created_at: raw.created_at || raw.uploaded_at || raw.createdAt,
        updated_at: raw.updated_at || raw.modified_at || raw.updatedAt,
        download_url: raw.download_url || raw.downloadUrl,
    };
}

export function normalizeDocuments(rawDocs?: any[]): Document[] {
    if (!Array.isArray(rawDocs)) {
        return [];
    }
    return rawDocs.map(normalizeDocument);
}
