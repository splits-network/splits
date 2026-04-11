import type { Metadata } from "next";
import type { StandardListResponse } from "@splits-network/shared-types";
import { Suspense } from "react";
import { apiClient } from "@/lib/api-client";
import { buildCanonical } from "@/lib/seo";
import CompaniesClient from "./companies-client";
import type { PublicCompany } from "./types";

export const metadata: Metadata = {
    title: "Companies Hiring | Applicant Network",
    description:
        "Browse companies actively hiring through the Applicant Network. Discover open roles, company culture, and perks.",
    openGraph: {
        title: "Companies Hiring | Applicant Network",
        description:
            "Browse companies actively hiring through the Applicant Network. Discover open roles, company culture, and perks.",
        url: "https://applicant.network/companies",
    },
    ...buildCanonical("/companies"),
};

export const revalidate = 60;

export default async function CompaniesPage() {
    let initialData: PublicCompany[] | undefined;
    let initialPagination:
        | StandardListResponse<PublicCompany>["pagination"]
        | undefined;

    try {
        const response = await apiClient.get<
            StandardListResponse<PublicCompany>
        >("/public/companies", {
            params: { limit: 24, sort_by: "name", sort_order: "asc" },
        });
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
                            Loading companies...
                        </span>
                    </div>
                </div>
            }
        >
            <CompaniesClient
                initialData={initialData}
                initialPagination={initialPagination}
            />
        </Suspense>
    );
}
