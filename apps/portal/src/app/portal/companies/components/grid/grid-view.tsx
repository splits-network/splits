"use client";

import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { CompanyDetailLoader } from "../shared/company-detail";
import { companyId } from "../shared/helpers";
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
        <div className="relative">
            {/* Grid */}
            <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
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

            {/* Detail Drawer */}
            {selectedItem && selectedId && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
                        onClick={() => onSelectAction(selectedItem)}
                    />
                    <div className="fixed top-0 right-0 z-50 h-full w-full md:w-[480px] lg:w-[540px] bg-base-100 shadow-2xl border-l border-base-300 overflow-y-auto animate-slide-in-right">
                        <CompanyDetailLoader
                            companyId={selectedId}
                            onClose={() => onSelectAction(selectedItem)}
                            onRefresh={onRefreshAction}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
