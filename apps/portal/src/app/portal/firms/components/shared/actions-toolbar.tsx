"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import { ModalPortal } from "@splits-network/shared-ui";
import { InviteMemberModal } from "../modals/invite-member-modal";
import { FirmProfileWizard } from "../modals/firm-profile-wizard";
import type { Firm } from "../../types";
import { Button, SpeedMenu, BaselConfirmModal, type SpeedDialAction } from "@splits-network/basel-ui";

/* --- Types ---------------------------------------------------------------- */

export interface FirmActionsToolbarProps {
    firm: Firm;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    showActions?: {
        inviteMember?: boolean;
        statusActions?: boolean;
        editProfile?: boolean;
    };
    onRefresh?: () => void;
    className?: string;
}

/* --- Component ------------------------------------------------------------ */

export function FirmActionsToolbar({
    firm,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    onRefresh,
    className = "",
}: FirmActionsToolbarProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const { isAdmin } = useUserProfile();
    const refresh = onRefresh ?? (() => {});

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showEditWizard, setShowEditWizard] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusAction, setStatusAction] = useState<string | null>(null);
    const [pendingStatus, setPendingStatus] = useState<"active" | "suspended" | null>(null);

    /* -- Permissions -- */

    const canManageFirm = useMemo(() => {
        if (isAdmin) return true;
        return false;
    }, [isAdmin]);

    /* -- Status Change -- */

    const handleStatusChange = (newStatus: "active" | "suspended") => {
        setPendingStatus(newStatus);
    };

    const confirmStatusChange = async () => {
        if (!pendingStatus) return;
        const newStatus = pendingStatus;
        setPendingStatus(null);

        setUpdatingStatus(true);
        setStatusAction(newStatus);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const client = createAuthenticatedClient(token);
            await client.patch(`/firms/${firm.id}`, { status: newStatus });
            toast.success(`Firm status updated to ${newStatus}.`);
            refresh();
        } catch (error: any) {
            console.error("Failed to update status:", error);
            toast.error(`Failed to update status: ${error.message}`);
        } finally {
            setUpdatingStatus(false);
            setStatusAction(null);
        }
    };

    /* -- Handlers -- */

    const handleInviteSuccess = () => {
        setShowInviteModal(false);
        refresh();
    };

    /* -- Visibility -- */

    const actions = {
        inviteMember: showActions.inviteMember !== false,
        statusActions: showActions.statusActions !== false && canManageFirm,
        editProfile: showActions.editProfile === true,
    };

    const getSizeClass = () => `btn-${size}`;
    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    /* -- Status Dropdown -- */

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
        if (firm.status !== "active")
            items.push({
                key: "activate",
                status: "active",
                label: "Activate",
                icon: "fa-duotone fa-regular fa-play",
                btnClass: "text-success",
            });
        if (firm.status === "active")
            items.push({
                key: "suspend",
                status: "suspended",
                label: "Suspend",
                icon: "fa-duotone fa-regular fa-ban",
                btnClass: "text-error",
            });
        return items;
    }, [firm.status]);

    const renderStatusDropdown = () => {
        if (!actions.statusActions || statusItems.length === 0) return null;
        return (
            <details ref={statusDropdownRef} className="dropdown dropdown-end">
                <summary
                    className={`btn ${getSizeClass()} btn-primary gap-2 list-none`}
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
                    className="dropdown-content menu bg-base-100 border-2 border-base-300 shadow-md p-2 w-48 mt-1"
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

    /* -- Modals -- */

    const modals = (
        <>
        <FirmProfileWizard
            isOpen={showEditWizard}
            onClose={() => setShowEditWizard(false)}
            onSuccess={() => {
                setShowEditWizard(false);
                refresh();
            }}
            firm={firm}
        />
        <BaselConfirmModal
            isOpen={!!pendingStatus}
            onClose={() => setPendingStatus(null)}
            onConfirm={confirmStatusChange}
            title="Change Firm Status"
            icon="fa-triangle-exclamation"
            confirmColor={pendingStatus === "suspended" ? "btn-error" : "btn-primary"}
        >
            <p>Are you sure you want to change the firm status to {pendingStatus}?</p>
        </BaselConfirmModal>
        <ModalPortal>
            {showInviteModal && (
                <InviteMemberModal
                    firmId={firm.id}
                    onClose={() => setShowInviteModal(false)}
                    onSuccess={handleInviteSuccess}
                />
            )}
        </ModalPortal>
        </>
    );

    /* -- Icon-Only Variant (SpeedDial) -- */

    if (variant === "icon-only") {
        const speedDialActions: SpeedDialAction[] = [];

        if (actions.editProfile) {
            speedDialActions.push({
                key: "edit-profile",
                icon: "fa-duotone fa-regular fa-pen-to-square",
                label: "Edit Profile",
                variant: "btn-secondary",
                onClick: () => setShowEditWizard(true),
            });
        }
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
            if (firm.status === "active") {
                speedDialActions.push({
                    key: "status",
                    icon: "fa-duotone fa-regular fa-ban",
                    label: "Suspend Firm",
                    variant: "btn-error",
                    loading: updatingStatus && statusAction === "suspended",
                    disabled: updatingStatus,
                    onClick: () => handleStatusChange("suspended"),
                });
            } else if (firm.status === "suspended") {
                speedDialActions.push({
                    key: "status",
                    icon: "fa-duotone fa-regular fa-play",
                    label: "Activate Firm",
                    variant: "btn-success",
                    loading: updatingStatus && statusAction === "active",
                    disabled: updatingStatus,
                    onClick: () => handleStatusChange("active"),
                });
            }
        }

        return (
            <>
                <SpeedMenu
                    actions={speedDialActions}
                    size={size ?? "sm"}
                    className={className}
                />
                {modals}
            </>
        );
    }

    /* -- Descriptive Variant -- */

    return (
        <>
            <div
                className={`flex flex-wrap items-center ${getLayoutClass()} ${className}`}
            >
                {actions.editProfile && (
                    <button
                        onClick={() => setShowEditWizard(true)}
                        className={`btn ${getSizeClass()} btn-secondary gap-2`}
                        style={{ borderRadius: 0 }}
                        title="Edit Profile"
                    >
                        <i className="fa-duotone fa-regular fa-pen-to-square" />
                        <span className="hidden md:inline">Edit Profile</span>
                    </button>
                )}
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
            </div>
            {modals}
        </>
    );
}
