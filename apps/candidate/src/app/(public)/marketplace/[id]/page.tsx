import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { buildCanonical } from "@/lib/seo";
import RecruiterDetail from "./recruiter-detail";

interface RecruiterDetailPageProps {
    params: Promise<{ id: string }>;
}

interface Recruiter {
    id: string;
    user_id: string;
    name?: string;
    email?: string;
    phone?: string;
    tagline?: string;
    specialization?: string;
    industries?: string[];
    specialties?: string[];
    location?: string;
    years_experience?: number;
    bio?: string;
    total_placements?: number;
    success_rate?: number;
    reputation_score?: number;
    created_at: string;
    users?: {
        id: string;
        name?: string;
        email?: string;
    };
}

export async function generateMetadata({
    params,
}: RecruiterDetailPageProps): Promise<Metadata> {
    const { id } = await params;
    let recruiter: Recruiter | null = null;

    try {
        const response = await apiClient.get<{ data: Recruiter }>(
            `/recruiters/${id}`,
            {
                params: { include: "user" },
            },
        );
        recruiter = response.data;
    } catch {
        return {
            title: "Recruiter Not Found",
        };
    }

    const name = recruiter?.users?.name || recruiter?.name || "Recruiter";
    const tagline = recruiter?.tagline || "Expert Recruiter";

    return {
        title: `${name} - ${tagline}`,
        description:
            recruiter?.bio?.substring(0, 160) ||
            `View ${name}'s recruiter profile`,
        openGraph: {
            title: `${name} - ${tagline}`,
            description:
                recruiter?.bio?.substring(0, 160) ||
                `View ${name}'s recruiter profile`,
            url: `https://applicant.network/marketplace/${id}`,
        },
        ...buildCanonical(`/marketplace/${id}`),
    };
}

export default async function RecruiterDetailPage({
    params,
}: RecruiterDetailPageProps) {
    const { id } = await params;
    let recruiter: Recruiter | null = null;

    try {
        const response = await apiClient.get<{ data: Recruiter }>(
            `/recruiters/${id}`,
            {
                params: { include: "user" },
            },
        );
        recruiter = response.data;
    } catch {
        notFound();
    }

    if (!recruiter) {
        notFound();
    }

    return <RecruiterDetail recruiter={recruiter} />;
}
