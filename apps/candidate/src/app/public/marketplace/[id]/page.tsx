import type { Metadata } from 'next';
import type { MarketplaceProfile } from '@splits-network/shared-types';
import { apiClient } from '@/lib/api-client';
import { cache } from 'react';
import RecruiterDetailClient from './recruiter-detail-client';
import { buildCanonical } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";

interface MarketplaceRecruiter {
    id: string;
    user_id: string;
    user_name?: string;
    user_email?: string;
    tagline?: string;
    industries?: string[];
    specialties?: string[];
    location?: string;
    years_experience?: number;
    marketplace_profile?: MarketplaceProfile;
    show_contact_info?: boolean;
    bio?: string;
    phone?: string;
    contact_available?: boolean;
    total_placements?: number;
    success_rate?: number;
    reputation_score?: number;
    status?: string;
    marketplace_visibility?: string;
    created_at: string;
    users?: {
        id: string;
        name?: string;
        email?: string;
    };
}

interface PageProps {
    params: Promise<{ id: string }>;
}

const fetchRecruiter = cache(async (id: string): Promise<MarketplaceRecruiter | null> => {
    try {
        const response = await apiClient.get<{ data: MarketplaceRecruiter }>(`/recruiters/${id}`, {
            params: { include: 'user,marketplace_profile,reputation' },
        });
        return response.data ?? null;
    } catch (error) {
        console.error('Failed to fetch recruiter:', error);
        return null;
    }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const recruiter = await fetchRecruiter(id);
    const canonicalPath = `/public/marketplace/${id}`;

    if (!recruiter) {
        return {
            title: 'Recruiter Profile',
            description: 'Explore recruiter profiles and marketplace availability.',
            ...buildCanonical(canonicalPath),
        };
    }

    const recruiterName = recruiter.users?.name ?? 'Recruiter Profile';
    return {
        title: recruiterName,
        description: recruiter.tagline || 'Explore recruiter specialties, experience, and marketplace availability.',
        ...buildCanonical(canonicalPath),
    };
}

export const revalidate = 60;

export default async function RecruiterDetailPage({ params }: PageProps) {
    const { id } = await params;
    const recruiter = await fetchRecruiter(id);
    const recruiterName = recruiter?.users?.name || recruiter?.user_name || "Recruiter Profile";
    const personJsonLd = recruiter
        ? {
              "@context": "https://schema.org",
              "@type": "Person",
              name: recruiterName,
              jobTitle: recruiter.tagline,
              url: `${process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network"}/public/marketplace/${id}`,
              address: recruiter.location
                  ? {
                        "@type": "PostalAddress",
                        addressLocality: recruiter.location,
                    }
                  : undefined,
              knowsAbout: recruiter.specialties,
              worksFor: recruiter.industries?.length
                  ? {
                        "@type": "Organization",
                        name: recruiter.industries.join(", "),
                    }
                  : undefined,
              description:
                  recruiter.marketplace_profile?.bio_rich ||
                  recruiter.bio ||
                  recruiter.tagline,
          }
        : null;

    return (
        <>
            {personJsonLd && (
                <JsonLd data={personJsonLd} id="marketplace-person-jsonld" />
            )}
            <RecruiterDetailClient
                recruiterId={id}
                initialRecruiter={recruiter}
                initialError={
                    recruiter
                        ? undefined
                        : "Failed to load recruiter profile. Please try again."
                }
            />
        </>
    );
}
