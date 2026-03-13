import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { buildCanonical, CANDIDATE_BASE_URL } from "@/lib/seo";
import RecruiterProfileClient from "./recruiter-profile-client";

interface Recruiter {
    id: string;
    user_id: string;
    slug?: string;
    name?: string;
    email?: string;
    phone?: string;
    tagline?: string;
    specialization?: string;
    firm_name?: string;
    status?: string;
    industries?: string[];
    specialties?: string[];
    location?: string;
    years_experience?: number;
    bio?: string;
    total_placements?: number;
    hire_rate?: number;
    reputation_score?: number;
    candidate_recruiter?: boolean;
    company_recruiter?: boolean;
    created_at: string;
    users?: {
        id: string;
        name?: string;
        email?: string;
        profile_image_url?: string;
    };
    recent_activity?: {
        id: string;
        activity_type: string;
        description: string;
        metadata: Record<string, unknown>;
        created_at: string;
    }[];
}

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    try {
        const response = await apiClient.get<{ data: Recruiter }>(
            `/public/recruiters/${slug}`,
            {},
        );
        const recruiter = response.data;
        const name =
            recruiter.users?.name || recruiter.name || "Recruiter";
        const tagline = recruiter.tagline || "Expert Recruiter";
        const title = `${name} - ${tagline}`;
        const description =
            recruiter.bio?.substring(0, 160) ||
            `View ${name}'s recruiter profile on Applicant Network.`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                url: `${CANDIDATE_BASE_URL}/marketplace/${slug}`,
            },
            ...buildCanonical(`/marketplace/${slug}`),
        };
    } catch {
        return { title: "Recruiter Not Found" };
    }
}

export default async function RecruiterProfilePage({ params }: Props) {
    const { slug } = await params;
    let recruiter: Recruiter;

    try {
        const response = await apiClient.get<{ data: Recruiter }>(
            `/public/recruiters/${slug}`,
            {},
        );
        recruiter = response.data;
    } catch {
        notFound();
    }

    const name = recruiter.users?.name || recruiter.name || "Recruiter";
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        name,
        jobTitle: recruiter.tagline || "Recruiter",
        url: `${CANDIDATE_BASE_URL}/marketplace/${slug}`,
        ...(recruiter.location
            ? {
                  address: {
                      "@type": "PostalAddress",
                      addressLocality: recruiter.location,
                  },
              }
            : {}),
        ...(recruiter.bio
            ? { description: recruiter.bio.substring(0, 160) }
            : {}),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <RecruiterProfileClient recruiter={recruiter} />
        </>
    );
}
