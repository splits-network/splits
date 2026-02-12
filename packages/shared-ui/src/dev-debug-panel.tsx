"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { getGatewayBaseUrl } from "./service-status/gateway-url";

interface MeResponse {
    data: {
        id: string;
        clerk_user_id: string;
        email: string;
        name: string;
        roles: string[];
        is_platform_admin: boolean;
        recruiter_id: string | null;
        candidate_id: string | null;
        organization_ids: string[];
        company_ids: string[];
        onboarding_status: string;
    };
}

/**
 * Dev-only debug panel that shows user context in the bottom-right corner.
 * Only renders when NEXT_PUBLIC_DEV_DEBUG=true or NODE_ENV=development.
 * Collapsible to minimize screen real-estate usage.
 */
export function DevDebugPanel() {
    const isDev =
        process.env.NODE_ENV === "development" ||
        process.env.NEXT_PUBLIC_DEV_DEBUG === "true";

    if (!isDev) return null;

    return <DevDebugPanelInner />;
}

function DevDebugPanelInner() {
    const { user, isLoaded: isUserLoaded } = useUser();
    const { getToken, isSignedIn } = useAuth();
    const [collapsed, setCollapsed] = useState(true);
    const [meData, setMeData] = useState<MeResponse["data"] | null>(null);
    const [meError, setMeError] = useState<string | null>(null);

    const fetchMe = useCallback(async () => {
        if (!isSignedIn) return;
        try {
            const token = await getToken();
            if (!token) return;
            const base = getGatewayBaseUrl();
            const res = await fetch(`${base}/api/v2/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                setMeError(`${res.status} ${res.statusText}`);
                return;
            }
            const json: MeResponse = await res.json();
            setMeData(json.data);
            setMeError(null);
        } catch (err) {
            setMeError(err instanceof Error ? err.message : String(err));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignedIn]);

    useEffect(() => {
        if (isSignedIn && !collapsed) {
            fetchMe();
        }
    }, [isSignedIn, collapsed, fetchMe]);

    if (!isUserLoaded) return null;

    if (collapsed) {
        return (
            <button
                onClick={() => setCollapsed(false)}
                className="fixed bottom-3 right-3 z-[9999] btn btn-xs btn-circle btn-ghost opacity-40 hover:opacity-100 bg-base-300 border border-base-content/20"
                title="Dev Debug"
            >
                <i className="fa-solid fa-bug text-xs" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-3 right-3 z-[9999] w-80 bg-base-100 border border-base-content/20 rounded-lg shadow-xl text-xs font-mono">
            <div className="flex items-center justify-between px-3 py-1.5 bg-base-300 rounded-t-lg border-b border-base-content/10">
                <span className="font-semibold text-base-content/70">
                    Dev Debug
                </span>
                <div className="flex gap-1">
                    <button
                        onClick={fetchMe}
                        className="btn btn-ghost btn-xs btn-circle"
                        title="Refresh"
                    >
                        <i className="fa-solid fa-arrows-rotate text-[10px]" />
                    </button>
                    <button
                        onClick={() => setCollapsed(true)}
                        className="btn btn-ghost btn-xs btn-circle"
                        title="Collapse"
                    >
                        <i className="fa-solid fa-xmark text-[10px]" />
                    </button>
                </div>
            </div>

            <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                {!isSignedIn ? (
                    <p className="text-base-content/50">Not signed in</p>
                ) : (
                    <>
                        {/* Clerk user info */}
                        <Section title="Clerk">
                            <Row label="Email" value={user?.primaryEmailAddress?.emailAddress} />
                            <Row label="Clerk ID" value={user?.id} copyable />
                        </Section>

                        {/* Identity / Access Context */}
                        {meError && (
                            <div className="text-error">
                                /me error: {meError}
                            </div>
                        )}
                        {meData && (
                            <>
                                <Section title="Identity">
                                    <Row label="User ID" value={meData.id} copyable />
                                    <Row label="Name" value={meData.name} />
                                    <Row label="Onboarding" value={meData.onboarding_status} />
                                </Section>

                                <Section title="Access">
                                    <Row label="Roles" value={meData.roles?.join(", ") || "none"} />
                                    <Row label="Admin" value={meData.is_platform_admin ? "yes" : "no"} />
                                    <Row label="Recruiter" value={meData.recruiter_id} copyable />
                                    <Row label="Candidate" value={meData.candidate_id} copyable />
                                    <Row label="Org IDs" value={meData.organization_ids?.join(", ") || "none"} />
                                    <Row label="Company IDs" value={meData.company_ids?.join(", ") || "none"} />
                                </Section>
                            </>
                        )}
                        {!meData && !meError && (
                            <p className="text-base-content/50">Loading...</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="text-base-content/50 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                {title}
            </div>
            <div className="space-y-0.5">{children}</div>
        </div>
    );
}

function Row({ label, value, copyable }: { label: string; value?: string | null; copyable?: boolean }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="flex items-start gap-2">
            <span className="text-base-content/50 w-16 shrink-0">{label}</span>
            <span
                className={`break-all ${copyable && value ? "cursor-pointer hover:text-primary" : ""} ${copied ? "text-success" : "text-base-content"}`}
                onClick={copyable ? handleCopy : undefined}
                title={copyable && value ? (copied ? "Copied!" : "Click to copy") : undefined}
            >
                {value || <span className="text-base-content/30">-</span>}
                {copied && <span className="ml-1 text-success text-[9px]">copied</span>}
            </span>
        </div>
    );
}
