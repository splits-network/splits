"use client";

import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { CompanyDetailLoader } from "../shared/company-detail";
import { companyId } from "../shared/helpers";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { GridCard } from "./grid-card";

export function GridView({
    items,
    activeTab,
    onSelectAction,
    selectedId,
    onRefreshAction,
}: {
    items: (Company | CompanyRelationship)[];
    activeTab: CompanyTab;
    onSelectAction: (item: Company | CompanyRelationship) => void;
    selectedId: string | null;
    onRefreshAction?: () => void;
}) {
    const isMarketplace = activeTab === "marketplace";
    const selectedItem = items.find(
        (item) => companyId(item, isMarketplace) === selectedId,
    );

    return (
        <div className="flex gap-6">
            {/* Card grid -- hidden on mobile when a detail is open */}
            <div
                className={`flex flex-col w-full ${selectedItem ? "hidden md:flex" : "flex"}`}
            >
                <div
                    className={`grid gap-4 w-full ${
                        selectedItem
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
                    {items.map((item) => {
                        const cId = companyId(item, isMarketplace);
                        return (
                            <GridCard
                                key={
                                    isMarketplace
                                        ? (item as Company).id
                                        : (item as CompanyRelationship).id
                                }
                                item={item}
                                activeTab={activeTab}
                                isSelected={selectedId === cId}
                                onSelect={() => onSelectAction(item)}
                                onRefresh={onRefreshAction}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Detail sidebar */}
            {selectedItem && selectedId && (
                <MobileDetailOverlay
                    isOpen
                    className="md:w-1/2 md:border-2 md:border-base-300 md:flex-shrink-0 md:self-start bg-base-100"
                >
                    <CompanyDetailLoader
                        companyId={selectedId}
                        onClose={() => onSelectAction(selectedItem)}
                        onRefresh={onRefreshAction}
                    />
                </MobileDetailOverlay>
            )}
        </div>
    );
}
