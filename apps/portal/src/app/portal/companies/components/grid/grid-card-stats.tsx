"use client";

import type { Company, CompanyRelationship } from "../../types";
import { formatSalary } from "../shared/helpers";

const iconStyles = [
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-warning text-warning-content",
];

function StatCell({
    icon,
    value,
    label,
    styleIndex,
}: {
    icon: string;
    value: string;
    label: string;
    styleIndex: number;
}) {
    return (
        <div className="flex items-center gap-2 px-2 py-3 min-w-0 overflow-hidden">
            <div
                className={`w-7 h-7 flex items-center justify-center shrink-0 ${iconStyles[styleIndex % iconStyles.length]}`}
            >
                <i className={`${icon} text-xs`} />
            </div>
            <div className="min-w-0">
                <span className="text-sm font-black text-base-content leading-none block truncate">
                    {value}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none truncate block">
                    {label}
                </span>
            </div>
        </div>
    );
}

export function MarketplaceStats({ company }: { company: Company }) {
    const stats = [
        {
            label: "Roles",
            value: String(company.open_roles_count ?? 0),
            icon: "fa-duotone fa-regular fa-briefcase",
        },
        {
            label: "Size",
            value: company.company_size || "N/A",
            icon: "fa-duotone fa-regular fa-users",
        },
        {
            label: "Stage",
            value: company.stage || "N/A",
            icon: "fa-duotone fa-regular fa-rocket",
        },
        {
            label: "Avg Salary",
            value: formatSalary(company.avg_salary),
            icon: "fa-duotone fa-regular fa-dollar-sign",
        },
    ];

    return (
        <div className="grid grid-cols-2 divide-x divide-y divide-base-300">
            {stats.map((stat, i) => (
                <StatCell
                    key={stat.label}
                    icon={stat.icon}
                    value={stat.value}
                    label={stat.label}
                    styleIndex={i}
                />
            ))}
        </div>
    );
}

export function RelationshipStats({
    relationship,
}: {
    relationship: CompanyRelationship;
}) {
    const stats = [
        {
            label: "Role",
            value: relationship.relationship_type
                ? relationship.relationship_type.charAt(0).toUpperCase() +
                  relationship.relationship_type.slice(1)
                : "---",
            icon: "fa-duotone fa-regular fa-user-tie",
        },
    ];

    return (
        <div
            className="grid divide-x divide-base-300"
            style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
        >
            {stats.map((stat, i) => (
                <StatCell
                    key={stat.label}
                    icon={stat.icon}
                    value={stat.value}
                    label={stat.label}
                    styleIndex={i}
                />
            ))}
        </div>
    );
}
