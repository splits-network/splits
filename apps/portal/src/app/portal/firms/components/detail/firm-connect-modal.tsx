"use client";

import { useFirmConnectStatus } from "@/hooks/use-firm-connect-status";
import { LoadingState, ModalPortal } from "@splits-network/shared-ui";
import {
    BaselAlertBox,
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
} from "@splits-network/basel-ui";
import { NotStartedView, StatusView, IdentityVerificationView } from "./firm-connect-views";
import { FirmConnectWizard } from "./firm-connect-wizard";

interface FirmConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    firmId: string;
    firmName?: string;
}

export function FirmConnectModal({ isOpen, onClose, firmId, firmName }: FirmConnectModalProps) {
    return (
        <ModalPortal>
            {isOpen && (
                <ModalInner
                    isOpen={isOpen}
                    onClose={onClose}
                    firmId={firmId}
                    firmName={firmName}
                />
            )}
        </ModalPortal>
    );
}

function ModalInner({
    isOpen,
    onClose,
    firmId,
    firmName,
}: {
    isOpen: boolean;
    onClose: () => void;
    firmId: string;
    firmName?: string;
}) {
    const connectStatus = useFirmConnectStatus(firmId);
    const { status } = connectStatus;

    if (connectStatus.loading) {
        return (
            <BaselModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
                <BaselModalHeader
                    title="Set Up Firm Payouts"
                    subtitle="Loading..."
                    icon="fa-building-columns"
                    onClose={onClose}
                />
                <BaselModalBody padding="p-8">
                    <LoadingState message="Loading payout status..." />
                </BaselModalBody>
            </BaselModal>
        );
    }

    if (connectStatus.error) {
        return (
            <BaselModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
                <BaselModalHeader
                    title="Set Up Firm Payouts"
                    subtitle="Error"
                    icon="fa-building-columns"
                    onClose={onClose}
                />
                <BaselModalBody padding="p-8">
                    <BaselAlertBox variant="error">
                        {connectStatus.error}
                    </BaselAlertBox>
                </BaselModalBody>
                <BaselModalFooter align="end">
                    <button onClick={onClose} className="btn btn-ghost">
                        Close
                    </button>
                </BaselModalFooter>
            </BaselModal>
        );
    }

    if (status === "not_started") {
        return (
            <NotStartedView
                isOpen={isOpen}
                onClose={onClose}
                onCreateAccount={connectStatus.createAccount}
            />
        );
    }

    if (status === "pending_verification") {
        return <StatusView isOpen={isOpen} onClose={onClose} status={status} />;
    }

    if (status === "ready") {
        return <StatusView isOpen={isOpen} onClose={onClose} status={status} />;
    }

    if (
        connectStatus.needsIdentityVerification &&
        connectStatus.detailsSubmitted
    ) {
        return (
            <IdentityVerificationView
                isOpen={isOpen}
                onClose={onClose}
                connectStatus={connectStatus}
            />
        );
    }

    return (
        <FirmConnectWizard
            isOpen={isOpen}
            onClose={onClose}
            connectStatus={connectStatus}
            firmName={firmName}
        />
    );
}
