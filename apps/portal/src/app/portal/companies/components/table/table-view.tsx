"use client";

import type { Company, CompanyRelationship, CompanyTab } from "../../types";
import { companyId } from "../shared/helpers";
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

    const marketplaceColumns = [
        "",
        "Company",
        "Industry",
        "Location",
        "Size",
        "Added",
        "",
    ];
    const myCompaniesColumns = [
        "",
        "Company",
        "Industry",
        "Location",
        "Status",
        "Type",
        "Added",
        "",
    ];
    const columns = isMarketplace ? marketplaceColumns : myCompaniesColumns;

    return (
        <div className="overflow-x-auto border-2 border-base-300">
            <table className="w-full" style={{ minWidth: 900 }}>
                <thead>
                    <tr className="bg-base-200 border-b-2 border-base-300">
                        {columns.map((h, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 ${i === 0 ? "w-8" : ""} ${i === columns.length - 1 ? "w-24" : ""}`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => {
                        const cId = companyId(item, isMarketplace);
                        return (
                            <TableRow
                                key={
                                    isMarketplace
                                        ? (item as Company).id
                                        : (item as CompanyRelationship).id
                                }
                                item={item}
                                activeTab={activeTab}
                                idx={idx}
                                isSelected={selectedId === cId}
                                colSpan={columns.length}
                                selectedCompanyId={
                                    selectedId === cId ? cId : null
                                }
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
