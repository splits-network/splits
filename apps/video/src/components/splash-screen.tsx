'use client';

import { useBrand } from '@/hooks/use-brand';

export function SplashScreen() {
    const brand = useBrand();

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center">
            <div className="text-center">
                <img
                    src={brand.logoUrl}
                    alt={`${brand.name} logo`}
                    className="h-16 mx-auto mb-8 animate-pulse"
                />
                <span className="loading loading-spinner loading-md text-primary" />
            </div>
        </div>
    );
}
