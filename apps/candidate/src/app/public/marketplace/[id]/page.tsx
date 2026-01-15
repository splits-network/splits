import type { Metadata } from 'next';
import type { MarketplaceProfile } from '@splits-network/shared-types';
import { apiClient } from '@/lib/api-client';
import { cache } from 'react';
import RecruiterDetailClient from './recruiter-detail-client';

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
            params: { include: 'user,marketplace_profile' },
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

    if (!recruiter) {
        return {
            title: 'Recruiter Profile',
            description: 'Explore recruiter profiles and marketplace availability.',
        };
    }

    const recruiterName = recruiter.users?.name ?? 'Recruiter Profile';
    return {
        title: recruiterName,
        description: recruiter.tagline || 'Explore recruiter specialties, experience, and marketplace availability.',
    };
}

export const revalidate = 60;

export default async function RecruiterDetailPage({ params }: PageProps) {
    const { id } = await params;
    const recruiter = await fetchRecruiter(id);

    return (
        <RecruiterDetailClient
            recruiterId={id}
            initialRecruiter={recruiter}
            initialError={recruiter ? undefined : 'Failed to load recruiter profile. Please try again.'}
        />
    );
}
