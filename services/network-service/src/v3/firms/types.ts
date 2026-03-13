/**
 * Firms V3 Types & JSON Schemas
 */

export interface FirmListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  marketplace_visible?: boolean;
  candidate_firm?: boolean;
  industries?: string[];
  specialties?: string[];
  placement_types?: string[];
  geo_focus?: string[];
  team_size_range?: string;
  is_candidate_firm?: string;
  is_company_firm?: string;
  is_marketplace_visible?: string;
  placement_type?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface FirmUpdate {
  name?: string;
  status?: string;
  admin_take_rate?: number;
  slug?: string;
  tagline?: string;
  description?: string;
  logo_url?: string;
  logo_path?: string;
  banner_url?: string;
  banner_path?: string;
  industries?: string[];
  specialties?: string[];
  placement_types?: string[];
  geo_focus?: string[];
  headquarters_city?: string;
  headquarters_state?: string;
  headquarters_country?: string;
  founded_year?: number;
  team_size_range?: string;
  website_url?: string;
  linkedin_url?: string;
  contact_email?: string;
  contact_phone?: string;
  marketplace_visible?: boolean;
  candidate_firm?: boolean;
  company_firm?: boolean;
  show_member_count?: boolean;
  show_placement_stats?: boolean;
  show_contact_info?: boolean;
}

export interface CreateFirmInput {
  name: string;
}

export type PublicFirmListParams = FirmListParams;

export interface FirmMemberListParams {
  page?: number;
  limit?: number;
  status?: string;
  role?: string;
}

export interface CreateFirmInvitationInput {
  email: string;
  role: string;
}

export interface TransferOwnershipInput {
  newOwnerRecruiterId: string;
}

export const VALID_PLACEMENT_TYPES = ['permanent', 'contract', 'contract_to_hire', 'executive_search'] as const;
export const VALID_TEAM_SIZE_RANGES = ['solo', '2_5', '6_15', '16_50', '50_plus'] as const;

export const PUBLIC_FIRM_SELECT = [
  'id', 'name', 'slug', 'tagline', 'description', 'logo_url', 'banner_url',
  'industries', 'specialties', 'placement_types', 'geo_focus',
  'headquarters_city', 'headquarters_state', 'headquarters_country',
  'founded_year', 'team_size_range', 'website_url', 'linkedin_url',
  'contact_email', 'contact_phone', 'marketplace_visible',
  'candidate_firm', 'company_firm', 'show_member_count',
  'show_placement_stats', 'show_contact_info', 'created_at',
].join(', ');

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100 },
    search: { type: 'string' }, status: { type: 'string' },
    sort_by: { type: 'string' }, sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['name'],
  properties: { name: { type: 'string', minLength: 1, maxLength: 255 } },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', maxLength: 255 }, status: { type: 'string' },
    admin_take_rate: { type: 'number', minimum: 0, maximum: 100 },
    slug: { type: 'string' }, tagline: { type: 'string', maxLength: 160 },
    description: { type: 'string' }, logo_url: { type: 'string' },
    logo_path: { type: 'string' }, banner_url: { type: 'string' },
    banner_path: { type: 'string' },
    industries: { type: 'array', items: { type: 'string' } },
    specialties: { type: 'array', items: { type: 'string' } },
    placement_types: { type: 'array', items: { type: 'string' } },
    geo_focus: { type: 'array', items: { type: 'string' } },
    headquarters_city: { type: 'string' }, headquarters_state: { type: 'string' },
    headquarters_country: { type: 'string', maxLength: 2 },
    founded_year: { type: ['integer', 'null'] }, team_size_range: { type: 'string' },
    website_url: { type: 'string' }, linkedin_url: { type: 'string' },
    contact_email: { type: 'string' }, contact_phone: { type: 'string' },
    marketplace_visible: { type: 'boolean' }, candidate_firm: { type: 'boolean' },
    company_firm: { type: 'boolean' }, show_member_count: { type: 'boolean' },
    show_placement_stats: { type: 'boolean' }, show_contact_info: { type: 'boolean' },
  },
  additionalProperties: false,
};

export const memberListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100 },
    status: { type: 'string' }, role: { type: 'string' },
  },
};

export const invitationCreateSchema = {
  type: 'object',
  required: ['email', 'role'],
  properties: {
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['admin', 'member', 'collaborator'] },
  },
  additionalProperties: false,
};

export const transferOwnershipSchema = {
  type: 'object',
  required: ['newOwnerRecruiterId'],
  properties: { newOwnerRecruiterId: { type: 'string', format: 'uuid' } },
  additionalProperties: false,
};

export const acceptInvitationSchema = {
  type: 'object',
  required: ['user_email'],
  properties: { user_email: { type: 'string', format: 'email' } },
  additionalProperties: false,
};

export const idParamSchema = {
  type: 'object', required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

export const firmIdParamSchema = {
  type: 'object', required: ['firmId'],
  properties: { firmId: { type: 'string', format: 'uuid' } },
};

export const firmMemberParamsSchema = {
  type: 'object', required: ['firmId', 'memberId'],
  properties: {
    firmId: { type: 'string', format: 'uuid' },
    memberId: { type: 'string', format: 'uuid' },
  },
};

export const firmInvitationParamsSchema = {
  type: 'object', required: ['firmId', 'invitationId'],
  properties: {
    firmId: { type: 'string', format: 'uuid' },
    invitationId: { type: 'string', format: 'uuid' },
  },
};

export const slugParamSchema = {
  type: 'object', required: ['slug'],
  properties: { slug: { type: 'string' } },
};

export const tokenParamSchema = {
  type: 'object', required: ['token'],
  properties: { token: { type: 'string' } },
};
