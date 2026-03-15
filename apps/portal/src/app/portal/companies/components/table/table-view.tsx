"use client";

import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { rowId } from "../shared/helpers";
import { TableRow } from "./table-row";

export function TableView({
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

    const columns = [
        "",
        "Company",
        "Industry",
        "Location",
        "Info",
        "Added",
        "",
    ];

    return (
        <div className="overflow-x-auto border-2 border-base-300">
            <table className="w-full" style={{ minWidth: 900 }}>
                <thead>
                    <tr className="bg-base-300 border-b-2 border-base-300">
                        {columns.map((h, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3 text-left text-sm uppercase tracking-[0.15em] font-bold ${i === 0 ? "w-8" : ""} ${i === columns.length - 1 ? "w-24" : ""}`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => {
                        const rId = rowId(item, isMarketplace);
                        return (
                            <TableRow
                                key={rId}
                                item={item}
                                activeTab={activeTab}
                                idx={idx}
                                isSelected={selectedId === rId}
                                colSpan={columns.length}
                                onSelect={() => onSelect(item)}
                                onRefresh={onRefresh}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
