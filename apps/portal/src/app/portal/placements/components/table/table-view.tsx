"use client";

import { Fragment } from "react";
import { Badge } from "@splits-network/memphis-ui";
import type { Placement } from "../../types";
import {
    getStatusDisplay,
    formatCurrency,
    formatPlacementDate,
} from "../../types";
import { accentAt, statusVariant } from "../shared/accent";
import { candidateName, jobTitle, companyName } from "../shared/helpers";
import { DetailLoader } from "../shared/detail-loader";

export function TableView({
    placements,
    onSelect,
    selectedId,
    onRefresh,
}: {
    placements: Placement[];
    onSelect: (p: Placement) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const columnHeaders = [
        "",
        "Candidate",
        "Job",
        "Company",
        "Salary",
        "Your Share",
        "Status",
        "Hired Date",
    ];

    return (
        <div className="overflow-x-auto border-4 border-dark">
            <table className="w-full" style={{ minWidth: 800 }}>
                <thead>
                    <tr className="bg-dark">
                        {columnHeaders.map((h, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${
                                    i === 0 ? "w-8" : ""
                                } ${accentAt(i).text}`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {placements.map((placement, idx) => {
                        const accent = accentAt(idx);
                        const isSelected = selectedId === placement.id;
                        const status = getStatusDisplay(placement);

                        return (
                            <Fragment key={placement.id}>
                                <tr
                                    onClick={() => onSelect(placement)}
                                    className={`cursor-pointer transition-colors border-l-4 ${
                                        isSelected
                                            ? `${accent.bgLight} ${accent.border}`
                                            : idx % 2 === 0
                                              ? "bg-white border-transparent"
                                              : "bg-cream border-transparent"
                                    }`}
                                >
                                    <td className="px-4 py-3 w-8">
                                        <i
                                            className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-[10px] transition-transform ${accent.text} ${isSelected ? "opacity-100" : "opacity-25"}`}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-sm text-dark">
                                            {candidateName(placement)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-dark/70">
                                        {jobTitle(placement)}
                                    </td>
                                    <td
                                        className={`px-4 py-3 text-sm font-semibold ${accent.text}`}
                                    >
                                        {companyName(placement)}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold text-dark">
                                        {formatCurrency(placement.salary || 0)}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold text-dark">
                                        {formatCurrency(
                                            placement.recruiter_share || 0,
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            color={statusVariant(
                                                placement.state || undefined,
                                            )}
                                            size="sm"
                                        >
                                            {status.label}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-dark/60">
                                        {formatPlacementDate(
                                            placement.hired_at,
                                        )}
                                    </td>
                                </tr>
                                {/* Expanded detail row */}
                                {isSelected && (
                                    <tr>
                                        <td
                                            colSpan={columnHeaders.length}
                                            className={`p-0 bg-white border-y-4 ${accent.border}`}
                                        >
                                            <DetailLoader
                                                placement={placement}
                                                accent={accent}
                                                onCloseAction={() =>
                                                    onSelect(placement)
                                                }
                                            />
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
