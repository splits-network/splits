"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useConnectionFilterOptional } from "../../contexts/filter-context";
import { RecruiterCompanyRelationship } from "../../types";
import TerminateCompanyModal from "@/app/portal/companies/components/modals/terminate-company-modal";

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
    const filterContext = useConnectionFilterOptional();
    const refresh = onRefresh ?? filterContext?.refresh ?? (() => {});

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
                {
                    accept: true,
                },
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
                {
                    accept: false,
                },
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

    const getSizeClass = () => `btn-${size}`;
    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    const terminateModal = showTerminateModal && (
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
    );

    if (variant === "icon-only") {
        return (
            <>
                <div
                    className={`flex items-center ${getLayoutClass()} ${className}`}
                >
                    {/* Accept - CTA */}
                    {actions.accept && (
                        <button
                            onClick={handleAccept}
                            className={`btn ${getSizeClass()} btn-square btn-success`}
                            disabled={accepting}
                            title="Accept"
                        >
                            {accepting ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-check" />
                            )}
                        </button>
                    )}
                    {/* Decline */}
                    {actions.decline && (
                        <button
                            onClick={handleDecline}
                            className={`btn ${getSizeClass()} btn-square btn-ghost text-error`}
                            disabled={declining}
                            title="Decline"
                        >
                            {declining ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-xmark" />
                            )}
                        </button>
                    )}
                    {/* End Relationship */}
                    {actions.terminate && (
                        <button
                            onClick={() => setShowTerminateModal(true)}
                            className={`btn ${getSizeClass()} btn-square btn-ghost text-error`}
                            title="End Relationship"
                        >
                            <i className="fa-duotone fa-regular fa-link-slash" />
                        </button>
                    )}
                    {/* View Details - far right */}
                    {onViewDetails && (
                        <>
                            {(actions.accept ||
                                actions.decline ||
                                actions.terminate) && (
                                <div className="w-px h-4 bg-base-300 mx-0.5" />
                            )}
                            <button
                                onClick={handleViewDetails}
                                className={`btn ${getSizeClass()} btn-square btn-primary`}
                                title="View Details"
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                            </button>
                        </>
                    )}
                </div>
                {terminateModal}
            </>
        );
    }

    // Descriptive variant
    return (
        <>
            <div
                className={`flex ${layout === "horizontal" ? "flex-wrap gap-2" : "flex-col gap-2"} ${className}`}
            >
                {/* Accept - CTA */}
                {actions.accept && (
                    <button
                        onClick={handleAccept}
                        className={`btn ${getSizeClass()} btn-success gap-2`}
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
                {/* Decline */}
                {actions.decline && (
                    <button
                        onClick={handleDecline}
                        className={`btn ${getSizeClass()} btn-error btn-outline gap-2`}
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
                {/* End Relationship */}
                {actions.terminate && (
                    <button
                        onClick={() => setShowTerminateModal(true)}
                        className={`btn ${getSizeClass()} btn-error btn-outline gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-link-slash" />
                        End Relationship
                    </button>
                )}
                {/* View Details - far right */}
                {onViewDetails && (
                    <>
                        {(actions.accept ||
                            actions.decline ||
                            actions.terminate) && (
                            <div className="divider divider-horizontal mx-0" />
                        )}
                        <button
                            onClick={handleViewDetails}
                            className={`btn ${getSizeClass()} btn-outline gap-2`}
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
