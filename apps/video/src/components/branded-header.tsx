'use client';

import { useBrand } from '@/hooks/use-brand';

interface BrandedHeaderProps {
    visible?: boolean;
}

export function BrandedHeader({ visible = true }: BrandedHeaderProps) {
    const brand = useBrand();

    if (!visible) return null;

    return (
        <header className="flex items-center h-14 px-4 border-b border-base-300 bg-base-100">
            <img
                src={brand.logoUrl}
                alt={`${brand.name} logo`}
                className="h-8"
            />
        </header>
    );
}
