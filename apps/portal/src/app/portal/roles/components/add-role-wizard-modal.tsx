'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useUserProfile } from '@/contexts';
import { useToast } from '@/lib/toast-context';
import { FormData, Company } from './wizard-steps/types';
import Step1BasicInfo from './wizard-steps/step-1-basic-info';
import Step2Compensation from './wizard-steps/step-2-compensation';
import Step3Descriptions from './wizard-steps/step-3-descriptions';
import Step4Requirements from './wizard-steps/step-4-requirements';
import Step5PreScreenQuestions from './wizard-steps/step-5-pre-screen-questions';

interface AddRoleWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddRoleWizardModal({ isOpen, onClose, onSuccess }: AddRoleWizardModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const { profile, isAdmin, isLoading: profileLoading } = useUserProfile();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);

    const [formData, setFormData] = useState<FormData>({
        // Step 1
        title: '',
        company_id: '',
        location: '',
        department: '',
        status: 'active',

        // Step 2
        salary_min: '',
        salary_max: '',
        show_salary_range: true,
        fee_percentage: 20,
        splits_fee_percentage: 50,
        employment_type: 'full_time',
        open_to_relocation: false,

        // Step 3
        recruiter_description: '',
        candidate_description: '',

        // Step 4
        mandatory_requirements: [],
        preferred_requirements: [],

        // Step 5
        pre_screen_questions: [],
    });

    const totalSteps = 5;

    const steps = [
        { number: 1, title: 'Basic Info', description: 'Job title and details' },
        { number: 2, title: 'Compensation', description: 'Salary and fees' },
        { number: 3, title: 'Descriptions', description: 'Job descriptions' },
        { number: 4, title: 'Requirements', description: 'Qualifications needed' },
        { number: 5, title: 'Pre-Screen', description: 'Screening questions' },
    ];

    // Load companies when modal opens
    useEffect(() => {
        if (!isOpen || profileLoading) return;

        async function loadCompanies() {
            setLoading(true);
            setError(null);

            try {
                const token = await getToken();
                if (!token) {
                    throw new Error('Authentication required');
                }

                const client = createAuthenticatedClient(token);

                if (isAdmin) {
                    // Platform admin: fetch all companies
                    const companiesResponse = await client.get<{ data: Company[]; pagination: any }>('/companies');
                    setCompanies(companiesResponse.data || []);
                } else {
                    // Company admin: auto-populate from their organization
                    const organizationId = profile?.organization_ids?.[0];
                    if (organizationId) {
                        try {
                            const companyResponse = await client.get<{ data: Company[]; pagination: any }>(`/companies`, {
                                params: {
                                    filters: {
                                        organizationId: organizationId
                                    },
                                    limit: 1
                                }
                            });
                            const companies = companyResponse.data || [];
                            setCompanies(companies);

                            if (companies.length > 0) {
                                setFormData(prev => ({ ...prev, company_id: companies[0].id }));
                            }
                        } catch (err: any) {
                            if (err.message?.includes('404') || err.message?.includes('not found')) {
                                setError('No company found for your organization. Please ask your admin to create one first.');
                            } else {
                                setError('Error loading company information.');
                            }
                        }
                    }
                }
            } catch (err: any) {
                console.error('Failed to load companies:', err);
                setError(err.message || 'Failed to load companies');
            } finally {
                setLoading(false);
            }
        }

        loadCompanies();
    }, [isOpen, profileLoading, isAdmin, profile, getToken]);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setError(null);
            setFormData({
                title: '',
                company_id: '',
                location: '',
                department: '',
                status: 'active',
                salary_min: '',
                salary_max: '',
                show_salary_range: true,
                fee_percentage: 20,
                splits_fee_percentage: 50,
                employment_type: 'full_time',
                open_to_relocation: false,
                recruiter_description: '',
                candidate_description: '',
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
                setError('Job title is required');
                return;
            }
            if (!formData.company_id) {
                setError('Please select a company');
                return;
            }
        }

        setError(null);
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    };

    const handleBack = () => {
        setError(null);
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const client = createAuthenticatedClient(token);

            // Build requirements array
            const requirements = [
                ...formData.mandatory_requirements.filter(r => r.trim()).map(description => ({
                    type: 'mandatory' as const,
                    description
                })),
                ...formData.preferred_requirements.filter(r => r.trim()).map(description => ({
                    type: 'preferred' as const,
                    description
                }))
            ];

            // Build payload
            const payload: any = {
                title: formData.title,
                company_id: formData.company_id,
                fee_percentage: formData.fee_percentage,
                status: formData.status,
                employment_type: formData.employment_type,
                open_to_relocation: formData.open_to_relocation,
                show_salary_range: formData.show_salary_range,
                splits_fee_percentage: formData.splits_fee_percentage,
            };

            if (formData.location) payload.location = formData.location;
            if (formData.department) payload.department = formData.department;
            if (formData.recruiter_description) payload.recruiter_description = formData.recruiter_description;
            if (formData.candidate_description) payload.candidate_description = formData.candidate_description;
            if (formData.salary_min) payload.salary_min = parseInt(formData.salary_min);
            if (formData.salary_max) payload.salary_max = parseInt(formData.salary_max);

            // Create the job
            const response = await client.post<{ data: { id: string } }>('/jobs', payload);
            const jobId = response.data.id;

            // Add requirements if any
            if (requirements.length > 0) {
                await Promise.all(
                    requirements.map(req =>
                        client.post('/job-requirements', {
                            job_id: jobId,
                            requirement_type: req.type,
                            description: req.description,
                        })
                    )
                );
            }

            // Add pre-screen questions if any
            if (formData.pre_screen_questions.length > 0) {
                await Promise.all(
                    formData.pre_screen_questions
                        .filter(q => q.question.trim())
                        .map(q =>
                            client.post('/job-pre-screen-questions', {
                                job_id: jobId,
                                question: q.question,
                                question_type: q.question_type,
                                is_required: q.is_required,
                                options: q.options || null,
                            })
                        )
                );
            }

            toast.success('Role created successfully!');
            onClose();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error('Failed to create role:', err);
            setError(err.message || 'Failed to create role. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-3xl">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold text-2xl">Create New Role</h3>
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
                                className={`step ${currentStep >= step.number ? 'step-primary' : ''}`}
                                data-content={currentStep > step.number ? '✓' : step.number}
                            >
                                <span className="hidden sm:inline">{step.title}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-solid fa-circle-exclamation"></i>
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
                        {currentStep === 1 ? 'Cancel' : 'Back'}
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
                            <i className="fa-solid fa-arrow-right ml-2"></i>
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
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-check mr-2"></i>
                                    Create Role
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
            <div className="modal-backdrop" onClick={handleClose}></div>
        </div>
    );
}
