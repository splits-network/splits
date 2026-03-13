/**
 * Users V3 Types & JSON Schemas
 */

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  clerk_user_id?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface CreateUserInput {
  email: string;
  clerk_user_id: string;
  name?: string;
  referred_by_recruiter_id?: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  profile_image_url?: string;
  profile_image_path?: string;
  status?: string;
  onboarding_status?: string;
  onboarding_step?: number;
  onboarding_completed_at?: string;
}

export interface RegisterUserInput {
  email: string;
  name?: string;
  profile_image_url?: string;
  referred_by_recruiter_id?: string;
}

export interface ProfileImageInput {
  profile_image_url: string;
  profile_image_path: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
    status: { type: 'string' },
    role: { type: 'string' },
    clerk_user_id: { type: 'string' },
    sort_by: { type: 'string', default: 'created_at' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['email', 'clerk_user_id'],
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    clerk_user_id: { type: 'string', minLength: 1, maxLength: 255 },
    name: { type: 'string', maxLength: 255 },
    referred_by_recruiter_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const registerSchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    name: { type: 'string', maxLength: 255 },
    profile_image_url: { type: 'string', maxLength: 1000 },
    referred_by_recruiter_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    name: { type: 'string', maxLength: 255 },
    profile_image_url: { type: 'string', maxLength: 1000 },
    profile_image_path: { type: 'string', maxLength: 1000 },
    status: { type: 'string' },
    onboarding_status: { type: 'string' },
    onboarding_step: { type: 'integer', minimum: 1 },
    onboarding_completed_at: { type: 'string' },
  },
  additionalProperties: false,
};

export const profileImageSchema = {
  type: 'object',
  required: ['profile_image_url', 'profile_image_path'],
  properties: {
    profile_image_url: { type: 'string', minLength: 1, maxLength: 1000 },
    profile_image_path: { type: 'string', minLength: 1, maxLength: 1000 },
  },
  additionalProperties: false,
};

export const activitySchema = {
  type: 'object',
  required: ['userId'],
  properties: {
    userId: { type: 'string', format: 'uuid' },
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
