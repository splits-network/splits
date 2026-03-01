"use client";

import type { Firm } from "../../types";
import { formatCurrency, formatDate } from "../../types";
import { statusColor } from "../shared/status-color";
import { formatStatus, memberCountDisplay } from "../shared/helpers";

interface SettingsSectionProps {
    firm: Firm;
    onRefresh: () => void;
}

export function SettingsSection({ firm, onRefresh }: SettingsSectionProps) {
    return (
        <div className="space-y-8">
            {/* Section 1: Firm Information */}
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                    Firm Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Firm ID
                        </p>
                        <p className="font-bold text-sm font-mono truncate">
                            {firm.id}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Status
                        </p>
                        <span
                            className={`text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(firm.status)}`}
                        >
                            {formatStatus(firm.status)}
                        </span>
                    </div>
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
                            Members
                        </p>
                        <p className="font-bold text-sm">
                            {memberCountDisplay(firm)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Total Placements
                        </p>
                        <p className="font-bold text-sm">
                            {firm.total_placements}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Total Revenue
                        </p>
                        <p className="font-bold text-sm">
                            {formatCurrency(firm.total_revenue)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 2: Split Distribution */}
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                    Split Distribution
                </h3>
                <div className="bg-info/10 text-info text-sm p-4">
                    Split configuration coming soon
                </div>
            </div>

            {/* Section 3: Danger Zone */}
            <div className="border-2 border-error/20 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-error mb-4">
                    Danger Zone
                </h3>
                <p className="text-sm text-base-content/60 mb-4">
                    Suspending a firm will disable all member access and pause
                    active placements. This action can be reversed.
                </p>
                <button
                    className="btn btn-sm btn-error btn-outline"
                    style={{ borderRadius: 0 }}
                    disabled
                >
                    <i className="fa-duotone fa-regular fa-ban mr-2" />
                    {firm.status === "active"
                        ? "Suspend Firm"
                        : "Activate Firm"}
                </button>
            </div>
        </div>
    );
}
