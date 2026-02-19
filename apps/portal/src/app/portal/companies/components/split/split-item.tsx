"use client";

import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    companyName,
    companyIndustry,
    companyLocation,
    addedAgo,
    extractRelationship,
    formatStatus,
} from "../shared/helpers";

export function SplitItem({
    item,
    activeTab,
    isSelected,
    onSelect,
}: {
    item: Company | CompanyRelationship;
    activeTab: CompanyTab;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const isMarketplace = activeTab === "marketplace";
    const name = companyName(item, isMarketplace);
    const industry = companyIndustry(item, isMarketplace);
    const location = companyLocation(item, isMarketplace);
    const relationship = extractRelationship(item, isMarketplace);

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer px-6 py-4 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "bg-base-100 border-transparent"
            }`}
        >
            {/* Row 1: name + time */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-bold text-sm tracking-tight truncate text-base-content">
                    {name}
                </h4>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {addedAgo(item)}
                </span>
            </div>

            {/* Row 2: industry */}
            {industry && (
                <div className="text-sm font-semibold text-base-content/60 mb-1 truncate">
                    {industry}
                </div>
            )}

            {/* Row 3: location + status */}
            <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-sm text-base-content/50 truncate">
                    {location ? (
                        <>
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {location}
                        </>
                    ) : null}
                </div>
                {relationship && (
                    <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold flex-shrink-0 ${statusColor(relationship.status)}`}
                    >
                        {formatStatus(relationship.status)}
                    </span>
                )}
            </div>

            {/* Row 4: size or relationship info */}
            {isMarketplace && (
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-bold text-base-content/70">
                        {(item as Company).company_size || "Size N/A"}
                    </span>
                </div>
            )}
            {!isMarketplace && relationship && (
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-bold text-base-content/70 capitalize">
                        {relationship.relationship_type}
                    </span>
                    {relationship.can_manage_company_jobs && (
                        <span className="text-sm font-bold text-secondary">
                            Can manage jobs
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
