"use client";

import { Fragment } from "react";
import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { BaselBadge } from "@splits-network/basel-ui";
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
    extractCompany,
    extractRelationship,
} from "../shared/helpers";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";
import { CompanyDetailLoader } from "../shared/company-detail";
import CompanyActionsToolbar from "../shared/actions-toolbar";

export function TableRow({
    item,
    activeTab,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    item: Company | CompanyRelationship;
    activeTab: CompanyTab;
    idx: number;
    isSelected: boolean;
    colSpan: number;
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

    const size = sizeBadge((item as Company).company_size ?? (company as Company).company_size);
    const stage = stageBadge((item as Company).stage ?? (company as Company).stage);
    const relStatus = relationshipStatusBadge(relationship?.status);
    const relType = relationshipTypeBadge(relationship?.relationship_type);

    const rowBase = isSelected
        ? "bg-primary/5 border-l-4 border-l-primary"
        : `border-l-4 border-l-transparent ${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"}`;

    return (
        <Fragment>
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors ${rowBase}`}
            >
                {/* Chevron */}
                <td className="px-4 py-3 w-8">
                    <i
                        className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? "text-primary" : "text-base-content/30"}`}
                    />
                </td>

                {/* Company */}
                <td className="px-4 py-3">
                    <span className="font-bold text-sm text-base-content inline-flex items-center gap-1.5">
                        {name}
                        {level && <LevelBadge level={level} size="sm" />}
                    </span>
                </td>

                {/* Industry */}
                <td className="px-4 py-3 text-sm font-semibold text-base-content/70">
                    {industry || "---"}
                </td>

                {/* Location */}
                <td className="px-4 py-3 text-sm text-base-content/60">
                    {location || "---"}
                </td>

                {/* Info: badges */}
                <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1">
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
                </td>

                {/* Added */}
                <td className="px-4 py-3 text-sm text-base-content/50">
                    {addedAgo(item)}
                </td>

                {/* Actions */}
                <td
                    className="px-4 py-3 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap">
                        <CompanyActionsToolbar
                            company={company}
                            relationship={relationship}
                            variant="icon-only"
                            size="xs"
                            onRefresh={onRefresh}
                        />
                    </div>
                </td>
            </tr>

            {/* Expanded detail row */}
            {isSelected && (
                <tr>
                    <td
                        colSpan={colSpan}
                        className="p-0 bg-base-100 border-t-2 border-b-2 border-primary"
                    >
                        <CompanyDetailLoader
                            companyId={companyId(item, isMarketplace)}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
