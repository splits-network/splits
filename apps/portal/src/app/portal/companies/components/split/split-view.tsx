"use client";

import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { CompanyDetailLoader } from "../shared/company-detail";
import { companyId, rowId } from "../shared/helpers";
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
        (item) => rowId(item, isMarketplace) === selectedId,
    );

    return (
        <div
            className="flex border-2 border-base-300"
            style={{ minHeight: 600 }}
        >
            {/* Left list -- hidden on mobile when a company is selected */}
            <div
                className={`w-full md:w-1/3 border-r border-base-300 overflow-y-auto ${
                    selectedId ? "hidden md:block" : "block"
                }`}
            >
                {items.map((item) => (
                    <SplitItem
                        key={rowId(item, isMarketplace)}
                        item={item}
                        activeTab={activeTab}
                        isSelected={
                            selectedId === rowId(item, isMarketplace)
                        }
                        onSelect={() => onSelect(item)}
                    />
                ))}
            </div>

            {/* Right detail -- MobileDetailOverlay handles mobile portal */}
            <MobileDetailOverlay
                isOpen={!!(selectedItem && selectedId)}
                className="md:w-2/3 w-full bg-base-100"
            >
                {selectedItem && selectedId ? (
                    <CompanyDetailLoader
                        companyId={companyId(selectedItem, isMarketplace)}
                        onClose={() => onSelect(selectedItem)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-building text-2xl text-primary" />
                            </div>
                            <h3 className="font-black text-xl tracking-tight mb-2">Select a Company</h3>
                            <p className="text-sm text-base-content/50">Click a company on the left to view their profile</p>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
