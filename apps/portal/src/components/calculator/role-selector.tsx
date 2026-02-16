"use client";

import { RecruiterRole } from "./types";
import { ROLE_META } from "./commission-rates";

interface RoleSelectorProps {
    selectedRoles: RecruiterRole[];
    onToggleRole: (role: RecruiterRole) => void;
}

export function RoleSelector({
    selectedRoles,
    onToggleRole,
}: RoleSelectorProps) {
    return (
        <div className="space-y-3">
            <div className="font-medium text-base-content">
                Your Role(s) in the Deal
            </div>
            <div className="text-sm text-base-content/70 mb-2">
                Select all roles you hold in this placement
            </div>
            <div className="grid gap-2">
                {ROLE_META.map((role) => {
                    const isSelected = selectedRoles.includes(role.id);
                    return (
                        <label
                            key={role.id}
                            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                    ? "bg-primary/10 border-2 border-coral"
                                    : "bg-base-200 border-2 border-transparent hover:bg-base-300"
                            }`}
                        >
                            <input
                                type="checkbox"
                                className="checkbox checkbox-primary mt-0.5"
                                checked={isSelected}
                                onChange={() => onToggleRole(role.id)}
                            />
                            <div>
                                <div className="font-medium">{role.label}</div>
                                <div className="text-sm text-base-content/60">
                                    {role.description}
                                </div>
                            </div>
                        </label>
                    );
                })}
            </div>
            {selectedRoles.length === 0 && (
                <div className="text-sm text-warning">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation mr-1"></i>
                    Select at least one role to see your payout
                </div>
            )}
        </div>
    );
}
