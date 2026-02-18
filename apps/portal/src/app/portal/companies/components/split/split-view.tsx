"use client";

import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
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
    const selectedItem = items.find((item) => companyId(item, isMarketplace) === selectedId);
    const selectedAc = selectedItem ? accentAt(items.indexOf(selectedItem)) : ACCENT[0];

    return (
        <div className="flex gap-0 border-4 border-dark" style={{ minHeight: 600 }}>
            {/* Left list */}
            <div className={`w-full md:w-2/5 border-r-4 border-dark overflow-y-auto ${selectedId ? "hidden md:block" : "block"}`}>
                {items.map((item, idx) => (
                    <SplitItem
                        key={isMarketplace ? (item as Company).id : (item as CompanyRelationship).id}
                        item={item}
                        activeTab={activeTab}
                        accent={accentAt(idx)}
                        isSelected={selectedId === companyId(item, isMarketplace)}
                        onSelect={() => onSelect(item)}
                    />
                ))}
            </div>

            {/* Right detail */}
            <MobileDetailOverlay
                isOpen={!!(selectedItem && selectedId)}
                className="md:w-3/5 w-full bg-white overflow-y-auto"
            >
                {selectedItem && selectedId ? (
                    <CompanyDetailLoader
                        companyId={selectedId}
                        accent={selectedAc}
                        onClose={() => onSelect(selectedItem)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="flex justify-center gap-3 mb-6">
                                <div className="w-8 h-8 rotate-12 bg-coral" />
                                <div className="w-8 h-8 rounded-full bg-teal" />
                                <div className="w-8 h-8 rotate-45 bg-yellow" />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tight mb-2 text-dark">
                                Select a Company
                            </h3>
                            <p className="text-sm text-dark/50">
                                Click a company on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
