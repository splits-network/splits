"use client";

import type { Company, CompanyRelationship } from "../../types";
import { formatDate, formatCompanySize } from "../../types";
import { statusColorName } from "./status-color";
import { formatStatus, formatSalary } from "./helpers";
import { BaselBadge } from "@splits-network/basel-ui";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import { BadgeGrid, useGamification } from "@splits-network/shared-gamification";

export function CompanyOverviewTab({
    company,
    relationship,
    techStack = [],
    perks = [],
    cultureTags = [],
}: {
    company: Company;
    relationship: CompanyRelationship | null;
    techStack?: string[];
    perks?: string[];
    cultureTags?: string[];
}) {
    const { getBadges } = useGamification();
    const badges = getBadges(company.id);

    return (
        <div className="space-y-8 p-6">
            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.15em] text-base-content/40 mb-1">Location</p>
                    {company.headquarters_location ? (
                        <p className="font-bold text-sm">
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {company.headquarters_location}
                        </p>
                    ) : (
                        <p className="text-sm text-base-content/30">---</p>
                    )}
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.15em] text-base-content/40 mb-1">Website</p>
                    {company.website ? (
                        <a
                            href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-primary hover:underline"
                        >
                            {company.website}
                        </a>
                    ) : (
                        <p className="text-sm text-base-content/30">---</p>
                    )}
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.15em] text-base-content/40 mb-1">Industry</p>
                    {company.industry ? (
                        <p className="font-bold text-sm">{company.industry}</p>
                    ) : (
                        <p className="text-sm text-base-content/30">---</p>
                    )}
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.15em] text-base-content/40 mb-1">Company Size</p>
                    {company.company_size ? (
                        <p className="font-bold text-sm">{formatCompanySize(company.company_size)}</p>
                    ) : (
                        <p className="text-sm text-base-content/30">---</p>
                    )}
                </div>
            </div>

            {/* Relationship Summary */}
            {relationship && (
                <div className="flex items-center gap-3 bg-base-200 border border-base-300 p-4">
                    <i className="fa-duotone fa-regular fa-handshake text-base-content/40" />
                    <div className="flex items-center gap-2">
                        <BaselBadge color={statusColorName(relationship.status)} size="sm">
                            {formatStatus(relationship.status)}
                        </BaselBadge>
                        <span className="text-sm text-base-content/60 capitalize">
                            {relationship.relationship_type}
                        </span>
                        {relationship.relationship_start_date && (
                            <span className="text-sm text-base-content/40">
                                since {formatDate(relationship.relationship_start_date)}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Avg Salary (not in header stats strip) */}
            {company.avg_salary != null && (
                <div className="bg-base-200 border border-base-300 border-l-4 border-l-primary p-4">
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-1">Avg Salary</p>
                    <p className="text-lg font-black tracking-tight">{formatSalary(company.avg_salary)}</p>
                </div>
            )}

            {/* Tagline */}
            <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-3">Tagline</p>
                {company.tagline ? (
                    <div className="text-lg italic text-base-content/70 border-l-4 border-l-primary pl-4">
                        <MarkdownRenderer content={company.tagline} />
                    </div>
                ) : (
                    <p className="text-sm text-base-content/30 italic">No tagline provided</p>
                )}
            </div>

            {/* About */}
            <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-3">About</p>
                {company.description ? (
                    <p className="text-sm text-base-content/70 leading-relaxed">{company.description}</p>
                ) : (
                    <p className="text-sm text-base-content/30 italic">No description provided</p>
                )}
            </div>

            {/* Social Links */}
            <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-3">Social</p>
                {company.linkedin_url || company.twitter_url || company.glassdoor_url ? (
                    <div className="flex items-center gap-4">
                        {company.linkedin_url && (
                            <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                                <i className="fa-brands fa-linkedin text-lg" /> LinkedIn
                            </a>
                        )}
                        {company.twitter_url && (
                            <a href={company.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                                <i className="fa-brands fa-x-twitter text-lg" /> X / Twitter
                            </a>
                        )}
                        {company.glassdoor_url && (
                            <a href={company.glassdoor_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                                <i className="fa-duotone fa-regular fa-star text-lg" /> Glassdoor
                            </a>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-base-content/30 italic">No social links provided</p>
                )}
            </div>

            {/* Tech Stack */}
            <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-4">Tech Stack</p>
                {techStack.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {techStack.map((skill) => (
                            <BaselBadge key={skill} variant="outline" size="sm">{skill}</BaselBadge>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-base-content/30 italic">No tech stack provided</p>
                )}
            </div>

            {/* Perks & Benefits */}
            <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-4">Perks & Benefits</p>
                {perks.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {perks.map((perk) => (
                            <BaselBadge key={perk} color="secondary" size="sm">{perk}</BaselBadge>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-base-content/30 italic">No perks or benefits provided</p>
                )}
            </div>

            {/* Culture & Values */}
            <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-4">Culture & Values</p>
                {cultureTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {cultureTags.map((tag) => (
                            <BaselBadge key={tag} color="accent" size="sm">{tag}</BaselBadge>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-base-content/30 italic">No culture or values provided</p>
                )}
            </div>

            {/* Achievements */}
            {badges.length > 0 && (
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-4">Achievements</p>
                    <BadgeGrid badges={badges} maxVisible={6} />
                </div>
            )}
        </div>
    );
}
