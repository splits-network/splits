'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client'; import { useToast } from '@/lib/toast-context'; import StageChangeDropdown from './stage-change-dropdown';
import HireModal from './hire-modal';
import PreScreenRequestModal from './pre-screen-request-modal';
import DocumentList from '@/components/document-list';
import type { ApplicationStage } from '@splits-network/shared-types';

interface Application {
    id: string;
    candidate_id: string;
    job_id: string;
    recruiter_id?: string | null;
    stage: ApplicationStage;
    status: string;
    notes?: string;
    created_at: string;
    candidate?: any;
}

const stages: Array<{ key: ApplicationStage; label: string; color: string }> = [
    { key: 'recruiter_proposed', label: 'Proposed', color: 'badge-secondary' },
    { key: 'recruiter_request', label: 'Recruiter Request', color: 'badge-info' },
    { key: 'draft', label: 'Draft', color: 'badge-accent' },
    { key: 'ai_review', label: 'AI Review', color: 'badge-info' },
    { key: 'screen', label: 'Screen', color: 'badge-info' },
    { key: 'submitted', label: 'Submitted', color: 'badge-neutral' },
    { key: 'interview', label: 'Interview', color: 'badge-primary' },
    { key: 'offer', label: 'Offer', color: 'badge-warning' },
    { key: 'hired', label: 'Hired', color: 'badge-success' },
    { key: 'rejected', label: 'Rejected', color: 'badge-error' },
];

interface CandidatePipelineProps {
    roleId: string;
}

export default function CandidatePipeline({ roleId }: CandidatePipelineProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStage, setSelectedStage] = useState<ApplicationStage | null>(null);
    const [showNeedsPreScreen, setShowNeedsPreScreen] = useState(false);
    const [hireApplication, setHireApplication] = useState<Application | null>(null);
    const [preScreenApplication, setPreScreenApplication] = useState<Application | null>(null);
    const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
    const [companyId, setCompanyId] = useState<string>('');

    useEffect(() => {
        fetchApplications();
    }, [roleId]);

    const fetchApplications = async () => {
        try {
            const token = await getToken();
            if (!token) {
                console.error('No auth token available');
                setLoading(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            const response: any = await client.get('/applications', {
                params: { job_id: roleId }
            });
            // V2 API returns { data: [...] }
            const applicationsData = response.data || [];
            setApplications(applicationsData);

            // Get company ID from first application (if any)
            if (applicationsData.length > 0) {
                const jobResponse: any = await client.get(`/jobs/${roleId}`);
                setCompanyId(jobResponse.data?.company_id || '');
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStageChange = async (applicationId: string, newStage: ApplicationStage) => {
        try {
            const token = await getToken();
            if (!token) {
                console.error('No auth token available');
                return;
            }

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${applicationId}`, { stage: newStage });
            // Refresh applications
            await fetchApplications();
        } catch (error) {
            console.error('Failed to update stage:', error);
            toast.error('Failed to update stage');
        }
    };

    const filteredApplications = showNeedsPreScreen
        ? applications.filter(app => !app.recruiter_id && app.stage === 'submitted')
        : selectedStage
            ? applications.filter(app => app.stage === selectedStage)
            : applications;

    const needsPreScreenCount = applications.filter(app => !app.recruiter_id && app.stage === 'submitted').length;

    if (loading) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <h2 className="font-semibold text-lg mb-3">Candidate Pipeline</h2>

            {/* Stage Tabs */}
            <div className="tabs tabs-boxed bg-base-200 mt-4">
                <a
                    className={`tab ${!showNeedsPreScreen && selectedStage === null ? 'tab-active' : ''}`}
                    onClick={() => {
                        setShowNeedsPreScreen(false);
                        setSelectedStage(null);
                    }}
                >
                    All
                    <span className="badge badge-sm ml-2">{applications.length}</span>
                </a>
                {needsPreScreenCount > 0 && (
                    <a
                        className={`tab ${showNeedsPreScreen ? 'tab-active' : ''}`}
                        onClick={() => {
                            setShowNeedsPreScreen(true);
                            setSelectedStage(null);
                        }}
                    >
                        <i className="fa-solid fa-user-check mr-1"></i>
                        Needs Pre-Screen
                        <span className="badge badge-warning badge-sm ml-2">
                            {needsPreScreenCount}
                        </span>
                    </a>
                )}
                {stages.map((stage) => {
                    const count = applications.filter(app => app.stage === stage.key).length;
                    return (
                        <a
                            key={stage.key}
                            className={`tab ${!showNeedsPreScreen && selectedStage === stage.key ? 'tab-active' : ''}`}
                            onClick={() => {
                                setShowNeedsPreScreen(false);
                                setSelectedStage(stage.key);
                            }}
                        >
                            {stage.label}
                            {count > 0 && (
                                <span className={`badge ${stage.color} badge-sm ml-2`}>
                                    {count}
                                </span>
                            )}
                        </a>
                    );
                })}
            </div>

            {/* Candidates List */}
            {filteredApplications.length > 0 ? (
                <div className="overflow-x-auto mt-6">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Stage</th>
                                <th>Notes</th>
                                <th>Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map((application) => {
                                const stage = stages.find(s => s.key === application.stage);
                                const isExpanded = expandedCandidate === application.candidate_id;
                                return (
                                    <React.Fragment key={application.id}>
                                        <tr className="hover">
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        className="btn btn-ghost btn-xs"
                                                        onClick={() => setExpandedCandidate(isExpanded ? null : application.candidate_id)}
                                                    >
                                                        <i className={`fa-solid fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
                                                    </button>
                                                    <div className="avatar avatar-placeholder">
                                                        <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                            <span className="text-xs">
                                                                {(() => {
                                                                    const names = application.candidate.full_name.split(' ').filter((n: any) => n);
                                                                    return (names[0]?.[0] || '') + (names[names.length - 1]?.[0] || '');
                                                                })().toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {application.candidate.full_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <StageChangeDropdown
                                                    currentStage={application.stage}
                                                    stages={stages}
                                                    onStageChange={(newStage) => handleStageChange(application.id, newStage)}
                                                />
                                            </td>
                                            <td className="max-w-xs truncate">{application.notes || '-'}</td>
                                            <td>{new Date(application.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    {!application.recruiter_id && application.stage === 'submitted' && (
                                                        <button
                                                            className="btn btn-warning btn-xs gap-1"
                                                            onClick={() => setPreScreenApplication(application)}
                                                        >
                                                            <i className="fa-solid fa-user-check"></i>
                                                            Request Pre-Screen
                                                        </button>
                                                    )}
                                                    {application.stage === 'offer' && application.status === 'active' && (
                                                        <button
                                                            className="btn btn-success btn-xs gap-1"
                                                            onClick={() => setHireApplication(application)}
                                                        >
                                                            <i className="fa-solid fa-check"></i>
                                                            Hire
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={6} className="bg-base-200">
                                                    <div className="p-4">
                                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                            <i className="fa-solid fa-paperclip"></i>
                                                            Documents
                                                        </h4>
                                                        <DocumentList
                                                            entityType="candidate"
                                                            entityId={application.candidate_id}
                                                            showUpload={true}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12">
                    <i className="fa-solid fa-users text-6xl text-base-content/20"></i>
                    <h3 className="text-xl font-semibold mt-4">
                        {showNeedsPreScreen
                            ? 'No Applications Need Pre-Screen'
                            : selectedStage
                                ? `No candidates in ${stages.find(s => s.key === selectedStage)?.label}`
                                : 'No Candidates Yet'}
                    </h3>
                    <p className="text-base-content/70 mt-2">
                        {showNeedsPreScreen
                            ? 'All direct applications have been assigned to recruiters'
                            : selectedStage
                                ? 'Try a different stage'
                                : 'Be the first to submit a candidate for this role'}
                    </p>
                </div>
            )}

            {hireApplication && (
                <HireModal
                    application={hireApplication}
                    onClose={() => setHireApplication(null)}
                    onSuccess={() => {
                        setHireApplication(null);
                        fetchApplications();
                    }}
                />
            )}

            {preScreenApplication && (
                <PreScreenRequestModal
                    application={preScreenApplication}
                    jobId={roleId}
                    companyId={companyId}
                    onClose={() => setPreScreenApplication(null)}
                    onSuccess={() => {
                        setPreScreenApplication(null);
                        fetchApplications();
                    }}
                />
            )}
        </>
    );
}
