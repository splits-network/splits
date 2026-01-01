'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createAuthenticatedClient } from '@/lib/api-client';
import DocumentList from '@/components/document-list';
import SubmitToJobWizard from './submit-to-job-wizard';
import VerificationModal from './verification-modal';
import {
    formatDate,
    getApplicationStageBadge,
    getApplicationStageBgColor,
    getApplicationStageIcon,
    getRelationshipStatusBadge,
    getVerificationStatusBadge,
    getVerificationStatusIcon
} from '@/lib/utils';

interface CandidateDetailClientProps {
    candidateId: string;
}

export default function CandidateDetailClient({ candidateId }: CandidateDetailClientProps) {
    const { getToken } = useAuth();
    const router = useRouter();

    // Candidate data (loads first - fast)
    const [candidate, setCandidate] = useState<any>(null);
    const [canEdit, setCanEdit] = useState(false);
    const [userContext, setUserContext] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Applications (loads async with its own state)
    const [applications, setApplications] = useState<any[]>([]);
    const [applicationsLoading, setApplicationsLoading] = useState(false);
    const [applicationsError, setApplicationsError] = useState<string | null>(null);

    // Relationship (loads async with its own state)
    const [relationship, setRelationship] = useState<any>(null);
    const [relationshipLoading, setRelationshipLoading] = useState(false);

    // Submit to job wizard
    const [showSubmitWizard, setShowSubmitWizard] = useState(false);

    // Verification modal
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    // Load candidate data first (fast)
    useEffect(() => {
        async function loadCandidate() {
            try {
                setLoading(true);
                setError(null);

                const token = await getToken();
                if (!token) {
                    setError('Not authenticated');
                    return;
                }

                const client = createAuthenticatedClient(token);

                // Fetch candidate details and user context
                const [candidateResponse, userContextResponse] = await Promise.all([
                    client.get(`/candidates/${candidateId}`),
                    client.get('/users?limit=1')
                ]);

                setCandidate(candidateResponse.data);
                console.log('Loaded candidate:', candidateResponse.data);

                // Check if user can edit (upload documents for) this candidate
                // V2 users endpoint returns array, get first (current) user
                const userContext = userContextResponse.data?.[0];
                if (!userContext) {
                    throw new Error('User context not found');
                }

                setUserContext(userContext);

                const canEditCandidate = userContext && (
                    userContext.roles?.some((role: string) => ['platform_admin', 'recruiter'].includes(role))
                );

                setCanEdit(canEditCandidate);

            } catch (err: any) {
                console.error('Failed to load candidate:', err);
                setError(err.message || 'Failed to load candidate details');
            } finally {
                setLoading(false);
            }
        }

        loadCandidate();
    }, [candidateId, getToken]);

    // Load applications in parallel (after candidate loads)
    useEffect(() => {
        async function loadApplications() {
            if (!candidate) return; // Wait for candidate first

            try {
                setApplicationsLoading(true);
                setApplicationsError(null);

                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);

                // Fetch applications with enriched job data (single query - no N+1!)
                // Use V2 API with query parameters and includes
                const applicationsResponse = await client.get(`/applications`, {
                    params: {
                        candidate_id: candidateId,
                        include: 'job,recruiter,company'
                    }
                });
                const apps = applicationsResponse.data || [];

                setApplications(apps);
            } catch (err: any) {
                console.error('Failed to load applications:', err);
                setApplicationsError('Failed to load applications');
            } finally {
                setApplicationsLoading(false);
            }
        }

        loadApplications();
    }, [candidate, candidateId, getToken]);

    // Load relationship info in parallel
    useEffect(() => {
        async function loadRelationship() {
            if (!candidate) return; // Wait for candidate first

            try {
                setRelationshipLoading(true);

                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);

                // Try to get detailed relationship info
                try {
                    // Use V2 API pattern with query parameters
                    const relationshipResponse = await client.get(`/recruiter-candidates`, {
                        params: {
                            candidate_id: candidateId,
                            limit: 10 // Get multiple to find active one
                        }
                    });
                    if (relationshipResponse.data && relationshipResponse.data.length > 0) {
                        // Get the most recent active relationship
                        const activeRelationship = relationshipResponse.data.find((r: any) => r.status === 'active');
                        setRelationship(activeRelationship || relationshipResponse.data[0]);
                    }
                } catch (err) {
                    // No relationship info available (might be admin or self-managed candidate)
                    console.log('No relationship info:', err);
                }
            } catch (err: any) {
                console.error('Failed to load relationship:', err);
            } finally {
                setRelationshipLoading(false);
            }
        }

        loadRelationship();
    }, [candidate, candidateId, getToken]);

    // Handle candidate updates (from modals)
    const handleCandidateUpdate = (updatedCandidate: any) => {
        setCandidate(updatedCandidate);
    };

    // Check if user can verify candidates (recruiters and platform admins)
    const canVerifyCandidate = userContext && (
        userContext.roles?.some((role: string) => ['platform_admin', 'recruiter'].includes(role))
    );

    // Check if candidate is already verified or rejected
    const isVerificationComplete = candidate?.verification_status === 'verified' || candidate?.verification_status === 'rejected';

    const handleSubmitToJob = async (jobId: string, notes: string, documentIds: string[]) => {
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);

            // Step 1: Create application (recruiter proposes job to candidate)
            const response = await client.post('/applications', {
                candidate_id: candidateId,
                job_id: jobId,
                recruiter_notes: notes,
            });

            const applicationId = response.data?.data?.id || response.data?.id;
            if (!applicationId) {
                throw new Error('No application ID returned from server');
            }

            // Step 2: Link documents to the application (if any were provided)
            if (documentIds.length > 0) {
                await Promise.all(
                    documentIds.map(docId =>
                        client.patch(`/documents/${docId}`, {
                            entity_type: 'application',
                            entity_id: applicationId,
                        }).catch(err => {
                            console.error(`Failed to link document ${docId}:`, err);
                            // Don't fail the whole operation if a document link fails
                        })
                    )
                );
            }

            // Show success message
            alert(`Job opportunity sent to ${candidate?.full_name || 'candidate'}! They'll receive an email notification and can review and approve the opportunity.`);

            // Redirect to the new application detail page
            router.push(`/applications/${applicationId}`);
        } catch (err: any) {
            console.error('Failed to propose job to candidate:', err);
            throw new Error(err.message || 'Failed to send job opportunity to candidate');
        }
    };

    const isRelationshipExpiringSoon = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const daysUntilExpiration = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="mt-4 text-base-content/70">Loading candidate details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="alert alert-warning">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>Candidate not found</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="text-sm breadcrumbs">
                <ul>
                    <li><Link href="/candidates">Candidates</Link></li>
                    <li>{candidate.full_name}</li>
                </ul>
            </div>

            {/* Candidate Header */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="avatar avatar-placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-20">
                                    <span className="text-2xl">{candidate.full_name[0]}</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold">{candidate.full_name}</h1>
                                    {candidate.verification_status && (
                                        <span className={`badge ${getVerificationStatusBadge(candidate.verification_status)} gap-1`}>
                                            <i className={`fa-solid ${getVerificationStatusIcon(candidate.verification_status)}`}></i>
                                            {candidate.verification_status.charAt(0).toUpperCase() + candidate.verification_status.slice(1)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-base-content/70">
                                    <div className="flex items-center gap-2">
                                        <i className="fa-solid fa-envelope"></i>
                                        <a href={`mailto:${candidate.email}`} className="link link-hover">
                                            {candidate.email}
                                        </a>
                                    </div>
                                    {candidate.phone && (
                                        <div className="flex items-center gap-2">
                                            <i className="fa-solid fa-phone"></i>
                                            <span>{candidate.phone}</span>
                                        </div>
                                    )}
                                    {candidate.linkedin_url && (
                                        <div className="flex items-center gap-2">
                                            <i className="fa-brands fa-linkedin"></i>
                                            <a
                                                href={candidate.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="link link-hover"
                                            >
                                                LinkedIn Profile
                                            </a>
                                        </div>
                                    )}
                                </div>
                                {(candidate.current_title || candidate.current_company || candidate.location) && (
                                    <div className="flex items-center gap-4 mt-2 text-sm text-base-content/70">
                                        {candidate.current_title && (
                                            <div className="flex items-center gap-1">
                                                <i className="fa-solid fa-briefcase"></i>
                                                <span>{candidate.current_title}</span>
                                            </div>
                                        )}
                                        {candidate.current_company && (
                                            <div className="flex items-center gap-1">
                                                <i className="fa-solid fa-building"></i>
                                                <span>{candidate.current_company}</span>
                                            </div>
                                        )}
                                        {candidate.location && (
                                            <div className="flex items-center gap-1">
                                                <i className="fa-solid fa-location-dot"></i>
                                                <span>{candidate.location}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="text-sm text-base-content/60 mt-1">
                                    Added {formatDate(candidate.created_at)}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {canEdit && (
                                <>
                                    <button
                                        onClick={() => setShowSubmitWizard(true)}
                                        className="btn btn-success gap-2"
                                    >
                                        <i className="fa-solid fa-paper-plane"></i>
                                        Send Job Opportunity
                                    </button>
                                    <Link href={`/candidates/${candidateId}/edit`} className="btn btn-primary gap-2">
                                        <i className="fa-solid fa-edit"></i>
                                        Edit
                                    </Link>
                                </>
                            )}
                            {canVerifyCandidate && !isVerificationComplete && (
                                <button
                                    onClick={() => setShowVerificationModal(true)}
                                    className="btn btn-outline gap-2"
                                >
                                    <i className="fa-solid fa-shield-check"></i>
                                    Verify
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
                <div className='basis-2/3'>
                    {/* Bio */}
                    <div className="card bg-base-100 shadow mb-6">
                        <div className="card-body">
                            <h2 className="card-title text-lg mb-4">
                                <i className="fa-solid fa-user-circle mr-2"></i>
                                Bio
                            </h2>
                            {candidate.bio ? (
                                <p className="whitespace-pre-line">{candidate.bio}</p>
                            ) : (
                                <p className="text-base-content/70 italic">No bio available.</p>
                            )}
                        </div>
                    </div>
                    {/* Applications */}
                    <div className='card bg-base-100 shadow'>
                        <div className="card-body">
                            <h2 className="card-title text-lg mb-4">
                                <i className="fa-solid fa-briefcase mr-2"></i>
                                Applications ({applications.length})
                            </h2>

                            {applicationsLoading ? (
                                <div className="card bg-base-200">
                                    <div className="card-body items-center text-center py-12">
                                        <span className="loading loading-spinner loading-lg"></span>
                                        <p className="mt-4 text-base-content/70">Loading applications...</p>
                                    </div>
                                </div>
                            ) : applicationsError ? (
                                <div className="alert alert-error">
                                    <i className="fa-solid fa-circle-exclamation"></i>
                                    <span>{applicationsError}</span>
                                </div>
                            ) : applications.length === 0 ? (
                                <div className="card bg-base-200">
                                    <div className="card-body items-center text-center py-12">
                                        <i className="fa-solid fa-inbox text-6xl text-base-content/20"></i>
                                        <h3 className="text-xl font-semibold mt-4">No Applications</h3>
                                        <p className="text-base-content/70 mt-2">
                                            This candidate hasn't been submitted to any roles yet.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {applications.map((application) => (
                                        <div key={application.id} className="card bg-base-200 hover:shadow-xl transition-shadow">
                                            <div className="card-body">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Link
                                                                href={`/roles/${application.job_id}`}
                                                                className="text-lg font-semibold hover:link"
                                                            >
                                                                {application.job?.title || 'Unknown Role'}
                                                            </Link>
                                                            <span className={`badge ${getApplicationStageBadge(application.stage)}`}>
                                                                <i className={`fa-solid ${getApplicationStageIcon(application.stage)} mr-1`}></i>
                                                                {application.stage.charAt(0).toUpperCase() + application.stage.slice(1)}
                                                            </span>
                                                        </div>
                                                        {application.job && (
                                                            <div className="flex items-center gap-4 text-sm text-base-content/70 mb-3">
                                                                {application.job.location && (
                                                                    <div className="flex items-center gap-1">
                                                                        <i className="fa-solid fa-location-dot"></i>
                                                                        <span>{application.job.location}</span>
                                                                    </div>
                                                                )}
                                                                {application.job.department && (
                                                                    <div className="flex items-center gap-1">
                                                                        <i className="fa-solid fa-building"></i>
                                                                        <span>{application.job.department}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-1">
                                                                    <i className="fa-solid fa-percent"></i>
                                                                    <span>{application.job.fee_percentage}% fee</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {application.notes && (
                                                            <div className="bg-base-200 rounded-lg p-3 mt-2">
                                                                <div className="text-xs font-semibold text-base-content/60 mb-1">Notes</div>
                                                                <div className="text-sm">{application.notes}</div>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-4 text-xs text-base-content/60 mt-3">
                                                            <div>
                                                                <i className="fa-solid fa-calendar-plus mr-1"></i>
                                                                Submitted {formatDate(application.created_at)}
                                                            </div>
                                                            <div>
                                                                <i className="fa-solid fa-clock mr-1"></i>
                                                                Updated {formatDate(application.updated_at)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0">
                                                        <Link
                                                            href={`/applications/${application.id}`}
                                                            className="btn btn-sm btn-ghost"
                                                        >
                                                            <i className="fa-solid fa-arrow-right"></i>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className='basis-1/3 gap-4 flex flex-col'>

                    {/* Recruiter Relationship Information */}
                    {relationship && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h2 className="card-title text-lg">
                                    <i className="fa-solid fa-handshake mr-2"></i>
                                    Recruiter Relationship
                                </h2>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">Status:</span>
                                            <span className={`badge ${getRelationshipStatusBadge(relationship.status)}`}>
                                                {relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-base-content/70">
                                            <div>
                                                <i className="fa-solid fa-calendar-plus mr-1"></i>
                                                Started: {formatDate(relationship.relationship_start_date)}
                                            </div>
                                            <div>
                                                <i className="fa-solid fa-calendar-xmark mr-1"></i>
                                                Expires: {formatDate(relationship.relationship_end_date)}
                                            </div>
                                        </div>
                                        {relationship.status === 'active' && isRelationshipExpiringSoon(relationship.relationship_end_date) && (
                                            <div className="alert alert-warning mt-2">
                                                <i className="fa-solid fa-triangle-exclamation"></i>
                                                <span>Relationship expires in less than 30 days. Consider renewing.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents */}
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title text-lg mb-4">
                                <i className="fa-solid fa-file-lines mr-2"></i>
                                Documents
                            </h2>
                            <DocumentList
                                entityType="candidate"
                                entityId={candidateId}
                                showUpload={canEdit}
                            />
                        </div>
                    </div>


                    {/* Activity Timeline (Phase 1 - Simple version) */}
                    <div>
                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h2 className="card-title text-lg">
                                    <i className="fa-solid fa-clock-rotate-left mr-2"></i>
                                    Activity Timeline
                                </h2>
                                {applicationsLoading ? (
                                    <div className="text-center py-8">
                                        <span className="loading loading-spinner loading-md"></span>
                                        <p className="mt-2 text-sm text-base-content/70">Loading timeline...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {applications
                                            .slice()
                                            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                                            .map((app) => (
                                                <div key={app.id} className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-3 h-3 rounded-full ${getApplicationStageBgColor(app.stage)}`}></div>
                                                        <div className="w-px h-full bg-base-300"></div>
                                                    </div>
                                                    <div className="flex-1 pb-4">
                                                        <div className="font-semibold">
                                                            Stage updated to {app.stage}
                                                        </div>
                                                        <div className="text-sm text-base-content/70">
                                                            {app.job?.title || 'Unknown Role'}
                                                        </div>
                                                        <div className="text-xs text-base-content/60 mt-1">
                                                            {formatDate(app.updated_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-base-300"></div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold">Candidate added</div>
                                                <div className="text-xs text-base-content/60 mt-1">
                                                    {formatDate(candidate.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit to Job Wizard */}
            {showSubmitWizard && (
                <SubmitToJobWizard
                    candidateId={candidateId}
                    candidateName={candidate.full_name}
                    onClose={() => setShowSubmitWizard(false)}
                    onSubmit={handleSubmitToJob}
                />
            )}

            {/* Verification Modal */}
            <VerificationModal
                candidate={candidate}
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                onUpdate={handleCandidateUpdate}
            />
        </div>
    );
}
