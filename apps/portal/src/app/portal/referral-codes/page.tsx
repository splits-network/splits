"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { PageTitle } from "@/components/page-title";
import { LoadingState, ButtonLoading } from "@splits-network/shared-ui";

interface RecruiterCode {
    id: string;
    code: string;
    label?: string;
    status: "active" | "inactive";
    created_at: string;
    usage_count?: number;
}

export default function ReferralCodesPage() {
    const { getToken } = useAuth();

    const [codes, setCodes] = useState<RecruiterCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newLabel, setNewLabel] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchCodes = useCallback(async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response: any = await client.get("/recruiter-codes", {
                params: { limit: 50, sort_by: "created_at", sort_order: "desc" },
            });

            setCodes(response?.data || []);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Failed to load referral codes");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchCodes();
    }, [fetchCodes]);

    const handleCreate = async () => {
        try {
            setCreating(true);
            setError(null);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.post("/recruiter-codes", {
                label: newLabel.trim() || undefined,
            });

            setNewLabel("");
            setShowCreateForm(false);
            await fetchCodes();
        } catch (err: any) {
            setError(err.message || "Failed to create referral code");
        } finally {
            setCreating(false);
        }
    };

    const handleToggleStatus = async (code: RecruiterCode) => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const newStatus = code.status === "active" ? "inactive" : "active";
            await client.patch(`/recruiter-codes/${code.id}`, {
                status: newStatus,
            });
            await fetchCodes();
        } catch (err: any) {
            setError(err.message || "Failed to update code");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.delete(`/recruiter-codes/${id}`);
            await fetchCodes();
        } catch (err: any) {
            setError(err.message || "Failed to delete code");
        } finally {
            setDeletingId(null);
        }
    };

    const copyShareLink = (code: string) => {
        const url = `https://splits.network?rec_code=${code}`;
        navigator.clipboard.writeText(url);
        setCopiedId(code);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return <LoadingState message="Loading referral codes..." />;
    }

    return (
        <>
            <PageTitle
                title="Referral Codes"
                subtitle="Create and manage your referral codes to track sourcing attribution"
            >
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowCreateForm(true)}
                >
                    <i className="fa-duotone fa-regular fa-plus"></i>
                    New Code
                </button>
            </PageTitle>

            <div className="space-y-4">
                {error && (
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                        <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => setError(null)}
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Create form */}
                {showCreateForm && (
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h3 className="card-title text-base">Create New Referral Code</h3>
                            <p className="text-sm text-base-content/60">
                                A unique code will be generated automatically. You can add an optional label to track campaigns.
                            </p>
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Label (optional)</legend>
                                <input
                                    type="text"
                                    placeholder="e.g., LinkedIn Q1 2026"
                                    className="input w-full"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    maxLength={255}
                                    disabled={creating}
                                />
                                <p className="fieldset-label">
                                    Campaign name or description for your reference
                                </p>
                            </fieldset>
                            <div className="card-actions justify-end mt-2">
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewLabel("");
                                    }}
                                    disabled={creating}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handleCreate}
                                    disabled={creating}
                                >
                                    <ButtonLoading
                                        loading={creating}
                                        text="Create Code"
                                        loadingText="Creating..."
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Codes table */}
                {codes.length === 0 && !showCreateForm ? (
                    <div className="card bg-base-100 shadow">
                        <div className="card-body items-center text-center py-12">
                            <i className="fa-duotone fa-regular fa-link text-4xl text-base-content/30 mb-4"></i>
                            <h3 className="font-semibold text-lg">No referral codes yet</h3>
                            <p className="text-base-content/60 max-w-md">
                                Create referral codes to share with potential candidates and companies.
                                When they sign up using your code, you'll be attributed as the sourcer.
                            </p>
                            <button
                                className="btn btn-primary btn-sm mt-4"
                                onClick={() => setShowCreateForm(true)}
                            >
                                <i className="fa-duotone fa-regular fa-plus"></i>
                                Create Your First Code
                            </button>
                        </div>
                    </div>
                ) : codes.length > 0 ? (
                    <div className="card bg-base-100 shadow overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Label</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {codes.map((code) => (
                                    <tr key={code.id}>
                                        <td>
                                            <code className="bg-base-200 px-2 py-1 rounded text-sm font-mono">
                                                {code.code}
                                            </code>
                                        </td>
                                        <td>
                                            <span className="text-sm text-base-content/70">
                                                {code.label || "—"}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge badge-sm ${
                                                    code.status === "active"
                                                        ? "badge-success"
                                                        : "badge-ghost"
                                                }`}
                                            >
                                                {code.status}
                                            </span>
                                        </td>
                                        <td className="text-sm text-base-content/60">
                                            {new Date(code.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="flex gap-1 justify-end">
                                                <button
                                                    className="btn btn-ghost btn-xs"
                                                    onClick={() => copyShareLink(code.code)}
                                                    title="Copy share link"
                                                >
                                                    {copiedId === code.code ? (
                                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                                    ) : (
                                                        <i className="fa-duotone fa-regular fa-copy"></i>
                                                    )}
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-xs"
                                                    onClick={() => handleToggleStatus(code)}
                                                    title={code.status === "active" ? "Deactivate" : "Activate"}
                                                >
                                                    {code.status === "active" ? (
                                                        <i className="fa-duotone fa-regular fa-pause"></i>
                                                    ) : (
                                                        <i className="fa-duotone fa-regular fa-play"></i>
                                                    )}
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-xs text-error"
                                                    onClick={() => handleDelete(code.id)}
                                                    disabled={deletingId === code.id}
                                                    title="Delete"
                                                >
                                                    {deletingId === code.id ? (
                                                        <span className="loading loading-spinner loading-xs"></span>
                                                    ) : (
                                                        <i className="fa-duotone fa-regular fa-trash"></i>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </div>
        </>
    );
}
