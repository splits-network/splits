"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Button, BaselFormField } from "@splits-network/basel-ui";
import type { RecruiterCode } from "../../../types";
import { formatDate } from "../helpers";

export function SettingsTab({
    code,
    onRefresh,
}: {
    code: RecruiterCode;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [isDefault, setIsDefault] = useState(code.is_default);
    const [expiryDate, setExpiryDate] = useState(
        code.expiry_date ? code.expiry_date.slice(0, 16) : "",
    );
    const [maxUses, setMaxUses] = useState(
        code.max_uses != null ? String(code.max_uses) : "",
    );
    const [usesRemaining, setUsesRemaining] = useState(
        code.uses_remaining != null ? String(code.uses_remaining) : "",
    );

    const handleSave = useCallback(async () => {
        try {
            setSaving(true);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.patch(`/recruiter-codes/${code.id}`, {
                is_default: isDefault,
                expiry_date: expiryDate
                    ? new Date(expiryDate).toISOString()
                    : null,
                max_uses: maxUses ? parseInt(maxUses, 10) : null,
                uses_remaining: usesRemaining
                    ? parseInt(usesRemaining, 10)
                    : null,
            });
            setEditing(false);
            onRefresh?.();
        } catch (err) {
            console.error("Failed to update settings:", err);
        } finally {
            setSaving(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code.id, isDefault, expiryDate, maxUses, usesRemaining, onRefresh]);

    if (!editing) {
        return (
            <div className="p-6 space-y-6">
                <div className="border-l-4 border-l-primary bg-base-200/50 border border-base-300">
                    <div className="p-5 space-y-4">
                        <SettingRow
                            label="Default Code"
                            icon="fa-duotone fa-regular fa-star"
                            value={code.is_default ? "Yes" : "No"}
                        />
                        <div className="border-t border-base-300" />
                        <SettingRow
                            label="Expiry Date"
                            icon="fa-duotone fa-regular fa-calendar-xmark"
                            value={
                                code.expiry_date
                                    ? formatDate(code.expiry_date)
                                    : "No expiration"
                            }
                        />
                        <div className="border-t border-base-300" />
                        <SettingRow
                            label="Max Uses"
                            icon="fa-duotone fa-regular fa-users"
                            value={
                                code.max_uses != null
                                    ? String(code.max_uses)
                                    : "Unlimited"
                            }
                        />
                        <div className="border-t border-base-300" />
                        <SettingRow
                            label="Uses Remaining"
                            icon="fa-duotone fa-regular fa-arrow-down-to-line"
                            value={
                                code.uses_remaining != null
                                    ? String(code.uses_remaining)
                                    : "Unlimited"
                            }
                        />
                    </div>
                </div>

                <Button
                    icon="fa-duotone fa-regular fa-pen"
                    variant="btn-outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                >
                    Edit Settings
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-5">
            <BaselFormField label="Default Code">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                    />
                    <span className="text-sm text-base-content/70">
                        Auto-attach this code when sharing jobs
                    </span>
                </label>
            </BaselFormField>

            <BaselFormField label="Expiry Date">
                <input
                    type="datetime-local"
                    className="input input-bordered w-full"
                    style={{ borderRadius: 0 }}
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                />
            </BaselFormField>

            <BaselFormField label="Max Uses">
                <input
                    type="number"
                    className="input input-bordered w-full"
                    style={{ borderRadius: 0 }}
                    placeholder="Leave empty for unlimited"
                    min={1}
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                />
            </BaselFormField>

            <BaselFormField label="Uses Remaining">
                <input
                    type="number"
                    className="input input-bordered w-full"
                    style={{ borderRadius: 0 }}
                    placeholder="Leave empty for unlimited"
                    min={0}
                    value={usesRemaining}
                    onChange={(e) => setUsesRemaining(e.target.value)}
                />
            </BaselFormField>

            <div className="flex items-center gap-2">
                <Button
                    icon="fa-duotone fa-regular fa-check"
                    variant="btn-primary"
                    size="sm"
                    onClick={handleSave}
                    loading={saving}
                >
                    Save Settings
                </Button>
                <Button
                    variant="btn-ghost"
                    size="sm"
                    onClick={() => setEditing(false)}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}

function SettingRow({
    label,
    icon,
    value,
}: {
    label: string;
    icon: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <i className={`${icon} text-primary w-5 text-center`} />
                <span className="text-sm font-semibold text-base-content/70">
                    {label}
                </span>
            </div>
            <span className="text-sm font-bold text-base-content">{value}</span>
        </div>
    );
}
