"use client";

import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { BaselBadge, BaselLevelIndicator } from "@splits-network/basel-ui";
import {
    relationshipStatusBadge,
    relationshipTypeBadge,
    sizeBadge,
    stageBadge,
} from "../shared/company-badges";
import {
    companyName,
    companyId,
    companyIndustry,
    companyLocation,
    addedAgo,
    extractRelationship,
} from "../shared/helpers";
import { statusBorder } from "../shared/status-color";
import { useGamification } from "@splits-network/shared-gamification";


export function SplitItem({
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
    const relationship = extractRelationship(item, isMarketplace);
    const { getLevel } = useGamification();
    const level = getLevel(companyId(item, isMarketplace));

    const company: Company = isMarketplace
        ? (item as Company)
        : ({ ...(item as CompanyRelationship).company, created_at: (item as CompanyRelationship).created_at } as Company);

    const size = sizeBadge((item as Company).company_size ?? (company as Company).company_size);
    const stage = stageBadge((item as Company).stage ?? (company as Company).stage);
    const relStatus = relationshipStatusBadge(relationship?.status);
    const relType = relationshipTypeBadge(relationship?.relationship_type);

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer px-4 py-2.5 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : `bg-base-100 ${statusBorder(relationship?.status)}`
            }`}
        >
            {/* Row 1: name + time */}
            <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-sm tracking-tight truncate text-base-content flex items-center gap-1.5">
                    {name}
                    {level && <BaselLevelIndicator level={level.current_level} title={level.title} totalXp={level.total_xp} xpToNextLevel={level.xp_to_next_level} />}
                </h4>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {addedAgo(item)}
                </span>
            </div>

            {/* Row 2: industry + location */}
            <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-sm text-base-content/60 truncate">
                    {industry || <span className="text-base-content/30">No industry</span>}
                </span>
                <span className="text-sm text-base-content/40 flex-shrink-0 truncate max-w-[40%]">
                    <i className="fa-duotone fa-regular fa-location-dot mr-0.5" />
                    {location || <span className="text-base-content/30">No location</span>}
                </span>
            </div>

            {/* Row 4: badge bar */}
            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                {relStatus && (
                    <BaselBadge color={relStatus.color} size="xs" variant="soft">
                        {relStatus.label}
                    </BaselBadge>
                )}
                {relType && (
                    <BaselBadge color={relType.color} size="xs" variant="outline">
                        {relType.label}
                    </BaselBadge>
                )}
                {size && (
                    <BaselBadge color={size.color} size="xs">
                        {size.label}
                    </BaselBadge>
                )}
                {stage && (
                    <BaselBadge color={stage.color} size="xs" variant="outline">
                        {stage.label}
                    </BaselBadge>
                )}
            </div>
        </div>
    );
}
