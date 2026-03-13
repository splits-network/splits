/**
 * OAuth Sessions V3 Types
 */

export interface OAuthSessionListParams {
  page?: number;
  limit?: number;
}

export const sessionListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
  },
};
