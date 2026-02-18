"use client";

import { Badge } from "@splits-network/memphis-ui";
import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { relationshipStatusVariant } from "../shared/accent";
import {
    companyName,
    companyIndustry,
    companyLocation,
    addedAgo,
    extractRelationship,
} from "../shared/helpers";

export function SplitItem({
    item,
    activeTab,
    accent,
    isSelected,
    onSelect,
}: {
    item: Company | CompanyRelationship;
    activeTab: CompanyTab;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const ac = accent;
    const isMarketplace = activeTab === "marketplace";
    const name = companyName(item, isMarketplace);
    const industry = companyIndustry(item, isMarketplace);
    const location = companyLocation(item, isMarketplace);
    const relationship = extractRelationship(item, isMarketplace);

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer p-4 transition-colors border-b-2 border-dark/10 border-l-4 ${
                isSelected
                    ? `${ac.bgLight} ${ac.border}`
                    : "bg-white border-transparent"
            }`}
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-black text-sm uppercase tracking-tight truncate text-dark">
                    {name}
                </h4>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-dark/40">
                    {addedAgo(item)}
                </span>
            </div>
            {industry && (
                <div className={`text-sm font-bold mb-1 ${ac.text}`}>
                    {industry}
                </div>
            )}
            <div className="flex items-center justify-between">
                {location && (
                    <span className="text-sm text-dark/50">
                        <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                        {location}
                    </span>
                )}
                {relationship && (
                    <Badge color={relationshipStatusVariant(relationship.status)}>
                        {relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)}
                    </Badge>
                )}
            </div>
            {isMarketplace && (
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-bold text-dark/70">
                        {(item as Company).company_size || "Size N/A"}
                    </span>
                </div>
            )}
            {!isMarketplace && relationship && (
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-bold text-dark/70 capitalize">
                        {relationship.relationship_type}
                    </span>
                    {relationship.can_manage_company_jobs && (
                        <span className="text-sm font-bold text-purple">
                            Can manage jobs
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
