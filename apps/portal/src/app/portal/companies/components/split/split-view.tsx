"use client";

import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { BaselSplitView } from "@splits-network/basel-ui";
import { CompanyDetailLoader } from "../shared/company-detail";
import { SplitItem } from "./split-item";

export function SplitView({
    items,
    activeTab,
    onSelect,
    selectedId,
    onRefresh,
}: {
    items: (Company | CompanyRelationship)[];
    activeTab: CompanyTab;
    onSelect: (item: Company | CompanyRelationship) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const getCompanyId = (item: Company | CompanyRelationship): string =>
        "company_id" in item ? item.company_id : item.id;

    return (
        <BaselSplitView
            items={items}
            selectedId={selectedId}
            getItemId={(item) => "company_id" in item ? item.company_id : item.id}
            estimatedItemHeight={90}
            renderItem={(item, isSelected) => (
                <SplitItem
                    item={item}
                    activeTab={activeTab}
                    isSelected={isSelected}
                    onSelect={() => onSelect(item)}
                />
            )}
            renderDetail={(item) => {
                const companyId = getCompanyId(item);
                return (
                    <CompanyDetailLoader
                        companyId={companyId}
                        onClose={() => onSelect(item)}
                        onRefresh={onRefresh}
                    />
                );
            }}
            emptyIcon="fa-building"
            emptyTitle="Select a Company"
            emptyDescription="Click a company on the left to view their profile"
            initialListWidth={33}
            onMobileClose={() => {
                const selected = items.find((i) => {
                    const id = "company_id" in i ? i.company_id : i.id;
                    return id === selectedId;
                });
                if (selected) onSelect(selected);
            }}
        />
    );
}
