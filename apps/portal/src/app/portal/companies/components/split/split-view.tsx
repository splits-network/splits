"use client";

import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { CompanyDetailLoader } from "../shared/company-detail";
import { companyId } from "../shared/helpers";
import { MobileDetailOverlay } from "@/components/standard-lists";
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
    const isMarketplace = activeTab === "marketplace";
    const selectedItem = items.find(
        (item) => companyId(item, isMarketplace) === selectedId,
    );

    return (
        <div
            className="flex border-2 border-base-300"
            style={{ minHeight: 600 }}
        >
            {/* Left list -- hidden on mobile when a company is selected */}
            <div
                className={`w-full md:w-2/5 border-r-2 border-base-300 overflow-y-auto ${
                    selectedId ? "hidden md:block" : "block"
                }`}
            >
                {items.map((item) => (
                    <SplitItem
                        key={
                            isMarketplace
                                ? (item as Company).id
                                : (item as CompanyRelationship).id
                        }
                        item={item}
                        activeTab={activeTab}
                        isSelected={
                            selectedId === companyId(item, isMarketplace)
                        }
                        onSelect={() => onSelect(item)}
                    />
                ))}
            </div>

            {/* Right detail -- MobileDetailOverlay handles mobile portal */}
            <MobileDetailOverlay
                isOpen={!!(selectedItem && selectedId)}
                className="md:w-3/5 w-full bg-base-100"
            >
                {selectedItem && selectedId ? (
                    <CompanyDetailLoader
                        companyId={selectedId}
                        onClose={() => onSelect(selectedItem)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-hand-pointer text-5xl text-base-content/30 mb-4" />
                            <h3 className="font-bold text-base text-base-content/30 tracking-tight">
                                Select a company to view details
                            </h3>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
