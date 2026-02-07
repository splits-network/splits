"use client";

import { Company, CompanyRelationship } from "../../types";
import Details from "./details";
import ActionsToolbar from "./actions-toolbar";
import { useFilter } from "../../contexts/filter-context";

interface SidebarProps {
    item: (Company | CompanyRelationship) | null;
    onClose: () => void;
}

function getCompanyFromItem(
    item: Company | CompanyRelationship,
): Company {
    if ("company" in item && item.company) {
        // It's a CompanyRelationship - extract company data
        return {
            id: item.company.id,
            name: item.company.name,
            industry: item.company.industry,
            headquarters_location: item.company.headquarters_location,
            created_at: item.created_at,
            updated_at: item.updated_at,
        };
    }
    // It's a Company
    return item as Company;
}

function getRelationshipFromItem(
    item: Company | CompanyRelationship,
): CompanyRelationship | null {
    if ("company_id" in item && "relationship_type" in item) {
        return item as CompanyRelationship;
    }
    return null;
}

export default function Sidebar({ item, onClose }: SidebarProps) {
    const {
        marketplaceContext: { refresh: refreshMarketplace },
        myCompaniesContext: { refresh: refreshMyCompanies },
    } = useFilter();

    if (!item) return null;

    const company = getCompanyFromItem(item);
    const relationship = getRelationshipFromItem(item);
    const companyId = relationship ? relationship.company_id : company.id;

    const handleRefresh = () => {
        refreshMarketplace();
        refreshMyCompanies();
    };

    return (
        <div className="drawer drawer-end">
            <input
                id="company-detail-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={!!item}
                readOnly
            />

            <div className="drawer-side z-50">
                <label
                    className="drawer-overlay"
                    onClick={onClose}
                    aria-label="Close sidebar"
                />

                <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-bold truncate">
                                <i className="fa-duotone fa-regular fa-building mr-2" />
                                {company.name}
                            </h2>
                            <div className="flex items-center gap-2">
                                <ActionsToolbar
                                    company={company}
                                    relationship={relationship}
                                    variant="icon-only"
                                    size="sm"
                                    onRefresh={handleRefresh}
                                />
                                <button
                                    onClick={onClose}
                                    className="btn btn-sm btn-circle btn-ghost"
                                    aria-label="Close"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                        <Details
                            companyId={companyId}
                            onRefresh={handleRefresh}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
