"use client";

import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { statusColorName } from "../shared/status-color";
import {
    companyName,
    companyInitials,
    companyIndustry,
    companyLocation,
    companyId,
    addedAgo,
    extractCompany,
    extractRelationship,
    formatStatus,
} from "../shared/helpers";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";
import { BaselBadge } from "@splits-network/basel-ui";
import CompanyActionsToolbar from "../shared/actions-toolbar";
import { MarketplaceStats, RelationshipStats } from "./grid-card-stats";

export function GridCard({
    item,
    activeTab,
    isSelected,
    onSelect,
    onRefresh,
}: {
    item: Company | CompanyRelationship;
    activeTab: CompanyTab;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const isMarketplace = activeTab === "marketplace";
    const name = companyName(item, isMarketplace);
    const industry = companyIndustry(item, isMarketplace);
    const location = companyLocation(item, isMarketplace);
    const company = extractCompany(item, isMarketplace);
    const relationship = extractRelationship(item, isMarketplace);
    const { getLevel } = useGamification();
    const level = getLevel(companyId(item, isMarketplace));

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
                {/* Kicker row: industry + status/hiring badge */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 truncate">
                        {industry || "Company"}
                    </p>
                    {relationship && (
                        <BaselBadge color={statusColorName(relationship.status)} size="sm" className="shrink-0">
                            {formatStatus(relationship.status)}
                        </BaselBadge>
                    )}
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

                {/* Location + added date */}
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
                    <span className="flex items-center gap-1.5 shrink-0">
                        <i className="fa-duotone fa-regular fa-clock text-xs" />
                        {addedAgo(item)}
                    </span>
                </div>
            </div>

            {/* Description (marketplace only, when available) */}
            {isMarketplace && (item as Company).description && (
                <div className="px-5 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-1.5">
                        About
                    </p>
                    <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        {(item as Company).description}
                    </p>
                </div>
            )}

            {/* Stats Row */}
            <div className="border-b border-base-300">
                {isMarketplace ? (
                    <MarketplaceStats company={item as Company} />
                ) : (
                    <RelationshipStats relationship={relationship!} />
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
