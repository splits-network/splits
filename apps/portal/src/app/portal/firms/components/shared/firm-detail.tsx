"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Firm, FirmMember, FirmInvitation } from "../../types";
import { formatCurrency, formatDate } from "../../types";
import { statusColor } from "./status-color";
import { formatStatus, memberCountDisplay } from "./helpers";
import { FirmActionsToolbar } from "./actions-toolbar";
import { MembersSection } from "../detail/members-section";
import { BillingSection } from "../detail/billing-section";
import { SettingsSection } from "../detail/settings-section";

type DetailTab = "members" | "billing" | "settings";

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
    const [activeTab, setActiveTab] = useState<DetailTab>("members");

    return (
        <div className="w-full">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-base-100 border-b-2 border-base-300 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className={`text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 ${statusColor(firm.status)}`}
                            >
                                {formatStatus(firm.status)}
                            </span>
                        </div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                            {memberCountDisplay(firm)}
                        </p>
                        <h2 className="text-2xl lg:text-3xl font-black leading-[0.95] tracking-tight mb-3">
                            {firm.name}
                        </h2>
                        <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                            <span>
                                <i className="fa-duotone fa-regular fa-calendar mr-1" />
                                Created {formatDate(firm.created_at)}
                            </span>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-ghost"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg" />
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-4">
                    <FirmActionsToolbar
                        firm={firm}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{}}
                    />
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                        Members
                    </p>
                    <p className="text-lg font-black tracking-tight">
                        {firm.active_member_count}
                    </p>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                        Placements
                    </p>
                    <p className="text-lg font-black tracking-tight">
                        {firm.total_placements}
                    </p>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                        Revenue
                    </p>
                    <p className="text-lg font-black tracking-tight">
                        {formatCurrency(firm.total_revenue)}
                    </p>
                </div>
            </div>

            {/* Tab bar */}
            <div className="border-b border-base-300 px-6 pt-4">
                <div className="flex bg-base-200 p-1 w-fit">
                    {(["members", "billing", "settings"] as const).map(
                        (tab) => (
                            <button
                                key={tab}
                                type="button"
                                className={`px-4 py-1.5 text-sm font-semibold transition-colors ${
                                    activeTab === tab
                                        ? "bg-primary text-primary-content"
                                        : "text-base-content/50 hover:text-base-content/70"
                                }`}
                                style={{ borderRadius: 0 }}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ),
                    )}
                </div>
            </div>

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

/* --- Detail Loading Wrapper ----------------------------------------------- */

export function FirmDetailLoader({
    firmId,
    firm,
    onClose,
    onRefresh,
}: {
    firmId: string;
    firm?: Firm;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
    const [loadedFirm, setLoadedFirm] = useState<Firm | null>(firm || null);
    const [members, setMembers] = useState<FirmMember[]>([]);
    const [invitations, setInvitations] = useState<FirmInvitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDetail = useCallback(
        async (
            id: string,
            firmProp: Firm | undefined,
            signal?: { cancelled: boolean },
        ) => {
            try {
                const token = await getToken();
                if (!token || signal?.cancelled) return;
                const client = createAuthenticatedClient(token);

                // Fetch firm if not provided
                if (!firmProp) {
                    const firmRes = await client.get<{ data: Firm }>(
                        `/firms/${id}`,
                    );
                    if (!signal?.cancelled) setLoadedFirm(firmRes.data);
                }

                // Fetch members and invitations in parallel
                const [membersRes, invitationsRes] = await Promise.all([
                    client.get(`/firms/${id}/members`),
                    client.get(`/firms/${id}/invitations`),
                ]);
                if (!signal?.cancelled) {
                    setMembers(membersRes.data || []);
                    setInvitations(invitationsRes.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch firm details:", err);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [],
    );

    useEffect(() => {
        const signal = { cancelled: false };
        setLoading(true);

        fetchDetail(firmId, firm, signal).finally(() => {
            if (!signal.cancelled) setLoading(false);
        });

        return () => {
            signal.cancelled = true;
        };
    }, [firmId, refreshKey, fetchDetail, firm]);

    const handleRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
        onRefresh?.();
    }, [onRefresh]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                    <span className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                        Loading firm...
                    </span>
                </div>
            </div>
        );
    }

    const resolvedFirm = firm || loadedFirm;
    if (!resolvedFirm) return null;

    return (
        <FirmDetail
            firm={resolvedFirm}
            members={members}
            invitations={invitations}
            onClose={onClose}
            onRefresh={handleRefresh}
        />
    );
}
