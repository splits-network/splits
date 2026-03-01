"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Firm, FirmMember } from "../../types";
import {
    formatCurrency,
    formatDate,
    formatMemberRole,
    formatMemberStatus,
} from "../../types";
import {
    statusColor,
    memberRoleColor,
    memberStatusColor,
} from "./status-color";
import { formatStatus, firmInitials, memberCountDisplay } from "./helpers";
import { FirmActionsToolbar } from "./actions-toolbar";

/* --- Detail Panel --------------------------------------------------------- */

export function FirmDetail({
    firm,
    members,
    onClose,
    onRefresh,
}: {
    firm: Firm;
    members: FirmMember[];
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const previewMembers = members.slice(0, 5);
    const remainingCount = members.length - previewMembers.length;

    return (
        <div>
            {/* Header */}
            <div className="sticky top-0 bg-base-100 border-b-2 border-base-300 px-6 py-4">
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
                        showActions={{ viewDetails: false }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
                {/* Stats grid */}
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

                {/* Members preview */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Firm Members ({members.length})
                    </h3>
                    {previewMembers.length > 0 ? (
                        <div className="space-y-0">
                            {previewMembers.map((member, idx) => (
                                <div
                                    key={member.id}
                                    className={`flex items-center gap-3 p-3 ${idx < previewMembers.length - 1 ? "border-b-2 border-base-300" : ""}`}
                                >
                                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border-2 border-base-300 bg-base-200 text-xs font-bold">
                                        {firmInitials(
                                            member.recruiter.user?.name,
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold truncate">
                                            {member.recruiter.user?.name}
                                        </div>
                                        <div className="text-xs text-base-content/50 truncate">
                                            {member.recruiter.user?.email}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className={`text-sm uppercase tracking-[0.2em] font-bold px-2 py-0.5 ${memberRoleColor(member.role)}`}
                                        >
                                            {formatMemberRole(member.role)}
                                        </span>
                                        <span
                                            className={`text-sm uppercase tracking-[0.2em] font-bold px-2 py-0.5 ${memberStatusColor(member.status)}`}
                                        >
                                            {formatMemberStatus(member.status)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {remainingCount > 0 && (
                                <a
                                    href={`/portal/firms/${firm.id}`}
                                    className="block text-center text-sm font-bold text-primary mt-3 hover:underline"
                                >
                                    View all {members.length} members
                                </a>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-base-content/50">
                            No members yet
                        </p>
                    )}
                </div>

                {/* Firm info grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Created
                        </p>
                        <p className="font-bold text-sm">
                            {formatDate(firm.created_at)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Status
                        </p>
                        <p className="font-bold text-sm">
                            {formatStatus(firm.status)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Owner
                        </p>
                        <p className="font-bold text-sm truncate">
                            {firm.owner_user_id}
                        </p>
                    </div>
                </div>
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

                // Fetch members
                const membersRes = await client.get(`/firms/${id}/members`);
                if (!signal?.cancelled) setMembers(membersRes.data || []);
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
            onClose={onClose}
            onRefresh={handleRefresh}
        />
    );
}
