"use client";

import type { PublicCompany, PublicCompanyProfile } from "../types";

interface SidebarProps {
    company: PublicCompany;
    profile: PublicCompanyProfile | null;
}

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname.replace("www.", "");
    } catch {
        return url;
    }
}

export default function Sidebar({ company, profile }: SidebarProps) {
    const linkItems = [
        company.website
            ? {
                  icon: "fa-duotone fa-regular fa-globe",
                  label: "Website",
                  value: extractDomain(company.website),
                  href: company.website,
              }
            : null,
        company.linkedin_url
            ? {
                  icon: "fa-brands fa-linkedin-in",
                  label: "LinkedIn",
                  value: "LinkedIn",
                  href: company.linkedin_url,
              }
            : null,
        company.glassdoor_url
            ? {
                  icon: "fa-duotone fa-regular fa-star",
                  label: "Glassdoor",
                  value: "Glassdoor",
                  href: company.glassdoor_url,
              }
            : null,
        company.twitter_url
            ? {
                  icon: "fa-brands fa-x-twitter",
                  label: "Twitter/X",
                  value: "Twitter/X",
                  href: company.twitter_url,
              }
            : null,
    ].filter(Boolean) as {
        icon: string;
        label: string;
        value: string;
        href: string;
    }[];

    const reputation = profile?.reputation;

    return (
        <aside className="space-y-6">
            {/* Links card */}
            {linkItems.length > 0 && (
                <div className="scroll-reveal fade-up sidebar-card bg-base-200 border border-base-300 border-l-4 border-l-primary">
                    <div className="px-6 py-4 border-b border-base-300">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                            Links
                        </p>
                    </div>
                    <div className="divide-y divide-base-300">
                        {linkItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 px-6 py-4 hover:bg-base-300/50 transition-colors"
                            >
                                <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                                    <i
                                        className={`${item.icon} text-primary text-xs`}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">
                                        {item.label}
                                    </p>
                                    <p className="text-sm font-semibold text-base-content truncate">
                                        {item.value}
                                    </p>
                                </div>
                                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-xs text-base-content/20 ml-auto" />
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Stats card */}
            <div className="scroll-reveal fade-up sidebar-card bg-base-200 border border-base-300">
                <div className="px-6 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                        Quick Stats
                    </p>
                </div>
                <div className="divide-y divide-base-300">
                    <div className="flex items-center justify-between px-6 py-4">
                        <span className="text-sm text-base-content/50">
                            Open Roles
                        </span>
                        <span className="text-sm font-black text-base-content">
                            {company.open_roles_count}
                        </span>
                    </div>
                    {company.company_size && (
                        <div className="flex items-center justify-between px-6 py-4">
                            <span className="text-sm text-base-content/50">
                                Company Size
                            </span>
                            <span className="text-sm font-black text-base-content">
                                {company.company_size}
                            </span>
                        </div>
                    )}
                    {reputation && (
                        <div className="flex items-center justify-between px-6 py-4">
                            <span className="text-sm text-base-content/50">
                                Reputation
                            </span>
                            <span className="text-sm font-black text-base-content capitalize">
                                {reputation.reputation_tier}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Industry card */}
            {company.industry && (
                <div className="scroll-reveal fade-up sidebar-card bg-base-200 border border-base-300">
                    <div className="px-6 py-4 border-b border-base-300">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                            Industry
                        </p>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-4">
                        <i className="fa-duotone fa-regular fa-industry text-xs text-accent" />
                        <span className="text-sm text-base-content/60">
                            {company.industry}
                        </span>
                    </div>
                </div>
            )}
        </aside>
    );
}
