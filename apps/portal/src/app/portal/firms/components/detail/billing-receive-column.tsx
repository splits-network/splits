"use client";

import { useState } from "react";
import { FirmConnectModal } from "./firm-connect-modal";

interface ConnectStatus {
    account_id: string;
    firm_id: string;
    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
    onboarded: boolean;
    bank_account: { bank_name: string; last4: string } | null;
    pending_balance: number;
}

interface BillingReceiveColumnProps {
    firmId: string;
    firmName?: string;
    connectStatus: ConnectStatus | null;
    onRefresh: () => void;
}

export function BillingReceiveColumn({
    firmId,
    firmName,
    connectStatus,
    onRefresh,
}: BillingReceiveColumnProps) {
    const [showModal, setShowModal] = useState(false);

    const handleCloseModal = () => {
        setShowModal(false);
        onRefresh();
    };

    return (
        <div className="bg-base-100 border border-base-300 border-t-[3px] border-t-secondary">
            {/* Header */}
            <div className="p-5 pb-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-1">
                    Payments You Receive
                </p>
                <h3 className="text-lg font-bold mb-1">Payout Account</h3>
                <p className="text-sm text-base-content/60">
                    When your firm&apos;s recruiters make placements on the platform,
                    your firm collects its admin take — a percentage of each placement fee.
                </p>
            </div>

            {/* Body */}
            <div className="px-5 pb-5">
                <HowItWorksReceive />

                {connectStatus ? (
                    <ConfiguredState
                        connectStatus={connectStatus}
                        onEdit={() => setShowModal(true)}
                    />
                ) : (
                    <NotConfiguredState onSetup={() => setShowModal(true)} />
                )}
            </div>

            <FirmConnectModal
                isOpen={showModal}
                onClose={handleCloseModal}
                firmId={firmId}
                firmName={firmName}
            />
        </div>
    );
}

function HowItWorksReceive() {
    const steps = [
        "A recruiter at your firm closes a placement on the platform",
        "Your firm\u2019s admin take is calculated from the placement fee",
        "The payout is sent to your linked bank account via Stripe Connect",
        "Identity verification is a one-time Stripe compliance requirement",
    ];

    return (
        <div className="bg-base-200 p-4 mb-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                How it works
            </h4>
            <ol className="text-sm text-base-content/60 space-y-1">
                {steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className="w-[18px] h-[18px] shrink-0 flex items-center justify-center text-[10px] font-semibold bg-secondary/10 text-secondary mt-0.5">
                            {i + 1}
                        </span>
                        {step}
                    </li>
                ))}
            </ol>
        </div>
    );
}

function ConfiguredState({
    connectStatus,
    onEdit,
}: {
    connectStatus: ConnectStatus;
    onEdit: () => void;
}) {
    return (
        <>
            <div className="border border-base-300 bg-base-200 mb-4">
                <SummaryRow
                    label="Onboarded"
                    value={connectStatus.onboarded ? "Yes" : "Incomplete"}
                    valueColor={connectStatus.onboarded ? "text-success" : "text-warning"}
                />
                <SummaryRow
                    label="Charges"
                    value={connectStatus.charges_enabled ? "Enabled" : "Disabled"}
                    valueColor={connectStatus.charges_enabled ? "text-success" : "text-base-content/40"}
                />
                <SummaryRow
                    label="Payouts"
                    value={connectStatus.payouts_enabled ? "Enabled" : "Disabled"}
                    valueColor={connectStatus.payouts_enabled ? "text-success" : "text-base-content/40"}
                />
                {connectStatus.bank_account && (
                    <SummaryRow
                        label="Bank Account"
                        value={`${connectStatus.bank_account.bank_name} ···· ${connectStatus.bank_account.last4}`}
                        last
                    />
                )}
                {!connectStatus.bank_account && (
                    <SummaryRow label="Bank Account" value="Not linked" dimValue last />
                )}
            </div>

            {!connectStatus.onboarded ? (
                <button
                    className="btn btn-sm btn-warning btn-outline"
                    style={{ borderRadius: 0 }}
                    onClick={onEdit}
                >
                    <i className="fa-duotone fa-regular fa-arrow-right mr-1" />
                    Complete Onboarding
                </button>
            ) : (
                <button
                    className="btn btn-sm btn-ghost"
                    style={{ borderRadius: 0 }}
                    onClick={onEdit}
                >
                    <i className="fa-duotone fa-regular fa-pen mr-1" />
                    Edit Payout Account
                </button>
            )}
        </>
    );
}

function NotConfiguredState({ onSetup }: { onSetup: () => void }) {
    return (
        <>
            <p className="text-sm text-base-content/50 mb-4">
                No payout account connected. Your firm cannot receive placement
                earnings until this is complete.
            </p>
            <button
                className="btn btn-sm btn-secondary"
                style={{ borderRadius: 0 }}
                onClick={onSetup}
            >
                <i className="fa-duotone fa-regular fa-building-columns mr-1" />
                Set Up Payout Account
            </button>
        </>
    );
}

function SummaryRow({
    label,
    value,
    valueColor,
    dimValue,
    last,
}: {
    label: string;
    value: string;
    valueColor?: string;
    dimValue?: boolean;
    last?: boolean;
}) {
    return (
        <div className={`flex justify-between px-4 py-3 ${last ? "" : "border-b border-base-300"}`}>
            <span className="text-sm text-base-content/50">{label}</span>
            <span className={`text-sm font-semibold ${valueColor || ""} ${dimValue ? "text-base-content/40" : ""}`}>
                {value}
            </span>
        </div>
    );
}
