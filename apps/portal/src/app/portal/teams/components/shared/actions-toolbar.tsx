"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import { ModalPortal } from "@splits-network/shared-ui";
import { InviteMemberModal } from "../modals/invite-member-modal";
import type { Team } from "../../types";
import { Button, SpeedDial, type SpeedDialAction } from "@splits-network/basel-ui";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface TeamActionsToolbarProps {
    team: Team;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    showActions?: {
        viewDetails?: boolean;
        inviteMember?: boolean;
        statusActions?: boolean;
    };
    onRefresh?: () => void;
    onViewDetails?: (teamId: string) => void;
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function TeamActionsToolbar({
    team,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    onRefresh,
    onViewDetails,
    className = "",
}: TeamActionsToolbarProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const { isAdmin } = useUserProfile();
    const refresh = onRefresh ?? (() => {});

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusAction, setStatusAction] = useState<string | null>(null);

    /* ── Permissions ── */

    const canManageTeam = useMemo(() => {
        if (isAdmin) return true;
        return false;
    }, [isAdmin]);

    /* ── Status Change ── */

    const handleStatusChange = async (newStatus: "active" | "suspended") => {
        if (
            !confirm(
                `Are you sure you want to change the team status to ${newStatus}?`,
            )
        )
            return;

        setUpdatingStatus(true);
        setStatusAction(newStatus);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const client = createAuthenticatedClient(token);
            await client.patch(`/teams/${team.id}`, { status: newStatus });
            toast.success(`Team status updated to ${newStatus}!`);
            refresh();
        } catch (error: any) {
            console.error("Failed to update status:", error);
            toast.error(`Failed to update status: ${error.message}`);
        } finally {
            setUpdatingStatus(false);
            setStatusAction(null);
        }
    };

    /* ── Handlers ── */

    const handleViewDetails = () => onViewDetails?.(team.id);
    const handleInviteSuccess = () => {
        setShowInviteModal(false);
        refresh();
    };

    /* ── Visibility ── */

    const actions = {
        viewDetails: showActions.viewDetails !== false,
        inviteMember: showActions.inviteMember !== false,
        statusActions: showActions.statusActions !== false && canManageTeam,
    };

    const getSizeClass = () => `btn-${size}`;
    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    /* ── Quick Status Button (icon-only) ── */

    const renderQuickStatusButton = () => {
        if (variant !== "icon-only" || !actions.statusActions) return null;
        if (team.status === "active") {
            return (
                <Button
                    icon="fa-duotone fa-regular fa-ban"
                    variant="btn-error"
                    size={size}
                    onClick={() => handleStatusChange("suspended")}
                    disabled={updatingStatus}
                    loading={updatingStatus && statusAction === "suspended"}
                    title="Suspend Team"
                />
            );
        }
        if (team.status === "suspended") {
            return (
                <Button
                    icon="fa-duotone fa-regular fa-play"
                    variant="btn-success"
                    size={size}
                    onClick={() => handleStatusChange("active")}
                    disabled={updatingStatus}
                    loading={updatingStatus && statusAction === "active"}
                    title="Activate Team"
                />
            );
        }
        return null;
    };

    /* ── Status Dropdown ── */

    const statusDropdownRef = useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                statusDropdownRef.current &&
                !statusDropdownRef.current.contains(e.target as Node)
            ) {
                statusDropdownRef.current.removeAttribute("open");
            }
        };
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    const statusItems = useMemo(() => {
        const items: {
            key: string;
            status: "active" | "suspended";
            label: string;
            icon: string;
            btnClass: string;
        }[] = [];
        if (team.status !== "active")
            items.push({
                key: "activate",
                status: "active",
                label: "Activate",
                icon: "fa-duotone fa-regular fa-play",
                btnClass: "text-success",
            });
        if (team.status === "active")
            items.push({
                key: "suspend",
                status: "suspended",
                label: "Suspend",
                icon: "fa-duotone fa-regular fa-ban",
                btnClass: "text-error",
            });
        return items;
    }, [team.status]);

    const renderStatusDropdown = () => {
        if (!actions.statusActions || statusItems.length === 0) return null;
        return (
            <details ref={statusDropdownRef} className="dropdown dropdown-end">
                <summary
                    className={`btn ${getSizeClass()} btn-ghost gap-2 list-none`}
                    style={{ borderRadius: 0 }}
                    title="Change Status"
                >
                    {updatingStatus ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-ellipsis-vertical" />
                    )}
                    <span className="hidden md:inline">Status</span>
                </summary>
                <ul
                    className="dropdown-content menu bg-base-100 border-2 border-base-300 shadow-md p-2 w-48 z-50 mt-1"
                    style={{ borderRadius: 0 }}
                >
                    {statusItems.map((item) => (
                        <li key={item.key}>
                            <button
                                onClick={() => {
                                    statusDropdownRef.current?.removeAttribute(
                                        "open",
                                    );
                                    handleStatusChange(item.status);
                                }}
                                className={`${item.btnClass} font-bold`}
                                disabled={updatingStatus}
                            >
                                {updatingStatus &&
                                statusAction === item.status ? (
                                    <span className="loading loading-spinner loading-xs" />
                                ) : (
                                    <i className={item.icon} />
                                )}
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </details>
        );
    };

    /* ── Modals ── */

    const modals = (
        <ModalPortal>
            {showInviteModal && (
                <InviteMemberModal
                    teamId={team.id} /* debug — logged inside modal */
                    onClose={() => setShowInviteModal(false)}
                    onSuccess={handleInviteSuccess}
                />
            )}
        </ModalPortal>
    );

    /* ── Icon-Only Variant (SpeedDial) ── */

    if (variant === "icon-only") {
        const speedDialActions: SpeedDialAction[] = [];

        if (actions.inviteMember) {
            speedDialActions.push({
                key: "invite",
                icon: "fa-duotone fa-regular fa-user-plus",
                label: "Invite Member",
                variant: "btn-primary",
                onClick: () => setShowInviteModal(true),
            });
        }
        if (actions.statusActions) {
            if (team.status === "active") {
                speedDialActions.push({
                    key: "status",
                    icon: "fa-duotone fa-regular fa-ban",
                    label: "Suspend Team",
                    variant: "btn-error",
                    loading: updatingStatus && statusAction === "suspended",
                    disabled: updatingStatus,
                    onClick: () => handleStatusChange("suspended"),
                });
            } else if (team.status === "suspended") {
                speedDialActions.push({
                    key: "status",
                    icon: "fa-duotone fa-regular fa-play",
                    label: "Activate Team",
                    variant: "btn-success",
                    loading: updatingStatus && statusAction === "active",
                    disabled: updatingStatus,
                    onClick: () => handleStatusChange("active"),
                });
            }
        }
        if (actions.viewDetails) {
            speedDialActions.push({
                key: "details",
                icon: "fa-duotone fa-regular fa-eye",
                label: "View Details",
                variant: "btn-primary",
                onClick: onViewDetails ? handleViewDetails : undefined,
                href: !onViewDetails ? `/portal/teams/${team.id}` : undefined,
            });
        }

        return (
            <>
                <SpeedDial
                    actions={speedDialActions}
                    size={size ?? "sm"}
                    className={className}
                />
                {modals}
            </>
        );
    }

    /* ── Descriptive Variant ── */

    return (
        <>
            <div
                className={`flex flex-wrap items-center ${getLayoutClass()} ${className}`}
            >
                {actions.inviteMember && (
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className={`btn ${getSizeClass()} btn-primary gap-2`}
                        style={{ borderRadius: 0 }}
                        title="Invite Member"
                    >
                        <i className="fa-duotone fa-regular fa-user-plus" />
                        <span className="hidden md:inline">Invite Member</span>
                    </button>
                )}
                {renderStatusDropdown()}
                {actions.viewDetails &&
                    (actions.inviteMember || actions.statusActions) && (
                        <div className="hidden sm:block w-px self-stretch bg-base-300 mx-1" />
                    )}
                {actions.viewDetails && (
                    <>
                        {onViewDetails ? (
                            <button
                                onClick={handleViewDetails}
                                className={`btn ${getSizeClass()} btn-outline gap-2`}
                                style={{ borderRadius: 0 }}
                                title="View Details"
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                                <span className="hidden md:inline">
                                    View Details
                                </span>
                            </button>
                        ) : (
                            <Link
                                href={`/portal/teams/${team.id}`}
                                className={`btn ${getSizeClass()} btn-outline gap-2`}
                                style={{ borderRadius: 0 }}
                                title="View Details"
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                                <span className="hidden md:inline">
                                    View Details
                                </span>
                            </Link>
                        )}
                    </>
                )}
            </div>
            {modals}
        </>
    );
}
