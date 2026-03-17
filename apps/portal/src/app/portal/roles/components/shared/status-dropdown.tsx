"use client";

import { useRef, useEffect, useMemo } from "react";
import type { Job } from "../../types";
import type { JobStatus } from "../../hooks/use-status-actions";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface StatusItem {
    key: string;
    status?: JobStatus;
    label: string;
    icon: string;
    btnClass: string;
    action?: () => void;
}

interface StatusDropdownProps {
    job: Job;
    billingReady: boolean;
    size: "xs" | "sm" | "md" | "lg";
    updatingStatus: boolean;
    statusAction: string | null;
    onStatusChange: (status: JobStatus) => void;
    onToggleEarlyAccess: () => void;
    onTogglePriority: () => void;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function StatusDropdown({
    job,
    billingReady,
    size,
    updatingStatus,
    statusAction,
    onStatusChange,
    onToggleEarlyAccess,
    onTogglePriority,
}: StatusDropdownProps) {
    const dropdownRef = useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                dropdownRef.current.removeAttribute("open");
            }
        };
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    const statusItems = useMemo(() => {
        const items: StatusItem[] = [];

        if (job.status === "draft") {
            if (billingReady) {
                items.push({ key: "active", status: "active", label: "Publish Live", icon: "fa-duotone fa-regular fa-play", btnClass: "text-success" });
            }
            items.push({ key: "pending", status: "pending", label: "Submit for Approval", icon: "fa-duotone fa-regular fa-paper-plane", btnClass: "text-warning" });
        }
        if (job.status === "pending") {
            if (billingReady) {
                items.push({ key: "active", status: "active", label: "Activate", icon: "fa-duotone fa-regular fa-play", btnClass: "text-success" });
            }
            items.push({ key: "paused", status: "paused", label: "Pause", icon: "fa-duotone fa-regular fa-pause", btnClass: "text-warning" });
        }
        if (job.status === "active") {
            items.push({ key: "paused", status: "paused", label: "Pause", icon: "fa-duotone fa-regular fa-pause", btnClass: "text-warning" });
        }
        if (job.status === "paused") {
            if (billingReady) {
                items.push({ key: "active", status: "active", label: "Activate", icon: "fa-duotone fa-regular fa-play", btnClass: "text-success" });
            }
        }
        if (job.status === "filled" || job.status === "closed") {
            if (billingReady) {
                items.push({ key: "active", status: "active", label: "Reopen", icon: "fa-duotone fa-regular fa-rotate-left", btnClass: "text-success" });
            }
        }

        // Toggle modifiers (only for active/paused jobs)
        if (["active", "paused"].includes(job.status)) {
            items.push({
                key: "early_access",
                label: job.is_early_access ? "Disable Early Access" : "Enable Early Access",
                icon: job.is_early_access ? "fa-duotone fa-regular fa-lock" : "fa-duotone fa-regular fa-lock-open",
                btnClass: job.is_early_access ? "text-base-content/60" : "text-accent",
                action: onToggleEarlyAccess,
            });
            items.push({
                key: "priority",
                label: job.is_priority ? "Remove Priority" : "Set Priority",
                icon: job.is_priority ? "fa-duotone fa-regular fa-star" : "fa-regular fa-star",
                btnClass: job.is_priority ? "text-base-content/60" : "text-primary",
                action: onTogglePriority,
            });
        }

        // Terminal options
        if (job.status !== "filled" && !["draft", "pending"].includes(job.status)) {
            items.push({ key: "filled", status: "filled", label: "Mark Filled", icon: "fa-duotone fa-regular fa-check", btnClass: "text-info" });
        }
        if (job.status !== "closed") {
            items.push({ key: "closed", status: "closed", label: "Close", icon: "fa-duotone fa-regular fa-xmark", btnClass: "text-error" });
        }

        return items;
    }, [job.status, job.is_early_access, job.is_priority, billingReady, onToggleEarlyAccess, onTogglePriority]);

    if (statusItems.length === 0) return null;

    return (
        <details ref={dropdownRef} className="dropdown dropdown-end">
            <summary
                className={`btn btn-${size} btn-primary gap-2 list-none`}
                style={{ borderRadius: 0 }}
                title="Change Status"
            >
                {updatingStatus ? (
                    <span className="loading loading-spinner loading-xs" />
                ) : (
                    <i className="fa-duotone fa-regular fa-ellipsis-vertical" />
                )}
                <span className="hidden md:inline">Status</span>
            </summary>
            <ul
                className="dropdown-content menu bg-base-100 border-2 border-base-300 shadow-md p-2 w-48 mt-1"
                style={{ borderRadius: 0 }}
            >
                {statusItems.map((item) => (
                    <li key={item.key}>
                        <button
                            onClick={() => {
                                dropdownRef.current?.removeAttribute("open");
                                if (item.action) {
                                    item.action();
                                } else if (item.status) {
                                    onStatusChange(item.status);
                                }
                            }}
                            className={`${item.btnClass} font-bold`}
                            disabled={updatingStatus}
                        >
                            {updatingStatus &&
                            statusAction === (item.status || item.key) ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className={item.icon} />
                            )}
                            {item.label}
                        </button>
                    </li>
                ))}
            </ul>
        </details>
    );
}
