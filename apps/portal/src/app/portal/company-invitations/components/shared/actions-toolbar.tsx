"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import { ModalPortal } from "@splits-network/shared-ui";
import { SpeedMenu, BaselConfirmModal, type SpeedDialAction } from "@splits-network/basel-ui";
import type { RecruiterCompanyRelationship } from "../../types";
import TerminateCompanyModal from "@/app/portal/companies/components/modals/terminate-company-modal";

export interface ConnectionActionsToolbarProps {
    invitation: RecruiterCompanyRelationship;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    showActions?: {
        accept?: boolean;
        decline?: boolean;
        revoke?: boolean;
        terminate?: boolean;
    };
    onRefresh?: () => void;
    className?: string;
}

export default function ConnectionActionsToolbar({
    invitation,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    onRefresh,
    className = "",
}: ConnectionActionsToolbarProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const toast = useToast();
    const { profile, isRecruiter } = useUserProfile();
    const refresh = onRefresh ?? (() => {});
    const [declining, setDeclining] = useState(false);
    const [revoking, setRevoking] = useState(false);
    const [showTerminateModal, setShowTerminateModal] = useState(false);
    const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
    const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

    const isPending = invitation.status === "pending";
    const isActive = invitation.status === "active";

    // Direction awareness: did the current user send this invitation?
    // invited_by stores the internal user ID (from users table)
    const isOutgoing = invitation.invited_by === profile?.id;

    const actions = {
        accept: showActions.accept !== false && isPending && !isOutgoing,
        decline: showActions.decline !== false && isPending && !isOutgoing,
        revoke: showActions.revoke !== false && isPending && isOutgoing,
        terminate: showActions.terminate !== false && isActive,
    };

    const handleAccept = useCallback(() => {
        // Navigate to the invitation wizard instead of inline accept
        const route = isRecruiter
            ? `/portal/invitation/recruiter/${invitation.id}`
            : `/portal/invitation/company/${invitation.id}`;
        router.push(route);
    }, [invitation.id, isRecruiter, router]);

    const handleDecline = useCallback(() => {
        setShowDeclineConfirm(true);
    }, []);

    const confirmDecline = useCallback(async () => {
        setShowDeclineConfirm(false);
        setDeclining(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.patch(
                `/recruiter-companies/${invitation.id}/respond`,
                { accept: false },
            );
            toast.success("Request declined.");
            refresh();
        } catch (e: any) {
            toast.error(
                e?.response?.data?.error?.message ||
                    "Failed to decline request",
            );
        } finally {
            setDeclining(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invitation.id, toast]);

    const handleRevoke = useCallback(() => {
        setShowRevokeConfirm(true);
    }, []);

    const confirmRevoke = useCallback(async () => {
        setShowRevokeConfirm(false);
        setRevoking(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.patch(
                `/recruiter-companies/${invitation.id}/respond`,
                { accept: false },
            );
            toast.success("Invitation revoked.");
            refresh();
        } catch (e: any) {
            toast.error(
                e?.response?.data?.error?.message ||
                    "Invitation couldn't be revoked. Try again.",
            );
        } finally {
            setRevoking(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invitation.id, toast]);

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
        const speedDialActions: SpeedDialAction[] = [];

        if (actions.accept) {
            speedDialActions.push({
                key: "accept",
                icon: "fa-duotone fa-regular fa-arrow-right",
                label: "Review & Respond",
                variant: "btn-success",
                onClick: handleAccept,
                title: "Review & Respond",
            });
        }
        if (actions.decline) {
            speedDialActions.push({
                key: "decline",
                icon: "fa-duotone fa-regular fa-xmark",
                label: "Decline Request",
                variant: "btn-ghost",
                onClick: handleDecline,
                disabled: declining,
                loading: declining,
                title: "Decline Request",
            });
        }
        if (actions.revoke) {
            speedDialActions.push({
                key: "revoke",
                icon: "fa-duotone fa-regular fa-ban",
                label: "Revoke Invitation",
                variant: "btn-ghost",
                onClick: handleRevoke,
                disabled: revoking,
                loading: revoking,
                title: "Revoke Invitation",
            });
        }
        if (actions.terminate) {
            speedDialActions.push({
                key: "terminate",
                icon: "fa-duotone fa-regular fa-link-slash",
                label: "End Relationship",
                variant: "btn-ghost",
                onClick: () => setShowTerminateModal(true),
                title: "End Relationship",
            });
        }

        return (
            <>
                <SpeedMenu
                    actions={speedDialActions}
                    size={size ?? "sm"}
                    className={className}
                />
                {terminateModal}
                <BaselConfirmModal
                    isOpen={showDeclineConfirm}
                    onClose={() => setShowDeclineConfirm(false)}
                    onConfirm={confirmDecline}
                    title="Decline Request"
                    icon="fa-ban"
                    confirmColor="btn-error"
                >
                    <p>Are you sure you want to decline this representation request?</p>
                </BaselConfirmModal>
                <BaselConfirmModal
                    isOpen={showRevokeConfirm}
                    onClose={() => setShowRevokeConfirm(false)}
                    onConfirm={confirmRevoke}
                    title="Revoke Invitation"
                    icon="fa-ban"
                    confirmColor="btn-error"
                >
                    <p>Are you sure you want to revoke this invitation?</p>
                </BaselConfirmModal>
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
                        className={`btn btn-${size} btn-success gap-2 rounded-none`}

                    >
                        <i className="fa-duotone fa-regular fa-arrow-right" />
                        Review & Respond
                    </button>
                )}
                {actions.decline && (
                    <button
                        onClick={handleDecline}
                        className={`btn btn-${size} btn-ghost gap-2 text-error rounded-none`}

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
                {actions.revoke && (
                    <button
                        onClick={handleRevoke}
                        className={`btn btn-${size} btn-ghost gap-2 text-error rounded-none`}

                        disabled={revoking}
                    >
                        {revoking ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-ban" />
                        )}
                        Revoke
                    </button>
                )}
                {actions.terminate && (
                    <button
                        onClick={() => setShowTerminateModal(true)}
                        className={`btn btn-${size} btn-ghost gap-2 text-error rounded-none`}

                    >
                        <i className="fa-duotone fa-regular fa-link-slash" />
                        End Relationship
                    </button>
                )}
            </div>
            {terminateModal}
            <BaselConfirmModal
                isOpen={showDeclineConfirm}
                onClose={() => setShowDeclineConfirm(false)}
                onConfirm={confirmDecline}
                title="Decline Request"
                icon="fa-ban"
                confirmColor="btn-error"
            >
                <p>Are you sure you want to decline this representation request?</p>
            </BaselConfirmModal>
            <BaselConfirmModal
                isOpen={showRevokeConfirm}
                onClose={() => setShowRevokeConfirm(false)}
                onConfirm={confirmRevoke}
                title="Revoke Invitation"
                icon="fa-ban"
                confirmColor="btn-error"
            >
                <p>Are you sure you want to revoke this invitation?</p>
            </BaselConfirmModal>
        </>
    );
}
