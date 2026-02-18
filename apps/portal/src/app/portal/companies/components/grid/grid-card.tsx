"use client";

import { Badge, Card } from "@splits-network/memphis-ui";
import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { relationshipStatusVariant } from "../shared/accent";
import {
    companyName,
    companyInitials,
    companyIndustry,
    companyLocation,
    addedAgo,
    extractCompany,
    extractRelationship,
} from "../shared/helpers";
import CompanyActionsToolbar from "../shared/actions-toolbar";

export function GridCard({
    item,
    activeTab,
    accent,
    isSelected,
    onSelect,
    onRefresh,
}: {
    item: Company | CompanyRelationship;
    activeTab: CompanyTab;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;
    const isMarketplace = activeTab === "marketplace";
    const name = companyName(item, isMarketplace);
    const industry = companyIndustry(item, isMarketplace);
    const location = companyLocation(item, isMarketplace);
    const company = extractCompany(item, isMarketplace);
    const relationship = extractRelationship(item, isMarketplace);

    return (
        <Card
            onClick={onSelect}
            className={`cursor-pointer border-4 transition-transform hover:-translate-y-1 relative ${isSelected ? ac.border : "border-dark/30"}`}
        >
            {/* Corner accent */}
            <div className={`absolute top-0 right-0 w-8 h-8 ${ac.bg}`} />

            <div className="card-body">
                {/* Company avatar + name */}
                <div className="flex items-center gap-3 mb-2">
                    {company.logo_url ? (
                        <img
                            src={company.logo_url}
                            alt={name}
                            className={`w-10 h-10 shrink-0 object-contain bg-cream border-2 ${ac.border} p-1`}
                        />
                    ) : (
                        <div
                            className={`w-10 h-10 shrink-0 flex items-center justify-center border-2 ${ac.border} bg-cream text-sm font-bold text-dark`}
                        >
                            {companyInitials(name)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <h3 className="font-black text-base uppercase tracking-tight leading-tight text-dark truncate">
                            {name}
                        </h3>
                        {industry && (
                            <div className={`text-sm font-bold ${ac.text}`}>
                                {industry}
                            </div>
                        )}
                    </div>
                </div>

                {location && (
                    <div className="flex items-center gap-1 text-sm mb-3 text-dark/60">
                        <i className="fa-duotone fa-regular fa-location-dot" />
                        {location}
                    </div>
                )}

                <div className="flex items-center justify-between mb-3">
                    {isMarketplace ? (
                        <span className="text-sm font-black text-dark">
                            {(item as Company).company_size || "Size N/A"}
                        </span>
                    ) : (
                        <span className="text-sm font-bold text-dark capitalize">
                            {relationship?.relationship_type || "—"}
                        </span>
                    )}
                    {relationship && (
                        <Badge color={relationshipStatusVariant(relationship.status)}>
                            {relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)}
                        </Badge>
                    )}
                </div>

                {/* Additional info */}
                {!isMarketplace && relationship && (
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-bold text-purple">
                            <i className="fa-duotone fa-regular fa-shield-check mr-1" />
                            {relationship.can_manage_company_jobs ? "Can manage jobs" : "View only"}
                        </span>
                    </div>
                )}
            </div>

            <div className={`card-actions justify-between gap-3 pt-3 border-t-2 ${ac.border}/30`}>
                <span className="text-sm text-dark/40 mt-2">
                    Added {addedAgo(item)}
                </span>
                <div className="mt-2 shrink-0">
                    <CompanyActionsToolbar
                        company={company}
                        relationship={relationship}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                    />
                </div>
            </div>
        </Card>
    );
}
