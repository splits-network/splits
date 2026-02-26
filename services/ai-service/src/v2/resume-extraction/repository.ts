/**
 * Resume Extraction Repository - V2
 * Handles database operations for resume structured data extraction.
 * Reads extracted text from documents, writes structured data to the dedicated structured_metadata column.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import type { ResumeMetadata } from '@splits-network/shared-types';

export class ResumeExtractionRepository {
    constructor(
        private supabase: SupabaseClient,
        private logger: Logger
    ) {}

    /**
     * Get a document by ID with its metadata (extracted_text, etc.)
     */
    async getDocument(documentId: string): Promise<{
        id: string;
        entity_type: string;
        entity_id: string;
        document_type: string;
        metadata: Record<string, any>;
        structured_metadata: Record<string, any> | null;
    } | null> {
        const { data, error } = await this.supabase
            .from('documents')
            .select('id, entity_type, entity_id, document_type, metadata, structured_metadata')
            .eq('id', documentId)
            .is('deleted_at', null)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return data;
    }

    /**
     * Write structured data to the dedicated structured_metadata column.
     */
    async writeStructuredData(
        documentId: string,
        structuredData: ResumeMetadata
    ): Promise<void> {
        const { error: updateError } = await this.supabase
            .from('documents')
            .update({ structured_metadata: structuredData })
            .eq('id', documentId);

        if (updateError) throw updateError;

        this.logger.debug({ document_id: documentId }, 'Structured data written to document structured_metadata');
    }
}
