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

// Extend BasePlacement with enriched fields returned by the API
export interface Placement extends Omit<BasePlacement, "hired_at" | "created_at" | "updated_at" | "start_date" | "end_date" | "guarantee_expires_at" | "failed_at"> {
    hired_at: string;
    created_at: string;
    updated_at: string;
    start_date?: string;
    end_date?: string;
    guarantee_expires_at?: string;
    failed_at?: string;
    failure_date?: string;
    status?: string; // Legacy field, use state instead
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

export interface PlacementStatusDisplay {
    label: string;
    badge: "coral" | "teal" | "yellow" | "purple" | "dark" | "cream";
    icon: string;
}

export function getStatusDisplay(placement: Placement): PlacementStatusDisplay {
    const state = placement.state || "unknown";

    const statusMap: Record<string, PlacementStatusDisplay> = {
        hired: {
            label: "Hired",
            badge: "teal",
            icon: "fa-user-check",
        },
        active: {
            label: "Active",
            badge: "purple",
            icon: "fa-briefcase",
        },
        completed: {
            label: "Completed",
            badge: "yellow",
            icon: "fa-check",
        },
        failed: {
            label: "Failed",
            badge: "coral",
            icon: "fa-xmark",
        },
    };

    return (
        statusMap[state] || {
            label: state.charAt(0).toUpperCase() + state.slice(1),
            badge: "dark",
            icon: "fa-circle-question",
        }
    );
}

export function formatPlacementDate(
    dateString: string | Date | null | undefined,
): string {
    if (!dateString) return "N/A";
    const date =
        dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
