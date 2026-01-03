import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { DocumentUpdate, DocumentFilters, DocumentRecord, PaginationParams, PaginationResponse } from '../shared/types';

export class DocumentRepositoryV2 {
  constructor(private supabase: SupabaseClient) {}

  async list(clerkUserId: string, filters: DocumentFilters & PaginationParams) {
    const context = await resolveAccessContext(this.supabase, clerkUserId);
    
    const query = this.supabase
      .schema('documents')
      .from('documents')
      .select('*', { count: 'exact' });
      
    // Apply role-based filtering
    if (context.candidateId) {
      // Candidates see only their own documents
      query.eq('entity_type', 'candidate').eq('entity_id', context.candidateId);
    } else if (context.organizationIds.length > 0 && !context.isPlatformAdmin) {
      // Company users see documents for their accessible companies
      query.in('company_id', context.organizationIds);
    }
    // Platform admins see everything (no filter)
    
    // Apply filters
    if (filters.processing_status) {
      query.eq('processing_status', filters.processing_status);
    }
    if (filters.entity_type) {
      query.eq('entity_type', filters.entity_type);
    }
    if (filters.entity_id) {
      query.eq('entity_id', filters.entity_id);
    }
    if (filters.search) {
      query.ilike('filename', `%${filters.search}%`);
    }
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const offset = (page - 1) * limit;
    query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(`Failed to list documents: ${error.message}`);
    }
    
    return {
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit)
      } as PaginationResponse
    };
  }

  async get(id: string, clerkUserId: string): Promise<DocumentRecord> {
    const context = await resolveAccessContext(this.supabase, clerkUserId);
    
    const query = this.supabase
      .schema('documents')
      .from('documents')
      .select('*')
      .eq('id', id);
      
    // Apply role-based filtering
    if (context.candidateId) {
      query.eq('entity_type', 'candidate').eq('entity_id', context.candidateId);
    } else if (context.organizationIds.length > 0 && !context.isPlatformAdmin) {
      query.in('company_id', context.organizationIds);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      throw new Error(`Failed to get document: ${error.message}`);
    }
    
    return data;
  }

  async update(id: string, clerkUserId: string, updates: DocumentUpdate): Promise<DocumentRecord> {
    const context = await resolveAccessContext(this.supabase, clerkUserId);
    
    // Prepare the update object
    const updateData: any = {};
    
    // Handle processing status updates
    if (updates.processing_status) {
      updateData.processing_status = updates.processing_status;
      
      if (updates.processing_status === 'processing') {
        updateData.processing_started_at = new Date().toISOString();
        updateData.processing_error = null; // Clear previous errors
      } else if (updates.processing_status === 'processed' || updates.processing_status === 'failed') {
        updateData.processing_completed_at = new Date().toISOString();
      }
    }
    
    // Handle metadata updates (including extracted text)
    if (updates.metadata || updates.extracted_text) {
      // Get existing metadata first
      const existing = await this.getMetadata(id);
      
      updateData.metadata = {
        ...existing,
        ...updates.metadata,
      };
      
      // Handle extracted_text as a convenience field
      if (updates.extracted_text !== undefined) {
        updateData.metadata.extracted_text = updates.extracted_text;
        updateData.text_length = updates.extracted_text?.length || 0;
      }
    }
    
    // Handle error updates
    if (updates.processing_error !== undefined) {
      updateData.processing_error = updates.processing_error;
    }
    
    // Add timestamp
    updateData.updated_at = new Date().toISOString();
    
    const query = this.supabase
      .schema('documents')
      .from('documents')
      .update(updateData)
      .eq('id', id);
      
    // Apply role-based filtering for updates
    if (context.candidateId) {
      query.eq('entity_type', 'candidate').eq('entity_id', context.candidateId);
    } else if (context.organizationIds.length > 0 && !context.isPlatformAdmin) {
      query.in('company_id', context.organizationIds);
    }
    
    const { data, error } = await query.select().single();
    
    if (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }
    
    return data;
  }

  // System-level update for internal processing (bypasses access control)
  async updateBySystem(id: string, updates: DocumentUpdate): Promise<DocumentRecord> {
    const updateData: any = {};
    
    if (updates.processing_status) {
      updateData.processing_status = updates.processing_status;
      
      if (updates.processing_status === 'processing') {
        updateData.processing_started_at = new Date().toISOString();
        updateData.processing_error = null;
      } else if (updates.processing_status === 'processed' || updates.processing_status === 'failed') {
        updateData.processing_completed_at = new Date().toISOString();
      }
    }
    
    if (updates.metadata || updates.extracted_text) {
      const existing = await this.getMetadata(id);
      
      updateData.metadata = {
        ...existing,
        ...updates.metadata,
      };
      
      if (updates.extracted_text !== undefined) {
        updateData.metadata.extracted_text = updates.extracted_text;
        updateData.text_length = updates.extracted_text?.length || 0;
      }
    }
    
    if (updates.processing_error !== undefined) {
      updateData.processing_error = updates.processing_error;
    }
    
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await this.supabase
      .schema('documents')
      .from('documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }
    
    return data;
  }

  private async getMetadata(id: string) {
    const { data } = await this.supabase
      .schema('documents')
      .from('documents')
      .select('metadata')
      .eq('id', id)
      .single();
    
    return data?.metadata || {};
  }

  // System method for processing queue
  async getPendingDocuments(limit = 20): Promise<DocumentRecord[]> {
    const { data, error } = await this.supabase
      .schema('documents')
      .from('documents')
      .select('*')
      .eq('processing_status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get pending documents: ${error.message}`);
    }

    return data || [];
  }
}