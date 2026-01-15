/**
 * Document Service Domain Types
 * 
 * Generated from Supabase database schema.
 * Includes: documents table and document-related enum types
 */

import type { Database, Tables, TablesInsert, TablesUpdate, Enums } from '../supabase/database.types';

// Helper types for cleaner usage
type DbTable<T extends keyof Database['public']['Tables']> = Tables<T>;
type DbTableInsert<T extends keyof Database['public']['Tables']> = TablesInsert<T>;
type DbTableUpdate<T extends keyof Database['public']['Tables']> = TablesUpdate<T>;
type DbEnum<T extends keyof Database['public']['Enums']> = Enums<T>;

// ============================================================================
// DOCUMENTS
// ============================================================================

export type Document = DbTable<'documents'>;
export type DocumentInsert = DbTableInsert<'documents'>;
export type DocumentUpdate = DbTableUpdate<'documents'>;

// ============================================================================
// ENUMS
// ============================================================================

export type DocumentType = DbEnum<'document_type'>;
export type EntityType = DbEnum<'entity_type'>;
export type ProcessingStatus = DbEnum<'processing_status'>;
