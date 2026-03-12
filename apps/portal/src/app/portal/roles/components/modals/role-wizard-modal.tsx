"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import { useToast } from "@/lib/toast-context";
import { BaselWizardModal, BaselAlertBox } from "@splits-network/basel-ui";
import { StepBasicInfo } from "@/app/portal/roles/components/wizards/wizard-steps/step-basic-info";
import { StepCompensation } from "@/app/portal/roles/components/wizards/wizard-steps/step-compensation";
import { StepDescriptions } from "@/app/portal/roles/components/wizards/wizard-steps/step-descriptions";
import { StepRequirements } from "@/app/portal/roles/components/wizards/wizard-steps/step-requirements";
import { StepSkills } from "@/app/portal/roles/components/wizards/wizard-steps/step-skills";
import { StepPreScreen } from "@/app/portal/roles/components/wizards/wizard-steps/step-pre-screen";
import type { FormData, Company, SkillOption } from "@/app/portal/roles/components/wizards/wizard-steps/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
    { label: "Role Details" },
    { label: "Compensation" },
    { label: "Descriptions" },
    { label: "Requirements" },
    { label: "Skills" },
    { label: "Screening" },
];

const INITIAL_FORM: FormData = {
    title: "",
    company_id: "",
    location: "",
    department: "",
    status: "draft",
    is_early_access: false,
    is_priority: false,
    activates_at: "",
    closes_at: "",
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
    required_skills: [],
    preferred_skills: [],
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface RoleWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    jobId?: string;
    mode?: "create" | "edit";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RoleWizardModal({
    isOpen,
    onClose,
    onSuccess,
    jobId,
    mode = "create",
}: RoleWizardModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const { profile, isAdmin, isRecruiter, isCompanyUser, isLoading: profileLoading } = useUserProfile();

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isRecruiterWithCompanyAccess, setIsRecruiterWithCompanyAccess] = useState(false);
    const [userFirms, setUserFirms] = useState<Array<{ id: string; name: string }>>([]);
    const [roleSource, setRoleSource] = useState<"company" | "firm">("company");
    const [formData, setFormData] = useState<FormData>({
        ...INITIAL_FORM,
        status: "draft",
    });

    // Derived state
    const hasFirms = userFirms.length > 0;
    const hasBothOptions = isRecruiterWithCompanyAccess && hasFirms;
    const isOffPlatform = isRecruiter && hasFirms && roleSource === "firm";
    const showCompanySelect = isAdmin || (isRecruiterWithCompanyAccess && companies.length > 1);

    // ── Load existing job data (edit mode) ──

    useEffect(() => {
        if (!isOpen || !jobId || mode !== "edit") return;
        async function loadJobData() {
            setLoading(true);
            try {
                const token = await getToken();
                if (!token) throw new Error("Authentication required");
                const client = createAuthenticatedClient(token);
                const response = await client.get<{ data: any }>(`/jobs/${jobId}`, { params: { include: "requirements,pre_screen_questions" } });
                const job = response.data;
                setFormData({
                    title: job.title || "", company_id: job.company_id || "", location: job.location || "",
                    department: job.department || "", status: job.status || "draft",
                    is_early_access: job.is_early_access || false, is_priority: job.is_priority || false,
                    activates_at: job.activates_at ? new Date(job.activates_at).toISOString().slice(0, 16) : "",
                    closes_at: job.closes_at ? new Date(job.closes_at).toISOString().slice(0, 16) : "",
                    salary_min: job.salary_min?.toString() || "", salary_max: job.salary_max?.toString() || "",
                    show_salary_range: job.show_salary_range ?? true, fee_percentage: job.fee_percentage || 20,
                    guarantee_days: job.guarantee_days || 90, employment_type: job.employment_type || "full_time",
                    open_to_relocation: job.open_to_relocation || false, commute_types: job.commute_types || [],
                    job_level: job.job_level || "", recruiter_description: job.recruiter_description || "",
                    candidate_description: job.candidate_description || "",
                    mandatory_requirements: job.requirements?.filter((r: any) => r.requirement_type === "mandatory").map((r: any) => r.description) || [],
                    preferred_requirements: job.requirements?.filter((r: any) => r.requirement_type === "preferred").map((r: any) => r.description) || [],
                    pre_screen_questions: job.pre_screen_questions?.map((q: any) => ({
                        question: q.question, question_type: q.question_type, is_required: q.is_required,
                        options: q.options, disclaimer: q.disclaimer || "",
                    })) || [],
                    required_skills: [], preferred_skills: [],
                });
                try {
                    const skillsResponse = await client.get<{ data: Array<{ skill_id: string; skill: SkillOption; is_required: boolean }> }>(`/job-skills?job_id=${jobId}`);
                    const jobSkills = skillsResponse.data || [];
                    setFormData(prev => ({
                        ...prev,
                        required_skills: jobSkills.filter(js => js.is_required && js.skill).map(js => js.skill),
                        preferred_skills: jobSkills.filter(js => !js.is_required && js.skill).map(js => js.skill),
                    }));
                } catch (skillsErr) {
                    console.error("Failed to load job skills:", skillsErr);
                }
            } catch (err: any) {
                console.error("Failed to load job:", err);
                setError("Could not load role data. Close and reopen to try again.");
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
                    const companiesResponse = await client.get<{ data: Company[]; pagination: any }>("/companies");
                    setCompanies(companiesResponse.data || []);
                } else if (isRecruiter) {
                    let hasCompanyAccess = false;
                    try {
                        const response = await client.get<{
                            data: Array<{
                                company_id: string;
                                company_name: string;
                                permissions: { can_create_jobs: boolean };
                            }>;
                        }>("/recruiter-companies/my-permissions");
                        const creatableCompanies = (response.data || [])
                            .filter((p) => p.permissions?.can_create_jobs)
                            .map((p) => ({ id: p.company_id, name: p.company_name } as Company));
                        setCompanies(creatableCompanies);
                        hasCompanyAccess = creatableCompanies.length > 0;
                        setIsRecruiterWithCompanyAccess(hasCompanyAccess);
                        if (creatableCompanies.length === 1) {
                            setFormData((prev) => ({ ...prev, company_id: creatableCompanies[0].id }));
                        }
                    } catch (err: any) {
                        console.error("Failed to load company permissions:", err);
                        setCompanies([]);
                    }
                    try {
                        const firmsResponse = await client.get<{ data: Array<{ id: string; name: string }> }>("/firms/my-firms");
                        const firms = (firmsResponse.data || []).map((f) => ({ id: f.id, name: f.name }));
                        setUserFirms(firms);
                        if (firms.length > 0 && !hasCompanyAccess) {
                            setRoleSource("firm");
                            setFormData((prev) => ({ ...prev, source_firm_id: firms[0].id }));
                        }
                    } catch {
                        setUserFirms([]);
                    }
                } else if (isCompanyUser) {
                    const organizationId = profile?.organization_ids?.[0];
                    if (organizationId) {
                        try {
                            const companyResponse = await client.get<{ data: Company[]; pagination: any }>(`/companies`, { params: { filters: { organizationId }, limit: 1 } });
                            const comps = companyResponse.data || [];
                            setCompanies(comps);
                            if (comps.length > 0) setFormData((prev) => ({ ...prev, company_id: comps[0].id }));
                        } catch (err: any) {
                            if (err.message?.includes("404") || err.message?.includes("not found")) {
                                setError("No company found for your organization.");
                            } else {
                                setError("Could not load company data. Refresh the page and try again.");
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, profileLoading, isAdmin, isRecruiter, isCompanyUser, profile]);

    // ── Reset on open ──

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setError(null);
            setRoleSource("company");
            setFormData({ ...INITIAL_FORM, status: "draft" });
        }
    }, [isOpen, isRecruiter]);

    // ── Handlers ──

    const handleChange = useCallback((updates: Partial<FormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    }, []);

    const handleClose = useCallback(() => {
        if (submitting) return;
        onClose();
    }, [submitting, onClose]);

    const handleNext = useCallback(() => {
        if (currentStep === 0) {
            if (!formData.title.trim()) { setError("A job title is required to continue."); return; }
            if (!formData.company_id && !isOffPlatform) { setError("Select a company to continue."); return; }
            if (isOffPlatform && !formData.source_firm_id) { setError("Select a firm to continue."); return; }
            if (formData.is_early_access && !formData.activates_at) { setError("An activation date is required when Early Access is enabled."); return; }
        }
        setError(null);
        setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    }, [currentStep, formData, isOffPlatform]);

    const handleBack = useCallback(() => {
        setError(null);
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    }, []);

    // ── Skills helpers ──

    const searchSkills = useCallback(async (query: string): Promise<SkillOption[]> => {
        const token = await getToken();
        if (!token) return [];
        const client = createAuthenticatedClient(token);
        const response = await client.get<{ data: SkillOption[] }>(`/skills?q=${encodeURIComponent(query)}&limit=10`);
        return response.data || [];
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const createSkill = useCallback(async (name: string): Promise<SkillOption> => {
        const token = await getToken();
        if (!token) throw new Error("Authentication required");
        const client = createAuthenticatedClient(token);
        const response = await client.post<{ data: SkillOption }>("/skills", { name });
        return response.data;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Submit ──

    const handleSubmit = useCallback(async () => {
        setSubmitting(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");
            const client = createAuthenticatedClient(token);
            const payload: any = {
                title: formData.title,
                fee_percentage: isOffPlatform ? Math.max(5, formData.fee_percentage) : formData.fee_percentage,
            };
            if (isOffPlatform && formData.source_firm_id) {
                payload.source_firm_id = formData.source_firm_id;
            } else {
                payload.company_id = formData.company_id;
            }
            if (formData.activates_at) payload.activates_at = new Date(formData.activates_at).toISOString();
            if (formData.closes_at) payload.closes_at = new Date(formData.closes_at).toISOString();
            Object.assign(payload, {
                status: formData.status, is_early_access: formData.is_early_access, is_priority: formData.is_priority,
                employment_type: formData.employment_type,
                open_to_relocation: formData.open_to_relocation, show_salary_range: formData.show_salary_range,
                guarantee_days: formData.guarantee_days,
                pre_screen_questions: formData.pre_screen_questions.filter((q) => q.question.trim()).map((q) => ({
                    question: q.question, question_type: q.question_type, is_required: q.is_required,
                    options: q.options?.length ? q.options : undefined, disclaimer: q.disclaimer?.trim() || undefined,
                })),
            });
            if (formData.location) payload.location = formData.location;
            if (formData.department) payload.department = formData.department;
            if (formData.recruiter_description) payload.recruiter_description = formData.recruiter_description;
            if (formData.candidate_description) payload.candidate_description = formData.candidate_description;
            if (formData.salary_min) payload.salary_min = parseInt(formData.salary_min);
            if (formData.salary_max) payload.salary_max = parseInt(formData.salary_max);
            if (formData.commute_types.length > 0) payload.commute_types = formData.commute_types;
            if (formData.job_level) payload.job_level = formData.job_level;

            // On edit, don't send fee/guarantee — company controls those terms
            if (mode === "edit") {
                delete payload.fee_percentage;
                delete payload.guarantee_days;
            }

            let targetJobId: string;
            if (mode === "edit" && jobId) {
                await client.patch(`/jobs/${jobId}`, payload);
                targetJobId = jobId;
                toast.success("Role updated.");
            } else {
                const response = await client.post<{ data: { id: string } }>("/jobs", payload);
                targetJobId = response.data.id;
                toast.success("Role created.");
            }

            // Handle requirements
            const requirements = [
                ...formData.mandatory_requirements.filter((r) => r.trim()).map((description) => ({ type: "mandatory" as const, description })),
                ...formData.preferred_requirements.filter((r) => r.trim()).map((description) => ({ type: "preferred" as const, description })),
            ];
            if (mode === "edit") {
                await client.put(`/job-requirements/job/${targetJobId}/bulk-replace`, {
                    requirements: requirements.map((req, i) => ({ requirement_type: req.type, description: req.description, sort_order: i })),
                });
            } else if (requirements.length > 0) {
                await Promise.all(requirements.map((req, i) =>
                    client.post("/job-requirements", { job_id: targetJobId, requirement_type: req.type, description: req.description, sort_order: i }),
                ));
            }

            // Handle skills
            const allSkills = [
                ...formData.required_skills.map(s => ({ skill_id: s.id, is_required: true })),
                ...formData.preferred_skills.map(s => ({ skill_id: s.id, is_required: false })),
            ];
            if (allSkills.length > 0 || mode === "edit") {
                await client.put(`/job-skills/job/${targetJobId}/bulk-replace`, { skills: allSkills });
            }

            onClose();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error("Failed to save role:", err);
            let errorMessage = "Failed to save role. Please try again.";
            if (err.response?.status === 500) errorMessage = "Server error. Check your roles list to see if the role was saved, then refresh.";
            else if (err.response?.status === 400) errorMessage = err.response?.data?.error?.message || "Invalid role data. Please check your inputs.";
            else if (err.message?.includes("Network Error") || err.code === "NETWORK_ERROR") errorMessage = "Network connection failed. Please check your connection.";
            else if (err.message?.includes("timeout") || err.code === "TIMEOUT") errorMessage = "Request timed out. Please try again.";
            else if (err.message) errorMessage = err.message;
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    }, [formData, isOffPlatform, mode, jobId, onClose, onSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Render ──

    return (
        <BaselWizardModal
            isOpen={isOpen}
            onClose={handleClose}
            title={mode === "edit" ? "Edit Role" : "Create Role"}
            icon="fa-duotone fa-regular fa-briefcase"
            accentColor="primary"
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
            submitting={submitting}
            nextDisabled={loading}
            submitLabel={mode === "edit" ? "Update Role" : "Create Role"}
            submittingLabel={mode === "edit" ? "Updating..." : "Creating..."}
            maxWidth="max-w-3xl"
        >
            {error && (
                <BaselAlertBox variant="error" className="mb-5">
                    {error}
                    <button type="button" className="text-xs underline ml-2" onClick={() => setError(null)}>
                        Dismiss
                    </button>
                </BaselAlertBox>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <span className="loading loading-spinner loading-lg text-primary mb-4" />
                    <span className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                        Loading role data...
                    </span>
                </div>
            ) : (
                <>
                    {currentStep === 0 && (
                        <StepBasicInfo
                            formData={formData}
                            onChange={handleChange}
                            companies={companies}
                            userFirms={userFirms}
                            roleSource={roleSource}
                            onRoleSourceChange={setRoleSource}
                            isOffPlatform={isOffPlatform}
                            hasBothOptions={hasBothOptions}
                            showCompanySelect={showCompanySelect}
                            mode={mode}
                            isRecruiter={!!isRecruiter}
                        />
                    )}
                    {currentStep === 1 && <StepCompensation formData={formData} onChange={handleChange} mode={mode} />}
                    {currentStep === 2 && <StepDescriptions formData={formData} onChange={handleChange} />}
                    {currentStep === 3 && <StepRequirements formData={formData} onChange={handleChange} />}
                    {currentStep === 4 && (
                        <StepSkills
                            requiredSkills={formData.required_skills}
                            preferredSkills={formData.preferred_skills}
                            onRequiredChange={(skills) => handleChange({ required_skills: skills })}
                            onPreferredChange={(skills) => handleChange({ preferred_skills: skills })}
                            searchFn={searchSkills}
                            createFn={createSkill}
                        />
                    )}
                    {currentStep === 5 && <StepPreScreen formData={formData} onChange={handleChange} />}
                </>
            )}
        </BaselWizardModal>
    );
}
