/**
 * Consent V3 Types & JSON Schemas
 */

export interface SaveConsentInput {
  preferences: {
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  ip_address?: string;
  user_agent?: string;
  consent_source?: string;
}

// --- JSON Schemas ---

export const saveConsentSchema = {
  type: 'object',
  required: ['preferences'],
  properties: {
    preferences: {
      type: 'object',
      required: ['functional', 'analytics', 'marketing'],
      properties: {
        functional: { type: 'boolean' },
        analytics: { type: 'boolean' },
        marketing: { type: 'boolean' },
      },
      additionalProperties: false,
    },
    ip_address: { type: 'string', maxLength: 100 },
    user_agent: { type: 'string', maxLength: 500 },
    consent_source: { type: 'string', maxLength: 50 },
  },
  additionalProperties: false,
};
