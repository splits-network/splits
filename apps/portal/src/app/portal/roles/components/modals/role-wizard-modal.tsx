"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import { useToast } from "@/lib/toast-context";
import { FormData, Company } from "../wizards/wizard-steps/types";
import Step1BasicInfo from "../wizards/wizard-steps/step-1-basic-info";
import Step2Compensation from "../wizards/wizard-steps/step-2-compensation";
import Step3Descriptions from "../wizards/wizard-steps/step-3-descriptions";
import Step4Requirements from "../wizards/wizard-steps/step-4-requirements";
import Step5PreScreenQuestions from "../wizards/wizard-steps/step-5-pre-screen-questions";

interface RoleWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    jobId?: string; // For edit mode
    mode?: "create" | "edit";
}

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
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isRecruiterWithCompanyAccess, setIsRecruiterWithCompanyAccess] =
        useState(false);

    const [formData, setFormData] = useState<FormData>({
        // Step 1
        title: "",
        company_id: "",
        location: "",
        department: "",
        status: "active",

        // Step 2
        salary_min: "",
        salary_max: "",
        show_salary_range: true,
        fee_percentage: 20,
        guarantee_days: 0,
        employment_type: "full_time",
        open_to_relocation: false,

        // Step 3
        recruiter_description: "",
        candidate_description: "",

        // Step 4
        mandatory_requirements: [],
        preferred_requirements: [],

        // Step 5
        pre_screen_questions: [],
    });

    const totalSteps = 5;

    const steps = [
        {
            number: 1,
            title: "Basic Info",
            description: "Job title and details",
        },
        { number: 2, title: "Compensation", description: "Salary and fees" },
        { number: 3, title: "Descriptions", description: "Job descriptions" },
        {
            number: 4,
            title: "Requirements",
            description: "Qualifications needed",
        },
        { number: 5, title: "Pre-Screen", description: "Screening questions" },
    ];

    // Load existing job data when in edit mode
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
                // Populate form with existing data
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

    // Load companies when modal opens
    useEffect(() => {
        if (!isOpen || profileLoading) return;

        async function loadCompanies() {
            setLoading(true);
            setError(null);
            setIsRecruiterWithCompanyAccess(false);

            try {
                const token = await getToken();
                if (!token) {
                    throw new Error("Authentication required");
                }

                const client = createAuthenticatedClient(token);

                if (isAdmin) {
                    // Platform admin: fetch all companies
                    const companiesResponse = await client.get<{
                        data: Company[];
                        pagination: any;
                    }>("/companies");
                    setCompanies(companiesResponse.data || []);
                } else if (isRecruiter) {
                    // Recruiter: fetch companies they can manage via recruiter_companies
                    try {
                        const response = await client.get<{
                            data: Company[];
                        }>(
                            "/recruiter-companies/manageable-companies-with-details",
                        );
                        const manageableCompanies = response.data || [];
                        setCompanies(manageableCompanies);
                        setIsRecruiterWithCompanyAccess(
                            manageableCompanies.length > 0,
                        );

                        if (manageableCompanies.length === 1) {
                            // Auto-select if only one company
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
                    // Company user (company_admin, hiring_manager): fetch from organization
                    const organizationId = profile?.organization_ids?.[0];
                    if (organizationId) {
                        try {
                            const companyResponse = await client.get<{
                                data: Company[];
                                pagination: any;
                            }>(`/companies`, {
                                params: {
                                    filters: {
                                        organizationId: organizationId,
                                    },
                                    limit: 1,
                                },
                            });
                            const companies = companyResponse.data || [];
                            setCompanies(companies);

                            if (companies.length > 0) {
                                setFormData((prev) => ({
                                    ...prev,
                                    company_id: companies[0].id,
                                }));
                            }
                        } catch (err: any) {
                            if (
                                err.message?.includes("404") ||
                                err.message?.includes("not found")
                            ) {
                                setError(
                                    "No company found for your organization. Please ask your admin to create one first.",
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

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setError(null);
            setFormData({
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
                recruiter_description: "",
                candidate_description: "",
                mandatory_requirements: [],
                preferred_requirements: [],
                pre_screen_questions: [],
            });
        }
    }, [isOpen]);

    const handleClose = () => {
        if (submitting) return; // Prevent closing during submit
        onClose();
    };

    const handleNext = () => {
        // Validate current step before proceeding
        if (currentStep === 1) {
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
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    };

    const handleBack = () => {
        setError(null);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("Authentication required");
            }

            const client = createAuthenticatedClient(token);

            // Build payload
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

            let targetJobId: string;

            if (mode === "edit" && jobId) {
                // Update existing job
                await client.patch(`/jobs/${jobId}`, payload);
                targetJobId = jobId;
                toast.success("Role updated successfully!");
            } else {
                // Create new job
                const response = await client.post<{ data: { id: string } }>(
                    "/jobs",
                    payload,
                );
                targetJobId = response.data.id;
                toast.success("Role created successfully!");
            }

            // Handle requirements and pre-screen questions for both create and edit modes

            // Build requirements array
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

            // For edit mode, delete existing requirements and pre-screen questions first
            if (mode === "edit") {
                // Get existing requirements and delete them
                try {
                    const existingRequirementsResponse = await client.get<{
                        data: any[];
                    }>(`/job-requirements?job_id=${targetJobId}`);
                    const existingRequirements =
                        existingRequirementsResponse.data || [];

                    if (existingRequirements.length > 0) {
                        await Promise.all(
                            existingRequirements.map((req) =>
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

                // Get existing pre-screen questions and delete them
                try {
                    const existingQuestionsResponse = await client.get<{
                        data: any[];
                    }>(`/job-pre-screen-questions?job_id=${targetJobId}`);
                    const existingQuestions =
                        existingQuestionsResponse.data || [];

                    if (existingQuestions.length > 0) {
                        await Promise.all(
                            existingQuestions.map((q) =>
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

            // Add new requirements if any
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

            // Add new pre-screen questions if any
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

            // Provide more specific error messages
            let errorMessage = "Failed to create role. Please try again.";

            if (err.response?.status === 500) {
                errorMessage =
                    "Server error occurred. The role may have been created successfully, please check your roles list and refresh the page.";
            } else if (err.response?.status === 400) {
                errorMessage =
                    err.response?.data?.error?.message ||
                    "Invalid role data. Please check your inputs and try again.";
            } else if (
                err.message?.includes("Network Error") ||
                err.code === "NETWORK_ERROR"
            ) {
                errorMessage =
                    "Network connection failed. Please check your connection and try again.";
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

    return (
        <dialog className="modal modal-open" open>
            <div className="modal-box max-w-3xl">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold text-2xl">
                            {mode === "edit" ? "Edit Role" : "Create New Role"}
                        </h3>
                        <p className="text-base-content/70 mt-1">
                            {steps[currentStep - 1].description}
                        </p>
                    </div>
                    <button
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        ✕
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="mb-6">
                    <ul className="steps steps-horizontal w-full">
                        {steps.map((step) => (
                            <li
                                key={step.number}
                                className={`step ${currentStep >= step.number ? "step-primary" : ""}`}
                                data-content={
                                    currentStep > step.number
                                        ? "✓"
                                        : step.number
                                }
                            >
                                <span className="hidden sm:inline">
                                    {step.title}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Step Content */}
                <div className="mb-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : (
                        <>
                            {currentStep === 1 && (
                                <Step1BasicInfo
                                    formData={formData}
                                    setFormData={setFormData}
                                    companies={companies}
                                    isAdmin={isAdmin}
                                    isRecruiterWithMultipleCompanies={
                                        isRecruiterWithCompanyAccess &&
                                        companies.length > 1
                                    }
                                />
                            )}
                            {currentStep === 2 && (
                                <Step2Compensation
                                    formData={formData}
                                    setFormData={setFormData}
                                />
                            )}
                            {currentStep === 3 && (
                                <Step3Descriptions
                                    formData={formData}
                                    setFormData={setFormData}
                                />
                            )}
                            {currentStep === 4 && (
                                <Step4Requirements
                                    formData={formData}
                                    setFormData={setFormData}
                                />
                            )}
                            {currentStep === 5 && (
                                <Step5PreScreenQuestions
                                    formData={formData}
                                    setFormData={setFormData}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-base-300">
                    <button
                        className="btn btn-ghost"
                        onClick={currentStep === 1 ? handleClose : handleBack}
                        disabled={submitting}
                    >
                        {currentStep === 1 ? "Cancel" : "Back"}
                    </button>

                    <div className="text-sm text-base-content/60">
                        Step {currentStep} of {totalSteps}
                    </div>

                    {currentStep < totalSteps ? (
                        <button
                            className="btn btn-primary"
                            onClick={handleNext}
                            disabled={loading || submitting}
                        >
                            Next
                            <i className="fa-duotone fa-regular fa-arrow-right ml-2"></i>
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    {mode === "edit"
                                        ? "Updating..."
                                        : "Creating..."}
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-check mr-2"></i>
                                    {mode === "edit"
                                        ? "Update Role"
                                        : "Create Role"}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={handleClose}>
                <button type="button">close</button>
            </form>
        </dialog>
    );
}
