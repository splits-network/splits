"use client";

import type { PublicCompany } from "../../types";

interface AboutTabProps {
    company: PublicCompany;
}

export function AboutTab({ company }: AboutTabProps) {
    return (
        <div className="space-y-10">
            {/* Description */}
            <div className="scroll-reveal fade-up profile-section border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    About {company.name}
                </p>
                {company.description ? (
                    <p className="text-base text-base-content/70 leading-relaxed">
                        {company.description}
                    </p>
                ) : (
                    <p className="text-base text-base-content/40 italic">
                        This company hasn&apos;t added a description yet.
                    </p>
                )}
            </div>

            {/* Tagline highlight */}
            {company.tagline && (
                <div className="scroll-reveal fade-up profile-section bg-primary/5 border border-primary/10 px-6 py-5">
                    <i className="fa-duotone fa-regular fa-quote-left text-xl text-primary/30 mb-3 block" />
                    <p className="text-lg font-bold text-base-content/80 italic leading-relaxed">
                        &ldquo;{company.tagline}&rdquo;
                    </p>
                </div>
            )}

            {/* Company Details */}
            <div className="scroll-reveal fade-up profile-section">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    Company Details
                </p>
                <div className="grid grid-cols-2 gap-4">
                    {company.industry && (
                        <div className="bg-base-200 border border-base-300 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-base-content/30 mb-1">
                                Industry
                            </p>
                            <p className="text-sm font-semibold text-base-content/70">
                                {company.industry}
                            </p>
                        </div>
                    )}
                    {company.company_size && (
                        <div className="bg-base-200 border border-base-300 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-base-content/30 mb-1">
                                Size
                            </p>
                            <p className="text-sm font-semibold text-base-content/70">
                                {company.company_size}
                            </p>
                        </div>
                    )}
                    {company.stage && (
                        <div className="bg-base-200 border border-base-300 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-base-content/30 mb-1">
                                Stage
                            </p>
                            <p className="text-sm font-semibold text-base-content/70">
                                {company.stage}
                            </p>
                        </div>
                    )}
                    {company.founded_year && (
                        <div className="bg-base-200 border border-base-300 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-base-content/30 mb-1">
                                Founded
                            </p>
                            <p className="text-sm font-semibold text-base-content/70">
                                {company.founded_year}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
