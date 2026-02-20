"use client";

interface ComparisonFeature {
    feature: string;
    starter: string | boolean;
    pro: string | boolean;
    partner: string | boolean;
}

interface BaselComparisonTableProps {
    features: ComparisonFeature[];
}

function renderCell(value: string | boolean) {
    if (typeof value === "boolean") {
        return value ? (
            <i className="fa-duotone fa-regular fa-check text-success" />
        ) : (
            <i className="fa-duotone fa-regular fa-xmark text-base-content/20" />
        );
    }
    return <span className="font-bold">{value}</span>;
}

export function BaselComparisonTable({ features }: BaselComparisonTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
                <thead>
                    <tr className="bg-base-200">
                        <th className="text-xs font-black uppercase tracking-[0.15em] text-base-content">
                            Feature
                        </th>
                        <th className="text-xs font-black uppercase tracking-[0.15em] text-success text-center">
                            Starter
                        </th>
                        <th className="text-xs font-black uppercase tracking-[0.15em] text-primary text-center">
                            Pro
                        </th>
                        <th className="text-xs font-black uppercase tracking-[0.15em] text-accent text-center">
                            Partner
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {features.map((row, i) => (
                        <tr key={i}>
                            <td className="text-sm text-base-content">
                                {row.feature}
                            </td>
                            <td className="text-center">
                                {renderCell(row.starter)}
                            </td>
                            <td className="text-center">
                                {renderCell(row.pro)}
                            </td>
                            <td className="text-center">
                                {renderCell(row.partner)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
