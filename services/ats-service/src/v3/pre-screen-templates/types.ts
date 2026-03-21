/**
 * Pre-Screen Templates V3 Types & JSON Schemas
 *
 * Reusable question templates for pre-screen. System templates are seeded,
 * company-specific templates are user-created.
 */

export interface PreScreenQuestionTemplate {
  id: string;
  category: 'compliance' | 'experience' | 'logistics' | 'role_info';
  label: string;
  question: string;
  question_type: 'text' | 'yes_no' | 'select' | 'multi_select';
  is_required: boolean;
  options: string[];
  disclaimer: string | null;
  is_system: boolean;
  company_id: string | null;
  created_by: string | null;
  sort_order: number;
  created_at: string;
}

export interface TemplateListParams {
  page?: number;
  limit?: number;
  category?: string;
  company_id?: string;
  q?: string;
}

export interface CreateTemplateInput {
  category: string;
  label: string;
  question: string;
  question_type: string;
  is_required: boolean;
  options?: string[];
  disclaimer?: string;
  company_id: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 100 },
    category: { type: 'string', enum: ['compliance', 'experience', 'logistics', 'role_info'] },
    company_id: { type: 'string', format: 'uuid' },
    q: { type: 'string' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['category', 'label', 'question', 'question_type', 'company_id'],
  properties: {
    category: { type: 'string', enum: ['compliance', 'experience', 'logistics', 'role_info'] },
    label: { type: 'string', minLength: 1, maxLength: 200 },
    question: { type: 'string', minLength: 1, maxLength: 1000 },
    question_type: { type: 'string', enum: ['text', 'yes_no', 'select', 'multi_select'] },
    is_required: { type: 'boolean' },
    options: { type: 'array', items: { type: 'string', maxLength: 500 } },
    disclaimer: { type: 'string', maxLength: 2000 },
    company_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
};
