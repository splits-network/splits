/**
 * Basel placements types — self-contained (no cross-reference to original).
 * Imports the base Placement type from shared-types and extends it
 * with API-enriched fields.
 */
import type { Placement as BasePlacement } from "@splits-network/shared-types";

export interface Collaborator {
    id: string;
    placement_id: string;
    recruiter_user_id: string;
    role: "sourcer" | "submitter" | "closer" | "support";
    split_percentage: number;
    split_amount: number;
    notes?: string;
    created_at: string;
}

export interface YourSplit {
    role: string;
    split_percentage: number;
    split_amount: number;
}

export interface Placement extends Omit<BasePlacement, "hired_at" | "created_at" | "updated_at" | "start_date" | "end_date" | "guarantee_expires_at" | "failed_at"> {
    hired_at: string;
    created_at: string;
    updated_at: string;
    start_date?: string;
    end_date?: string;
    guarantee_expires_at?: string;
    failed_at?: string;
    failure_date?: string;
    status?: string;
    candidate?: {
        id: string;
        full_name: string;
        email: string;
    };
    job?: {
        id: string;
        title: string;
        company?: {
            id: string;
            name: string;
            identity_organization_id?: string;
        };
    };
    collaborators?: Collaborator[];
    your_splits?: YourSplit[];
}

export interface PlacementFilters {
    status?: string;
}
