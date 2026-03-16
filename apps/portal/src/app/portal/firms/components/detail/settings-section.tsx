"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { ModalPortal, ButtonLoading } from "@splits-network/shared-ui";
import type { Firm, FirmMember } from "../../types";
import { formatCurrency, formatDate } from "../../types";
import { firmStatusBadgeColor } from "../shared/status-color";
import { formatStatus, memberCountDisplay } from "../shared/helpers";
import { BaselBadge } from "@splits-network/basel-ui";
import TransferOwnershipModal from "../modals/transfer-ownership-modal";
import SuspendFirmModal from "../modals/suspend-firm-modal";
import { FirmProfileWizard } from "../modals/firm-profile-wizard";

interface SettingsSectionProps {
    firm: Firm;
    members: FirmMember[];
    onRefresh: () => void;
}

export function SettingsSection({ firm, members, onRefresh }: SettingsSectionProps) {
    const { profile } = useUserProfile();
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [showEditWizard, setShowEditWizard] = useState(false);

    // Check if current user is the firm owner or admin
    const currentMember = members.find(
        (m) => m.recruiter?.user_id === profile?.id && m.status === "active",
    );
    const isOwner = profile?.id === firm.owner_user_id;
    const isAdmin = currentMember?.role === "owner" || currentMember?.role === "admin";

    return (
        <div className="space-y-8">
            {/* Edit Profile (owner/admin only) */}
            {isAdmin && (
                <div className="flex items-center justify-between border-b border-base-300 pb-6">
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Firm Profile
                        </h3>
                        <p className="text-sm text-base-content/60">
                            Update your firm's public profile, specializations, and marketplace settings.
                        </p>
                    </div>
                    <button
                        className="btn btn-sm btn-primary"

                        onClick={() => setShowEditWizard(true)}
                    >
                        <i className="fa-duotone fa-regular fa-pen-to-square mr-2" />
                        Edit Profile
                    </button>
                </div>
            )}

            {/* Section 1: Firm Information */}
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                    Firm Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Firm ID
                        </p>
                        <p className="font-bold text-sm font-mono truncate">
                            {firm.id}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Status
                        </p>
                        <BaselBadge color={firmStatusBadgeColor(firm.status)} variant="soft" size="sm">
                            {formatStatus(firm.status)}
                        </BaselBadge>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Created
                        </p>
                        <p className="font-bold text-sm">
                            {formatDate(firm.created_at)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Members
                        </p>
                        <p className="font-bold text-sm">
                            {memberCountDisplay(firm)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Total Placements
                        </p>
                        <p className="font-bold text-sm">
                            {firm.placement_stats?.total_placements ?? 0}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Total Revenue
                        </p>
                        <p className="font-bold text-sm">
                            {formatCurrency(firm.placement_stats?.total_revenue ?? 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 2: Admin Take Rate */}
            <AdminTakeRateSection
                firm={firm}
                isAdmin={isAdmin}
                onSaved={onRefresh}
            />

            {/* Section 3: Ownership Transfer (owner only) */}
            {isOwner && (
                <div className="border-2 border-warning/20 p-6">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-warning mb-4">
                        Ownership Transfer
                    </h3>
                    <p className="text-sm text-base-content/60 mb-4">
                        Transfer firm ownership to another active member. The new owner
                        must have an active Partner subscription. You will be demoted to
                        Admin.
                    </p>
                    <button
                        className="btn btn-sm btn-warning btn-outline"

                        onClick={() => setShowTransferModal(true)}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-right-arrow-left mr-2" />
                        Transfer Ownership
                    </button>
                </div>
            )}

            {/* Section 4: Danger Zone (owner only) */}
            {isOwner && (
                <div className="border-2 border-error/20 p-6">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-error mb-4">
                        Danger Zone
                    </h3>
                    <p className="text-sm text-base-content/60 mb-4">
                        {firm.status === "active"
                            ? "Suspending a firm will disable all member access and pause active placements. This action can be reversed."
                            : "This firm is currently suspended. Reactivating will restore member access and resume normal operations."}
                    </p>
                    <button
                        className={`btn btn-sm ${firm.status === "active" ? "btn-error btn-outline" : "btn-success btn-outline"}`}

                        onClick={() => setShowSuspendModal(true)}
                    >
                        <i
                            className={`fa-duotone fa-regular ${firm.status === "active" ? "fa-ban" : "fa-check-circle"} mr-2`}
                        />
                        {firm.status === "active"
                            ? "Suspend Firm"
                            : "Activate Firm"}
                    </button>
                </div>
            )}

            {/* Edit Profile Wizard */}
            <FirmProfileWizard
                isOpen={showEditWizard}
                onClose={() => setShowEditWizard(false)}
                onSuccess={() => {
                    setShowEditWizard(false);
                    onRefresh();
                }}
                firm={firm}
            />

            {/* Transfer Ownership Modal */}
            <ModalPortal>
                {showTransferModal && (
                    <TransferOwnershipModal
                        isOpen={showTransferModal}
                        onClose={() => setShowTransferModal(false)}
                        onSuccess={() => {
                            setShowTransferModal(false);
                            onRefresh();
                        }}
                        firmId={firm.id}
                        members={members}
                    />
                )}
            </ModalPortal>

            {/* Suspend/Activate Firm Modal */}
            <ModalPortal>
                {showSuspendModal && (
                    <SuspendFirmModal
                        isOpen={showSuspendModal}
                        onClose={() => setShowSuspendModal(false)}
                        onSuccess={() => {
                            setShowSuspendModal(false);
                            onRefresh();
                        }}
                        firmId={firm.id}
                        firmName={firm.name}
                        currentStatus={firm.status as "active" | "suspended"}
                    />
                )}
            </ModalPortal>
        </div>
    );
}

function AdminTakeRateSection({
    firm,
    isAdmin,
    onSaved,
}: {
    firm: Firm;
    isAdmin: boolean;
    onSaved: () => void;
}) {
    const { getToken } = useAuth();
    const toast = useToast();

    const [takeRate, setTakeRate] = useState(firm.admin_take_rate ?? 0);
    const [saving, setSaving] = useState(false);

    const hasChanges = takeRate !== (firm.admin_take_rate ?? 0);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!isAdmin) return;

        try {
            setSaving(true);
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.patch(`/firms/${firm.id}`, {
                admin_take_rate: takeRate,
            });

            toast.success("Take rate updated.");
            onSaved();
        } catch (err: any) {
            const message =
                err?.response?.data?.error?.message ||
                err?.response?.data?.error ||
                err.message ||
                "Failed to update take rate";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                Admin Take Rate
            </h3>

            {isAdmin ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-base-content/60">
                        Set the percentage your firm earns from member placement
                        payouts. The owner&apos;s own placements are exempt.
                        Changes only affect future placements.
                    </p>
                    <div className="flex items-end gap-4">
                        <fieldset className="fieldset w-48">
                            <legend className="fieldset-legend">
                                Take Rate (%)
                            </legend>
                            <input
                                type="number"
                                value={takeRate}
                                onChange={(e) =>
                                    setTakeRate(
                                        Math.min(
                                            100,
                                            Math.max(
                                                0,
                                                parseFloat(e.target.value) || 0,
                                            ),
                                        ),
                                    )
                                }
                                className="input w-full"
                                min={0}
                                max={100}
                                step={0.01}
                                disabled={saving}
                            />
                        </fieldset>
                        <button
                            type="submit"
                            className="btn btn-sm btn-primary"
    
                            disabled={saving || !hasChanges}
                        >
                            <ButtonLoading
                                loading={saving}
                                text="Save"
                                loadingText="Saving..."
                            />
                        </button>
                    </div>

                    {takeRate > 0 && (
                        <div className="bg-base-200 p-4 text-sm">
                            <p className="text-base-content/70">
                                <strong>Example:</strong> If a member earns a $1,000
                                split, the firm receives{" "}
                                <strong>
                                    {formatCurrency((1000 * takeRate) / 100)}
                                </strong>{" "}
                                and the member receives{" "}
                                <strong>
                                    {formatCurrency(
                                        1000 - (1000 * takeRate) / 100,
                                    )}
                                </strong>
                                .
                            </p>
                        </div>
                    )}
                </form>
            ) : (
                <div className="bg-base-200 p-4">
                    <p className="text-sm text-base-content/60 mb-2">
                        Current admin take rate for this firm:
                    </p>
                    <p className="text-2xl font-black tracking-tight">
                        {firm.admin_take_rate ?? 0}%
                    </p>
                </div>
            )}
        </div>
    );
}
