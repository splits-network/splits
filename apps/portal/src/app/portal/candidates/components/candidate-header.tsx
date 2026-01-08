'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUserProfile } from '@/contexts';
import AddCandidateModal from './add-candidate-modal';
import { useToast } from '@/lib/toast-context';

interface Candidate {
    id: string;
    full_name: string;
    email: string;
    [key: string]: any;
}

export default function CandidateHeader() {
    const toast = useToast();
    const { isAdmin, profile } = useUserProfile();
    const [showAddModal, setShowAddModal] = useState(false);

    // Check if user can create candidates (company_admin or platform_admin)
    const canCreateCandidate = isAdmin || profile?.roles?.includes('recruiter');

    const handleAddCandidateSuccess = (newCandidate: Candidate) => {
        setShowAddModal(false);
        // Optionally, you can add logic here to refresh the candidate list or show a success message
        toast.success('Invitation sent to candidate successfully!');
    };

    return (
        <>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Candidates</h1>
                    <p className="text-base-content/70 mt-1">
                        Browse and manage candidates in your organization
                    </p>
                </div>
                {canCreateCandidate && (
                    <button
                        className="btn btn-primary gap-2"
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="fa-solid fa-plus"></i>
                        New Candidate
                    </button>
                )}
            </div>

            {/* Add Candidate Modal */}
            <AddCandidateModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddCandidateSuccess}
            />
        </>
    );
}