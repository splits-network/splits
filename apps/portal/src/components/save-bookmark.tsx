"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";

type EntityType = "job" | "candidate";

const CONFIG: Record<EntityType, { endpoint: string; bodyKey: string; label: string }> = {
    job: { endpoint: "/recruiter-saved-jobs", bodyKey: "job_id", label: "Role" },
    candidate: { endpoint: "/recruiter-saved-candidates", bodyKey: "candidate_id", label: "Candidate" },
};

interface SaveBookmarkProps {
    entityType: EntityType;
    entityId: string;
    isSaved: boolean;
    savedRecordId: string | null;
    onToggle?: (isSaved: boolean, savedRecordId: string | null) => void;
    size?: "xs" | "sm" | "md";
}

export function SaveBookmark({
    entityType,
    entityId,
    isSaved,
    savedRecordId,
    onToggle,
    size = "sm",
}: SaveBookmarkProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const [saving, setSaving] = useState(false);

    const { endpoint, bodyKey, label } = CONFIG[entityType];

    // Use refs to avoid stale closure — props change via optimistic updates
    const isSavedRef = useRef(isSaved);
    const savedRecordIdRef = useRef(savedRecordId);
    isSavedRef.current = isSaved;
    savedRecordIdRef.current = savedRecordId;

    const handleClick = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();
            setSaving(true);
            try {
                const token = await getToken();
                if (!token) throw new Error("No auth token");
                const client = createAuthenticatedClient(token);

                if (isSavedRef.current && savedRecordIdRef.current) {
                    await client.delete(`${endpoint}/${savedRecordIdRef.current}`);
                    onToggle?.(false, null);
                    toast.info(`${label} removed from saved.`);
                } else {
                    const res = await client.post(endpoint, { [bodyKey]: entityId });
                    onToggle?.(true, res?.data?.id);
                    toast.success(`${label} saved.`);
                }
            } catch (error: any) {
                console.error("Failed to toggle save:", error);
                if (error?.response?.status === 403 && error?.response?.data?.entitlement) {
                    toast.error(`You've reached your saved ${label.toLowerCase()}s limit. Upgrade your plan for more.`);
                } else {
                    toast.error("Failed to update saved status.");
                }
            } finally {
                setSaving(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [entityId, getToken, onToggle, toast, endpoint, bodyKey, label]
    );

    const sizeClass = size === "xs" ? "text-xs" : size === "sm" ? "text-sm" : "text-base";

    return (
        <button
            onClick={handleClick}
            disabled={saving}
            className={`btn btn-ghost btn-circle btn-${size} ${sizeClass} ${isSaved ? "text-warning" : "text-base-content/30 hover:text-warning"} transition-colors`}
            title={isSaved ? `Unsave ${label}` : `Save ${label}`}
        >
            {saving ? (
                <span className="loading loading-spinner loading-xs" />
            ) : (
                <i className={isSaved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"} />
            )}
        </button>
    );
}
