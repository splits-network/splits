"use client";

import { useState, useEffect } from "react";
import type { Firm, FirmMember, FirmInvitation } from "../../types";
import { formatCurrency, formatDate } from "../../types";
import { firmStatusBadgeColor } from "./status-color";
import { formatStatus, memberCountDisplay, firmInitials } from "./helpers";
import { FirmActionsToolbar } from "./actions-toolbar";
import {
    LevelBadge,
    BadgeGrid,
    useGamification,
} from "@splits-network/shared-gamification";
import { BaselTabBar, BaselBadge } from "@splits-network/basel-ui";
import { MembersSection } from "../detail/members-section";
import { BillingSection } from "../detail/billing-section";
import { SettingsSection } from "../detail/settings-section";

type DetailTab = "members" | "billing" | "settings";

const ICON_STYLES = [
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-warning text-warning-content",
];

/* --- Detail Panel --------------------------------------------------------- */

export function FirmDetail({
    firm,
    members,
    invitations,
    onClose,
    onRefresh,
}: {
    firm: Firm;
    members: FirmMember[];
    invitations: FirmInvitation[];
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const [activeTab, setActiveTab] = useState<DetailTab>("settings");
    const { registerEntities, getLevel, getBadges } = useGamification();

    useEffect(() => {
        registerEntities("firm", [firm.id]);
        const recruiterIds = members.map((m) => m.recruiter_id).filter(Boolean);
        if (recruiterIds.length > 0) {
            registerEntities("recruiter", [...new Set(recruiterIds)]);
        }
    }, [firm.id, members, registerEntities]);

    const firmLevel = getLevel(firm.id);
    const badges = getBadges(firm.id);
    const location = [firm.headquarters_city, firm.headquarters_state]
        .filter(Boolean)
        .join(", ");
    const initials = firmInitials(firm.name);

    const stats = [
        {
            label: "Members",
            value: String(firm.active_member_count || 0),
            icon: "fa-duotone fa-regular fa-users",
        },
        {
            label: "Placements",
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
        <div className="w-full">
            {/* Dark Header */}
            <header className="relative bg-base-300 text-base-content border-l-4 border-l-primary">
                {/* Diagonal accent */}
                <div
                    className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />

                <div className="relative px-6 pt-6 pb-0">
                    {/* Kicker row: member count left, status + close right */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40 truncate">
                            {memberCountDisplay(firm)}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                            <BaselBadge
                                color={firmStatusBadgeColor(firm.status)}
                                variant="soft"
                                size="sm"
                            >
                                {formatStatus(firm.status)}
                            </BaselBadge>
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="btn btn-sm btn-square btn-primary"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark text-lg" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Avatar + Identity */}
                    <div className="flex items-end gap-5">
                        <div className="relative shrink-0">
                            {firm.logo_url ? (
                                <img
                                    src={firm.logo_url}
                                    alt={`${firm.name} logo`}
                                    className="w-20 h-20 object-contain bg-primary border-2 border-primary"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-primary text-primary-content flex items-center justify-center text-2xl font-black tracking-tight select-none shrink-0 border-2 border-primary">
                                    {initials}
                                </div>
                            )}
                            {firmLevel && (
                                <div className="absolute -bottom-1 -right-1">
                                    <LevelBadge level={firmLevel} size="sm" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 pb-1">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-1 truncate">
                                Recruiting Firm
                            </p>
                            <h2 className="text-3xl font-black tracking-tight leading-none text-base-content mb-2 truncate">
                                {firm.name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/40">
                                {location && (
                                    <span className="flex items-center gap-1.5">
                                        <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                                        {location}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <i className="fa-duotone fa-regular fa-calendar text-xs" />
                                    Created {formatDate(firm.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center gap-2">
                        <FirmActionsToolbar
                            firm={firm}
                            variant="descriptive"
                            size="sm"
                            onRefresh={onRefresh}
                            showActions={{}}
                        />
                    </div>

                    {/* Stats strip */}
                    <div
                        className="grid divide-x divide-neutral-content/10 border-t border-neutral-content/10 mt-6"
                        style={{
                            gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
                        }}
                    >
                        {stats.map((stat, i) => (
                            <div
                                key={stat.label}
                                className="flex items-center gap-2.5 px-3 py-4"
                            >
                                <div
                                    className={`w-9 h-9 flex items-center justify-center shrink-0 ${ICON_STYLES[i % ICON_STYLES.length]}`}
                                >
                                    <i className={`${stat.icon} text-sm`} />
                                </div>
                                <div>
                                    <span className="text-lg font-black text-base-content leading-none block">
                                        {stat.value}
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-base-content/40 leading-none">
                                        {stat.label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Achievements */}
            {badges.length > 0 && (
                <div className="px-6 py-4 border-b border-base-300">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Achievements
                    </h3>
                    <BadgeGrid badges={badges} maxVisible={6} />
                </div>
            )}

            {/* Tab bar */}
            <BaselTabBar
                tabs={[
                    { label: "Settings", value: "settings" },
                    { label: "Billing", value: "billing" },
                    { label: "Members", value: "members" },
                ]}
                active={activeTab}
                onChange={(v) => setActiveTab(v as DetailTab)}
                className="border-b border-base-300 px-6 pt-4"
            />

            {/* Tab content */}
            <div className="p-6">
                {activeTab === "members" && (
                    <MembersSection
                        firm={firm}
                        members={members}
                        invitations={invitations}
                        onRefresh={onRefresh ?? (() => {})}
                    />
                )}
                {activeTab === "billing" && (
                    <BillingSection firm={firm} members={members} />
                )}
                {activeTab === "settings" && (
                    <SettingsSection
                        firm={firm}
                        members={members}
                        onRefresh={onRefresh ?? (() => {})}
                    />
                )}
            </div>
        </div>
    );
}
