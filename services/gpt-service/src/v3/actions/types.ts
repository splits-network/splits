/**
 * GPT Actions V3 Types & JSON Schemas
 * These endpoints are consumed by the GPT plugin
 */

export interface JobSearchParams {
  keywords?: string;
  location?: string;
  commute_type?: string;
  job_level?: string;
  page?: number;
}

export interface SubmitApplicationInput {
  job_id: string;
  confirmed?: boolean;
  confirmation_token?: string;
  pre_screen_answers?: { question: string; answer: string }[];
  cover_letter?: string;
}

export interface ResumeAnalysisInput {
  job_id: string;
  resume_text?: string;
}

export const jobSearchQuerySchema = {
  type: 'object',
  properties: {
    keywords: { type: 'string' },
    location: { type: 'string' },
    commute_type: { type: 'string' },
    job_level: { type: 'string' },
    page: { type: 'integer', minimum: 1, default: 1 },
  },
};

export const jobIdParamSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

export const submitApplicationSchema = {
  type: 'object',
  required: ['job_id'],
  properties: {
    job_id: { type: 'string', format: 'uuid' },
    confirmed: { type: 'boolean' },
    confirmation_token: { type: 'string' },
    pre_screen_answers: {
      type: 'array',
      items: {
        type: 'object',
        required: ['question', 'answer'],
        properties: {
          question: { type: 'string' },
          answer: { type: 'string' },
        },
      },
    },
    cover_letter: { type: 'string' },
  },
  additionalProperties: false,
};

export const resumeAnalysisSchema = {
  type: 'object',
  required: ['job_id'],
  properties: {
    job_id: { type: 'string', format: 'uuid' },
    resume_text: { type: 'string' },
  },
  additionalProperties: false,
};
