"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading } from "@splits-network/shared-ui";

interface CandidateSuggestion {
    id: string;
    full_name: string;
    email: string;
    current_title?: string;
    current_company?: string;
}

interface AddCandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (candidate: any) => void;
}

interface SuccessState {
    candidate: any;
    existing: boolean;
    invitation_sent: boolean;
}

export default function AddCandidateModal({
    isOpen,
    onClose,
    onSuccess,
}: AddCandidateModalProps) {
    const { getToken } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<SuccessState | null>(null);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
    });
    const [suggestions, setSuggestions] = useState<CandidateSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searching, setSearching] = useState(false);
    const [selectedFromSuggestion, setSelectedFromSuggestion] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Debounced email search
    useEffect(() => {
        if (selectedFromSuggestion || formData.email.trim().length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setSearching(true);
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const response = await client.get<{ data: CandidateSuggestion[] }>(
                    "/candidates",
                    { params: { search: formData.email.trim(), scope: "all", limit: 5 } },
                );

                const results = response.data || [];
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            } catch {
                setSuggestions([]);
                setShowSuggestions(false);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.email]);

    const handleSelectSuggestion = (candidate: CandidateSuggestion) => {
        setSelectedFromSuggestion(true);
        setFormData({
            full_name: candidate.full_name || "",
            email: candidate.email || "",
        });
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const payload = {
                email: formData.email.trim(),
                full_name: formData.full_name.trim(),
            };

            const response = await client.post<{
                data: any;
                meta?: { existing?: boolean; invitation_sent?: boolean };
            }>("/candidates", payload);

            setSuccess({
                candidate: response.data,
                existing: response.meta?.existing ?? false,
                invitation_sent: response.meta?.invitation_sent ?? false,
            });
        } catch (error: any) {
            console.error("Failed to invite candidate:", error);
            const errorMessage =
                error.message || error.response?.data?.error?.message || "";

            if (errorMessage.includes("Not authenticated")) {
                setError("Session expired. Refresh the page and try again.");
            } else {
                setError(
                    errorMessage ||
                        "Could not send invitation. Check your input and try again.",
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDone = () => {
        if (success) {
            onSuccess(success.candidate);
        }
        handleClose();
    };

    const handleClose = () => {
        if (submitting) return;
        setFormData({ full_name: "", email: "" });
        setError(null);
        setSuccess(null);
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedFromSuggestion(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open modal-bottom sm:modal-middle">
            <div
                className="modal-box max-w-md w-full p-0"
                style={{ borderRadius: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-primary px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tight text-primary-content">
                        {success ? "Invitation Sent" : "Add Candidate"}
                    </h2>
                    <button
                        type="button"
                        className="btn btn-sm btn-square btn-ghost text-primary-content"
                        onClick={success ? handleDone : handleClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>

                <div className="p-6">
                    {/* ── Success state ── */}
                    {success ? (
                        <div className="space-y-6">
                            <div className="bg-success/10 border-l-4 border-success p-4">
                                <div className="flex gap-3 items-start">
                                    <i className="fa-duotone fa-regular fa-circle-check text-success text-xl mt-0.5" />
                                    <div className="text-sm">
                                        {success.invitation_sent ? (
                                            success.existing ? (
                                                <>
                                                    <p className="font-black text-base-content uppercase tracking-wider text-xs mb-1">
                                                        Already in the system
                                                    </p>
                                                    <p className="text-base-content/70 font-medium leading-relaxed">
                                                        <strong>
                                                            {
                                                                success
                                                                    .candidate
                                                                    ?.email
                                                            }
                                                        </strong>{" "}
                                                        was already a candidate
                                                        — they&apos;ve been
                                                        added to your pipeline
                                                        and a fresh invitation
                                                        email has been sent.
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-black text-base-content uppercase tracking-wider text-xs mb-1">
                                                        Invitation sent
                                                    </p>
                                                    <p className="text-base-content/70 font-medium leading-relaxed break-all">
                                                        An invitation has been
                                                        sent to{" "}
                                                        <strong>
                                                            {
                                                                success
                                                                    .candidate
                                                                    ?.email
                                                            }
                                                        </strong>
                                                        . They&apos;ll receive
                                                        an email to set up their
                                                        profile and accept your
                                                        right-to-represent
                                                        agreement.
                                                    </p>
                                                </>
                                            )
                                        ) : (
                                            <>
                                                <p className="font-black text-base-content uppercase tracking-wider text-xs mb-1">
                                                    Candidate added
                                                </p>
                                                <p className="text-base-content/70 font-medium leading-relaxed">
                                                    <strong>
                                                        {
                                                            success.candidate
                                                                ?.full_name
                                                        }
                                                    </strong>{" "}
                                                    has been added to your
                                                    pipeline.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ borderRadius: 0 }}
                                    onClick={handleDone}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm font-bold uppercase tracking-wider text-base-content/60 mb-6">
                                Invite a candidate to join your pipeline
                            </p>

                            {/* Error Alert */}
                            {error && (
                                <div className="bg-error/10 border-l-4 border-error p-4 mb-4">
                                    <div className="flex gap-3 items-start">
                                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-lg mt-0.5" />
                                        <div className="flex-1">
                                            <span className="font-bold text-base-content text-sm">
                                                {error}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Full Name Field */}
                                <div>
                                    <label className="block text-sm font-bold uppercase tracking-wider text-base-content/60 mb-2">
                                        Full Name{" "}
                                        <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        style={{ borderRadius: 0 }}
                                        value={formData.full_name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                full_name: e.target.value,
                                            })
                                        }
                                        placeholder="John Doe"
                                        required
                                        disabled={submitting}
                                        autoFocus
                                    />
                                </div>

                                {/* Email Field with Autocomplete */}
                                <div className="relative">
                                    <label className="block text-sm font-bold uppercase tracking-wider text-base-content/60 mb-2">
                                        Email{" "}
                                        <span className="text-error">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            className="input input-bordered w-full"
                                            style={{ borderRadius: 0 }}
                                            value={formData.email}
                                            onChange={(e) => {
                                                setSelectedFromSuggestion(false);
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                });
                                            }}
                                            placeholder="john@example.com"
                                            required
                                            disabled={submitting}
                                            autoComplete="off"
                                        />
                                        {searching && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 loading loading-spinner loading-xs text-base-content/40" />
                                        )}
                                    </div>

                                    {/* Suggestions Dropdown */}
                                    {showSuggestions && (
                                        <div
                                            ref={suggestionsRef}
                                            className="absolute w-full mt-1 border-2 border-base-300 bg-base-100 shadow-md max-h-48 overflow-y-auto"
                                        >
                                            <div className="px-3 py-1.5 border-b border-base-200">
                                                <span className="text-xs font-black uppercase tracking-wider text-base-content/40">
                                                    Existing candidates
                                                </span>
                                            </div>
                                            {suggestions.map((s) => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    className="w-full px-3 py-2.5 text-left hover:bg-base-200 flex items-center gap-3 transition-colors"
                                                    onClick={() => handleSelectSuggestion(s)}
                                                >
                                                    <div className="w-8 h-8 bg-primary flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-black text-primary-content">
                                                            {s.full_name?.[0] || "?"}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-base-content truncate">
                                                            {s.full_name}
                                                        </p>
                                                        <p className="text-xs text-base-content/60 font-medium truncate">
                                                            {s.email}
                                                            {s.current_title && ` · ${s.current_title}`}
                                                        </p>
                                                    </div>
                                                    <span className="ml-auto shrink-0 text-xs font-bold text-info uppercase tracking-wider">
                                                        On platform
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {selectedFromSuggestion ? (
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <i className="fa-duotone fa-regular fa-circle-check text-info text-sm" />
                                            <p className="text-xs font-bold text-info uppercase tracking-wider">
                                                Already on Splits Network — invitation will be sent
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs font-bold text-base-content/50 mt-2 uppercase tracking-wider">
                                            An invitation to accept your
                                            representation will be sent to this
                                            address
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 justify-end pt-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        style={{ borderRadius: 0 }}
                                        onClick={handleClose}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{ borderRadius: 0 }}
                                        disabled={
                                            submitting ||
                                            !formData.full_name.trim() ||
                                            !formData.email.trim()
                                        }
                                    >
                                        <ButtonLoading
                                            loading={submitting}
                                            text="Send Invitation"
                                            loadingText="Sending..."
                                        />
                                    </button>
                                </div>
                            </form>

                            {/* Info Box */}
                            <div className="bg-info/10 border-l-4 border-info p-4 mt-6">
                                <div className="flex gap-3 items-start">
                                    <i className="fa-duotone fa-regular fa-handshake text-info text-lg mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-black text-base-content uppercase tracking-wider text-xs mb-1">
                                            What happens next
                                        </p>
                                        <p className="text-base-content/70 font-medium leading-relaxed">
                                            The candidate receives an email
                                            inviting them to join Splits Network
                                            and accept your right-to-represent
                                            agreement. Once they accept, you can
                                            complete their profile and submit
                                            them to open roles.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button
                    type="button"
                    onClick={success ? handleDone : handleClose}
                >
                    {" "}
                    close
                </button>
            </form>
        </dialog>
    );
}
