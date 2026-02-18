"use client";

import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
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
    const selectedItem = items.find((item) => companyId(item, isMarketplace) === selectedId);
    const selectedAc = selectedItem
        ? accentAt(items.indexOf(selectedItem))
        : ACCENT[0];

    return (
        <div className="flex gap-6">
            <div className="flex flex-col w-full">
                <div
                    className={`grid gap-4 w-full ${
                        selectedItem
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
                    {items.map((item, idx) => (
                        <GridCard
                            key={isMarketplace ? (item as Company).id : (item as CompanyRelationship).id}
                            item={item}
                            activeTab={activeTab}
                            accent={accentAt(idx)}
                            isSelected={selectedId === companyId(item, isMarketplace)}
                            onSelect={() => onSelectAction(item)}
                            onRefresh={onRefreshAction}
                        />
                    ))}
                </div>
            </div>

            {/* Detail Sidebar */}
            {selectedItem && selectedId && (
                <div
                    className={`w-1/2 border-4 flex-shrink-0 self-start bg-white ${selectedAc.border}`}
                >
                    <CompanyDetailLoader
                        companyId={selectedId}
                        accent={selectedAc}
                        onClose={() => onSelectAction(selectedItem)}
                        onRefresh={onRefreshAction}
                    />
                </div>
            )}
        </div>
    );
}
