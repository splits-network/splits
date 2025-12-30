'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getJob, getPreScreenQuestions, getMyDocuments, submitApplication } from '@/lib/api-client';
import StepIndicator from '@/components/application-wizard/step-indicator';
import StepDocuments from '@/components/application-wizard/step-documents';
import StepQuestions from '@/components/application-wizard/step-questions';
import StepReview from '@/components/application-wizard/step-review';

interface ApplicationWizardModalProps {
    jobId: string;
    jobTitle: string;
    companyName: string;
    onClose: () => void;
    onSuccess?: (applicationId: string) => void;
}

export default function ApplicationWizardModal({
    jobId,
    jobTitle,
    companyName,
    onClose,
    onSuccess,
}: ApplicationWizardModalProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [job, setJob] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [localDocuments, setLocalDocuments] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        documents: {
            selected: [] as string[],
            primary_resume_id: null as string | null,
        },
        pre_screen_answers: [] as Array<{ question_id: string; answer: string | string[] | boolean }>,
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasQuestions = questions.length > 0;
    const totalSteps = hasQuestions ? 3 : 2;

    const steps = [
        { number: 1, title: 'Documents', description: 'Select your resume' },
        ...(hasQuestions ? [{ number: 2, title: 'Questions', description: 'Answer pre-screening questions' }] : []),
        { number: totalSteps, title: 'Review', description: 'Review and submit' },
    ];

    // Load initial data
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError(null);

            try {
                const token = await getToken();
                if (!token) {
                    throw new Error('Authentication required');
                }

                const [jobResponse, questionsResponse, documentsResponse] = await Promise.all([
                    getJob(jobId, token),
                    getPreScreenQuestions(jobId, token),
                    getMyDocuments(token),
                ]);

                const jobData = (jobResponse as any).data;
                const questionsData = (questionsResponse as any).data || [];
                const documentsData = Array.isArray(documentsResponse)
                    ? documentsResponse
                    : ((documentsResponse as any).data || []);

                setJob(jobData);
                setQuestions(questionsData);
                setDocuments(documentsData);
                setLocalDocuments(documentsData);
            } catch (err: any) {
                console.error('Failed to load application data:', err);
                setError(err.message || 'Failed to load application data');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [jobId, getToken]);

    const handleNext = () => {
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

            const result = await submitApplication(
                {
                    job_id: jobId,
                    document_ids: formData.documents.selected,
                    primary_resume_id: formData.documents.primary_resume_id!,
                    pre_screen_answers: formData.pre_screen_answers,
                    notes: formData.notes,
                },
                token
            );

            const applicationId = (result as any).data.application.id;

            // Call success callback if provided
            if (onSuccess) {
                onSuccess(applicationId);
            }

            // Close modal and navigate
            onClose();
            router.push(`/applications?success=true&application=${applicationId}`);
        } catch (err: any) {
            console.error('Failed to submit application:', err);
            setError(err.message || 'Failed to submit application');
            setSubmitting(false);
        }
    };

    const renderStep = () => {
        if (!job) return null;

        switch (currentStep) {
            case 1:
                return (
                    <StepDocuments
                        documents={localDocuments}
                        selected={formData.documents.selected}
                        primaryResumeId={formData.documents.primary_resume_id}
                        onChange={(docs: any) => setFormData({ ...formData, documents: docs })}
                        onNext={handleNext}
                        onDocumentsUpdated={setLocalDocuments}
                    />
                );
            case 2:
                if (hasQuestions) {
                    return (
                        <StepQuestions
                            questions={questions}
                            answers={formData.pre_screen_answers}
                            onChange={(answers: any) => setFormData({ ...formData, pre_screen_answers: answers })}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    );
                } else {
                    return (
                        <StepReview
                            job={job}
                            documents={documents}
                            selectedDocuments={formData.documents.selected}
                            primaryResumeId={formData.documents.primary_resume_id}
                            questions={questions}
                            answers={formData.pre_screen_answers}
                            additionalNotes={formData.notes}
                            onSubmit={handleSubmit}
                            onBack={handleBack}
                        />
                    );
                }
            case 3:
                return (
                    <StepReview
                        job={job}
                        documents={documents}
                        selectedDocuments={formData.documents.selected}
                        primaryResumeId={formData.documents.primary_resume_id}
                        questions={questions}
                        answers={formData.pre_screen_answers}
                        additionalNotes={formData.notes}
                        onSubmit={handleSubmit}
                        onBack={handleBack}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-base-300">
                    <div>
                        <h2 className="text-2xl font-bold">Apply to {jobTitle}</h2>
                        <p className="text-base-content/70 mt-1">at {companyName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost"
                        disabled={submitting}
                    >
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <span className="loading loading-spinner loading-lg"></span>
                            <p className="mt-4 text-base-content/70">Loading application form...</p>
                        </div>
                    ) : error && !job ? (
                        <div className="alert alert-error">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <div>
                                <p className="font-bold">Failed to load application</p>
                                <p>{error}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Error Alert */}
                            {error && (
                                <div className="alert alert-error">
                                    <i className="fa-solid fa-circle-exclamation"></i>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Step Indicator */}
                            <StepIndicator steps={steps} currentStep={currentStep} />

                            {/* Step Content */}
                            <div className="bg-base-100">
                                {renderStep()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Backdrop */}
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
}
