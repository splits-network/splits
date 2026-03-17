'use client';

import { useBrand } from '@/hooks/use-brand';
import { BrandedHeader } from '@/components/branded-header';

export default function HomePage() {
    const brand = useBrand();

    return (
        <div className="min-h-screen flex flex-col">
            <BrandedHeader />
            <main className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <i className="fa-duotone fa-regular fa-video text-4xl text-primary mb-4 block" />
                    <h1 className="text-2xl font-bold mb-2">
                        Video Call
                    </h1>
                    <p className="text-base-content/60 mb-6">
                        This page requires a valid call link. Please use the link
                        provided in your email or calendar invitation.
                    </p>
                    <a
                        href={brand.portalUrl}
                        className="btn btn-primary"
                    >
                        Go to {brand.name}
                    </a>
                </div>
            </main>
        </div>
    );
}
