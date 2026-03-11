"use client";

import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import {
    relationshipStatusBadge,
    relationshipTypeBadge,
} from "../shared/company-badges";
import {
    companyName,
    companyInitials,
    companyIndustry,
    companyLocation,
    companyId,
    addedAgo,
    extractCompany,
    extractRelationship,
    companyFoundedYear,
    companyTagline,
} from "../shared/helpers";
import {
    LevelBadge,
    useGamification,
} from "@splits-network/shared-gamification";
import { BaselBadge } from "@splits-network/basel-ui";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import CompanyActionsToolbar from "../shared/actions-toolbar";
import { CompanyStats } from "./grid-card-stats";

export function GridCard({
    item,
    activeTab,
    isSelected,
    onSelect,
    onRefresh,
    techStack = [],
    perks = [],
    cultureTags = [],
}: {
    item: Company | CompanyRelationship;
    activeTab: CompanyTab;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
    techStack?: string[];
    perks?: string[];
    cultureTags?: string[];
}) {
    const isMarketplace = activeTab === "marketplace";
    const name = companyName(item, isMarketplace);
    const industry = companyIndustry(item, isMarketplace);
    const location = companyLocation(item, isMarketplace);
    const company = extractCompany(item, isMarketplace);
    const relationship = extractRelationship(item, isMarketplace);
    const foundedYear = companyFoundedYear(item, isMarketplace);
    const tagline = companyTagline(item, isMarketplace);
    const { getLevel } = useGamification();
    const level = getLevel(companyId(item, isMarketplace));

    const relStatus = relationshipStatusBadge(relationship?.status);
    const relType = relationshipTypeBadge(relationship?.relationship_type);
    const initials = companyInitials(name);

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer bg-base-100 border border-base-300 border-l-4 transition-all",
                isSelected
                    ? "border-l-primary shadow-md"
                    : "border-l-base-300 hover:border-l-primary/50 hover:shadow-md",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-5 pt-5 pb-4">
                {/* Kicker row: industry + badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 truncate">
                        {industry || "Company"}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                        {relStatus && (
                            <BaselBadge color={relStatus.color} size="sm" variant="soft">
                                {relStatus.label}
                            </BaselBadge>
                        )}
                        {relType && (
                            <BaselBadge color={relType.color} size="sm" variant="outline">
                                {relType.label}
                            </BaselBadge>
                        )}
                    </div>
                </div>

                {/* Avatar + Name block */}
                <div className="flex items-end gap-3">
                    <div className="relative shrink-0">
                        {company.logo_url ? (
                            <img
                                src={company.logo_url}
                                alt={name}
                                className="w-14 h-14 object-contain bg-base-100"
                            />
                        ) : (
                            <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center text-lg font-black tracking-tight select-none">
                                {initials}
                            </div>
                        )}
                        {level && (
                            <div className="absolute -bottom-1 -right-1">
                                <LevelBadge level={level} size="sm" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            Company
                        </p>
                        <h3 className="text-2xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                    </div>
                </div>

                {/* Location + founded/added date */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/40">
                    {location && (
                        <span className="flex items-center gap-1.5 truncate">
                            <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                            {location}
                        </span>
                    )}
                    {location && (
                        <span className="text-base-content/20">|</span>
                    )}
                    {foundedYear ? (
                        <span className="flex items-center gap-1.5 shrink-0">
                            <i className="fa-duotone fa-regular fa-calendar text-xs" />
                            Est. {foundedYear}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 shrink-0">
                            <i className="fa-duotone fa-regular fa-clock text-xs" />
                            {addedAgo(item)}
                        </span>
                    )}
                </div>
            </div>

            {/* Tagline / About */}
            <div className="px-5 py-4 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-1.5">
                    About
                </p>
                {tagline ? (
                    <div className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        <MarkdownRenderer content={tagline} />
                    </div>
                ) : (
                    <p className="text-sm text-base-content/20 italic">No description added yet</p>
                )}
            </div>

            {/* Stats Row */}
            <div className="border-b border-base-300">
                <CompanyStats company={company} />
            </div>

            {/* Tech Stack */}
            <div className="px-5 py-4 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    Tech Stack
                </p>
                {techStack.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {techStack.slice(0, 6).map((tech) => (
                            <BaselBadge key={tech} variant="outline" size="sm">
                                {tech}
                            </BaselBadge>
                        ))}
                        {techStack.length > 6 && (
                            <span className="text-sm font-semibold text-base-content/40 self-center">
                                +{techStack.length - 6} more
                            </span>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-base-content/20 italic">No tech stack listed</p>
                )}
            </div>

            {/* Perks */}
            <div className="px-5 py-4 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    Perks
                </p>
                {perks.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {perks.slice(0, 4).map((perk) => (
                            <BaselBadge key={perk} color="secondary" size="sm">
                                {perk}
                            </BaselBadge>
                        ))}
                        {perks.length > 4 && (
                            <span className="text-sm font-semibold text-base-content/40 self-center">
                                +{perks.length - 4} more
                            </span>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-base-content/20 italic">No perks listed</p>
                )}
            </div>

            {/* Culture & Values */}
            <div className="px-5 py-4 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    Culture & Values
                </p>
                {cultureTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {cultureTags.slice(0, 4).map((tag) => (
                            <BaselBadge key={tag} color="accent" size="sm">
                                {tag}
                            </BaselBadge>
                        ))}
                        {cultureTags.length > 4 && (
                            <span className="text-sm font-semibold text-base-content/40 self-center">
                                +{cultureTags.length - 4} more
                            </span>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-base-content/20 italic">No culture tags listed</p>
                )}
            </div>

            {/* Footer: actions toolbar */}
            <div className="px-5 py-3 flex items-center justify-end">
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <CompanyActionsToolbar
                        company={company}
                        relationship={relationship}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                    />
                </div>
            </div>
        </article>
    );
}
