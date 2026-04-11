"use client";

import type { PublicCompany } from "../types";
import { companyLocation, companyInitials } from "../types";
import { HeroStats } from "./hero-stats";

interface HeroSectionProps {
    company: PublicCompany;
}

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname.replace("www.", "");
    } catch {
        return url;
    }
}

export default function HeroSection({ company }: HeroSectionProps) {
    const location = companyLocation(company);
    const initials = companyInitials(company.name);

    return (
        <header className="relative bg-base-300 text-base-content border-l-4 border-l-primary">
            <div
                className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                style={{
                    clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)",
                }}
            />
            <div className="relative px-8 pt-10 pb-0">
                {/* Kicker row */}
                <div className="flex items-center justify-between mb-8">
                    <p className="scroll-reveal fade-up hero-kicker text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                        {company.industry || "Company"}
                    </p>
                    {company.stage && (
                        <span className="scroll-reveal fade-up hero-kicker flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                            <i className="fa-duotone fa-regular fa-chart-line text-sm" />
                            {company.stage}
                        </span>
                    )}
                </div>

                {/* Logo + Identity */}
                <div className="flex flex-col lg:flex-row lg:items-end gap-8">
                    <div className="flex items-end gap-5 flex-1">
                        <div className="scroll-reveal pop-in relative shrink-0">
                            {company.logo_url ? (
                                <img
                                    src={company.logo_url}
                                    alt={`${company.name} logo`}
                                    className="w-20 h-20 lg:w-24 lg:h-24 object-contain bg-base-100"
                                />
                            ) : (
                                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-primary text-primary-content flex items-center justify-center text-2xl lg:text-3xl font-black tracking-tight select-none">
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 pb-1">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-1">
                                Company
                            </p>
                            <h1 className="scroll-reveal fade-up text-4xl lg:text-5xl font-black tracking-tight leading-none text-base-content mb-3">
                                {company.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/40">
                                {location && (
                                    <span className="scroll-reveal fade-up flex items-center gap-1.5">
                                        <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                                        {location}
                                    </span>
                                )}
                                {company.founded_year && (
                                    <>
                                        {location && (
                                            <span className="text-base-content/20">
                                                |
                                            </span>
                                        )}
                                        <span className="scroll-reveal fade-up flex items-center gap-1.5">
                                            <i className="fa-duotone fa-regular fa-calendar text-xs" />
                                            Est. {company.founded_year}
                                        </span>
                                    </>
                                )}
                                {company.website && (
                                    <>
                                        <span className="text-base-content/20">
                                            |
                                        </span>
                                        <span className="scroll-reveal fade-up flex items-center gap-1.5">
                                            <i className="fa-duotone fa-regular fa-globe text-xs" />
                                            {extractDomain(company.website)}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-wrap gap-2 pb-1 shrink-0">
                        {company.website && (
                            <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="scroll-reveal fade-up btn btn-primary btn-sm font-bold uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                                Website
                            </a>
                        )}
                        {company.linkedin_url && (
                            <a
                                href={company.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="scroll-reveal fade-up btn btn-ghost btn-sm border-neutral-content/20 font-bold uppercase tracking-wider"
                            >
                                <i className="fa-brands fa-linkedin-in" />
                                LinkedIn
                            </a>
                        )}
                        <button className="scroll-reveal fade-up btn btn-ghost btn-sm border-neutral-content/20 font-bold uppercase tracking-wider">
                            <i className="fa-duotone fa-regular fa-share-nodes" />
                            Share
                        </button>
                    </div>
                </div>

                {/* Stats strip */}
                <HeroStats company={company} />
            </div>
        </header>
    );
}
