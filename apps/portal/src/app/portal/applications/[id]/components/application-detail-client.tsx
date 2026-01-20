'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useAuth } from '@clerk/nextjs';
import { useToast } from '@/lib/toast-context';
import { useUserProfile } from '@/contexts/user-profile-context';
import StageUpdateModal from './stage-update-modal';
import AddNoteModal from './add-note-modal';
import ApplicationTimeline from './application-timeline';
import AIReviewDisplay from './ai-review-display';
import JobDetailModal from './job-detail-modal';
import CandidateDetailModal from './candidate-detail-modal';
import DocumentViewerModal from './document-viewer-modal';
import GateActions from './gate-actions';
import { getApplicationStageBadge, getApplicationStageLabel } from '@/lib/utils/badge-styles';
import type { ApplicationStage } from '@splits-network/shared-types';

export default function ApplicationDetailClient({ applicationId }: { applicationId: string }) {
    const router = useRouter();
    const { getToken } = useAuth();
    const toast = useToast();
    const { profile, isLoading: profileLoading, isAdmin, isRecruiter, isCompanyUser } = useUserProfile();

    // Data states
    const [application, setApplication] = useState<any>(null);
    const [job, setJob] = useState<any>(null);
    const [candidate, setCandidate] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [preScreenAnswers, setPreScreenAnswers] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [recruiter, setRecruiter] = useState<any>(null);
    const [relationship, setRelationship] = useState<any>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [cra, setCra] = useState<any>(null);

    // UI states
    const [showStageModal, setShowStageModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showJobModal, setShowJobModal] = useState(false);
    const [showCandidateModal, setShowCandidateModal] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [candidateLoading, setCandidateLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Use context for platform admin check
    const isPlatformAdmin = isAdmin;

    // Get token on mount
    useEffect(() => {
        async function initializeAuth() {
            const authToken = await getToken();
            setToken(authToken);
        }
        initializeAuth();
    }, [getToken]);

    // Data fetching logic
    const loadApplicationData = useCallback(async () => {
        if (profileLoading || !applicationId) return;

        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) {
                setError('Not authenticated');
                return;
            }

            const client = createAuthenticatedClient(token);

            // Get application full details with includes
            const appResponse: any = await client.get(`/applications/${applicationId}?include=job,documents,pre_screen_answers,job_requirements,current_gate`);
            const appData = appResponse.data || appResponse;
            console.log(appResponse);
            if (!appData) {
                setError('Application not found');
                return;
            }
            setCandidateLoading(true);
            try {
                const token = await getToken();
                if (!token) {
                    throw new Error('Not authenticated');
                }

                const client = createAuthenticatedClient(token);
                const response: any = await client.get(`/candidates/${appData.candidate_id}`);
                setCandidate(response.data || response);
            } catch (error: any) {
                console.error('Failed to load full candidate:', error);
                toast.error('Failed to load full candidate details');
            } finally {
                setCandidateLoading(false);
            }

            setApplication(appData);
            setJob(appData.job);
            //setCandidate(appData.candidate);
            setDocuments(appData.documents || []);
            setPreScreenAnswers(appData.pre_screen_answers || []);
            setQuestions(appData.job_requirements || []);

            // Get audit log for timeline
            try {
                const auditLogResponse: any = await client.get(`/applications/${applicationId}?include=audit_log`);
                setAuditLogs(auditLogResponse.data?.audit_log || []);
            } catch (err) {
                console.warn('Could not fetch audit log:', err);
            }

            // Get CRA (Candidate Role Assignment) for gate actions
            try {
                const craResponse: any = await client.get(`/candidate-role-assignments?candidate_id=${appData.candidate_id}&job_id=${appData.job_id}&limit=1&include=current_gate`);
                const craData = craResponse.data?.[0] || null;
                console.log('first cra gate', craData);
                setCra(craData);
            } catch (err) {
                console.warn('Could not fetch CRA:', err);
            }

            // Role-specific permission checks and data loading
            if (isRecruiter) {
                // For recruiters: get recruiter profile and check permissions
                try {
                    const recruiterResponse: any = await client.getCurrentRecruiter();
                    const recruiterProfile = recruiterResponse.data || null;
                    setRecruiter(recruiterProfile);

                    // Check recruiter-candidate relationship status
                    if (appData.candidate && recruiterProfile) {
                        try {
                            const relationshipResponse: any = await client.get(`/recruiter-candidates?recruiter_id=${recruiterProfile.id}&candidate_id=${appData.candidate.id}&limit=1`);
                            const relationships = relationshipResponse.data || [];
                            setRelationship(relationships[0] || null);

                            // Verify recruiter has permission to view this application
                            const ownsApplication = appData.recruiter_id === recruiterProfile.id;
                            const hasRelationship = relationships[0] && relationships[0].status === 'active';

                            if (!ownsApplication && !hasRelationship) {
                                setError('You do not have permission to view this application');
                                return;
                            }
                        } catch (err) {
                            console.warn('Could not check relationship:', err);
                        }
                    }
                } catch (err) {
                    console.error('Error loading recruiter profile:', err);
                }
            } else if (isCompanyUser) {
                // For company admins/hiring managers: verify application belongs to their company
                const organizationId = profile?.organization_ids?.[0];

                if (organizationId) {
                    // Check if application's job belongs to user's organization
                    if (appData.job?.company?.identity_organization_id !== organizationId) {
                        setError('You do not have permission to view this application');
                        return;
                    }
                }
            }
            // Platform admins can view all applications (no additional checks needed)

        } catch (err: any) {
            console.error('Error fetching application details:', err);
            setError(err.message || 'Failed to load application details');
        } finally {
            setLoading(false);
        }
    }, [applicationId, getToken, profileLoading, isRecruiter, isCompanyUser, isAdmin, profile?.organization_ids]);

    useEffect(() => {
        loadApplicationData();
    }, [loadApplicationData]);

    // Loading state
    if (loading || profileLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    // Not found state
    if (!application) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="alert alert-warning">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                    <span>Application not found</span>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleStageUpdate = async (newStage: ApplicationStage, notes?: string) => {
        setActionLoading(true);
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Not authenticated');
            }

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${application.id}`, {
                stage: newStage,
                ...(notes && { notes })
            });

            setShowStageModal(false);
            // Reload data after update
            await loadApplicationData();
        } catch (error: any) {
            console.error('Failed to update stage:', error);
            toast.error(error.message || 'Failed to update application stage');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddNote = async (note: string) => {
        setActionLoading(true);
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Not authenticated');
            }

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${application.id}`, {
                notes: note
            });

            setShowNoteModal(false);
            // Reload data after update
            await loadApplicationData();
        } catch (error: any) {
            console.error('Failed to add note:', error);
            toast.error(error.message || 'Failed to add note');
        } finally {
            setActionLoading(false);
        }
    };

    const handleGateApprove = async (notes?: string) => {
        if (!cra?.id) return;

        setActionLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);
            await client.post(`/candidate-role-assignments/${cra.id}/approve-gate`, { notes });

            toast.success('Application approved successfully');
            await loadApplicationData();
        } catch (error: any) {
            console.error('Failed to approve gate:', error);
            toast.error(error.message || 'Failed to approve application');
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const handleGateDeny = async (reason: string) => {
        if (!cra?.id) return;

        setActionLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);
            await client.post(`/candidate-role-assignments/${cra.id}/deny-gate`, { reason });

            toast.success('Application denied');
            await loadApplicationData();
        } catch (error: any) {
            console.error('Failed to deny gate:', error);
            toast.error(error.message || 'Failed to deny application');
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const handleGateRequestInfo = async (questions: string) => {
        if (!cra?.id) return;

        setActionLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);
            await client.post(`/candidate-role-assignments/${cra.id}/request-info`, { questions });

            toast.success('Information request sent');
            await loadApplicationData();
        } catch (error: any) {
            console.error('Failed to request info:', error);
            toast.error(error.message || 'Failed to request information');
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenCandidateModal = () => {
        setShowCandidateModal(true);
    };
    console.log("current gate", cra.current_gate);
    const relationshipWarning = relationship && relationship.status !== 'active';
    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Breadcrumbs */}
            <div className='col-span-12'>
                <div className="text-sm breadcrumbs">
                    <ul>
                        <li><Link href="/portal/dashboard">Dashboard</Link></li>
                        <li><Link href="/portal/applications">Applications</Link></li>
                        <li>Application Details</li>
                    </ul>
                </div>
            </div>

            <div className="col-span-12 md:col-span-8 xl:col-span-8 space-y-6">
                {/* Hero Section with Candidate & Job Info */}

                <div className='card bg-base-200'>
                    <div className='card bg-base-100 m-2 shadow-lg'>
                        <div className='card-body'>
                            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <i className="fa-duotone fa-regular fa-users fa-2xl text-primary mr-2"></i>
                                    <div>
                                        <h2 className="text-4xl font-bold mb-2">
                                            {candidate?.full_name}
                                        </h2>
                                        <div className="flex flex-wrap gap-3 text-sm">
                                            {candidate.email && (
                                                <div className="flex items-center gap-2">
                                                    <i className='fa-duotone fa-regular fa-envelope text-primary' />
                                                    <span>{candidate.email}</span>
                                                </div>
                                            )}
                                            {candidate.phone && (
                                                <div className="flex items-center gap-2">
                                                    <i className='fa-duotone fa-regular fa-phone text-primary' />
                                                    <span>{candidate.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex flex-wrap gap-3 text-sm space-y-4 mt-4'>
                                            {candidate.current_title && (
                                                <div>
                                                    <div className="text-sm text-base-content/60 mb-1">Current Role</div>
                                                    <div className="text-base font-medium">{candidate.current_title}</div>
                                                </div>
                                            )}

                                            {candidate.current_company && (
                                                <div>
                                                    <div className="text-sm text-base-content/60 mb-1">Current Company</div>
                                                    <div className="text-base font-medium">{candidate.current_company}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-3 text-sm items-end'>

                                    {candidate.linkedin_url && (
                                        <div>
                                            <Link
                                                href={candidate.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline btn-sm gap-2"
                                            >
                                                <i className="fa-brands fa-linkedin"></i>
                                                View LinkedIn Profile
                                            </Link>
                                        </div>
                                    )}
                                    {candidate.portfolio_url && (
                                        <div>
                                            <Link
                                                href={candidate.portfolio_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline btn-sm gap-2"
                                            >
                                                <i className="fa-duotone fa-regular fa-globe"></i>
                                                View Portfolio
                                            </Link>
                                        </div>
                                    )}
                                    {candidate.github_url && (
                                        <div>
                                            <Link
                                                href={candidate.github_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline btn-sm gap-2"
                                            >
                                                <i className="fa-brands fa-github"></i>
                                                View GitHub Profile
                                            </Link>
                                        </div>
                                    )}
                                    {application.accepted_by_company && (
                                        <div className="badge badge-success gap-1">
                                            <i className="fa-duotone fa-regular fa-circle-check"></i>
                                            Accepted
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='px-4 py-0'>
                        {/* AI Review Panel - Role-based visibility */}
                        {token && (application.ai_reviewed || application.stage === 'ai_review' ||
                            ['screen', 'submitted', 'interview', 'offer', 'hired'].includes(application.stage)) && (
                                <AIReviewDisplay
                                    applicationId={application.id}
                                    isRecruiter={isRecruiter || false}
                                    isCompanyUser={isCompanyUser || false}
                                    token={token}
                                />
                            )}
                    </div>

                    <div className="flex justify-end p-4 pt-0">
                        <button
                            onClick={handleOpenCandidateModal}
                            className="btn btn-primary btn-sm gap-2"
                        >
                            <i className="fa-duotone fa-regular fa-user"></i>
                            View Full Candidate Profile
                        </button>
                    </div>
                </div>

                {/* Job Details */}
                <div className="card bg-base-200 shadow">
                    <div className='card bg-base-100 m-2 shadow-lg'>
                        <div className="card-body">
                            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <i className="fa-duotone fa-regular fa-buildings fa-2xl text-primary mr-2"></i>
                                    <div>
                                        <h2 className="text-4xl font-bold mb-2">
                                            {job.title}
                                        </h2>

                                        <div className="space-y-6">
                                            {/* Job Info Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {job.location && (
                                                    <div>
                                                        <div className="text-sm text-base-content/60 mb-1">Location</div>
                                                        <div className="text-sm font-medium">{job.location}</div>
                                                    </div>
                                                )}

                                                {job.employment_type && (
                                                    <div>
                                                        <div className="text-sm text-base-content/60 mb-1">Type</div>
                                                        <div className="text-sm font-medium capitalize">{job.employment_type.replace('_', ' ')}</div>
                                                    </div>
                                                )}

                                                {(job.salary_min || job.salary_max) && (
                                                    <div>
                                                        <div className="text-sm text-base-content/60 mb-1">Salary Range</div>
                                                        <div className="text-sm font-medium">
                                                            ${job.salary_min?.toLocaleString() || '...'} - ${job.salary_max?.toLocaleString() || '...'}
                                                        </div>
                                                    </div>
                                                )}

                                                {job.department && (
                                                    <div>
                                                        <div className="text-sm text-base-content/60 mb-1">Department</div>
                                                        <div className="text-sm font-medium">{job.department}</div>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div className='flex flex-col text-sm items-end'>
                                    {/* Company Information */}
                                    <div>
                                        <div className="text-base font-medium">{job.company?.name}</div>
                                    </div>
                                    <div>
                                        <div className='text-sm text-base-content/60 mb-1'>
                                            <Link
                                                href={job.company?.website || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-primary underline"
                                            >
                                                <i className="fa-duotone fa-regular fa-globe mr-2"></i>
                                                {job.company?.website}
                                            </Link>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='text-sm text-base-content/60 mb-1'>
                                            <i className="fa-duotone fa-regular fa-industry mr-2"></i>
                                            {job.company?.industry} | {job.company?.company_size} employees
                                        </div>
                                    </div>
                                    <div>
                                        <div className='text-sm text-base-content/60 mb-1'>{job.company?.headquarters_location}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='px-4 py-0'>
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 py-4'>
                            {/* Description */}
                            {(job.recruiter_description || job.description) && (
                                <div className='md:col-span-2'>
                                    <div className="text-sm text-base-content/60 mb-2">Description</div>
                                    <div className="text-sm text-base-content/80 whitespace-pre-wrap line-clamp-6">
                                        {job.recruiter_description || job.description}
                                    </div>
                                </div>
                            )}

                            {/* Mandatory Requirements */}
                            <div className="mb-4">
                                <div className="text-sm font-medium text-error mb-2">Required</div>
                                <ul className="space-y-2">
                                    {job.job_requirements
                                        .filter((r: any) => r.requirement_type === 'mandatory')
                                        .sort((a: any, b: any) => a.sort_order - b.sort_order)
                                        .map((req: any) => (
                                            <li key={req.id} className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-circle-check text-error mt-1 shrink-0"></i>
                                                <span>{req.description}</span>
                                            </li>
                                        ))}
                                </ul>
                            </div>

                            {/* Preferred Requirements */}
                            <div>
                                <div className="text-sm font-medium text-info mb-2">Preferred</div>
                                <ul className="space-y-2">
                                    {job.job_requirements
                                        .filter((r: any) => r.requirement_type === 'preferred')
                                        .sort((a: any, b: any) => a.sort_order - b.sort_order)
                                        .map((req: any) => (
                                            <li key={req.id} className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-circle-plus text-info mt-1 shrink-0"></i>
                                                <span>{req.description}</span>
                                            </li>
                                        ))}
                                </ul>
                            </div>

                        </div>
                    </div>
                    <div className="flex justify-end p-4 pt-0">
                        <button
                            onClick={() => setShowJobModal(true)}
                            className="btn btn-primary btn-sm gap-2"
                        >
                            <i className="fa-duotone fa-regular fa-briefcase"></i>
                            View Full Job Posting
                        </button>
                    </div>
                </div>

                {/* Relationship Warning */}
                {relationshipWarning && (
                    <div className='p-4 pt-0'>
                        <div className="alert alert-warning">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                            <div>
                                <h3 className="font-bold">Relationship Status Changed</h3>
                                <div className="text-sm">
                                    Your relationship with this candidate is {relationship.status}.
                                    Historical data is preserved but you may have limited editing capabilities.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className='col-span-12 md:col-span-4 xl:col-span-4 space-y-6'>

                {/* Gate Actions - Show if user has review responsibility */}
                <GateActions
                    application={application}
                    craId={cra?.id || null}
                    isRecruiter={isRecruiter || false}
                    isCompanyUser={isCompanyUser || false}
                    currentGate={application?.current_gate || null}
                    onGateAction={loadApplicationData}
                    onApprove={handleGateApprove}
                    onDeny={handleGateDeny}
                    onRequestInfo={handleGateRequestInfo}
                />

                <div className="card bg-base-200 shadow">
                    <div className="card-body">
                        <h2 className="card-title text-lg mb-4">
                            <i className="fa-duotone fa-regular fa-ellipsis"></i>
                            Actions
                        </h2>

                        <div className="space-y-2">
                            {isPlatformAdmin && (
                                <button
                                    onClick={() => setShowStageModal(true)}
                                    className="btn btn-primary btn-sm gap-2"
                                    disabled={actionLoading}
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-right-arrow-left"></i>
                                    Update Stage
                                </button>
                            )}
                            <button
                                onClick={() => setShowNoteModal(true)}
                                className="btn btn-outline btn-sm gap-2"
                                disabled={actionLoading}
                            >
                                <i className="fa-duotone fa-regular fa-note-sticky"></i>
                                Add Note
                            </button>
                            {application.stage === 'screen' && (
                                <Link
                                    href={`/portal/applications/${application.id}/review`}
                                    className="btn btn-accent btn-sm gap-2"
                                >
                                    <i className="fa-duotone fa-regular fa-clipboard-check"></i>
                                    Review & Submit
                                </Link>
                            )}
                            {application.stage === 'offer' && (
                                <button
                                    onClick={() => handleStageUpdate('hired')}
                                    className="btn btn-success btn-sm gap-2"
                                    disabled={loading}
                                >
                                    <i className="fa-duotone fa-regular fa-check-circle"></i>
                                    Mark as Hired
                                </button>
                            )}

                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className="card bg-base-200 shadow">
                    <div className="card-body">
                        <h2 className="card-title text-lg mb-4">Status</h2>
                        <div className="space-y-3">
                            <div>
                                <div className="text-sm text-base-content/60 mb-1">Current Stage</div>
                                <span className={`badge ${getApplicationStageBadge(application.stage)} badge-lg`}>
                                    {getApplicationStageLabel(application.stage)}
                                </span>
                            </div>
                            <div>
                                <div className="text-sm text-base-content/60 mb-1">Created</div>
                                <div className="text-sm">{formatDate(application.created_at)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-base-content/60 mb-1">Last Updated</div>
                                <div className="text-sm">{formatDate(application.updated_at)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Documents Card */}
                {documents && documents.length > 0 && (
                    <div className="card bg-base-200 shadow">
                        <div className="card-body">
                            <h2 className="card-title text-lg mb-4">
                                <i className="fa-duotone fa-regular fa-file"></i>
                                Documents
                            </h2>

                            <div className="space-y-2">
                                {application.documents.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-base-300 hover:bg-base-300 transition-colors">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <i className={`fa-duotone fa-regular ${doc.document_type === 'resume' ? 'fa-file-text' :
                                                doc.document_type === 'cover_letter' ? 'fa-file-lines' :
                                                    'fa-file'
                                                } text-primary`}></i>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{doc.file_name}</div>
                                                <div className="text-sm text-base-content/60">
                                                    {doc.document_type.replace('_', ' ').toUpperCase()}
                                                    {doc.file_size && ` • ${(doc.file_size / 1024).toFixed(1)} KB`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {doc.metadata?.is_primary && (
                                                <span className="badge badge-primary badge-sm">Primary</span>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedDocument(doc);
                                                    setShowDocumentModal(true);
                                                }}
                                                className="btn btn-ghost btn-sm"
                                            >
                                                <i className="fa-duotone fa-regular fa-eye"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Relationship Status */}
                {relationship && (
                    <div className="card bg-base-200 shadow">
                        <div className="card-body">
                            <h2 className="card-title text-lg mb-4">Relationship</h2>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-base-content/70">Status:</span>{' '}
                                    <span className={`badge ${relationship.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                                        {relationship.status}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-base-content/70">Period:</span>{' '}
                                    {new Date(relationship.relationship_start_date).toLocaleDateString()} - {' '}
                                    {new Date(relationship.relationship_end_date).toLocaleDateString()}
                                </div>
                                {relationship.consent_given && (
                                    <div className="text-success">
                                        <i className="fa-duotone fa-regular fa-check mr-1"></i>
                                        Right to Represent consent given
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Main Content Grid */}

            <div className="col-span-12 md:col-span-8 xl:col-span-10 space-y-6">
                {/* Pre-Screen Answers */}
                {preScreenAnswers && preScreenAnswers.length > 0 && (
                    <div className="card bg-base-200 shadow">
                        <div className="card-body">
                            <h2 className="card-title mb-4">
                                <i className="fa-duotone fa-regular fa-clipboard-question"></i>
                                Pre-Screen Responses
                            </h2>
                            <div className="space-y-4">
                                {preScreenAnswers.map((answer: any, index: number) => {
                                    const questionObj = questions.find((q: any) => q.id === answer.question_id);
                                    const questionText = questionObj?.question || `Question ${index + 1}`;
                                    return (
                                        <div key={index} className="border-l-4 border-primary pl-4">
                                            <p className="font-semibold mb-1">
                                                {questionText}
                                            </p>
                                            <p className="text-sm text-base-content/70">
                                                {typeof answer.answer === 'string'
                                                    ? answer.answer
                                                    : JSON.stringify(answer.answer)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Notes */}
                {(application.notes || application.recruiter_notes) && (
                    <div className="card bg-base-200 shadow">
                        <div className="card-body">
                            <h2 className="card-title mb-4">
                                <i className="fa-duotone fa-regular fa-note-sticky"></i>
                                Notes
                            </h2>

                            {application.notes && (
                                <div className="mb-4">
                                    <h3 className="font-semibold mb-2">Candidate Notes:</h3>
                                    <p className="text-sm text-base-content/70 whitespace-pre-wrap">
                                        {application.notes}
                                    </p>
                                </div>
                            )}

                            {application.recruiter_notes && (
                                <div>
                                    <h3 className="font-semibold mb-2">Recruiter Notes:</h3>
                                    <p className="text-sm text-base-content/70 whitespace-pre-wrap">
                                        {application.recruiter_notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="col-span-12 md:col-span-4 xl:col-span-2 space-y-6">
                {/* Actions */}

                {/* Application Timeline */}
                <ApplicationTimeline auditLogs={auditLogs} />
            </div>

            {/* Stage Update Modal */}
            {isPlatformAdmin && showStageModal && (
                <StageUpdateModal
                    currentStage={application.stage}
                    onClose={() => setShowStageModal(false)}
                    onUpdate={handleStageUpdate}
                    loading={loading}
                />
            )}

            {/* Add Note Modal */}
            {showNoteModal && (
                <AddNoteModal
                    applicationId={application.id}
                    onClose={() => setShowNoteModal(false)}
                    onSave={handleAddNote}
                    loading={loading}
                />
            )}

            {/* Job Detail Modal */}
            <JobDetailModal
                job={job}
                isOpen={showJobModal}
                onClose={() => setShowJobModal(false)}
            />

            {/* Candidate Detail Modal */}
            <CandidateDetailModal
                candidate={candidate}
                isOpen={showCandidateModal}
                onClose={() => setShowCandidateModal(false)}
            />

            {/* Document Viewer Modal */}
            <DocumentViewerModal
                document={selectedDocument}
                isOpen={showDocumentModal}
                onClose={() => {
                    setShowDocumentModal(false);
                    setSelectedDocument(null);
                }}
            />
        </div>
    );
}
