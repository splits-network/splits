"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { MarkdownEditor, MarkdownRenderer } from "@splits-network/shared-ui";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubmitCandidateModalProps {
    roleId: string;
    roleTitle: string;
    companyName?: string;
    onClose: () => void;
    onSuccess?: () => void;
}

interface Candidate {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    location?: string;
    current_title?: string;
    current_company?: string;
    linkedin_url?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
    { label: "Select Candidate" },
    { label: "Proposal Details" },
    { label: "Review" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function SubmitCandidateModal({
    roleId,
    roleTitle,
    companyName,
    onClose,
    onSuccess,
}: SubmitCandidateModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Wizard state
    const [currentStep, setCurrentStep] = useState(0);
    const [mode, setMode] = useState<"select" | "new">("select");
    const [selectedCandidate, setSelectedCandidate] =
        useState<Candidate | null>(null);
    const [pitch, setPitch] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Candidate selection state
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [candidatesLoading, setCandidatesLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 25;

    // New candidate form
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        location: "",
        current_title: "",
        current_company: "",
        linkedin_url: "",
    });

    // ── Debounce search ──

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    // ── Load candidates ──

    useEffect(() => {
        if (currentStep !== 0 || mode !== "select") return;

        async function loadCandidates() {
            try {
                setCandidatesLoading(true);
                setError(null);

                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const params: any = {
                    page,
                    limit,
                    search: debouncedSearch || undefined,
                    sort_by: "created_at",
                    sort_order: "desc",
                };

                const response = await client.get("/candidates", { params });

                if (response.data?.data) {
                    setCandidates(response.data);
                    if (response.data.pagination) {
                        setTotalPages(
                            response.data.pagination.total_pages || 1,
                        );
                        setTotalCount(response.data.pagination.total || 0);
                    }
                } else if (Array.isArray(response.data)) {
                    setCandidates(response.data);
                    setTotalPages(1);
                    setTotalCount(response.data.length);
                } else {
                    setCandidates([]);
                    setTotalPages(1);
                    setTotalCount(0);
                }

                if (
                    (response.data?.data || response.data)?.length === 0 &&
                    !debouncedSearch
                ) {
                    setMode("new");
                }
            } catch (err: any) {
                console.error("Failed to load candidates:", err);
                setError("Failed to load candidates. Please try again.");
            } finally {
                setCandidatesLoading(false);
            }
        }

        loadCandidates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, mode, page, debouncedSearch]);

    // ── File handling ──

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "text/plain",
            ];
            if (!allowedTypes.includes(file.type)) {
                setError("Please upload a PDF, DOC, DOCX, or TXT file");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError("File size must be less than 10MB");
                return;
            }
            setResumeFile(file);
            setError(null);
        }
    };

    // ── Navigation ──

    const handleNext = () => {
        if (currentStep === 0) {
            if (mode === "select" && !selectedCandidate) {
                setError("Please select a candidate to continue");
                return;
            }
            if (mode === "new") {
                if (!formData.full_name.trim() || !formData.email.trim()) {
                    setError("Please provide candidate name and email");
                    return;
                }
                setSelectedCandidate({
                    id: "new",
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    location: formData.location,
                    current_title: formData.current_title,
                    current_company: formData.current_company,
                    linkedin_url: formData.linkedin_url,
                });
            }
        }
        if (currentStep === 1 && !pitch.trim()) {
            setError("Please provide a pitch for this opportunity");
            return;
        }
        setError(null);
        setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setError(null);
        setCurrentStep((prev) => prev - 1);
    };

    // ── Submit ──

    const handleSubmit = async () => {
        if (!selectedCandidate) return;

        try {
            setSubmitting(true);
            setError(null);

            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            let candidateId: string | undefined;
            let applicationId: string | undefined;

            if (mode === "select" && selectedCandidate.id !== "new") {
                candidateId = selectedCandidate.id;
            } else {
                const createResponse: any = await client.post("/applications", {
                    job_id: roleId,
                    ...formData,
                });
                candidateId =
                    createResponse.data?.candidate?.id ||
                    createResponse.candidate?.id;
            }

            if (candidateId) {
                const applicationResponse: any = await client.post(
                    "/applications",
                    {
                        job_id: roleId,
                        candidate_id: candidateId,
                        stage: "recruiter_proposed",
                        application_source: "recruiter",
                    },
                );
                applicationId =
                    applicationResponse.data?.id || applicationResponse.id;
            }

            if (!applicationId) {
                throw new Error(
                    "Could not create application for this proposal",
                );
            }

            if (pitch.trim()) {
                try {
                    await client.post(
                        `/applications/${applicationId}/notes`,
                        {
                            created_by_type: "candidate_recruiter",
                            note_type: "note",
                            visibility: "shared",
                            message_text: pitch.trim(),
                        },
                    );
                } catch (noteError: any) {
                    console.warn("Failed to create pitch note:", noteError);
                }
            }

            if (resumeFile && candidateId) {
                const uploadFormData = new FormData();
                uploadFormData.append("file", resumeFile);
                uploadFormData.append("entity_type", "candidate");
                uploadFormData.append("entity_id", candidateId);
                uploadFormData.append("document_type", "resume");
                await client.post("/documents", uploadFormData);
            }

            toast.success(
                `Opportunity sent to ${selectedCandidate.full_name}! They'll receive an email notification.`,
            );
            onClose();
            onSuccess?.();
        } catch (err: any) {
            console.error("Failed to submit candidate:", err);
            let errorMessage =
                err.message || "Failed to send opportunity to candidate";
            if (
                errorMessage.includes("already has an active application")
            ) {
                errorMessage = `${selectedCandidate.full_name} already has an active application for this role.`;
            } else if (errorMessage.includes("HTTP 409")) {
                errorMessage = `${selectedCandidate.full_name} already has an active application for this role. You cannot submit the same candidate twice.`;
            }
            setError(errorMessage);
            setSubmitting(false);
        }
    };

    // ── Render ──

    return (
        <dialog className="modal modal-open">
            <div
                className="modal-box max-w-4xl p-0"
                style={{ borderRadius: 0 }}
            >
                <div className="p-6">
                    {/* ── Header ── */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-base-300">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-secondary">
                                <i className="fa-duotone fa-regular fa-user-plus text-lg text-secondary-content" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-wider">
                                    Submit Candidate
                                </h3>
                                <p className="text-xs font-semibold text-base-content/50">
                                    {roleTitle}
                                    {companyName
                                        ? ` \u2022 ${companyName}`
                                        : ""}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-ghost"
                            aria-label="Close"
                        >
                            <i className="fa-solid fa-xmark" />
                        </button>
                    </div>

                    {/* ── Step Progress ── */}
                    <ul className="steps steps-horizontal w-full text-xs mb-6">
                        {WIZARD_STEPS.map((step, i) => (
                            <li
                                key={i}
                                className={`step ${i <= currentStep ? "step-primary" : ""}`}
                            >
                                <span className="hidden sm:inline text-[10px] uppercase tracking-[0.15em] font-bold">
                                    {step.label}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* ── Error ── */}
                    {error && (
                        <div className="mb-4">
                            <div role="alert" className="alert alert-error">
                                <i className="fa-duotone fa-regular fa-circle-xmark" />
                                <span className="text-sm flex-1">{error}</span>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-xs"
                                    onClick={() => setError(null)}
                                >
                                    <i className="fa-solid fa-xmark" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Content ── */}
                    <div className="min-h-[300px] max-h-[55vh] overflow-y-auto">
                        {/* Step 1: Select / Create Candidate */}
                        {currentStep === 0 && (
                            <div className="space-y-4">
                                {/* Mode Toggle */}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setMode("select")}
                                        style={{ borderRadius: 0 }}
                                        className={`btn flex-1 ${
                                            mode === "select"
                                                ? "btn-primary"
                                                : "btn-outline"
                                        }`}
                                    >
                                        <i className="fa-duotone fa-regular fa-user-check" />
                                        Select Existing
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode("new")}
                                        style={{ borderRadius: 0 }}
                                        className={`btn flex-1 ${
                                            mode === "new"
                                                ? "btn-primary"
                                                : "btn-outline"
                                        }`}
                                    >
                                        <i className="fa-duotone fa-regular fa-user-plus" />
                                        Add New
                                    </button>
                                </div>

                                {mode === "select" ? (
                                    <>
                                        {/* Search */}
                                        <div className="relative">
                                            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                                            <input
                                                className="input input-bordered w-full pl-9 bg-base-200 border-base-300"
                                                style={{ borderRadius: 0 }}
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Search by name, email, title, company..."
                                            />
                                        </div>
                                        {candidatesLoading && debouncedSearch && (
                                            <span className="text-xs font-bold text-base-content/40 uppercase tracking-wider">
                                                <i className="fa-duotone fa-regular fa-spinner-third fa-spin mr-1" />
                                                Searching...
                                            </span>
                                        )}

                                        {/* Candidates List */}
                                        {candidatesLoading ? (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <span className="loading loading-spinner loading-lg text-primary mb-3" />
                                                <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                                                    Loading candidates...
                                                </span>
                                            </div>
                                        ) : candidates.length === 0 ? (
                                            <div className="py-8 text-center border-2 border-dashed border-base-300">
                                                <i className="fa-duotone fa-regular fa-users text-3xl text-base-content/20 mb-3" />
                                                <p className="text-sm font-bold text-base-content/50">
                                                    {debouncedSearch
                                                        ? `No candidates matching "${debouncedSearch}". Try a different search or add a new candidate.`
                                                        : "No candidates found. Please add a new candidate."}
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {debouncedSearch && (
                                                    <span className="text-xs font-bold text-base-content/50">
                                                        Found {totalCount}{" "}
                                                        candidate
                                                        {totalCount !== 1
                                                            ? "s"
                                                            : ""}{" "}
                                                        matching &ldquo;
                                                        {debouncedSearch}&rdquo;
                                                    </span>
                                                )}

                                                <div className="border-2 border-base-300 overflow-hidden">
                                                    {/* Table Header */}
                                                    <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-base-200 text-base-content/40 text-xs font-black uppercase tracking-wider">
                                                        <div className="col-span-1" />
                                                        <div className="col-span-3">
                                                            Name
                                                        </div>
                                                        <div className="col-span-3">
                                                            Email
                                                        </div>
                                                        <div className="col-span-3">
                                                            Current Role
                                                        </div>
                                                        <div className="col-span-2">
                                                            Location
                                                        </div>
                                                    </div>
                                                    {/* Rows */}
                                                    {candidates.map(
                                                        (candidate) => {
                                                            const isSelected =
                                                                selectedCandidate?.id ===
                                                                candidate.id;
                                                            return (
                                                                <div
                                                                    key={
                                                                        candidate.id
                                                                    }
                                                                    onClick={() =>
                                                                        setSelectedCandidate(
                                                                            candidate,
                                                                        )
                                                                    }
                                                                    className={`grid grid-cols-12 gap-2 px-4 py-3 cursor-pointer transition-colors border-b border-base-300 last:border-b-0 ${
                                                                        isSelected
                                                                            ? "bg-primary/5 border-l-4 border-l-primary"
                                                                            : "hover:bg-base-200"
                                                                    }`}
                                                                >
                                                                    <div className="col-span-1 flex items-center">
                                                                        <div
                                                                            className={`w-5 h-5 border-2 flex items-center justify-center ${
                                                                                isSelected
                                                                                    ? "border-primary bg-primary"
                                                                                    : "border-base-300 bg-base-100"
                                                                            }`}
                                                                        >
                                                                            {isSelected && (
                                                                                <i className="fa-solid fa-check text-[8px] text-primary-content" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-span-3">
                                                                        <span className="text-sm font-bold">
                                                                            {
                                                                                candidate.full_name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="col-span-3">
                                                                        <span className="text-sm text-base-content/70">
                                                                            {
                                                                                candidate.email
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="col-span-3">
                                                                        {candidate.current_title ||
                                                                        candidate.current_company ? (
                                                                            <span className="text-sm text-base-content/70">
                                                                                {
                                                                                    candidate.current_title
                                                                                }
                                                                                {candidate.current_title &&
                                                                                    candidate.current_company &&
                                                                                    " \u2022 "}
                                                                                {
                                                                                    candidate.current_company
                                                                                }
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-sm text-base-content/30">
                                                                                Not
                                                                                specified
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="col-span-2">
                                                                        <span className="text-sm text-base-content/70">
                                                                            {candidate.location || (
                                                                                <span className="text-base-content/30">
                                                                                    ---
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>

                                                {/* Pagination */}
                                                {totalPages > 1 && (
                                                    <div className="flex items-center justify-between mt-3">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-ghost"
                                                            style={{
                                                                borderRadius: 0,
                                                            }}
                                                            onClick={() =>
                                                                setPage((p) =>
                                                                    Math.max(
                                                                        1,
                                                                        p - 1,
                                                                    ),
                                                                )
                                                            }
                                                            disabled={page <= 1}
                                                        >
                                                            <i className="fa-solid fa-chevron-left mr-1" />
                                                            Prev
                                                        </button>
                                                        <span className="text-xs font-semibold text-base-content/50">
                                                            Page {page} of{" "}
                                                            {totalPages}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-ghost"
                                                            style={{
                                                                borderRadius: 0,
                                                            }}
                                                            onClick={() =>
                                                                setPage((p) =>
                                                                    Math.min(
                                                                        totalPages,
                                                                        p + 1,
                                                                    ),
                                                                )
                                                            }
                                                            disabled={
                                                                page >=
                                                                totalPages
                                                            }
                                                        >
                                                            Next
                                                            <i className="fa-solid fa-chevron-right ml-1" />
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                ) : (
                                    /* New Candidate Form */
                                    <div className="space-y-4">
                                        <div role="alert" className="alert alert-info">
                                            <i className="fa-duotone fa-regular fa-circle-info" />
                                            <span className="text-sm">
                                                This candidate will be added to
                                                your database and proposed for
                                                this role.
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                    Full Name *
                                                </legend>
                                                <input
                                                    className="input input-bordered w-full"
                                                    style={{ borderRadius: 0 }}
                                                    value={formData.full_name}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            full_name:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="John Doe"
                                                />
                                            </fieldset>
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                    Email *
                                                </legend>
                                                <input
                                                    className="input input-bordered w-full"
                                                    style={{ borderRadius: 0 }}
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            email: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder="john@example.com"
                                                />
                                            </fieldset>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                    Phone
                                                </legend>
                                                <input
                                                    className="input input-bordered w-full"
                                                    style={{ borderRadius: 0 }}
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            phone: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                            </fieldset>
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                    Location
                                                </legend>
                                                <input
                                                    className="input input-bordered w-full"
                                                    style={{ borderRadius: 0 }}
                                                    value={formData.location}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            location:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="City, State/Country"
                                                />
                                            </fieldset>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                    Current Title
                                                </legend>
                                                <input
                                                    className="input input-bordered w-full"
                                                    style={{ borderRadius: 0 }}
                                                    value={
                                                        formData.current_title
                                                    }
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            current_title:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="e.g., Senior Software Engineer"
                                                />
                                            </fieldset>
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                    Current Company
                                                </legend>
                                                <input
                                                    className="input input-bordered w-full"
                                                    style={{ borderRadius: 0 }}
                                                    value={
                                                        formData.current_company
                                                    }
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            current_company:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="e.g., Acme Corp"
                                                />
                                            </fieldset>
                                        </div>

                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                LinkedIn URL
                                            </legend>
                                            <input
                                                className="input input-bordered w-full"
                                                style={{ borderRadius: 0 }}
                                                type="url"
                                                value={formData.linkedin_url}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        linkedin_url:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        </fieldset>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Proposal Details */}
                        {currentStep === 1 && selectedCandidate && (
                            <div className="space-y-5">
                                {/* Selected Candidate Summary */}
                                <div className="flex items-center gap-3 p-4 border-2 border-primary">
                                    <div className="w-10 h-10 flex items-center justify-center bg-primary flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-user text-lg text-primary-content" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-black">
                                            {selectedCandidate.full_name}
                                        </span>
                                        <span className="text-xs text-base-content/50 block">
                                            {selectedCandidate.email}
                                        </span>
                                    </div>
                                </div>

                                {/* Pitch */}
                                <fieldset>
                                    <label className="block font-bold text-sm uppercase tracking-wider mb-2">
                                        Your Pitch to Candidate{" "}
                                        <span className="text-error">*</span>
                                    </label>
                                    <MarkdownEditor
                                        value={pitch}
                                        onChange={setPitch}
                                        placeholder="Why is this role a great fit? This message will be included in the email notification to the candidate..."
                                        helperText={`Explain why you think ${selectedCandidate.full_name} should consider this role.`}
                                        height={200}
                                        maxLength={500}
                                        showCount
                                    />
                                </fieldset>

                                {/* Resume Upload */}
                                <fieldset>
                                    <label className="block font-bold text-sm uppercase tracking-wider mb-2">
                                        Resume{" "}
                                        <span className="text-base-content/40 font-semibold normal-case">
                                            (Optional)
                                        </span>
                                    </label>
                                    <div
                                        className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                                            resumeFile
                                                ? "border-secondary bg-secondary/5"
                                                : "border-base-300 bg-base-200 hover:border-base-content/30"
                                        }`}
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >
                                        {resumeFile ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center bg-secondary">
                                                    <i className="fa-duotone fa-regular fa-file-pdf text-lg text-secondary-content" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold">
                                                        {resumeFile.name}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        className="text-xs font-bold text-error uppercase tracking-wider hover:opacity-70"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setResumeFile(null);
                                                            if (
                                                                fileInputRef.current
                                                            )
                                                                fileInputRef.current.value =
                                                                    "";
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center border-2 border-base-300">
                                                    <i className="fa-duotone fa-regular fa-cloud-arrow-up text-xl text-base-content/60" />
                                                </div>
                                                <p className="text-sm font-bold mb-1">
                                                    Drop your file here or click
                                                    to browse
                                                </p>
                                                <p className="text-xs text-base-content/40 font-semibold">
                                                    PDF, DOC, DOCX, TXT up to
                                                    10MB
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.txt"
                                        onChange={handleFileChange}
                                    />
                                </fieldset>
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {currentStep === 2 && selectedCandidate && (
                            <div className="space-y-4">
                                <div role="alert" className="alert alert-info">
                                    <i className="fa-duotone fa-regular fa-circle-info" />
                                    <span className="text-sm">
                                        Review the details below.{" "}
                                        {selectedCandidate.full_name} will
                                        receive an email notification and must
                                        approve this opportunity.
                                    </span>
                                </div>

                                {/* Role Summary */}
                                <div className="border-2 border-primary p-5">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2 mb-3">
                                        <i className="fa-duotone fa-regular fa-briefcase" />
                                        Role
                                    </h4>
                                    <p className="text-lg font-black">
                                        {roleTitle}
                                    </p>
                                    {companyName && (
                                        <p className="text-sm text-base-content/60">
                                            <i className="fa-duotone fa-regular fa-building mr-1" />
                                            {companyName}
                                        </p>
                                    )}
                                </div>

                                {/* Candidate Summary */}
                                <div className="border-2 border-secondary p-5">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-secondary flex items-center gap-2 mb-3">
                                        <i className="fa-duotone fa-regular fa-user" />
                                        Candidate
                                    </h4>
                                    <div className="space-y-1">
                                        <p className="text-lg font-black">
                                            {selectedCandidate.full_name}
                                        </p>
                                        <p className="text-sm text-base-content/60">
                                            {selectedCandidate.email}
                                        </p>
                                        {(selectedCandidate.current_title ||
                                            selectedCandidate.current_company) && (
                                            <p className="text-sm text-base-content/60">
                                                {
                                                    selectedCandidate.current_title
                                                }
                                                {selectedCandidate.current_title &&
                                                    selectedCandidate.current_company &&
                                                    " \u2022 "}
                                                {
                                                    selectedCandidate.current_company
                                                }
                                            </p>
                                        )}
                                        {selectedCandidate.location && (
                                            <p className="text-sm text-base-content/60">
                                                <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                                {selectedCandidate.location}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Pitch */}
                                {pitch && (
                                    <div className="border-2 border-warning p-5">
                                        <h4 className="text-xs font-black uppercase tracking-wider text-base-content flex items-center gap-2 mb-3">
                                            <i className="fa-duotone fa-regular fa-message text-warning" />
                                            Your Pitch
                                        </h4>
                                        <MarkdownRenderer
                                            content={pitch}
                                            className="prose prose-sm max-w-none text-base-content/80"
                                        />
                                    </div>
                                )}

                                {/* Resume */}
                                {resumeFile && (
                                    <div className="border-2 border-accent p-5">
                                        <h4 className="text-xs font-black uppercase tracking-wider text-accent flex items-center gap-2 mb-3">
                                            <i className="fa-duotone fa-regular fa-file" />
                                            Resume
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <span className="badge badge-accent badge-sm gap-1">
                                                <i className="fa-duotone fa-regular fa-file-pdf" />
                                                {resumeFile.name}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Footer Navigation ── */}
                    <div className="mt-6 pt-4 border-t-2 border-base-300 flex items-center justify-between">
                        <button
                            type="button"
                            className="btn btn-neutral btn-sm"
                            style={{ borderRadius: 0 }}
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <div className="flex items-center gap-3">
                            {currentStep > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-neutral btn-sm"
                                    style={{ borderRadius: 0 }}
                                    onClick={handleBack}
                                    disabled={submitting}
                                >
                                    <i className="fa-solid fa-arrow-left text-xs mr-1" />
                                    Back
                                </button>
                            )}
                            {currentStep < 2 ? (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    style={{ borderRadius: 0 }}
                                    onClick={handleNext}
                                    disabled={
                                        (currentStep === 0 &&
                                            mode === "select" &&
                                            !selectedCandidate) ||
                                        (currentStep === 0 &&
                                            mode === "new" &&
                                            (!formData.full_name.trim() ||
                                                !formData.email.trim()))
                                    }
                                >
                                    Next
                                    <i className="fa-solid fa-arrow-right text-xs ml-1" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    style={{ borderRadius: 0 }}
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-regular fa-paper-plane mr-1" />
                                            Send to Candidate
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}
