/**
 * Activity V3 Types & JSON Schemas
 *
 * Redis-based presence tracking. No DB table — data lives in Redis keys.
 */

export interface HeartbeatInput {
  session_id: string;
  user_id?: string;
  app: 'portal' | 'candidate' | 'corporate';
  page: string;
  status: 'active' | 'idle';
  user_type?: 'recruiter' | 'company_admin' | 'hiring_manager' | 'candidate' | 'anonymous';
}

// --- JSON Schemas ---

export const heartbeatSchema = {
  type: 'object',
  required: ['session_id', 'app', 'page', 'status'],
  properties: {
    session_id: { type: 'string', minLength: 8, maxLength: 64 },
    user_id: { type: 'string', maxLength: 128 },
    app: { type: 'string', enum: ['portal', 'candidate', 'corporate'] },
    page: { type: 'string', maxLength: 512 },
    status: { type: 'string', enum: ['active', 'idle'] },
    user_type: {
      type: 'string',
      enum: ['recruiter', 'company_admin', 'hiring_manager', 'candidate', 'anonymous'],
    },
  },
  additionalProperties: false,
};
