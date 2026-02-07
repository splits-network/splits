"use client";

import {
    ExpandableTableRow,
    ExpandedDetailGrid,
    ExpandedDetailItem,
} from "@/components/ui/tables";
import {
    CompanyTab,
    Company,
    CompanyRelationship,
    getRelationshipStatusBadgeClass,
    formatDate,
} from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";

interface RowProps {
    item: Company | CompanyRelationship;
    activeTab: CompanyTab;
    onViewDetails: () => void;
}

export default function Row({ item, activeTab, onViewDetails }: RowProps) {
    const isMarketplace = activeTab === "marketplace";
    const company = isMarketplace
        ? (item as Company)
        : (item as CompanyRelationship).company;
    const relationship = isMarketplace
        ? null
        : (item as CompanyRelationship);

    const cells = isMarketplace ? (
        <>
            <td className="py-4">
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary/10 text-base-content/70 w-10 rounded-full flex items-center justify-center text-sm font-semibold">
                            {company.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="text-sm min-w-0">
                        <span className="font-semibold whitespace-pre-line" title={company.name}>
                            {company.name}
                        </span>
                        <div className="text-sm text-base-content/60">
                            {company.industry || "No industry"}
                        </div>
                    </div>
                </div>
            </td>
            <td className="hidden md:table-cell">
                {company.headquarters_location || (
                    <span className="text-base-content/30">—</span>
                )}
            </td>
            <td className="hidden md:table-cell">
                {(item as Company).company_size || (
                    <span className="text-base-content/30">—</span>
                )}
            </td>
            <td onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1 justify-end">
                    <ActionsToolbar
                        company={item as Company}
                        relationship={null}
                        variant="icon-only"
                        layout="horizontal"
                        size="sm"
                        onViewDetails={onViewDetails}
                    />
                </div>
            </td>
        </>
    ) : (
        <>
            <td className="py-4">
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary/10 text-base-content/70 w-10 rounded-full flex items-center justify-center text-sm font-semibold">
                            {company.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="text-sm min-w-0">
                        <span className="font-semibold whitespace-pre-line" title={company.name}>
                            {company.name}
                        </span>
                        <div className="text-sm text-base-content/60">
                            {company.industry || "No industry"}
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <span
                    className={`badge badge-sm ${getRelationshipStatusBadgeClass(relationship!.status)}`}
                >
                    {relationship!.status}
                </span>
            </td>
            <td className="hidden md:table-cell capitalize">
                {relationship!.relationship_type}
            </td>
            <td className="hidden md:table-cell">
                {formatDate(relationship!.created_at)}
            </td>
            <td onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1 justify-end">
                    <ActionsToolbar
                        company={company as Company}
                        relationship={relationship}
                        variant="icon-only"
                        layout="horizontal"
                        size="sm"
                        onViewDetails={onViewDetails}
                    />
                </div>
            </td>
        </>
    );

    const expandedContent = isMarketplace ? (
        <div className="space-y-4">
            <ExpandedDetailGrid cols={4}>
                <ExpandedDetailItem
                    icon="fa-building"
                    label="Company"
                    value={company.name}
                />
                <ExpandedDetailItem
                    icon="fa-industry"
                    label="Industry"
                    value={company.industry || "Not provided"}
                />
                <ExpandedDetailItem
                    icon="fa-location-dot"
                    label="Location"
                    value={company.headquarters_location || "Not provided"}
                />
                <ExpandedDetailItem
                    icon="fa-users"
                    label="Size"
                    value={(item as Company).company_size || "Not provided"}
                />
            </ExpandedDetailGrid>
            <ExpandedDetailGrid cols={4}>
                <ExpandedDetailItem
                    icon="fa-globe"
                    label="Website"
                    value={(item as Company).website || "Not provided"}
                />
                <ExpandedDetailItem
                    icon="fa-align-left"
                    label="Description"
                    value={(item as Company).description || "Not provided"}
                />
                <ExpandedDetailItem
                    icon="fa-calendar"
                    label="Added"
                    value={formatDate(item.created_at)}
                />
            </ExpandedDetailGrid>
            <div className="flex items-center gap-2 pt-2 border-t border-base-300">
                <ActionsToolbar
                    company={item as Company}
                    relationship={null}
                    variant="descriptive"
                    layout="horizontal"
                    size="sm"
                    onViewDetails={onViewDetails}
                />
            </div>
        </div>
    ) : (
        <div className="space-y-4">
            <ExpandedDetailGrid cols={4}>
                <ExpandedDetailItem
                    icon="fa-building"
                    label="Company"
                    value={company.name}
                />
                <ExpandedDetailItem
                    icon="fa-industry"
                    label="Industry"
                    value={company.industry || "Not provided"}
                />
                <ExpandedDetailItem
                    icon="fa-location-dot"
                    label="Location"
                    value={company.headquarters_location || "Not provided"}
                />
                <ExpandedDetailItem
                    icon="fa-handshake"
                    label="Relationship Type"
                    value={
                        <span className="capitalize">
                            {relationship!.relationship_type}
                        </span>
                    }
                />
            </ExpandedDetailGrid>
            <ExpandedDetailGrid cols={4}>
                <ExpandedDetailItem
                    icon="fa-signal"
                    label="Status"
                    value={
                        <span
                            className={`badge badge-sm ${getRelationshipStatusBadgeClass(relationship!.status)}`}
                        >
                            {relationship!.status}
                        </span>
                    }
                />
                <ExpandedDetailItem
                    icon="fa-shield-check"
                    label="Can Manage Jobs"
                    value={relationship!.can_manage_company_jobs ? "Yes" : "No"}
                />
                <ExpandedDetailItem
                    icon="fa-calendar"
                    label="Since"
                    value={formatDate(relationship!.created_at)}
                />
                <ExpandedDetailItem
                    icon="fa-calendar-check"
                    label="Start Date"
                    value={
                        relationship!.relationship_start_date
                            ? formatDate(relationship!.relationship_start_date)
                            : "Not set"
                    }
                />
            </ExpandedDetailGrid>
            <div className="flex items-center gap-2 pt-2 border-t border-base-300">
                <ActionsToolbar
                    company={company as Company}
                    relationship={relationship}
                    variant="descriptive"
                    layout="horizontal"
                    size="sm"
                    onViewDetails={onViewDetails}
                />
            </div>
        </div>
    );

    return (
        <ExpandableTableRow
            rowId={`company-${item.id}`}
            cells={cells}
            expandedContent={expandedContent}
            showToggle={true}
        />
    );
}
