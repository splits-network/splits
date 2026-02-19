"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import { useToast } from "@/lib/toast-context";
import { MarkdownEditor } from "@splits-network/shared-ui";
import type {
    FormData,
    Company,
    PreScreenQuestion,
} from "@/app/portal/roles/components/wizards/wizard-steps/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
    { label: "Basic Info", icon: "fa-duotone fa-regular fa-briefcase" },
    { label: "Compensation", icon: "fa-duotone fa-regular fa-money-bill-wave" },
    { label: "Descriptions", icon: "fa-duotone fa-regular fa-file-lines" },
    { label: "Requirements", icon: "fa-duotone fa-regular fa-list-check" },
    { label: "Pre-Screen", icon: "fa-duotone fa-regular fa-clipboard-question" },
];

const COMMUTE_OPTIONS = [
    { value: "remote", label: "Remote" },
    { value: "hybrid_1", label: "Hybrid (1 day)" },
    { value: "hybrid_2", label: "Hybrid (2 days)" },
    { value: "hybrid_3", label: "Hybrid (3 days)" },
    { value: "hybrid_4", label: "Hybrid (4 days)" },
    { value: "in_office", label: "In Office" },
];

const JOB_LEVEL_OPTIONS = [
    { value: "", label: "Select Level" },
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior" },
    { value: "lead", label: "Lead" },
    { value: "manager", label: "Manager" },
    { value: "director", label: "Director" },
    { value: "vp", label: "VP" },
    { value: "c_suite", label: "C-Suite" },
];

const EMPLOYMENT_TYPE_OPTIONS = [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "temporary", label: "Temporary" },
];

const GUARANTEE_OPTIONS = [
    { value: "0", label: "No guarantee" },
    { value: "15", label: "15 days" },
    { value: "30", label: "30 days" },
    { value: "60", label: "60 days" },
    { value: "90", label: "90 days" },
];

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "closed", label: "Closed" },
];

const INITIAL_FORM: FormData = {
    title: "",
    company_id: "",
    location: "",
    department: "",
    status: "active",
    salary_min: "",
    salary_max: "",
    show_salary_range: true,
    fee_percentage: 20,
    guarantee_days: 0,
    employment_type: "full_time",
    open_to_relocation: false,
    commute_types: [],
    job_level: "",
    recruiter_description: "",
    candidate_description: "",
    mandatory_requirements: [],
    preferred_requirements: [],
    pre_screen_questions: [],
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface RoleWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    jobId?: string;
    mode?: "create" | "edit";
}

// ─── Pre-Screen Question Card ────────────────────────────────────────────────

function PreScreenQuestionCard({
    question,
    index,
    onUpdate,
    onRemove,
    onAddOption,
    onRemoveOption,
}: {
    question: PreScreenQuestion;
    index: number;
    onUpdate: (
        index: number,
        field: keyof PreScreenQuestion,
        value: any,
    ) => void;
    onRemove: (index: number) => void;
    onAddOption: (questionIndex: number, option: string) => void;
    onRemoveOption: (questionIndex: number, optionIndex: number) => void;
}) {
    const [newOption, setNewOption] = useState("");
    const requiresOptions = ["select", "multi_select"].includes(
        question.question_type,
    );

    const handleAddOption = () => {
        if (newOption.trim()) {
            onAddOption(index, newOption.trim());
            setNewOption("");
        }
    };

    return (
        <div className="border-2 border-base-300 p-4 space-y-3">
            <div className="flex gap-2">
                <fieldset className="fieldset flex-1">
                    <input
                        className="input input-bordered w-full"
                        style={{ borderRadius: 0 }}
                        value={question.question}
                        onChange={(e) =>
                            onUpdate(index, "question", e.target.value)
                        }
                        placeholder="Enter question..."
                    />
                </fieldset>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="btn btn-ghost btn-sm text-error"
                >
                    <i className="fa-duotone fa-regular fa-trash" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <fieldset className="fieldset">
                    <select
                        className="select select-bordered w-full"
                        style={{ borderRadius: 0 }}
                        value={question.question_type}
                        onChange={(e) =>
                            onUpdate(index, "question_type", e.target.value)
                        }
                    >
                        <option value="text">Text</option>
                        <option value="yes_no">Yes/No</option>
                        <option value="select">Select One</option>
                        <option value="multi_select">Multi-Select</option>
                    </select>
                </fieldset>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={question.is_required}
                        onChange={(e) =>
                            onUpdate(index, "is_required", e.target.checked)
                        }
                    />
                    <span className="text-sm font-semibold">Required</span>
                </div>
            </div>

            {requiresOptions && (
                <div className="space-y-2 pl-4 border-l-4 border-primary">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                        <i className="fa-duotone fa-regular fa-list mr-1" />
                        Answer Options
                    </span>

                    {question.options && question.options.length > 0 && (
                        <div className="space-y-1">
                            {question.options.map((option, optIdx) => (
                                <div
                                    key={optIdx}
                                    className="flex gap-2 items-center"
                                >
                                    <span className="text-base-content/60 text-sm font-bold w-5">
                                        {optIdx + 1}.
                                    </span>
                                    <span className="flex-1 bg-base-200 px-3 py-2 text-sm font-semibold text-base-content border-2 border-base-300">
                                        {option}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onRemoveOption(index, optIdx)
                                        }
                                        className="text-error font-black text-xs hover:opacity-70"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <fieldset className="fieldset flex-1">
                            <input
                                className="input input-bordered w-full"
                                style={{ borderRadius: 0 }}
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddOption();
                                    }
                                }}
                                placeholder="Type an option and press Enter..."
                            />
                        </fieldset>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ borderRadius: 0 }}
                            onClick={handleAddOption}
                            disabled={!newOption.trim()}
                        >
                            <i className="fa-duotone fa-regular fa-plus" />
                        </button>
                    </div>

                    {(!question.options || question.options.length < 2) && (
                        <div role="alert" className="alert alert-info">
                            <i className="fa-duotone fa-regular fa-circle-info" />
                            <span className="text-sm">
                                Add at least 2 options for this question type
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RoleWizardModal({
    isOpen,
    onClose,
    onSuccess,
    jobId,
    mode = "create",
}: RoleWizardModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const {
        profile,
        isAdmin,
        isRecruiter,
        isCompanyUser,
        isLoading: profileLoading,
    } = useUserProfile();

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isRecruiterWithCompanyAccess, setIsRecruiterWithCompanyAccess] =
        useState(false);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM);

    const totalSteps = 5;

    // ── Load existing job data (edit mode) ──

    useEffect(() => {
        if (!isOpen || !jobId || mode !== "edit") return;

        async function loadJobData() {
            setLoading(true);
            try {
                const token = await getToken();
                if (!token) throw new Error("Authentication required");

                const client = createAuthenticatedClient(token);
                const response = await client.get<{ data: any }>(
                    `/jobs/${jobId}`,
                    {
                        params: {
                            include: "requirements,pre_screen_questions",
                        },
                    },
                );
                const job = response.data;
                setFormData({
                    title: job.title || "",
                    company_id: job.company_id || "",
                    location: job.location || "",
                    department: job.department || "",
                    status: job.status || "active",
                    salary_min: job.salary_min?.toString() || "",
                    salary_max: job.salary_max?.toString() || "",
                    show_salary_range: job.show_salary_range ?? true,
                    fee_percentage: job.fee_percentage || 20,
                    guarantee_days: job.guarantee_days || 90,
                    employment_type: job.employment_type || "full_time",
                    open_to_relocation: job.open_to_relocation || false,
                    commute_types: job.commute_types || [],
                    job_level: job.job_level || "",
                    recruiter_description: job.recruiter_description || "",
                    candidate_description: job.candidate_description || "",
                    mandatory_requirements:
                        job.requirements
                            ?.filter(
                                (r: any) => r.requirement_type === "mandatory",
                            )
                            .map((r: any) => r.description) || [],
                    preferred_requirements:
                        job.requirements
                            ?.filter(
                                (r: any) => r.requirement_type === "preferred",
                            )
                            .map((r: any) => r.description) || [],
                    pre_screen_questions:
                        job.pre_screen_questions?.map((q: any) => ({
                            question: q.question,
                            question_type: q.question_type,
                            is_required: q.is_required,
                            options: q.options,
                        })) || [],
                });
            } catch (err: any) {
                console.error("Failed to load job:", err);
                setError("Failed to load job data. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        loadJobData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, jobId, mode]);

    // ── Load companies ──

    useEffect(() => {
        if (!isOpen || profileLoading) return;

        async function loadCompanies() {
            setLoading(true);
            setError(null);
            setIsRecruiterWithCompanyAccess(false);

            try {
                const token = await getToken();
                if (!token) throw new Error("Authentication required");

                const client = createAuthenticatedClient(token);

                if (isAdmin) {
                    const companiesResponse = await client.get<{
                        data: Company[];
                        pagination: any;
                    }>("/companies");
                    setCompanies(companiesResponse.data || []);
                } else if (isRecruiter) {
                    try {
                        const response = await client.get<{ data: Company[] }>(
                            "/recruiter-companies/manageable-companies-with-details",
                        );
                        const manageableCompanies = response.data || [];
                        setCompanies(manageableCompanies);
                        setIsRecruiterWithCompanyAccess(
                            manageableCompanies.length > 0,
                        );
                        if (manageableCompanies.length === 1) {
                            setFormData((prev) => ({
                                ...prev,
                                company_id: manageableCompanies[0].id,
                            }));
                        }
                    } catch (err: any) {
                        console.error(
                            "Failed to load manageable companies:",
                            err,
                        );
                        setCompanies([]);
                    }
                } else if (isCompanyUser) {
                    const organizationId = profile?.organization_ids?.[0];
                    if (organizationId) {
                        try {
                            const companyResponse = await client.get<{
                                data: Company[];
                                pagination: any;
                            }>(`/companies`, {
                                params: {
                                    filters: { organizationId },
                                    limit: 1,
                                },
                            });
                            const comps = companyResponse.data || [];
                            setCompanies(comps);
                            if (comps.length > 0) {
                                setFormData((prev) => ({
                                    ...prev,
                                    company_id: comps[0].id,
                                }));
                            }
                        } catch (err: any) {
                            if (
                                err.message?.includes("404") ||
                                err.message?.includes("not found")
                            ) {
                                setError(
                                    "No company found for your organization.",
                                );
                            } else {
                                setError("Error loading company information.");
                            }
                        }
                    }
                }
            } catch (err: any) {
                console.error("Failed to load companies:", err);
                setError(err.message || "Failed to load companies");
            } finally {
                setLoading(false);
            }
        }

        loadCompanies();
    }, [
        isOpen,
        profileLoading,
        isAdmin,
        isRecruiter,
        isCompanyUser,
        profile,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ]);

    // ── Reset on open ──

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setError(null);
            setFormData(INITIAL_FORM);
        }
    }, [isOpen]);

    // ── Handlers ──

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    const handleNext = () => {
        if (currentStep === 0) {
            if (!formData.title.trim()) {
                setError("Job title is required");
                return;
            }
            if (!formData.company_id) {
                setError("Please select a company");
                return;
            }
        }
        setError(null);
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    };

    const handleBack = () => {
        setError(null);
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    // ── Requirements helpers ──

    const addMandatory = () =>
        setFormData((prev) => ({
            ...prev,
            mandatory_requirements: [...prev.mandatory_requirements, ""],
        }));
    const addPreferred = () =>
        setFormData((prev) => ({
            ...prev,
            preferred_requirements: [...prev.preferred_requirements, ""],
        }));
    const updateMandatory = (index: number, value: string) =>
        setFormData((prev) => ({
            ...prev,
            mandatory_requirements: prev.mandatory_requirements.map((r, i) =>
                i === index ? value : r,
            ),
        }));
    const updatePreferred = (index: number, value: string) =>
        setFormData((prev) => ({
            ...prev,
            preferred_requirements: prev.preferred_requirements.map((r, i) =>
                i === index ? value : r,
            ),
        }));
    const removeMandatory = (index: number) =>
        setFormData((prev) => ({
            ...prev,
            mandatory_requirements: prev.mandatory_requirements.filter(
                (_, i) => i !== index,
            ),
        }));
    const removePreferred = (index: number) =>
        setFormData((prev) => ({
            ...prev,
            preferred_requirements: prev.preferred_requirements.filter(
                (_, i) => i !== index,
            ),
        }));

    // ── Pre-screen question helpers ──

    const addQuestion = () =>
        setFormData((prev) => ({
            ...prev,
            pre_screen_questions: [
                ...prev.pre_screen_questions,
                {
                    question: "",
                    question_type: "text",
                    is_required: true,
                    options: [],
                },
            ],
        }));

    const updateQuestion = (
        index: number,
        field: keyof PreScreenQuestion,
        value: any,
    ) =>
        setFormData((prev) => ({
            ...prev,
            pre_screen_questions: prev.pre_screen_questions.map((q, i) => {
                if (i !== index) return q;
                if (
                    field === "question_type" &&
                    !["select", "multi_select"].includes(value)
                ) {
                    return { ...q, [field]: value, options: [] };
                }
                return { ...q, [field]: value };
            }),
        }));

    const removeQuestion = (index: number) =>
        setFormData((prev) => ({
            ...prev,
            pre_screen_questions: prev.pre_screen_questions.filter(
                (_, i) => i !== index,
            ),
        }));

    const addOption = (questionIndex: number, option: string) => {
        if (!option.trim()) return;
        setFormData((prev) => ({
            ...prev,
            pre_screen_questions: prev.pre_screen_questions.map((q, i) =>
                i !== questionIndex
                    ? q
                    : { ...q, options: [...(q.options || []), option] },
            ),
        }));
    };

    const removeOption = (questionIndex: number, optionIndex: number) =>
        setFormData((prev) => ({
            ...prev,
            pre_screen_questions: prev.pre_screen_questions.map((q, i) =>
                i !== questionIndex
                    ? q
                    : {
                          ...q,
                          options: (q.options || []).filter(
                              (_, oi) => oi !== optionIndex,
                          ),
                      },
            ),
        }));

    // ── Commute toggle ──

    const toggleCommute = (value: string) =>
        setFormData((prev) => ({
            ...prev,
            commute_types: prev.commute_types.includes(value)
                ? prev.commute_types.filter((t) => t !== value)
                : [...prev.commute_types, value],
        }));

    // ── Submit ──

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");

            const client = createAuthenticatedClient(token);

            const payload: any = {
                title: formData.title,
                company_id: formData.company_id,
                fee_percentage: formData.fee_percentage,
                status: formData.status,
                employment_type: formData.employment_type,
                open_to_relocation: formData.open_to_relocation,
                show_salary_range: formData.show_salary_range,
                guarantee_days: formData.guarantee_days,
            };

            if (formData.location) payload.location = formData.location;
            if (formData.department) payload.department = formData.department;
            if (formData.recruiter_description)
                payload.recruiter_description = formData.recruiter_description;
            if (formData.candidate_description)
                payload.candidate_description = formData.candidate_description;
            if (formData.salary_min)
                payload.salary_min = parseInt(formData.salary_min);
            if (formData.salary_max)
                payload.salary_max = parseInt(formData.salary_max);
            if (formData.commute_types.length > 0)
                payload.commute_types = formData.commute_types;
            if (formData.job_level) payload.job_level = formData.job_level;

            let targetJobId: string;

            if (mode === "edit" && jobId) {
                await client.patch(`/jobs/${jobId}`, payload);
                targetJobId = jobId;
                toast.success("Role updated successfully!");
            } else {
                const response = await client.post<{ data: { id: string } }>(
                    "/jobs",
                    payload,
                );
                targetJobId = response.data.id;
                toast.success("Role created successfully!");
            }

            // Handle requirements
            const requirements = [
                ...formData.mandatory_requirements
                    .filter((r) => r.trim())
                    .map((description) => ({
                        type: "mandatory" as const,
                        description,
                    })),
                ...formData.preferred_requirements
                    .filter((r) => r.trim())
                    .map((description) => ({
                        type: "preferred" as const,
                        description,
                    })),
            ];

            if (mode === "edit") {
                try {
                    const existingReqs = await client.get<{ data: any[] }>(
                        `/job-requirements?job_id=${targetJobId}`,
                    );
                    if ((existingReqs.data || []).length > 0) {
                        await Promise.all(
                            (existingReqs.data || []).map((req) =>
                                client.delete(`/job-requirements/${req.id}`),
                            ),
                        );
                    }
                } catch (err) {
                    console.warn(
                        "Failed to delete existing requirements:",
                        err,
                    );
                }

                try {
                    const existingQs = await client.get<{ data: any[] }>(
                        `/job-pre-screen-questions?job_id=${targetJobId}`,
                    );
                    if ((existingQs.data || []).length > 0) {
                        await Promise.all(
                            (existingQs.data || []).map((q) =>
                                client.delete(
                                    `/job-pre-screen-questions/${q.id}`,
                                ),
                            ),
                        );
                    }
                } catch (err) {
                    console.warn(
                        "Failed to delete existing pre-screen questions:",
                        err,
                    );
                }
            }

            if (requirements.length > 0) {
                await Promise.all(
                    requirements.map((req) =>
                        client.post("/job-requirements", {
                            job_id: targetJobId,
                            requirement_type: req.type,
                            description: req.description,
                        }),
                    ),
                );
            }

            if (formData.pre_screen_questions.length > 0) {
                await Promise.all(
                    formData.pre_screen_questions
                        .filter((q) => q.question.trim())
                        .map((q) =>
                            client.post("/job-pre-screen-questions", {
                                job_id: targetJobId,
                                question: q.question,
                                question_type: q.question_type,
                                is_required: q.is_required,
                                options: q.options || null,
                            }),
                        ),
                );
            }

            onClose();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error("Failed to create role:", err);

            let errorMessage = "Failed to create role. Please try again.";
            if (err.response?.status === 500) {
                errorMessage =
                    "Server error occurred. Please check your roles list and refresh.";
            } else if (err.response?.status === 400) {
                errorMessage =
                    err.response?.data?.error?.message ||
                    "Invalid role data. Please check your inputs.";
            } else if (
                err.message?.includes("Network Error") ||
                err.code === "NETWORK_ERROR"
            ) {
                errorMessage =
                    "Network connection failed. Please check your connection.";
            } else if (
                err.message?.includes("timeout") ||
                err.code === "TIMEOUT"
            ) {
                errorMessage = "Request timed out. Please try again.";
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // ── Render ──

    const companyOptions = companies.map((c) => ({
        value: c.id,
        label: c.name,
    }));
    const showCompanySelect =
        isAdmin || (isRecruiterWithCompanyAccess && companies.length > 1);

    return (
        <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
            <div className="modal-box max-w-3xl p-0" style={{ borderRadius: 0 }}>
                <div className="p-6">
                    {/* ── Header ── */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-base-300">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-primary">
                                <i className="fa-duotone fa-regular fa-briefcase text-lg text-primary-content" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-wider">
                                    {mode === "edit"
                                        ? "Edit Role"
                                        : "Create New Role"}
                                </h3>
                                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                                    Step {currentStep + 1} of {totalSteps}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={submitting}
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

                    {/* ── Step Label ── */}
                    <div className="flex items-center gap-2 mb-5">
                        <span className="badge badge-primary badge-md">
                            Step {currentStep + 1}
                        </span>
                        <span className="text-md font-bold uppercase tracking-wide">
                            {WIZARD_STEPS[currentStep].label}
                        </span>
                    </div>

                    {/* ── Content ── */}
                    <div className="min-h-[300px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <span className="loading loading-spinner loading-lg text-primary mb-4" />
                                <span className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                    Loading...
                                </span>
                            </div>
                        ) : (
                            <>
                                {/* Step 1: Basic Info */}
                                {currentStep === 0 && (
                                    <div className="space-y-4">
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                Job Title *
                                            </legend>
                                            <input
                                                className="input input-bordered w-full"
                                                style={{ borderRadius: 0 }}
                                                value={formData.title}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        title: e.target.value,
                                                    }))
                                                }
                                                placeholder="e.g., Senior Software Engineer"
                                            />
                                        </fieldset>

                                        {showCompanySelect ? (
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                    Company *
                                                </legend>
                                                <select
                                                    className="select select-bordered w-full"
                                                    style={{ borderRadius: 0 }}
                                                    value={formData.company_id}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            company_id:
                                                                e.target.value,
                                                        }))
                                                    }
                                                >
                                                    <option value="">
                                                        Select a company...
                                                    </option>
                                                    {companyOptions.map(
                                                        (opt) => (
                                                            <option
                                                                key={opt.value}
                                                                value={
                                                                    opt.value
                                                                }
                                                            >
                                                                {opt.label}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </fieldset>
                                        ) : (
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                    Company *
                                                </legend>
                                                <input
                                                    className="input input-bordered w-full"
                                                    style={{ borderRadius: 0 }}
                                                    value={
                                                        companies[0]?.name ||
                                                        "Loading..."
                                                    }
                                                    disabled
                                                    readOnly
                                                />
                                            </fieldset>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                    Location
                                                </legend>
                                                <input
                                                    className="input input-bordered w-full"
                                                    style={{ borderRadius: 0 }}
                                                    value={formData.location}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            location:
                                                                e.target.value,
                                                        }))
                                                    }
                                                    placeholder="e.g., New York, NY or Remote"
                                                />
                                            </fieldset>
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                    Department
                                                </legend>
                                                <input
                                                    className="input input-bordered w-full"
                                                    style={{ borderRadius: 0 }}
                                                    value={formData.department}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            department:
                                                                e.target.value,
                                                        }))
                                                    }
                                                    placeholder="e.g., Engineering"
                                                />
                                            </fieldset>
                                        </div>

                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                Status *
                                            </legend>
                                            <select
                                                className="select select-bordered w-full"
                                                style={{ borderRadius: 0 }}
                                                value={formData.status}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        status: e.target
                                                            .value as any,
                                                    }))
                                                }
                                            >
                                                {STATUS_OPTIONS.map((opt) => (
                                                    <option
                                                        key={opt.value}
                                                        value={opt.value}
                                                    >
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </fieldset>
                                    </div>
                                )}

                                {/* Step 2: Compensation */}
                                {currentStep === 1 && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                    Min Salary (USD)
                                                </legend>
                                                <input
                                                    className="input input-bordered w-full"
                                                    style={{ borderRadius: 0 }}
                                                    type="number"
                                                    value={formData.salary_min}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            salary_min:
                                                                e.target.value,
                                                        }))
                                                    }
                                                    placeholder="100000"
                                                />
                                            </fieldset>
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                    Max Salary (USD)
                                                </legend>
                                                <input
                                                    className="input input-bordered w-full"
                                                    style={{ borderRadius: 0 }}
                                                    type="number"
                                                    value={formData.salary_max}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            salary_max:
                                                                e.target.value,
                                                        }))
                                                    }
                                                    placeholder="150000"
                                                />
                                            </fieldset>
                                        </div>

                                        <div className="flex items-center justify-between border-2 border-base-300 p-4">
                                            <span className="font-bold text-sm uppercase tracking-wider">
                                                Show salary range to candidates
                                            </span>
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-primary"
                                                checked={
                                                    formData.show_salary_range
                                                }
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        show_salary_range:
                                                            e.target.checked,
                                                    }))
                                                }
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                    Fee Percentage *
                                                </legend>
                                                <input
                                                    className="input input-bordered w-full"
                                                    style={{ borderRadius: 0 }}
                                                    type="number"
                                                    value={formData.fee_percentage.toString()}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            fee_percentage:
                                                                parseFloat(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                        }))
                                                    }
                                                    placeholder="20"
                                                />
                                            </fieldset>
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                    Guarantee Period *
                                                </legend>
                                                <select
                                                    className="select select-bordered w-full"
                                                    style={{ borderRadius: 0 }}
                                                    value={(
                                                        formData.guarantee_days ??
                                                        0
                                                    ).toString()}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            guarantee_days:
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                    10,
                                                                ),
                                                        }))
                                                    }
                                                >
                                                    {GUARANTEE_OPTIONS.map(
                                                        (opt) => (
                                                            <option
                                                                key={opt.value}
                                                                value={
                                                                    opt.value
                                                                }
                                                            >
                                                                {opt.label}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </fieldset>
                                        </div>

                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                Employment Type *
                                            </legend>
                                            <select
                                                className="select select-bordered w-full"
                                                style={{ borderRadius: 0 }}
                                                value={formData.employment_type}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        employment_type: e
                                                            .target
                                                            .value as FormData["employment_type"],
                                                    }))
                                                }
                                            >
                                                {EMPLOYMENT_TYPE_OPTIONS.map(
                                                    (opt) => (
                                                        <option
                                                            key={opt.value}
                                                            value={opt.value}
                                                        >
                                                            {opt.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </fieldset>

                                        <div>
                                            <span className="block font-bold text-sm uppercase tracking-wider mb-3">
                                                Commute Type
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {COMMUTE_OPTIONS.map((opt) => {
                                                    const selected =
                                                        formData.commute_types.includes(
                                                            opt.value,
                                                        );
                                                    return (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() =>
                                                                toggleCommute(
                                                                    opt.value,
                                                                )
                                                            }
                                                            style={{
                                                                borderRadius: 0,
                                                            }}
                                                            className={`btn btn-sm ${
                                                                selected
                                                                    ? "btn-primary"
                                                                    : "btn-outline"
                                                            }`}
                                                        >
                                                            {selected && (
                                                                <i className="fa-solid fa-check mr-1 text-[10px]" />
                                                            )}
                                                            {opt.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold">
                                                Job Level
                                            </legend>
                                            <select
                                                className="select select-bordered w-full"
                                                style={{ borderRadius: 0 }}
                                                value={formData.job_level}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        job_level:
                                                            e.target.value,
                                                    }))
                                                }
                                            >
                                                {JOB_LEVEL_OPTIONS.map(
                                                    (opt) => (
                                                        <option
                                                            key={opt.value}
                                                            value={opt.value}
                                                        >
                                                            {opt.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </fieldset>

                                        <div className="flex items-center justify-between border-2 border-base-300 p-4">
                                            <span className="font-bold text-sm uppercase tracking-wider">
                                                Open to relocation
                                            </span>
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-primary"
                                                checked={
                                                    formData.open_to_relocation
                                                }
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        open_to_relocation:
                                                            e.target.checked,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Descriptions */}
                                {currentStep === 2 && (
                                    <div className="space-y-5">
                                        <div role="alert" className="alert alert-info">
                                            <i className="fa-duotone fa-regular fa-circle-info" />
                                            <span className="text-sm">
                                                Two descriptions for different
                                                audiences. Recruiter-facing
                                                notes stay internal.
                                                Candidate-facing description is
                                                public.
                                            </span>
                                        </div>

                                        <fieldset>
                                            <label className="block font-bold text-sm uppercase tracking-wider mb-2">
                                                Recruiter-Facing Description
                                            </label>
                                            <MarkdownEditor
                                                value={
                                                    formData.recruiter_description
                                                }
                                                onChange={(value) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        recruiter_description:
                                                            value,
                                                    }))
                                                }
                                                placeholder="Internal notes for recruiters: pain points, urgency, ideal candidate profile..."
                                                helperText="Internal notes only recruiters will see"
                                                height={160}
                                            />
                                        </fieldset>

                                        <fieldset>
                                            <label className="block font-bold text-sm uppercase tracking-wider mb-2">
                                                Candidate-Facing Description
                                            </label>
                                            <MarkdownEditor
                                                value={
                                                    formData.candidate_description
                                                }
                                                onChange={(value) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        candidate_description:
                                                            value,
                                                    }))
                                                }
                                                placeholder="Public job description: responsibilities, team info, company culture..."
                                                helperText="Public description candidates will see"
                                                height={160}
                                            />
                                        </fieldset>
                                    </div>
                                )}

                                {/* Step 4: Requirements */}
                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <div role="alert" className="alert alert-info">
                                            <i className="fa-duotone fa-regular fa-circle-info" />
                                            <span className="text-sm">
                                                Mandatory requirements are
                                                must-haves. Preferred
                                                requirements make candidates
                                                more competitive.
                                            </span>
                                        </div>

                                        {/* Mandatory */}
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <div>
                                                    <h4 className="font-black text-sm uppercase tracking-wider">
                                                        Mandatory Requirements
                                                    </h4>
                                                    <span className="text-xs text-base-content/50 font-semibold">
                                                        Must-have qualifications
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm"
                                                    style={{ borderRadius: 0 }}
                                                    onClick={addMandatory}
                                                >
                                                    <i className="fa-duotone fa-regular fa-plus mr-1" />
                                                    Add
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {formData.mandatory_requirements
                                                    .length === 0 ? (
                                                    <p className="text-base-content/40 text-sm font-semibold py-6 text-center border-2 border-dashed border-base-300">
                                                        No mandatory requirements
                                                        added yet
                                                    </p>
                                                ) : (
                                                    formData.mandatory_requirements.map(
                                                        (req, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex gap-2"
                                                            >
                                                                <input
                                                                    className="input input-bordered flex-1"
                                                                    style={{
                                                                        borderRadius: 0,
                                                                    }}
                                                                    value={req}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateMandatory(
                                                                            idx,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="e.g., 5+ years of React experience"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-ghost btn-sm text-error"
                                                                    onClick={() =>
                                                                        removeMandatory(
                                                                            idx,
                                                                        )
                                                                    }
                                                                >
                                                                    <i className="fa-duotone fa-regular fa-trash" />
                                                                </button>
                                                            </div>
                                                        ),
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        {/* Preferred */}
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <div>
                                                    <h4 className="font-black text-sm uppercase tracking-wider">
                                                        Preferred Requirements
                                                    </h4>
                                                    <span className="text-xs text-base-content/50 font-semibold">
                                                        Nice-to-have
                                                        qualifications
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm"
                                                    style={{ borderRadius: 0 }}
                                                    onClick={addPreferred}
                                                >
                                                    <i className="fa-duotone fa-regular fa-plus mr-1" />
                                                    Add
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {formData.preferred_requirements
                                                    .length === 0 ? (
                                                    <p className="text-base-content/40 text-sm font-semibold py-6 text-center border-2 border-dashed border-base-300">
                                                        No preferred requirements
                                                        added yet
                                                    </p>
                                                ) : (
                                                    formData.preferred_requirements.map(
                                                        (req, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex gap-2"
                                                            >
                                                                <input
                                                                    className="input input-bordered flex-1"
                                                                    style={{
                                                                        borderRadius: 0,
                                                                    }}
                                                                    value={req}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updatePreferred(
                                                                            idx,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="e.g., Experience with GraphQL"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-ghost btn-sm text-error"
                                                                    onClick={() =>
                                                                        removePreferred(
                                                                            idx,
                                                                        )
                                                                    }
                                                                >
                                                                    <i className="fa-duotone fa-regular fa-trash" />
                                                                </button>
                                                            </div>
                                                        ),
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Pre-Screen Questions */}
                                {currentStep === 4 && (
                                    <div className="space-y-4">
                                        <div role="alert" className="alert alert-info">
                                            <i className="fa-duotone fa-regular fa-circle-info" />
                                            <span className="text-sm">
                                                Screen candidates upfront with
                                                custom questions. Types: Text,
                                                Yes/No, Select, Multi-Select.
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-black text-sm uppercase tracking-wider">
                                                    Questions for Candidates
                                                </h4>
                                                <span className="text-xs text-base-content/50 font-semibold">
                                                    e.g., eligibility,
                                                    clearance, relocation
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm"
                                                style={{ borderRadius: 0 }}
                                                onClick={addQuestion}
                                            >
                                                <i className="fa-duotone fa-regular fa-plus mr-1" />
                                                Add Question
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {formData.pre_screen_questions
                                                .length === 0 ? (
                                                <p className="text-base-content/40 text-sm font-semibold py-10 text-center border-2 border-dashed border-base-300">
                                                    No pre-screen questions added
                                                    yet
                                                </p>
                                            ) : (
                                                formData.pre_screen_questions.map(
                                                    (question, idx) => (
                                                        <PreScreenQuestionCard
                                                            key={idx}
                                                            question={question}
                                                            index={idx}
                                                            onUpdate={
                                                                updateQuestion
                                                            }
                                                            onRemove={
                                                                removeQuestion
                                                            }
                                                            onAddOption={
                                                                addOption
                                                            }
                                                            onRemoveOption={
                                                                removeOption
                                                            }
                                                        />
                                                    ),
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── Footer Navigation ── */}
                    <div className="mt-6 pt-4 border-t-2 border-base-300 flex items-center justify-between">
                        <button
                            type="button"
                            className="btn btn-neutral"
                            style={{ borderRadius: 0 }}
                            onClick={
                                currentStep === 0 ? handleClose : handleBack
                            }
                            disabled={submitting}
                        >
                            {currentStep === 0 ? (
                                "Cancel"
                            ) : (
                                <>
                                    <i className="fa-solid fa-arrow-left mr-1" />
                                    Back
                                </>
                            )}
                        </button>

                        <span className="text-xs font-bold text-base-content/40 uppercase tracking-wider">
                            Step {currentStep + 1} of {totalSteps}
                        </span>

                        {currentStep < totalSteps - 1 ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ borderRadius: 0 }}
                                onClick={handleNext}
                                disabled={loading || submitting}
                            >
                                Next
                                <i className="fa-solid fa-arrow-right ml-1" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ borderRadius: 0 }}
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm" />
                                        {mode === "edit"
                                            ? "Updating..."
                                            : "Creating..."}
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-check mr-1" />
                                        {mode === "edit"
                                            ? "Update Role"
                                            : "Create Role"}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={handleClose}>close</button>
            </form>
        </dialog>
    );
}
