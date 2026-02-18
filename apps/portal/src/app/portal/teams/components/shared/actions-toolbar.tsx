"use client";

import { useState } from "react";
import { ModalPortal } from "@splits-network/shared-ui";
import type { Team } from "../../types";
import { ExpandableButton } from "./expandable-button";
import { InviteMemberModal } from "../modals/invite-member-modal";

interface TeamActionsToolbarProps {
    team: Team;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md" | "lg";
    showActions?: {
        viewDetails?: boolean;
        inviteMember?: boolean;
    };
    onRefresh?: () => void;
    className?: string;
}

export function TeamActionsToolbar({
    team,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    onRefresh,
    className = "",
}: TeamActionsToolbarProps) {
    const [showInviteModal, setShowInviteModal] = useState(false);

    const actions = {
        viewDetails: showActions.viewDetails !== false,
        inviteMember: showActions.inviteMember !== false,
    };

    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    const getSizeClass = () => `btn-${size}`;

    if (variant === "icon-only") {
        return (
            <>
                <div className={`flex items-center ${getLayoutClass()} ${className}`}>
                    {actions.inviteMember && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-user-plus"
                            label="Invite"
                            variant="btn-primary"
                            size={size}
                            onClick={() => setShowInviteModal(true)}
                            title="Invite Member"
                        />
                    )}

                    {actions.viewDetails && (
                        <>
                            <div className="w-px h-4 bg-dark/20 mx-0.5" />
                            <ExpandableButton
                                icon="fa-duotone fa-regular fa-eye"
                                label="Details"
                                variant="btn-primary"
                                size={size}
                                href={`/portal/teams/${team.id}`}
                                title="View Details"
                            />
                        </>
                    )}
                </div>

                <ModalPortal>
                    {showInviteModal && (
                        <InviteMemberModal
                            teamId={team.id}
                            onClose={() => setShowInviteModal(false)}
                            onSuccess={() => {
                                setShowInviteModal(false);
                                onRefresh?.();
                            }}
                        />
                    )}
                </ModalPortal>
            </>
        );
    }

    // Descriptive variant
    return (
        <>
            <div className={`flex flex-wrap items-center ${getLayoutClass()} ${className}`}>
                {actions.inviteMember && (
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className={`btn ${getSizeClass()} btn-primary gap-2`}
                        title="Invite Member"
                    >
                        <i className="fa-duotone fa-regular fa-user-plus" />
                        <span className="hidden md:inline">Invite Member</span>
                    </button>
                )}

                {actions.viewDetails && (
                    <>
                        <div className="hidden sm:block w-px self-stretch bg-dark/20 mx-1" />
                        <a
                            href={`/portal/teams/${team.id}`}
                            className={`btn ${getSizeClass()} btn-outline gap-2`}
                            title="View Full Details"
                        >
                            <i className="fa-duotone fa-regular fa-eye" />
                            <span className="hidden md:inline">View Details</span>
                        </a>
                    </>
                )}
            </div>

            <ModalPortal>
                {showInviteModal && (
                    <InviteMemberModal
                        teamId={team.id}
                        onClose={() => setShowInviteModal(false)}
                        onSuccess={() => {
                            setShowInviteModal(false);
                            onRefresh?.();
                        }}
                    />
                )}
            </ModalPortal>
        </>
    );
}
