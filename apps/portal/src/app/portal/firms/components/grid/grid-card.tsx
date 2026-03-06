"use client";

import Link from "next/link";
import type { Firm } from "../../types";
import { formatCurrency } from "../../types";
import { firmStatusBadgeColor } from "../shared/status-color";
import {
    formatStatus,
    firmInitials,
    memberCountDisplay,
} from "../shared/helpers";
import { FirmActionsToolbar } from "../shared/actions-toolbar";
import {
    LevelBadge,
    useGamification,
} from "@splits-network/shared-gamification";
import { BaselBadge } from "@splits-network/basel-ui";

export function GridCard({
    firm,
    isSelected,
    onSelect,
    onRefresh,
}: {
    firm: Firm;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const { getLevel } = useGamification();
    const firmLevel = firm.id ? getLevel(firm.id) : undefined;
    const initials = firmInitials(firm.name);
    const location =
        [firm.headquarters_city, firm.headquarters_state]
            .filter(Boolean)
            .join(", ") || null;

    const hasPartnerSignal = firm.candidate_firm || firm.company_firm;

    const stats = [
        {
            label: "Members",
            value: String(firm.active_member_count || 0),
            icon: "fa-duotone fa-regular fa-users",
        },
        {
            label: "Placed",
            value: String(firm.total_placements),
            icon: "fa-duotone fa-regular fa-briefcase",
        },
        {
            label: "Revenue",
            value: formatCurrency(firm.total_revenue),
            icon: "fa-duotone fa-regular fa-dollar-sign",
        },
    ];

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col h-full bg-base-100 border border-base-300 border-l-4 transition-all hover:shadow-lg",
                isSelected
                    ? "border-l-primary border-primary"
                    : "border-l-primary hover:border-primary/40",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-6 pt-5 pb-4">
                {/* Kicker row: industries on left, status on right */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 truncate mr-2">
                        {(firm.industries || []).slice(0, 2).join(" · ") ||
                            "Recruiting Firm"}
                    </p>
                    <BaselBadge
                        color={firmStatusBadgeColor(firm.status)}
                        variant="soft"
                        size="sm"
                    >
                        {formatStatus(firm.status)}
                    </BaselBadge>
                </div>

                {/* Logo + Name block */}
                <div className="flex items-end gap-4">
                    <div className="relative shrink-0">
                        {firm.logo_url ? (
                            <img
                                src={firm.logo_url}
                                alt={`${firm.name} logo`}
                                className="w-16 h-16 object-contain bg-base-100"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-primary text-primary-content flex items-center justify-center text-xl font-black tracking-tight select-none">
                                {initials}
                            </div>
                        )}
                        {firmLevel && (
                            <div className="absolute -bottom-1 -right-1">
                                <LevelBadge level={firmLevel} size="sm" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            Recruiting Firm
                        </p>
                        <h3 className="text-2xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
                            {firm.name}
                        </h3>
                    </div>
                </div>

                {/* Location meta */}
                {location && (
                    <div className="flex items-center gap-1.5 mt-3 text-sm text-base-content/40">
                        <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                        {location}
                    </div>
                )}
            </div>

            {/* Card Body */}
            <div className="flex-1 flex flex-col justify-between">
                {/* Tagline */}
                {firm.tagline && (
                    <div className="px-6 py-5 border-b border-base-300">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                            About
                        </p>
                        <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                            {firm.tagline}
                        </p>
                    </div>
                )}

                {/* Stats Row */}
                <div className="border-b border-base-300">
                    <div
                        className="grid divide-x divide-base-300"
                        style={{
                            gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
                        }}
                    >
                        {stats.map((stat, i) => {
                            const iconStyles = [
                                "bg-primary text-primary-content",
                                "bg-secondary text-secondary-content",
                                "bg-accent text-accent-content",
                            ];
                            const iconStyle = iconStyles[i % iconStyles.length];
                            return (
                                <div
                                    key={stat.label}
                                    className="flex items-center gap-2.5 px-3 py-4"
                                >
                                    <div
                                        className={`w-7 h-7 flex items-center justify-center shrink-0 ${iconStyle}`}
                                    >
                                        <i className={`${stat.icon} text-xs`} />
                                    </div>
                                    <div>
                                        <span className="text-sm font-black text-base-content leading-none block">
                                            {stat.value}
                                        </span>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-base-content/30 leading-none">
                                            {stat.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Specialties + Industries */}
                <div className="px-6 py-5 border-b border-base-300 space-y-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                            Specialties
                        </p>
                        {(firm.specialties || []).length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {(firm.specialties || [])
                                    .slice(0, 4)
                                    .map((spec) => (
                                        <BaselBadge
                                            key={spec}
                                            color="primary"
                                            variant="soft"
                                            size="sm"
                                        >
                                            {spec}
                                        </BaselBadge>
                                    ))}
                                {(firm.specialties || []).length > 4 && (
                                    <span className="px-2 py-0.5 text-xs font-bold text-base-content/40">
                                        +{(firm.specialties || []).length - 4}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-base-content/30 italic">
                                Not provided
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                            Industries
                        </p>
                        {(firm.industries || []).length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {(firm.industries || [])
                                    .slice(0, 3)
                                    .map((ind) => (
                                        <BaselBadge
                                            key={ind}
                                            variant="outline"
                                            size="sm"
                                        >
                                            {ind}
                                        </BaselBadge>
                                    ))}
                                {(firm.industries || []).length > 3 && (
                                    <span className="px-2 py-0.5 text-xs font-bold text-base-content/40">
                                        +{(firm.industries || []).length - 3}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-base-content/30 italic">
                                Not provided
                            </p>
                        )}
                    </div>
                </div>

                {/* Partnership Badges */}
                <div className="px-6 py-5 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                        Partnership
                    </p>
                    {hasPartnerSignal ? (
                        <div className="flex flex-wrap gap-2">
                            {firm.candidate_firm && (
                                <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-primary text-primary-content">
                                    <i className="fa-duotone fa-regular fa-handshake text-sm" />
                                    Candidate Partners
                                </span>
                            )}
                            {firm.company_firm && (
                                <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-secondary text-secondary-content">
                                    <i className="fa-duotone fa-regular fa-paper-plane text-sm" />
                                    Company Partners
                                </span>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-base-content/30 italic">
                            No partnerships
                        </p>
                    )}
                </div>
            </div>

            {/* Footer: actions */}
            <div
                className="mt-auto flex items-center justify-between gap-3 px-6 py-4 border-t border-base-300"
                onClick={(e) => e.stopPropagation()}
            >
                <Link
                    href={`/firms/${firm.slug}`}
                    className="btn btn-sm btn-link gap-1"
                >
                    View Profile
                    <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                </Link>
                <FirmActionsToolbar
                    firm={firm}
                    variant="icon-only"
                    size="sm"
                    onRefresh={onRefresh}
                    showActions={{
                        inviteMember: false,
                    }}
                />
            </div>
        </article>
    );
}
