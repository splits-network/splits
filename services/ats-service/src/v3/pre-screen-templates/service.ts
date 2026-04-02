/**
 * Pre-Screen Templates V3 Service — Business Logic
 *
 * Anyone authenticated can list/search templates. Company members can create.
 * System templates cannot be deleted by users.
 */

import { ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';
import { PreScreenTemplateRepository } from './repository.js';
import { CreateTemplateInput, TemplateListParams } from './types.js';

export class PreScreenTemplateService {
  constructor(private repository: PreScreenTemplateRepository) {}

  async getAll(params: TemplateListParams) {
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 100, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async create(input: CreateTemplateInput, clerkUserId: string) {
    const record = {
      category: input.category,
      label: input.label,
      question: input.question,
      question_type: input.question_type,
      is_required: input.is_required ?? true,
      options: input.options || [],
      disclaimer: input.disclaimer || null,
      is_system: false,
      company_id: input.company_id,
      created_by: clerkUserId,
      sort_order: 99,
    };

    return this.repository.create(record);
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('PreScreenTemplate', id);

    if (existing.is_system) {
      throw new ForbiddenError('System templates cannot be deleted');
    }

    await this.repository.delete(id);
  }
}
