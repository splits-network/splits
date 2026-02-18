"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { ModalPortal } from "@splits-network/shared-ui";
import type { RecruiterCompanyRelationship } from "../../types";
import TerminateCompanyModal from "@/app/portal/companies/components/modals/terminate-company-modal";
import { ExpandableButton } from "./expandable-button";

export interface ConnectionActionsToolbarProps {
    invitation: RecruiterCompanyRelationship;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    showActions?: {
        accept?: boolean;
        decline?: boolean;
        terminate?: boolean;
    };
    onRefresh?: () => void;
    onViewDetails?: (id: string) => void;
    className?: string;
}

export default function ConnectionActionsToolbar({
    invitation,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    onRefresh,
    onViewDetails,
    className = "",
}: ConnectionActionsToolbarProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const refresh = onRefresh ?? (() => {});

    const [accepting, setAccepting] = useState(false);
    const [declining, setDeclining] = useState(false);
    const [showTerminateModal, setShowTerminateModal] = useState(false);

    const isPending = invitation.status === "pending";
    const isActive = invitation.status === "active";

    const actions = {
        accept: showActions.accept !== false && isPending,
        decline: showActions.decline !== false && isPending,
        terminate: showActions.terminate !== false && isActive,
    };

    const handleAccept = useCallback(async () => {
        setAccepting(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.patch(
                `/recruiter-companies/${invitation.id}/respond`,
                { accept: true },
            );
            toast.success("Connection accepted!");
            refresh();
        } catch (e: any) {
            toast.error(
                e?.response?.data?.error?.message ||
                    "Failed to accept connection",
            );
        } finally {
            setAccepting(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invitation.id, toast]);

    const handleDecline = useCallback(async () => {
        if (
            !confirm(
                "Are you sure you want to decline this connection request?",
            )
        ) {
            return;
        }
        setDeclining(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.patch(
                `/recruiter-companies/${invitation.id}/respond`,
                { accept: false },
            );
            toast.success("Connection declined.");
            refresh();
        } catch (e: any) {
            toast.error(
                e?.response?.data?.error?.message ||
                    "Failed to decline connection",
            );
        } finally {
            setDeclining(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invitation.id, toast]);

    const handleViewDetails = useCallback(() => {
        onViewDetails?.(invitation.id);
    }, [invitation.id, onViewDetails]);

    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    const terminateModal = showTerminateModal && (
        <ModalPortal>
            <TerminateCompanyModal
                isOpen={showTerminateModal}
                onClose={() => setShowTerminateModal(false)}
                onSuccess={() => {
                    setShowTerminateModal(false);
                    refresh();
                }}
                relationshipId={invitation.id}
                recruiterId={invitation.recruiter_id}
                companyId={invitation.company_id}
                targetName={invitation.recruiter?.user?.name || "Unknown Recruiter"}
                targetEmail={invitation.recruiter?.user?.email}
                targetRole="recruiter"
            />
        </ModalPortal>
    );

    // ===== ICON-ONLY VARIANT =====

    if (variant === "icon-only") {
        return (
            <>
                <div
                    className={`flex items-center ${getLayoutClass()} ${className}`}
                >
                    {actions.accept && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-check"
                            label="Accept"
                            variant="btn-success"
                            size={size}
                            onClick={handleAccept}
                            disabled={accepting}
                            loading={accepting}
                            title="Accept Connection"
                        />
                    )}
                    {actions.decline && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-xmark"
                            label="Decline"
                            variant="btn-ghost"
                            size={size}
                            onClick={handleDecline}
                            disabled={declining}
                            loading={declining}
                            title="Decline Connection"
                        />
                    )}
                    {actions.terminate && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-link-slash"
                            label="End"
                            variant="btn-ghost"
                            size={size}
                            onClick={() => setShowTerminateModal(true)}
                            title="End Relationship"
                        />
                    )}
                    {onViewDetails && (
                        <>
                            {(actions.accept || actions.decline || actions.terminate) && (
                                <div className="w-px h-4 bg-dark/20 mx-0.5" />
                            )}
                            <ExpandableButton
                                icon="fa-duotone fa-regular fa-eye"
                                label="Details"
                                variant="btn-primary"
                                size={size}
                                onClick={handleViewDetails}
                                title="View Details"
                            />
                        </>
                    )}
                </div>
                {terminateModal}
            </>
        );
    }

    // ===== DESCRIPTIVE VARIANT =====

    return (
        <>
            <div
                className={`flex flex-wrap items-center ${layout === "horizontal" ? "gap-2" : "flex-col gap-2"} ${className}`}
            >
                {actions.accept && (
                    <button
                        onClick={handleAccept}
                        className={`btn btn-${size} btn-success gap-2`}
                        disabled={accepting}
                    >
                        {accepting ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-check" />
                        )}
                        Accept
                    </button>
                )}
                {actions.decline && (
                    <button
                        onClick={handleDecline}
                        className={`btn btn-${size} btn-ghost gap-2 text-coral`}
                        disabled={declining}
                    >
                        {declining ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-xmark" />
                        )}
                        Decline
                    </button>
                )}
                {actions.terminate && (
                    <button
                        onClick={() => setShowTerminateModal(true)}
                        className={`btn btn-${size} btn-ghost gap-2 text-coral`}
                    >
                        <i className="fa-duotone fa-regular fa-link-slash" />
                        End Relationship
                    </button>
                )}
                {onViewDetails && (
                    <>
                        {(actions.accept || actions.decline || actions.terminate) && (
                            <div className="hidden sm:block w-px self-stretch bg-dark/20 mx-1" />
                        )}
                        <button
                            onClick={handleViewDetails}
                            className={`btn btn-${size} btn-ghost gap-2`}
                        >
                            <i className="fa-duotone fa-regular fa-eye" />
                            View Details
                        </button>
                    </>
                )}
            </div>
            {terminateModal}
        </>
    );
}
