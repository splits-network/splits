"use client";

import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import {
    relationshipStatusBadge,
    relationshipTypeBadge,
} from "../shared/company-badges";
import { statusBorder } from "../shared/status-color";
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
    useGamification,
} from "@splits-network/shared-gamification";
import { BaselBadge, BaselAvatar, BaselLevelIndicator } from "@splits-network/basel-ui";
import { formatCompanySize } from "../../types";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import CompanyActionsToolbar from "../shared/actions-toolbar";

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
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-colors",
                isSelected
                    ? "border-primary border-l-primary bg-primary/5"
                    : `${statusBorder(relationship?.status)} hover:border-base-content/20`,
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 px-5 pt-4 pb-4">
                {/* Kicker row: badges */}
                <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
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
                <div className="flex items-start gap-3">
                    <BaselAvatar
                        initials={initials}
                        src={company.logo_url}
                        alt={name}
                        size="md"
                        className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-0.5 truncate">
                            {industry || "Company"}
                        </p>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                    </div>
                </div>

                {/* Location + founded/added date */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/50">
                    <span className="flex items-center gap-1.5 truncate">
                        <i className="fa-duotone fa-regular fa-location-dot text-xs text-secondary" />
                        {location || "Location not specified"}
                    </span>
                    {(foundedYear || addedAgo(item)) && (
                        <>
                            <span className="text-base-content/20">|</span>
                            {foundedYear ? (
                                <span className="flex items-center gap-1.5 shrink-0">
                                    <i className="fa-duotone fa-regular fa-calendar text-xs text-accent" />
                                    Est. {foundedYear}
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 shrink-0">
                                    <i className="fa-duotone fa-regular fa-clock text-xs text-accent" />
                                    {addedAgo(item)}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Inline metadata: size · stage · founded · roles */}
            <div className="px-5 py-2.5 border-b border-base-300 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                {level && (
                    <>
                        <BaselLevelIndicator level={level.current_level} title={level.title} totalXp={level.total_xp} />
                        <span className="text-base-content/20">&middot;</span>
                    </>
                )}
                {([
                    { icon: "fa-users", color: "text-primary", value: formatCompanySize(company.company_size) || "\u2014", muted: !company.company_size, tooltip: "Company size" },
                    { icon: "fa-rocket", color: "text-secondary", value: company.stage || "\u2014", muted: !company.stage, tooltip: "Company stage" },
                    { icon: "fa-calendar", color: "text-accent", value: foundedYear ? `Est. ${foundedYear}` : "\u2014", muted: !foundedYear, tooltip: "Year founded" },
                    { icon: "fa-briefcase", color: "text-success", value: company.open_roles_count != null ? `${company.open_roles_count} roles` : "\u2014", muted: company.open_roles_count == null, tooltip: "Open roles" },
                ] as const).map((item, i) => (
                    <span key={i} className={`tooltip tooltip-bottom flex items-center gap-1 ${item.muted ? "text-base-content/30" : "text-base-content/50"}`} data-tip={item.tooltip}>
                        <i className={`fa-duotone fa-regular ${item.icon} ${item.muted ? "text-base-content/20" : item.color} text-xs`} />
                        <span className="truncate">{item.value}</span>
                    </span>
                ))}
            </div>

            {/* About snippet */}
            <div className="px-5 py-3 border-b border-base-300">
                {tagline ? (
                    <div className="text-sm text-base-content/60 leading-relaxed line-clamp-2">
                        <MarkdownRenderer content={tagline} />
                    </div>
                ) : (
                    <p className="text-sm text-base-content/30">No description provided</p>
                )}
            </div>

            {/* Tags: tech stack + perks + culture */}
            <div className="px-5 py-3 border-b border-base-300">
                <div className="flex flex-wrap gap-1.5">
                    {techStack.slice(0, 3).map((tech) => (
                        <BaselBadge key={tech} variant="outline" size="sm">
                            {tech}
                        </BaselBadge>
                    ))}
                    {perks.slice(0, 2).map((perk) => (
                        <BaselBadge key={perk} color="secondary" size="sm">
                            {perk}
                        </BaselBadge>
                    ))}
                    {cultureTags.slice(0, 2).map((tag) => (
                        <BaselBadge key={tag} color="accent" size="sm">
                            {tag}
                        </BaselBadge>
                    ))}
                    {(() => {
                        const shown = Math.min(techStack.length, 3) + Math.min(perks.length, 2) + Math.min(cultureTags.length, 2);
                        const total = techStack.length + perks.length + cultureTags.length;
                        const remaining = total - shown;
                        return remaining > 0 ? (
                            <span className="text-sm font-semibold text-base-content/50 self-center">
                                +{remaining} more
                            </span>
                        ) : null;
                    })()}
                    {techStack.length === 0 && perks.length === 0 && cultureTags.length === 0 && (
                        <span className="text-sm text-base-content/30">No details listed</span>
                    )}
                </div>
            </div>

            {/* Footer: view link + actions */}
            <div
                className="mt-auto flex items-center justify-between gap-3 px-5 py-3"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onSelect}
                    className="text-sm font-semibold text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
                >
                    View Details
                    <i className="fa-duotone fa-regular fa-arrow-right text-xs" />
                </button>
                <CompanyActionsToolbar
                    company={company}
                    relationship={relationship}
                    variant="icon-only"
                    size="sm"
                    onRefresh={onRefresh}
                />
            </div>
        </article>
    );
}
