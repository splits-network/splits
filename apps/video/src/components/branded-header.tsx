'use client';

import { useBrand } from '@/hooks/use-brand';

interface BrandedHeaderProps {
    visible?: boolean;
}

export function BrandedHeader({ visible = true }: BrandedHeaderProps) {
    const brand = useBrand();

    if (!visible) return null;

    return (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-base-100/90 border-b border-base-300 rounded-none">
            <div className="flex items-center h-14 px-6">
                <img
                    src={brand.logoUrl}
                    alt={`${brand.name}`}
                    className="h-8 rounded-none"
                />
            </div>
        </header>
    );
}
