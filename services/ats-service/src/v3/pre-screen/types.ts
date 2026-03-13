/**
 * Pre-Screen V3 Types & JSON Schemas
 *
 * Pre-screen questions live on jobs.pre_screen_questions (JSONB).
 * Pre-screen answers live on applications.pre_screen_answers (JSONB).
 * This resource provides focused CRUD for managing both.
 */

export interface PreScreenQuestion {
  question: string;
  question_type: 'text' | 'yes_no' | 'select' | 'multi_select';
  is_required: boolean;
  options?: string[];
  disclaimer?: string;
}

export interface PreScreenAnswer {
  question: string;
  question_type: string;
  is_required: boolean;
  options?: string[];
  disclaimer?: string;
  answer: any;
}

export interface PreScreenListParams {
  page?: number;
  limit?: number;
  job_id?: string;
  has_questions?: 'yes' | 'no';
}

export interface CreatePreScreenInput {
  job_id: string;
  questions: PreScreenQuestion[];
}

export interface UpdatePreScreenInput {
  questions: PreScreenQuestion[];
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    job_id: { type: 'string', format: 'uuid' },
    has_questions: { type: 'string', enum: ['yes', 'no'] },
  },
};

const questionSchema = {
  type: 'object',
  required: ['question', 'question_type', 'is_required'],
  properties: {
    question: { type: 'string', minLength: 1, maxLength: 1000 },
    question_type: { type: 'string', enum: ['text', 'yes_no', 'select', 'multi_select'] },
    is_required: { type: 'boolean' },
    options: { type: 'array', items: { type: 'string', maxLength: 500 } },
    disclaimer: { type: 'string', maxLength: 2000 },
  },
  additionalProperties: false,
};

export const createSchema = {
  type: 'object',
  required: ['job_id', 'questions'],
  properties: {
    job_id: { type: 'string', format: 'uuid' },
    questions: { type: 'array', items: questionSchema, minItems: 1, maxItems: 50 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  required: ['questions'],
  properties: {
    questions: { type: 'array', items: questionSchema, maxItems: 50 },
  },
  additionalProperties: false,
};

export const jobIdParamSchema = {
  type: 'object',
  required: ['jobId'],
  properties: {
    jobId: { type: 'string', format: 'uuid' },
  },
};

export const applicationIdParamSchema = {
  type: 'object',
  required: ['applicationId'],
  properties: {
    applicationId: { type: 'string', format: 'uuid' },
  },
};
