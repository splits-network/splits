"use client";

import { Fragment } from "react";
import { Badge } from "@splits-network/memphis-ui";
import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { formatDate } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { relationshipStatusVariant } from "../shared/accent";
import {
    companyName,
    companyIndustry,
    companyLocation,
    addedAgo,
    extractCompany,
    extractRelationship,
} from "../shared/helpers";
import { CompanyDetailLoader } from "../shared/company-detail";
import CompanyActionsToolbar from "../shared/actions-toolbar";

export function TableRow({
    item,
    activeTab,
    accent,
    idx,
    isSelected,
    colSpan,
    selectedCompanyId,
    onSelect,
    onRefresh,
}: {
    item: Company | CompanyRelationship;
    activeTab: CompanyTab;
    accent: AccentClasses;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    selectedCompanyId: string | null;
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
        <Fragment>
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors border-l-4 ${
                    isSelected
                        ? `${ac.bgLight} ${ac.border}`
                        : `border-transparent ${idx % 2 === 0 ? "bg-white" : "bg-cream"}`
                }`}
            >
                <td className="px-4 py-3 w-8">
                    <i
                        className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? ac.text : "text-dark/40"}`}
                    />
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-dark">
                            {name}
                        </span>
                    </div>
                </td>
                <td className={`px-4 py-3 text-sm font-semibold ${ac.text}`}>
                    {industry || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-dark/70">
                    {location || "—"}
                </td>
                {isMarketplace ? (
                    <td className="px-4 py-3 text-sm font-bold text-dark">
                        {(item as Company).company_size || "—"}
                    </td>
                ) : (
                    <>
                        <td className="px-4 py-3">
                            <Badge color={relationshipStatusVariant(relationship?.status)}>
                                {relationship?.status ? relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1) : "—"}
                            </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-purple capitalize">
                            {relationship?.relationship_type || "—"}
                        </td>
                    </>
                )}
                <td className="px-4 py-3 text-sm text-dark/60">
                    {addedAgo(item)}
                </td>
                <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
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
            {isSelected && selectedCompanyId && (
                <tr>
                    <td
                        colSpan={colSpan}
                        className={`p-0 bg-white border-t-4 border-b-4 ${ac.border}`}
                    >
                        <CompanyDetailLoader
                            companyId={selectedCompanyId}
                            accent={ac}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
