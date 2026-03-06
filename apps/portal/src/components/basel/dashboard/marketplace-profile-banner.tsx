'use client';

import Link from 'next/link';
import { useRecruiterMarketplaceStatus } from '@/app/portal/dashboard/hooks/use-recruiter-marketplace-status';
import { useUserProfile } from '@/contexts';

export function MarketplaceProfileBanner() {
    const { isRecruiter } = useUserProfile();
    const { recruiter, completeness, missingFields, needsAttention, loading } =
        useRecruiterMarketplaceStatus();

    if (!isRecruiter || loading || !needsAttention) return null;

    const marketplaceOff = !recruiter?.marketplace_enabled;
    const severity = marketplaceOff ? 'error' : 'warning';

    const headline = marketplaceOff
        ? 'Your Marketplace Profile is Hidden'
        : 'Complete Your Marketplace Profile';

    const description = marketplaceOff
        ? "Companies and candidates can't find you until you enable your marketplace profile."
        : 'A more complete profile means more visibility to companies and candidates.';

    const percentage = completeness?.percentage ?? 0;

    return (
        <section className="px-4 lg:px-6 pt-4 lg:pt-6">
            <div
                className={`border-l-4 p-5 flex flex-col sm:flex-row gap-4 ${
                    severity === 'error'
                        ? 'bg-error/5 border-error'
                        : 'bg-warning/5 border-warning'
                }`}
            >
                <div
                    className={`w-10 h-10 flex items-center justify-center shrink-0 ${
                        severity === 'error'
                            ? 'bg-error/10 text-error'
                            : 'bg-warning/10 text-warning'
                    }`}
                >
                    <i
                        className={`fa-duotone fa-regular ${
                            marketplaceOff ? 'fa-eye-slash' : 'fa-chart-line-up'
                        } text-lg`}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base-content">{headline}</h3>
                    <p className="text-sm text-base-content/60 mt-1">{description}</p>

                    {!marketplaceOff && (
                        <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 max-w-48 h-2 bg-base-300 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all ${
                                        percentage < 40 ? 'bg-error' : 'bg-warning'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-sm font-semibold tabular-nums">
                                {percentage}%
                            </span>
                        </div>
                    )}

                    {missingFields.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {missingFields.map((field) => (
                                <span
                                    key={field.name}
                                    className="badge badge-ghost badge-sm"
                                >
                                    <i className="fa-duotone fa-regular fa-circle-plus mr-1" />
                                    {field.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-start">
                    <Link
                        href="/portal/profile?section=marketplace"
                        className={`btn btn-sm ${
                            severity === 'error' ? 'btn-error' : 'btn-warning'
                        }`}
                    >
                        {marketplaceOff ? 'Enable Now' : 'Complete Profile'}
                        <i className="fa-duotone fa-regular fa-arrow-right" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
