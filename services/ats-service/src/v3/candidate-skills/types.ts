/**
 * Candidate Skills V3 Types & JSON Schemas
 *
 * Junction table linking candidates to skills.
 */

export interface CreateCandidateSkillInput {
  candidate_id: string;
  skill_id: string;
  proficiency_level?: string;
}

export interface CandidateSkillListParams {
  candidate_id: string;
}

export interface BulkReplaceCandidateSkillsInput {
  skills: Array<{ skill_id: string; proficiency_level?: string }>;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  required: ['candidate_id'],
  properties: {
    candidate_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['candidate_id', 'skill_id'],
  properties: {
    candidate_id: { type: 'string', format: 'uuid' },
    skill_id: { type: 'string', format: 'uuid' },
    proficiency_level: { type: 'string', maxLength: 50 },
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
          proficiency_level: { type: 'string', maxLength: 50 },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};

export const candidateIdParamSchema = {
  type: 'object',
  required: ['candidateId'],
  properties: {
    candidateId: { type: 'string', format: 'uuid' },
  },
};

export const deleteParamSchema = {
  type: 'object',
  required: ['candidateId', 'skillId'],
  properties: {
    candidateId: { type: 'string', format: 'uuid' },
    skillId: { type: 'string', format: 'uuid' },
  },
};
