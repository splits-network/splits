"use client";

import type { RecruiterCompanyPermissions } from "./types";

interface PermissionOption {
    key: keyof RecruiterCompanyPermissions;
    label: string;
    description: string;
    icon: string;
}

const PERMISSION_OPTIONS: PermissionOption[] = [
    {
        key: "can_view_jobs",
        label: "View Job Listings",
        description:
            "The recruiter can see your company's open positions and their details.",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        key: "can_submit_candidates",
        label: "Submit Candidates",
        description:
            "The recruiter can submit candidates to your open positions. Submissions create tracked applications.",
        icon: "fa-duotone fa-regular fa-user-plus",
    },
    {
        key: "can_view_applications",
        label: "View Applications",
        description:
            "The recruiter can view the status and details of applications submitted to your jobs.",
        icon: "fa-duotone fa-regular fa-folder-open",
    },
    {
        key: "can_advance_candidates",
        label: "Advance Candidates",
        description:
            "The recruiter can move candidates through pre-offer stages (screening, interviews). They cannot advance to offer or hired.",
        icon: "fa-duotone fa-regular fa-arrow-right",
    },
    {
        key: "can_create_jobs",
        label: "Create Jobs",
        description:
            "The recruiter can create new job listings on behalf of your company.",
        icon: "fa-duotone fa-regular fa-plus-circle",
    },
    {
        key: "can_edit_jobs",
        label: "Edit Jobs",
        description:
            "The recruiter can modify existing job listings (title, description, requirements).",
        icon: "fa-duotone fa-regular fa-pen",
    },
];

interface PermissionConfiguratorProps {
    permissions: RecruiterCompanyPermissions;
    onChange?: (permissions: RecruiterCompanyPermissions) => void;
    recruiterName: string;
    disabled?: boolean;
    readonly?: boolean;
}

export function PermissionConfigurator({
    permissions,
    onChange,
    recruiterName,
    disabled = false,
    readonly = false,
}: PermissionConfiguratorProps) {
    const togglePermission = (key: keyof RecruiterCompanyPermissions) => {
        onChange?.({ ...permissions, [key]: !permissions[key] });
    };

    const enabledCount = Object.values(permissions).filter(Boolean).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-base-content/50">
                        Permissions for {recruiterName}
                    </h3>
                    <p className="text-sm text-base-content/40 mt-1">
                        {enabledCount} of {PERMISSION_OPTIONS.length} permissions
                        enabled.{!readonly && " You can change these at any time."}
                    </p>
                </div>
            </div>
            <div className="space-y-2">
                {PERMISSION_OPTIONS.map((option) => {
                    const isEnabled = permissions[option.key];

                    if (readonly) {
                        return (
                            <div
                                key={option.key}
                                className={`flex items-start gap-4 p-4 border ${
                                    isEnabled
                                        ? "border-primary/30 bg-primary/5"
                                        : "border-base-300 bg-base-200"
                                }`}
                            >
                                <i
                                    className={`text-sm mt-1 ${
                                        isEnabled
                                            ? "fa-duotone fa-regular fa-circle-check text-success"
                                            : "fa-duotone fa-regular fa-circle-xmark text-base-content/30"
                                    }`}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <i
                                            className={`${option.icon} text-sm ${
                                                isEnabled
                                                    ? "text-primary"
                                                    : "text-base-content/30"
                                            }`}
                                        />
                                        <span className="text-sm font-bold">
                                            {option.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-base-content/50 mt-1 leading-relaxed">
                                        {option.description}
                                    </p>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <label
                            key={option.key}
                            className={`flex items-start gap-4 p-4 border cursor-pointer transition-all ${
                                isEnabled
                                    ? "border-primary/30 bg-primary/5"
                                    : "border-base-300 bg-base-200"
                            } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
                        >
                            <input
                                type="checkbox"
                                className="toggle toggle-primary toggle-sm mt-0.5"
                                checked={isEnabled}
                                onChange={() => togglePermission(option.key)}
                                disabled={disabled}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <i
                                        className={`${option.icon} text-sm ${
                                            isEnabled
                                                ? "text-primary"
                                                : "text-base-content/30"
                                        }`}
                                    />
                                    <span className="text-sm font-bold">
                                        {option.label}
                                    </span>
                                </div>
                                <p className="text-sm text-base-content/50 mt-1 leading-relaxed">
                                    {option.description}
                                </p>
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
