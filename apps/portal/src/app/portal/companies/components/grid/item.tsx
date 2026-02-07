"use client";

import {
    DataRow,
    DataList,
    MetricCard,
} from "@/components/ui/cards";
import { formatRelativeTime } from "@/lib/utils";
import {
    CompanyTab,
    Company,
    CompanyRelationship,
    getRelationshipStatusBadgeClass,
} from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";

interface ItemProps {
    item: Company | CompanyRelationship;
    activeTab: CompanyTab;
    onViewDetails: () => void;
}

export default function Item({ item, activeTab, onViewDetails }: ItemProps) {
    const isMarketplace = activeTab === "marketplace";
    const company = isMarketplace
        ? (item as Company)
        : (item as CompanyRelationship).company;
    const relationship = isMarketplace
        ? null
        : (item as CompanyRelationship);

    return (
        <MetricCard className="group hover:shadow-lg transition-all duration-200">
            <MetricCard.Header>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex justify-between w-full items-center">
                        {/* Company Avatar */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="avatar avatar-placeholder shrink-0">
                                <div className="bg-base-200 text-base-content/70 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold">
                                    {company.name.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-base-content group-hover:text-primary transition-colors truncate">
                                    {company.name}
                                </h3>
                                <p className="text-sm text-base-content/60 truncate">
                                    {company.industry || "No industry"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            {!isMarketplace && relationship && (
                                <div
                                    className={`badge ${getRelationshipStatusBadgeClass(relationship.status)} shrink-0`}
                                >
                                    {relationship.status}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </MetricCard.Header>
            <MetricCard.Body>
                <DataList compact>
                    <DataRow
                        icon="fa-location-dot"
                        label="Location"
                        value={company.headquarters_location || "Not provided"}
                    />
                    {isMarketplace && (
                        <DataRow
                            icon="fa-users"
                            label="Size"
                            value={(item as Company).company_size || "Not provided"}
                        />
                    )}
                    {!isMarketplace && relationship && (
                        <>
                            <DataRow
                                icon="fa-handshake"
                                label="Type"
                                value={relationship.relationship_type}
                            />
                            <DataRow
                                icon="fa-shield-check"
                                label="Manage Jobs"
                                value={relationship.can_manage_company_jobs ? "Yes" : "No"}
                            />
                        </>
                    )}
                </DataList>
            </MetricCard.Body>
            <MetricCard.Footer>
                <div className="flex items-center justify-between w-full">
                    <span className="text-base-content/50">
                        Added {formatRelativeTime(item.created_at)}
                    </span>
                    <div className="flex items-center gap-2">
                        <ActionsToolbar
                            company={company as Company}
                            relationship={relationship}
                            variant="icon-only"
                            size="xs"
                            onViewDetails={onViewDetails}
                        />
                    </div>
                </div>
            </MetricCard.Footer>
        </MetricCard>
    );
}
