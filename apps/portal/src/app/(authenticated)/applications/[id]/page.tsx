import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createAuthenticatedClient } from '@/lib/api-client';
import ApplicationDetailClient from './components/application-detail-client';

export default async function ApplicationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
        redirect('/sign-in');
    }

    const client = createAuthenticatedClient(token);
    const { id } = await params;
    const applicationId = id;

    let application: any = null;
    let job: any = null;
    let candidate: any = null;
    let documents: any[] = [];
    let preScreenAnswers: any[] = [];
    let questions: any[] = [];
    let recruiter: any = null;
    let relationship: any = null;
    let auditLogs: any[] = [];
    let error: string | null = null;
    let userRole: string | null = null;

    try {
        // Get user profile to determine role
        const profileResponse: any = await client.getCurrentUser();
        const profile = profileResponse.data || profileResponse;
        const memberships = profile?.memberships || [];

        // Determine user role
        const isCompanyUser = memberships.some((m: any) =>
            m.role === 'company_admin' || m.role === 'hiring_manager'
        );
        const isPlatformAdmin = memberships.some((m: any) => m.role === 'platform_admin');
        const isRecruiter = !isCompanyUser && !isPlatformAdmin;

        if (isCompanyUser) {
            userRole = 'company';
        } else if (isPlatformAdmin) {
            userRole = 'admin';
        } else if (isRecruiter) {
            userRole = 'recruiter';
        }

        console.log('User role:', userRole, 'Memberships:', memberships);

        // Get application full details
        const appResponse: any = await client.getApplicationFullDetails(applicationId);
        const appData = appResponse.data || appResponse;

        console.log('Application response:', appData);

        application = appData.application || appData;
        job = appData.job || application.job;
        candidate = appData.candidate || application.candidate;
        documents = appData.documents || [];
        preScreenAnswers = appData.pre_screen_answers || [];
        questions = appData.questions || [];

        console.log('Parsed application:', application);

        // Get audit log for timeline
        try {
            const auditLogResponse: any = await client.get(`/applications/${applicationId}/audit-log`);
            auditLogs = auditLogResponse.data || [];
            console.log('Audit logs:', auditLogs);
        } catch (err) {
            console.warn('Could not fetch audit log:', err);
        }

        // Role-specific permission checks and data loading
        if (userRole === 'recruiter') {
            // For recruiters: get recruiter profile and check permissions
            try {
                const recruiterResponse: any = await client.getRecruiterProfile();
                recruiter = recruiterResponse.data || recruiterResponse;
                console.log('Recruiter profile:', recruiter);
                console.log('Application recruiter_id:', application.recruiter_id);
                console.log('Recruiter id:', recruiter.id);

                // Check recruiter-candidate relationship status
                if (candidate && recruiter) {
                    try {
                        const relationshipResponse: any = await client.getRecruiterCandidateRelationship(
                            recruiter.id,
                            candidate.id
                        );
                        relationship = relationshipResponse.data || relationshipResponse;
                        console.log('Recruiter-candidate relationship:', relationship);
                    } catch (err) {
                        console.warn('Could not fetch recruiter-candidate relationship:', err);
                    }
                }

                // Verify recruiter has permission to view this application
                // Permission granted if:
                // 1. Recruiter owns the application (represented candidate), OR
                // 2. Recruiter has active relationship with candidate (can view direct applications too)
                const ownsApplication = application.recruiter_id === recruiter.id;
                const hasRelationship = relationship && relationship.status === 'active';

                if (!ownsApplication && !hasRelationship) {
                    error = 'You do not have permission to view this application';
                }
            } catch (err) {
                console.error('Error loading recruiter profile:', err);
                error = 'Failed to load recruiter profile';
            }
        } else if (userRole === 'company') {
            // For company admins/hiring managers: verify application belongs to their company
            const companyMembership = memberships.find((m: any) =>
                m.role === 'company_admin' || m.role === 'hiring_manager'
            );

            if (companyMembership) {
                try {
                    // Get company for this organization
                    const companiesRes: any = await client.get('/companies', {
                        params: {
                            identity_organization_id: companyMembership.organization_id,
                            limit: 1,
                        },
                    });
                    const companies = companiesRes.data || [];

                    if (companies.length > 0) {
                        const userCompanyId = companies[0].id;
                        console.log('User company ID:', userCompanyId, 'Job company ID:', job?.company_id);

                        // Check if application's job belongs to user's company
                        if (job?.company_id !== userCompanyId) {
                            error = 'You do not have permission to view this application';
                        }
                    } else {
                        error = 'No company found for your organization';
                    }
                } catch (err) {
                    console.error('Error checking company permissions:', err);
                    error = 'Failed to verify permissions';
                }
            }
        }
        // Platform admins can view all applications (no additional checks needed)

    } catch (err: any) {
        console.error('Error fetching application details:', err);
        error = err.message || 'Failed to load application details';
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
