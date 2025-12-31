'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProposalAlert } from './proposal-alert';
import { DeclineModal } from './decline-modal';
import { ProposalResponseWizard, type WizardData } from './proposal-response-wizard';
import {
    uploadDocument,
    getJobPreScreenQuestions,
    saveJobPreScreenAnswers,
    updateApplication,
} from '@/lib/api';

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

            const questions = await getJobPreScreenQuestions(application.job_id, token);
            setPreScreenQuestions(Array.isArray(questions) ? questions : []);
            setShowWizard(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load application wizard');
        }
    };

    const handleDecline = async (reason: string, details?: string) => {
        try {
            setError(null);

            await updateApplication(
                application.id,
                {
                    stage: 'rejected',
                    decline_reason: reason,
                    decline_details: details,
                    candidate_notes: details,
                },
                token
            );

            // Refresh page to show updated state
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to decline proposal');
            throw err; // Re-throw so modal can handle it
        }
    };

    const handleCompleteApplication = async (wizardData: WizardData) => {
        try {
            setError(null);
            const candidateId = application.candidate_id;
            if (!candidateId) {
                throw new Error('Missing candidate profile for this application');
            }

            // Step 1: Upload new documents (if any)
            const newDocumentIds: string[] = [];
            for (const file of wizardData.documents) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('document_type', file.name.toLowerCase().includes('resume') ? 'resume' : 'other');
                formData.append('entity_type', 'candidate');
                formData.append('entity_id', candidateId);

                const uploaded = await uploadDocument(formData, token);
                newDocumentIds.push(uploaded.id);
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

            // Step 2: Save pre-screen answers via V2 endpoint
            await saveJobPreScreenAnswers(application.id, wizardData.preScreenAnswers, token);

            // Step 3: Update application via V2 PATCH
            await updateApplication(
                application.id,
                {
                    stage: 'ai_review',
                    document_ids: allDocumentIds,
                    primary_resume_id: primaryResumeId,
                    candidate_notes: wizardData.notes || undefined,
                },
                token
            );

            // Success - refresh page
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to complete application');
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
