/**
 * Documents V3 Service — Business Logic
 *
 * Entity-based access control. File upload handled separately.
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError, BadRequestError } from '@splits-network/shared-fastify';
import { DocumentRepository } from './repository';
import { DocumentListParams, UpdateDocumentInput } from './types';
import { IEventPublisher } from '../../v2/shared/events';

export class DocumentService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: DocumentRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: DocumentListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new BadRequestError('User identity not found');
    }

    // Auto-scope when entity params not provided (matches V2 behavior)
    if (!context.isPlatformAdmin && !params.entity_type && !params.entity_id) {
      if (context.candidateId) {
        params.entity_type = 'candidate';
        params.entity_id = context.candidateId;
      } else if (context.organizationIds.length > 0) {
        params.entity_type = 'company';
        params.entity_id = context.organizationIds[0];
      } else if (context.recruiterId) {
        params.entity_type = 'recruiter';
        params.entity_id = context.recruiterId;
      } else {
        const page = params.page || 1;
        const limit = Math.min(params.limit || 25, 100);
        return { data: [], pagination: { total: 0, page, limit, total_pages: 0 } };
      }
    }

    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new BadRequestError('User identity not found');
    }

    const document = await this.repository.findById(id);
    if (!document) throw new NotFoundError('Document', id);

    // Generate signed download URL using raw DB column names
    let download_url: string | null = null;
    if (document.bucket_name && document.storage_path) {
      const { data } = await this.supabase.storage
        .from(document.bucket_name)
        .createSignedUrl(document.storage_path, 3600);
      if (data?.signedUrl) {
        download_url = data.signedUrl;
      }
    }

    return { ...document, download_url };
  }

  async update(id: string, input: UpdateDocumentInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new BadRequestError('User identity not found');
    }

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Document', id);

    // Merge metadata with existing values; keys set to null are removed
    const updatePayload: Record<string, any> = {};
    if (input.document_type !== undefined) updatePayload.document_type = input.document_type;
    if (input.processing_status !== undefined) updatePayload.processing_status = input.processing_status;
    if (input.metadata !== undefined) {
      const merged = { ...(existing.metadata || {}), ...input.metadata };
      updatePayload.metadata = Object.fromEntries(
        Object.entries(merged).filter(([_, v]) => v !== null),
      );
    }

    // Clear other primary resumes when marking one as primary
    const markingPrimary =
      input.metadata?.is_primary_for_candidate === true &&
      existing.document_type === 'resume' &&
      existing.entity_type === 'candidate';

    if (markingPrimary) {
      await this.clearOtherPrimaryResumes(id, existing.entity_id);
    }

    const result = await this.repository.update(id, updatePayload);

    await this.eventPublisher?.publish('document.updated', {
      document_id: id,
      entity_type: existing.entity_type,
      entity_id: existing.entity_id,
    }, 'document-service');

    if (markingPrimary) {
      await this.eventPublisher?.publish('resume.primary.changed', {
        document_id: id,
        entity_type: existing.entity_type,
        entity_id: existing.entity_id,
      }, 'document-service');
    }

    return result;
  }

  /**
   * Clear is_primary_for_candidate from all other resumes for a candidate.
   */
  private async clearOtherPrimaryResumes(currentDocId: string, candidateId: string) {
    const { data: resumes } = await this.supabase
      .from('documents')
      .select('id, metadata')
      .eq('entity_type', 'candidate')
      .eq('entity_id', candidateId)
      .eq('document_type', 'resume')
      .is('deleted_at', null)
      .neq('id', currentDocId);

    if (!resumes?.length) return;

    const updates = resumes
      .filter((r: any) => r.metadata?.is_primary_for_candidate)
      .map((r: any) => {
        const cleaned = { ...r.metadata };
        delete cleaned.is_primary_for_candidate;
        return this.supabase
          .from('documents')
          .update({ metadata: cleaned, updated_at: new Date().toISOString() })
          .eq('id', r.id);
      });

    await Promise.all(updates);
  }

  async delete(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new BadRequestError('User identity not found');
    }

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Document', id);

    await this.repository.softDelete(id);

    await this.eventPublisher?.publish('document.deleted', {
      document_id: id,
      entity_type: existing.entity_type,
      entity_id: existing.entity_id,
    }, 'document-service');
  }
}
