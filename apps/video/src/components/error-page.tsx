'use client';

import { useBrand } from '@/hooks/use-brand';
import { BrandedHeader } from '@/components/branded-header';
import { JoinError } from '@/lib/types';

interface ErrorPageProps {
    error: JoinError;
}

const ERROR_HEADINGS: Record<JoinError['type'], string> = {
    invalid: 'Link Not Recognized',
    expired: 'This Link Has Expired',
    'not-started': 'Not Yet Open',
    unknown: 'Unable to Connect',
};

const ERROR_DESCRIPTIONS: Record<JoinError['type'], string> = {
    invalid:
        'This call link is not valid or has already been used. Ask the organizer to send a new one.',
    expired:
        'Call links are time-limited for security. Reach out to the person who scheduled this call for a fresh link.',
    'not-started':
        'The host has not opened this call yet. You can try this link again once the call is underway.',
    unknown:
        'Something did not connect as expected. Refresh the page to try again, or return to your dashboard.',
};

const ERROR_ICONS: Record<JoinError['type'], string> = {
    invalid: 'fa-link-slash',
    expired: 'fa-hourglass-end',
    'not-started': 'fa-clock',
    unknown: 'fa-triangle-exclamation',
};

const ERROR_ACCENTS: Record<JoinError['type'], string> = {
    invalid: 'error',
    expired: 'warning',
    'not-started': 'info',
    unknown: 'neutral',
};

const ERROR_KICKERS: Record<JoinError['type'], string> = {
    invalid: 'Invalid Link',
    expired: 'Expired',
    'not-started': 'Waiting',
    unknown: 'Error',
};

function accentTextClass(accent: string): string {
    const map: Record<string, string> = {
        error: 'text-error',
        warning: 'text-warning',
        info: 'text-info',
        neutral: 'text-neutral',
    };
    return map[accent] ?? 'text-neutral';
}

function accentBgClass(accent: string): string {
    const map: Record<string, string> = {
        error: 'bg-error/5',
        warning: 'bg-warning/5',
        info: 'bg-info/5',
        neutral: 'bg-neutral/5',
    };
    return map[accent] ?? 'bg-neutral/5';
}

function accentIconOpacityClass(accent: string): string {
    const map: Record<string, string> = {
        error: 'text-error/5',
        warning: 'text-warning/5',
        info: 'text-info/5',
        neutral: 'text-neutral/5',
    };
    return map[accent] ?? 'text-neutral/5';
}

export function ErrorPage({ error }: ErrorPageProps) {
    const brand = useBrand();

    const heading = ERROR_HEADINGS[error.type];
    const description = error.message || ERROR_DESCRIPTIONS[error.type];
    const icon = ERROR_ICONS[error.type];
    const accent = ERROR_ACCENTS[error.type];
    const kicker = ERROR_KICKERS[error.type];

    return (
        <div className="min-h-screen flex flex-col">
            <BrandedHeader />

            {/* Main split layout */}
            <main className="flex-1 grid lg:grid-cols-5">
                {/* Left panel — content */}
                <div className="col-span-3 flex items-center px-8 lg:px-16 py-12">
                    <div className="stagger-children scroll-reveal animate w-full max-w-xl">
                        {/* Error icon */}
                        <div className="fade-up mb-6">
                            <i
                                className={`fa-duotone fa-regular ${icon} text-6xl ${accentTextClass(accent)}`}
                            />
                        </div>

                        {/* Kicker */}
                        <p
                            className={`fade-up tracking-[0.2em] text-sm uppercase font-semibold ${accentTextClass(accent)} mb-3`}
                        >
                            {kicker}
                        </p>

                        {/* Headline */}
                        <h1 className="fade-up text-4xl md:text-5xl font-black leading-[0.95] mb-4 text-base-content">
                            {heading}
                        </h1>

                        {/* Description */}
                        <p className="fade-up text-lg text-base-content/60 leading-relaxed mb-8">
                            {description}
                        </p>

                        {/* CTA */}
                        <div className="fade-up">
                            <a
                                href={brand.portalUrl}
                                className="btn btn-primary btn-lg rounded-none"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left" />
                                Back to {brand.name}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right panel — decorative */}
                <div
                    className={`hidden lg:flex col-span-2 items-center justify-center ${accentBgClass(accent)}`}
                    style={{
                        clipPath:
                            'polygon(12% 0, 100% 0, 100% 100%, 0% 100%)',
                    }}
                >
                    <i
                        className={`fa-duotone fa-regular ${icon} text-[10rem] ${accentIconOpacityClass(accent)}`}
                    />
                </div>
            </main>
        </div>
    );
}
