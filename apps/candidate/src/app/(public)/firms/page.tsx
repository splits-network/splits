import type { Metadata } from "next";
import type { StandardListResponse } from "@splits-network/shared-types";
import { Suspense } from "react";
import { apiClient } from "@/lib/api-client";
import { buildCanonical } from "@/lib/seo";
import FirmsClient from "./firms-client";
import type { PublicFirm } from "./types";

export const metadata: Metadata = {
    title: "Recruiting Firms | Applicant Network",
    description:
        "Browse marketplace-approved recruiting firms seeking split-fee partners and accepting candidate submissions.",
    openGraph: {
        title: "Recruiting Firms | Applicant Network",
        description:
            "Browse marketplace-approved recruiting firms seeking split-fee partners and accepting candidate submissions.",
        url: "https://applicant.network/firms",
    },
    ...buildCanonical("/firms"),
};

export const revalidate = 60;

export default async function FirmsPage() {
    let initialData: PublicFirm[] | undefined;
    let initialPagination:
        | StandardListResponse<PublicFirm>["pagination"]
        | undefined;

    try {
        const response = await apiClient.get<StandardListResponse<PublicFirm>>(
            "/public/firms",
            { params: { limit: 24, sort_by: "name", sort_order: "asc" } },
        );
        initialData = response.data ?? [];
        initialPagination = response.pagination;
    } catch {
        initialData = undefined;
        initialPagination = undefined;
    }

    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-base-100 flex items-center justify-center">
                    <div className="text-center">
                        <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                        <span className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                            Loading firms...
                        </span>
                    </div>
                </div>
            }
        >
            <FirmsClient
                initialData={initialData}
                initialPagination={initialPagination}
            />
        </Suspense>
    );
}
