/**
 * Firm Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface FirmFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    marketplace_visible?: boolean;
    industries?: string[];
    specialties?: string[];
    placement_types?: string[];
    geo_focus?: string[];
    candidate_firm?: boolean;
}

export interface FirmUpdate {
    name?: string;
    status?: string;
    admin_take_rate?: number;
    // Profile / branding
    slug?: string;
    tagline?: string;
    description?: string;
    logo_url?: string;
    logo_path?: string;
    banner_url?: string;
    banner_path?: string;
    // Specialization
    industries?: string[];
    specialties?: string[];
    placement_types?: string[];
    geo_focus?: string[];
    // Location
    headquarters_city?: string;
    headquarters_state?: string;
    headquarters_country?: string;
    founded_year?: number;
    team_size_range?: string;
    // Contact
    website_url?: string;
    linkedin_url?: string;
    contact_email?: string;
    contact_phone?: string;
    // Marketplace toggles
    marketplace_visible?: boolean;
    candidate_firm?: boolean;
    company_firm?: boolean;
    // Visibility controls
    show_member_count?: boolean;
    show_placement_stats?: boolean;
    show_contact_info?: boolean;
}

export const VALID_PLACEMENT_TYPES = ['permanent', 'contract', 'contract_to_hire', 'executive_search'] as const;
export const VALID_TEAM_SIZE_RANGES = ['solo', '2_5', '6_15', '16_50', '50_plus'] as const;

export interface PublicFirmFilters extends PaginationParams, SortParams {
    search?: string;
    industries?: string[];
    specialties?: string[];
    placement_types?: string[];
    geo_focus?: string[];
    candidate_firm?: boolean;
}

/** Fields safe to expose in public API responses */
export const PUBLIC_FIRM_SELECT = [
    'id', 'name', 'slug', 'tagline', 'description',
    'logo_url', 'banner_url',
    'industries', 'specialties', 'placement_types', 'geo_focus',
    'headquarters_city', 'headquarters_state', 'headquarters_country',
    'founded_year', 'team_size_range',
    'website_url', 'linkedin_url', 'contact_email', 'contact_phone',
    'marketplace_visible', 'candidate_firm', 'company_firm',
    'show_member_count', 'show_placement_stats', 'show_contact_info',
    'created_at',
].join(', ');

export interface CreateFirmRequest {
    name: string;
}

export interface FirmMemberFilters extends PaginationParams {
    status?: string;
    role?: string;
}

export interface CreateFirmInvitationRequest {
    email: string;
    role: 'admin' | 'member' | 'collaborator';
}

export interface TransferOwnershipRequest {
    newOwnerRecruiterId: string;
}

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

export interface FirmPlacementStats {
    firm_id: string;
    total_placements: number;
    recent_placements: number;
    total_revenue: number;
    avg_fee: number;
    last_placement_at: string | null;
}

export interface FirmRecentPlacement {
    placement_id: string;
    job_title: string;
    hired_at: string;
    salary: number | null;
}

export interface EnrichedPublicFirmProfile {
    firm: Record<string, unknown>;
    placement_stats: FirmPlacementStats | null;
    recent_placements: FirmRecentPlacement[];
    contact_user_id: string | null;
}
