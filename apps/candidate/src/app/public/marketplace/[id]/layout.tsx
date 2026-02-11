import { ReactNode } from 'react';

interface MarketplaceDetailLayoutProps {
    children: ReactNode;
    params: Promise<{ id: string }>;
}

export default function MarketplaceDetailLayout({ children }: MarketplaceDetailLayoutProps) {
    return children;
}
