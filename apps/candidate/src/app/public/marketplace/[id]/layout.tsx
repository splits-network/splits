import type { Metadata } from 'next';
import { ReactNode } from 'react';

interface MarketplaceDetailLayoutProps {
    children: ReactNode;
    params: Promise<{ id: string }>;
}

export async function generateMetadata(
    { params }: MarketplaceDetailLayoutProps
): Promise<Metadata> {
    const { id } = await params;
    return {
        title: `Recruiter Profile ${id}`,
        description: 'Explore recruiter profiles, specialties, and marketplace availability.',
    };
}

export default function MarketplaceDetailLayout({ children }: MarketplaceDetailLayoutProps) {
    return children;
}
