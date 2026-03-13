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
    return document;
  }

  async update(id: string, input: UpdateDocumentInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new BadRequestError('User identity not found');
    }

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Document', id);

    const result = await this.repository.update(id, input);

    await this.eventPublisher?.publish('document.updated', {
      document_id: id,
      entity_type: existing.entity_type,
      entity_id: existing.entity_id,
    }, 'document-service');

    return result;
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
