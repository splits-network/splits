'use client';

import { useBrand } from '@/hooks/use-brand';

export function SplashScreen() {
    const brand = useBrand();

    return (
        <div className="min-h-screen flex rounded-none">
            <div className="flex-1 lg:basis-3/5 flex flex-col bg-base-100">
                <div className="p-6">
                    <img
                        src={brand.logoUrl}
                        alt={`${brand.name}`}
                        className="h-10 rounded-none"
                    />
                </div>
                <div className="flex-1 flex items-center justify-center px-8">
                    <div className="hero-entrance">
                        <p className="tracking-[0.2em] text-sm uppercase font-semibold text-primary mb-4 fade-up">
                            Preparing Your Call
                        </p>
                        <h1 className="text-4xl md:text-5xl font-black leading-[0.95] text-base-content mb-4 fade-up">
                            Setting the stage
                        </h1>
                        <p className="text-lg text-base-content/60 mb-8 fade-up">
                            Verifying your link and connecting you to the right room.
                        </p>
                        <span className="loading loading-spinner loading-md text-primary fade-up" />
                    </div>
                </div>
            </div>
            <div
                className="hidden lg:flex lg:basis-2/5 relative items-center justify-center bg-primary/5 fade-in"
                style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 0% 100%)' }}
            >
                <i className="fa-duotone fa-regular fa-video text-[8rem] text-primary/10" />
            </div>
        </div>
    );
}
