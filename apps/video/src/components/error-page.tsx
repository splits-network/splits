'use client';

import { useBrand } from '@/hooks/use-brand';
import { JoinError } from '@/lib/types';

interface ErrorPageProps {
    error: JoinError;
}

const ERROR_HEADINGS: Record<JoinError['type'], string> = {
    invalid: 'Link Invalid',
    expired: 'Link Expired',
    'not-started': 'Call Not Ready',
    unknown: 'Something Went Wrong',
};

const ERROR_DESCRIPTIONS: Record<JoinError['type'], string> = {
    invalid: 'This call link is invalid or has already been used. Please request a new link.',
    expired: 'This call link has expired. Please request a new link from the call organizer.',
    'not-started': 'This call has not started yet. Please wait for the host to start the call.',
    unknown: 'An unexpected error occurred. Please try again or contact support.',
};

export function ErrorPage({ error }: ErrorPageProps) {
    const brand = useBrand();

    const heading = ERROR_HEADINGS[error.type];
    const description = error.message || ERROR_DESCRIPTIONS[error.type];

    return (
        <div className="min-h-screen flex flex-col">
            <header className="flex items-center h-14 px-4 border-b border-base-300 bg-base-100">
                <img
                    src={brand.logoUrl}
                    alt={`${brand.name} logo`}
                    className="h-8"
                />
            </header>

            <main className="flex-1 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <i className="fa-duotone fa-regular fa-circle-exclamation text-5xl text-error mb-6 block" />
                    <h1 className="text-2xl font-bold mb-2">{heading}</h1>
                    <p className="text-base-content/60 mb-8">{description}</p>
                    <a href={brand.portalUrl} className="btn btn-primary">
                        Return to {brand.name}
                    </a>
                </div>
            </main>
        </div>
    );
}
