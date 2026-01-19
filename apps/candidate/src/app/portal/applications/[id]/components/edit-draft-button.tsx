'use client';

import { useState } from 'react';
import ApplicationWizardModal from '@/components/application-wizard-modal';

interface EditDraftButtonProps {
    application: any;
    job: any;
}

export default function EditDraftButton({ application, job }: EditDraftButtonProps) {
    const [showWizard, setShowWizard] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowWizard(true)}
                className="btn btn-primary btn-block"
            >
                <i className="fa-duotone fa-regular fa-edit"></i>
                Edit & Submit Application
            </button>

            {showWizard && (
                <ApplicationWizardModal
                    jobId={job.id}
                    jobTitle={job.title}
                    companyName={job.company?.name || 'Company'}
                    onClose={() => setShowWizard(false)}
                    onSuccess={() => {
                        setShowWizard(false);
                        // Refresh page to show updated application
                        window.location.reload();
                    }}
                    existingApplication={application}
                />
            )}
        </>
    );
}
