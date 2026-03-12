/**
 * Basel placements types — self-contained (no cross-reference to original).
 * Imports the base Placement type from shared-types and extends it
 * with API-enriched fields.
 */
import type { Placement as BasePlacement } from "@splits-network/shared-types";
import type { BaselSortOption } from "@splits-network/basel-ui";

export interface PlacementSplit {
    id: string;
    role: string;
    split_percentage: number;
    split_amount: number;
    recruiter_id: string;
    recruiter?: {
        id: string;
        user?: {
            name: string;
        };
    };
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
            logo_url?: string;
            identity_organization_id?: string;
        };
    };
    splits?: PlacementSplit[];
}

export interface PlacementFilters {
    status?: string;
}

export const PLACEMENT_STATUS_LABELS: Record<string, string> = {
    hired: "Hired",
    active: "Active",
    completed: "Completed",
    failed: "Failed",
};

export const PLACEMENT_SORT_OPTIONS: BaselSortOption[] = [
    { value: "created_at", label: "Date Created" },
    { value: "hired_at", label: "Hire Date" },
    { value: "status", label: "Status" },
];
