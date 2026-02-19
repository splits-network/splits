"use client";

import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    companyName,
    companyInitials,
    companyIndustry,
    companyLocation,
    addedAgo,
    extractCompany,
    extractRelationship,
    formatStatus,
} from "../shared/helpers";
import CompanyActionsToolbar from "../shared/actions-toolbar";

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

    return (
        <div
            onClick={onSelect}
            className={[
                "group cursor-pointer bg-base-100 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30",
                isSelected ? "border-primary border-l-4" : "border-base-200",
            ].join(" ")}
        >
            {/* Company avatar + name */}
            <div className="flex items-center gap-3 mb-3">
                {company.logo_url ? (
                    <img
                        src={company.logo_url}
                        alt={name}
                        className="w-10 h-10 shrink-0 object-contain bg-base-200 border border-base-300 p-1"
                    />
                ) : (
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-base-200 border border-base-300 text-sm font-bold text-base-content/60">
                        {companyInitials(name)}
                    </div>
                )}
                <div className="min-w-0">
                    <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors truncate">
                        {name}
                    </h3>
                    {industry && (
                        <div className="text-sm font-semibold text-base-content/60">
                            {industry}
                        </div>
                    )}
                </div>
            </div>

            {/* Location */}
            {location && (
                <div className="flex items-center gap-1 text-sm text-base-content/50 mb-3">
                    <i className="fa-duotone fa-regular fa-location-dot" />
                    {location}
                </div>
            )}

            {/* Size or relationship info */}
            <div className="flex items-center justify-between mb-3">
                {isMarketplace ? (
                    <span className="text-sm font-black text-base-content">
                        {(item as Company).company_size || "Size N/A"}
                    </span>
                ) : (
                    <span className="text-sm font-bold text-base-content capitalize">
                        {relationship?.relationship_type || "---"}
                    </span>
                )}
                {relationship && (
                    <span
                        className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(relationship.status)}`}
                    >
                        {formatStatus(relationship.status)}
                    </span>
                )}
            </div>

            {/* Manage jobs badge */}
            {!isMarketplace && relationship && (
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-bold text-secondary">
                        <i className="fa-duotone fa-regular fa-shield-check mr-1" />
                        {relationship.can_manage_company_jobs
                            ? "Can manage jobs"
                            : "View only"}
                    </span>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-base-200">
                <span className="text-sm text-base-content/40">
                    Added {addedAgo(item)}
                </span>
                <div
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <CompanyActionsToolbar
                        company={company}
                        relationship={relationship}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                    />
                </div>
            </div>
        </div>
    );
}
