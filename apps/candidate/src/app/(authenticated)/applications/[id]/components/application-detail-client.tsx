'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProposalAlert } from './proposal-alert';
import { DeclineModal } from './decline-modal';
import { ProposalResponseWizard, type WizardData } from './proposal-response-wizard';

interface ApplicationDetailClientProps {
    application: any;
    job: any;
    token: string;
}

export function ApplicationDetailClient({ application, job, token }: ApplicationDetailClientProps) {
    const router = useRouter();
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const [preScreenQuestions, setPreScreenQuestions] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isProposed = application.stage === 'recruiter_proposed';
    const isJobActive = job?.status === 'active';
    const isJobClosed = ['closed', 'filled', 'cancelled'].includes(job?.status);

    const handleAccept = async () => {
        try {
            setError(null);

            console.log('Fetching pre-screen questions for job:', application.job_id);

            // Fetch pre-screen questions without changing application state
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/jobs/${application.job_id}/pre-screen-questions`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('Pre-screen questions response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Pre-screen questions result:', result);
                setPreScreenQuestions(result.data || []);
            } else {
                console.warn('Failed to fetch pre-screen questions, status:', response.status);
                // If endpoint doesn't exist or fails, continue with empty questions
                setPreScreenQuestions([]);
            }

            // Open wizard - state change happens when they complete it
            setShowWizard(true);
        } catch (err) {
            console.error('Error fetching pre-screen questions:', err);
            setError(err instanceof Error ? err.message : 'Failed to load application wizard');
            console.error('Load wizard error:', err);
        }
    };

    const handleDecline = async (reason: string, details?: string) => {
        try {
            setError(null);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/applications/${application.id}/decline-proposal`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ reason, details }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to decline proposal');
            }

            // Refresh page to show updated state
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to decline proposal');
            console.error('Decline proposal error:', err);
            throw err; // Re-throw so modal can handle it
        }
    };

    const handleCompleteApplication = async (wizardData: WizardData) => {
        try {
            setError(null);

            // Step 1: Upload new documents (if any)
            const newDocumentIds: string[] = [];
            for (const file of wizardData.documents) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('document_type', file.name.toLowerCase().includes('resume') ? 'resume' : 'other');

                const uploadResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/documents/upload`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: formData,
                    }
                );

                if (!uploadResponse.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }

                const uploadResult = await uploadResponse.json();
                newDocumentIds.push(uploadResult.data.id);
            }

            // Combine existing and newly uploaded document IDs
            const allDocumentIds = [...wizardData.existingDocumentIds, ...newDocumentIds];

            // Determine primary resume ID
            let primaryResumeId: string;
            if (wizardData.primaryExistingDocId) {
                // User selected an existing document as primary
                primaryResumeId = wizardData.primaryExistingDocId;
            } else if (wizardData.primaryResumeIndex !== null) {
                // User selected a newly uploaded document as primary
                primaryResumeId = newDocumentIds[wizardData.primaryResumeIndex];
            } else {
                // Fallback to first document
                primaryResumeId = allDocumentIds[0];
            }

            // Step 2: Accept proposal with all documents and answers
            const acceptResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/applications/${application.id}/accept-proposal`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        document_ids: allDocumentIds,
                        primary_resume_id: primaryResumeId,
                        pre_screen_answers: Object.entries(wizardData.preScreenAnswers).map(
                            ([question_id, answer]) => ({
                                question_id,
                                answer,
                            })
                        ),
                        additional_notes: wizardData.notes || undefined,
                    }),
                }
            );

            if (!acceptResponse.ok) {
                const errorData = await acceptResponse.json();
                throw new Error(errorData.error?.message || 'Failed to accept proposal');
            }
            // TODO: Add endpoint to save answers to existing application

            // Success - refresh page
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to complete application');
            console.error('Complete application error:', err);
            throw err; // Re-throw so wizard can handle it
        }
    };

    if (!isProposed) {
        return null; // No UI changes needed for non-proposed applications
    }

    const recruiterName = application.recruiter
        ? `${application.recruiter.first_name} ${application.recruiter.last_name}`
        : 'Your recruiter';

    return (
        <>
            {error && (
                <div className="alert alert-error mb-6">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {isJobClosed && (
                <div className="alert alert-warning mb-6">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <div>
                        <h3 className="font-bold">This position is no longer available</h3>
                        <p className="text-sm mt-1">The company has closed this position and is not accepting new applications.</p>
                    </div>
                </div>
            )}

            <ProposalAlert
                recruiterName={recruiterName}
                recruiterPitch={application.recruiter_notes}
                onAccept={handleAccept}
                onDecline={() => setShowDeclineModal(true)}
                isDisabled={!isJobActive}
            />

            <DeclineModal
                isOpen={showDeclineModal}
                onClose={() => setShowDeclineModal(false)}
                onSubmit={handleDecline}
                jobTitle={job?.title || 'this position'}
            />

            <ProposalResponseWizard
                isOpen={showWizard}
                onClose={() => setShowWizard(false)}
                applicationId={application.id}
                jobTitle={job?.title || 'this position'}
                preScreenQuestions={preScreenQuestions || []}
                onComplete={handleCompleteApplication}
            />
        </>
    );
}
