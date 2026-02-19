"use client";

import { Fragment } from "react";
import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    companyName,
    companyIndustry,
    companyLocation,
    addedAgo,
    extractCompany,
    extractRelationship,
    formatStatus,
} from "../shared/helpers";
import { CompanyDetailLoader } from "../shared/company-detail";
import CompanyActionsToolbar from "../shared/actions-toolbar";

export function TableRow({
    item,
    activeTab,
    idx,
    isSelected,
    colSpan,
    selectedCompanyId,
    onSelect,
    onRefresh,
}: {
    item: Company | CompanyRelationship;
    activeTab: CompanyTab;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    selectedCompanyId: string | null;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const isMarketplace = activeTab === "marketplace";
    const name = companyName(item, isMarketplace);
    const industry = companyIndustry(item, isMarketplace);
    const location = companyLocation(item, isMarketplace);
    const company = extractCompany(item, isMarketplace);
    const relationship = extractRelationship(item, isMarketplace);

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
                    <span className="font-bold text-sm text-base-content">
                        {name}
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

                {/* Marketplace: Size | My Companies: Status + Type */}
                {isMarketplace ? (
                    <td className="px-4 py-3 text-sm font-bold text-base-content">
                        {(item as Company).company_size || "---"}
                    </td>
                ) : (
                    <>
                        <td className="px-4 py-3">
                            <span
                                className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] font-bold ${statusColor(relationship?.status)}`}
                            >
                                {formatStatus(relationship?.status)}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-secondary capitalize">
                            {relationship?.relationship_type || "---"}
                        </td>
                    </>
                )}

                {/* Added */}
                <td className="px-4 py-3 text-sm text-base-content/50">
                    {addedAgo(item)}
                </td>

                {/* Actions */}
                <td
                    className="px-4 py-3 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap z-10">
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
            {isSelected && selectedCompanyId && (
                <tr>
                    <td
                        colSpan={colSpan}
                        className="p-0 bg-base-100 border-t-2 border-b-2 border-primary"
                    >
                        <CompanyDetailLoader
                            companyId={selectedCompanyId}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
