import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { apiClient, createAuthenticatedClient } from '@/lib/api-client';
import JobDetailClient from './components/job-detail-client';

interface JobRequirement {
    id: string;
    requirement_type: 'mandatory' | 'preferred';
    description: string;
    sort_order: number;
}

interface Job {
    id: string;
    title: string;
    company?: {
        name: string;
        description?: string;
        industry?: string;
        headquarters_location?: string;
        logo_url?: string;
    };
    department?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    employment_type?: string;
    open_to_relocation?: boolean;
    posted_at?: string;
    created_at?: string;
    status?: string;
    description?: string;
    candidate_description?: string;
    requirements?: JobRequirement[];
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
    const { id } = await params;
    const { userId, getToken } = await auth();

    let job: Job | null = null;
    let hasActiveRecruiter = false;
    let existingApplication: any = null;

    try {
        const response = await apiClient.get<{ data: Job }>(`/jobs/${id}`);
        job = response.data;
    } catch (error) {
        console.error('Failed to fetch job:', error);
        notFound();
    }

    if (!job) {
        notFound();
    }

    // Check if user has an active recruiter relationship and existing application
    if (userId) {
        try {
            const token = await getToken();
            if (token) {
                const authClient = createAuthenticatedClient(token);
                const [recruitersResponse, applicationsResponse] = await Promise.all([
                    authClient.get<{ data: any[] }>('/recruiter-candidates'),
                    authClient.get<{ data: any[] }>('/applications'),
                ]);

                hasActiveRecruiter = recruitersResponse.data && recruitersResponse.data.length > 0;

                // Check for existing application to this job
                const applications = applicationsResponse.data || [];
                existingApplication = applications.find(
                    (app: any) => app.job_id === id && !['rejected', 'withdrawn'].includes(app.stage)
                );
            }
        } catch (error) {
            console.error('Failed to fetch recruiter relationships or applications:', error);
            // Continue without recruiter/application info
        }
    }

    return (
        <JobDetailClient
            job={job}
            isAuthenticated={!!userId}
            hasActiveRecruiter={hasActiveRecruiter}
            existingApplication={existingApplication}
        />
    );
}
