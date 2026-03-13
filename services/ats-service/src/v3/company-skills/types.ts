/**
 * Company Skills V3 Types & JSON Schemas
 *
 * Junction table linking companies to skills.
 */

export interface CreateCompanySkillInput {
  company_id: string;
  skill_id: string;
}

export interface CompanySkillListParams {
  company_id: string;
}

export interface BulkReplaceCompanySkillsInput {
  skills: Array<{ skill_id: string }>;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  required: ['company_id'],
  properties: {
    company_id: { type: 'string', format: 'uuid' },
  },
};

export const createSchema = {
  type: 'object',
  required: ['company_id', 'skill_id'],
  properties: {
    company_id: { type: 'string', format: 'uuid' },
    skill_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const bulkReplaceSchema = {
  type: 'object',
  required: ['skills'],
  properties: {
    skills: {
      type: 'array',
      items: {
        type: 'object',
        required: ['skill_id'],
        properties: {
          skill_id: { type: 'string', format: 'uuid' },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};

export const companyIdParamSchema = {
  type: 'object',
  required: ['companyId'],
  properties: {
    companyId: { type: 'string', format: 'uuid' },
  },
};

export const deleteParamSchema = {
  type: 'object',
  required: ['companyId', 'skillId'],
  properties: {
    companyId: { type: 'string', format: 'uuid' },
    skillId: { type: 'string', format: 'uuid' },
  },
};
