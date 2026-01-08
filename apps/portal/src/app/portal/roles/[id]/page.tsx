'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import RoleHeader from './components/role-header';
import RoleDetailsTabs from './components/role-details-tabs';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import Link from 'next/link';

interface Job {
    id: string;
    title: string;
    job_requirements: Array<{
        id: string;
        description: string;
        requirement_type: 'required' | 'preferred';
    }>;
}

export default function RoleDetailPage() {
    const params = useParams();
    const { getToken } = useAuth();
    const id = params.id as string;
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadJob() {
            try {
                setLoading(true);
                const token = await getToken();
                if (!token) {
                    console.error('No auth token available');
                    return;
                }

                const client = createAuthenticatedClient(token);
                const response = await client.get(`/jobs/${id}`, {
                    params: { include: 'job_requirements' }
                });

                setJob(response.data);
            } catch (error) {
                console.error('Error loading job:', error);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            loadJob();
        }
    }, [id, getToken]);

    return (
        <>
            <div className='flex'>
                <Link href="/portal/roles" className="btn btn-ghost btn-sm gap-2">
                    <i className="fa-solid fa-arrow-left"></i>
                    Back to Roles
                </Link>
            </div>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="w-full md:flex-1 md:mr-4 space-y-6">
                    <RoleHeader roleId={id} />
                    <RoleDetailsTabs roleId={id} />
                </div>
                <div className="w-full md:w-64 lg:w-72 xl:w-80 shrink-0 mt-6 md:mt-0">
                    {/* Preferred Requirements */}
                    {!loading &&
                        (job?.job_requirements?.filter(r => r.requirement_type === 'preferred').length && (
                            <div>
                                <h3 className="font-semibold text-lg mb-3">
                                    <i className="fa-solid fa-star mr-2 text-warning"></i>
                                    Preferred Requirements
                                </h3>
                                <ul className="list-disc list-inside space-y-2">
                                    {job.job_requirements
                                        .filter(r => r.requirement_type === 'preferred')
                                        .map(r => (
                                            <li key={r.id} className="text-base-content/70">{r.description}</li>
                                        ))}
                                </ul>
                            </div>
                        ),
                            (job?.job_requirements?.filter(r => r.requirement_type === 'required').length && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">
                                        <i className="fa-solid fa-check-circle mr-2 text-success"></i>
                                        Required Requirements
                                    </h3>
                                    <ul className="list-disc list-inside space-y-2">
                                        {job.job_requirements
                                            .filter(r => r.requirement_type === 'required')
                                            .map(r => (
                                                <li key={r.id} className="text-base-content/80">{r.description}</li>
                                            ))}
                                    </ul>
                                </div>
                            )


                            )
                        )
                    }
                    {loading && (
                        <div className="space-y-3">
                            <div className="h-6 bg-base-300 rounded animate-pulse"></div>
                            <div className="h-4 bg-base-300 rounded animate-pulse"></div>
                            <div className="h-4 bg-base-300 rounded animate-pulse"></div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
