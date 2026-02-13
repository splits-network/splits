/**
 * Resume Extraction Repository - V2
 * Handles database operations for resume structured data extraction.
 * Reads extracted text from documents, writes structured_data back to document metadata.
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
    } | null> {
        const { data, error } = await this.supabase
            .from('documents')
            .select('id, entity_type, entity_id, document_type, metadata')
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
     * Write structured_data to document metadata (merge with existing metadata).
     */
    async writeStructuredData(
        documentId: string,
        structuredData: ResumeMetadata
    ): Promise<void> {
        // First read current metadata to merge
        const { data: doc, error: readError } = await this.supabase
            .from('documents')
            .select('metadata')
            .eq('id', documentId)
            .single();

        if (readError) throw readError;

        const updatedMetadata = {
            ...(doc?.metadata || {}),
            structured_data: structuredData,
        };

        const { error: updateError } = await this.supabase
            .from('documents')
            .update({ metadata: updatedMetadata })
            .eq('id', documentId);

        if (updateError) throw updateError;

        this.logger.debug({ document_id: documentId }, 'Structured data written to document metadata');
    }

    /**
     * Check if a document is the primary resume for its candidate entity.
     * Returns the candidate_id if it is primary, null otherwise.
     */
    async isPrimaryResumeForCandidate(documentId: string): Promise<string | null> {
        const { data, error } = await this.supabase
            .from('candidates')
            .select('id')
            .eq('primary_resume_id', documentId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found - not primary
            throw error;
        }

        return data?.id || null;
    }
}
