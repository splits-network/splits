'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useUserProfile } from '@/contexts/user-profile-context';
import ApplicationDetailClient from './application-detail-client';

export default function ApplicationDetailPageClient() {
    const params = useParams();
    const applicationId = params.id as string;
    const { getToken } = useAuth();
    const { profile, isLoading: profileLoading, isAdmin, isRecruiter, isCompanyUser } = useUserProfile();

    const [application, setApplication] = useState<any>(null);
    const [job, setJob] = useState<any>(null);
    const [candidate, setCandidate] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [preScreenAnswers, setPreScreenAnswers] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [recruiter, setRecruiter] = useState<any>(null);
    const [relationship, setRelationship] = useState<any>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            const appResponse: any = await client.get(`/applications/${applicationId}?include=candidate,job,documents,pre_screen_answers,job_requirements`);
            const appData = appResponse.data || appResponse;

            if (!appData) {
                setError('Application not found');
                return;
            }

            setApplication(appData);
            setJob(appData.job);
            setCandidate(appData.candidate);
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

            // Role-specific permission checks and data loading
            if (isRecruiter) {
                // For recruiters: get recruiter profile and check permissions
                try {
                    const recruiterResponse: any = await client.get('/recruiters?limit=1');
                    const recruiters = recruiterResponse.data || [];
                    const recruiterProfile = recruiters[0] || null;
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
                    try {
                        // Get company for this organization
                        const companiesRes: any = await client.get(`/companies?identity_organization_id=${organizationId}&limit=1`);
                        const companies = companiesRes.data || [];

                        if (companies.length > 0) {
                            const userCompanyId = companies[0].id;

                            // Check if application's job belongs to user's company
                            if (appData.job?.company_id !== userCompanyId) {
                                setError('You do not have permission to view this application');
                                return;
                            }
                        } else {
                            setError('No company found for your organization');
                            return;
                        }
                    } catch (err) {
                        console.error('Error checking company permissions:', err);
                        setError('Failed to verify permissions');
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

    if (loading || profileLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="alert alert-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="alert alert-warning">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <span>Application not found</span>
                </div>
            </div>
        );
    }

    return (
        <ApplicationDetailClient
            application={application}
            job={job}
            candidate={candidate}
            documents={documents}
            preScreenAnswers={preScreenAnswers}
            questions={questions}
            recruiter={recruiter}
            relationship={relationship}
            auditLogs={auditLogs}
        />
    );
}
