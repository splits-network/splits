"use client";

import {
    CompanyTab,
    Company,
    CompanyRelationship,
    getRelationshipStatusBadgeClass,
} from "../../types";

interface ListItemProps {
    item: Company | CompanyRelationship;
    activeTab: CompanyTab;
    isSelected: boolean;
    onSelect: () => void;
}

export default function ListItem({
    item,
    activeTab,
    isSelected,
    onSelect,
}: ListItemProps) {
    const isMarketplace = activeTab === "marketplace";
    const company = isMarketplace
        ? (item as Company)
        : (item as CompanyRelationship).company;
    const relationship = isMarketplace
        ? null
        : (item as CompanyRelationship);

    return (
        <button
            onClick={onSelect}
            className={`w-full text-left p-4 border-b border-base-300 hover:bg-base-300/50 transition-colors ${
                isSelected ? "bg-base-300" : ""
            }`}
        >
            <div className="flex items-start gap-3">
                {/* Company Initial Avatar */}
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {company.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm truncate">
                            {company.name}
                        </h4>
                        {!isMarketplace && relationship && (
                            <span
                                className={`badge badge-xs ${getRelationshipStatusBadgeClass(relationship.status)}`}
                            >
                                {relationship.status}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-base-content/60">
                        {company.industry && (
                            <span>
                                <i className="fa-duotone fa-regular fa-industry mr-1" />
                                {company.industry}
                            </span>
                        )}
                        {company.headquarters_location && (
                            <span>
                                <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                {company.headquarters_location}
                            </span>
                        )}
                    </div>

                    {!isMarketplace && relationship && (
                        <div className="mt-1 text-xs text-base-content/40">
                            <span className="capitalize">
                                {relationship.relationship_type}
                            </span>
                            {relationship.can_manage_company_jobs && (
                                <span className="ml-2">
                                    <i className="fa-duotone fa-regular fa-check-circle text-success mr-1" />
                                    Can manage jobs
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}
