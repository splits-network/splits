'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import CandidatePipeline from './candidate-pipeline';

interface Job {
    id: string;
    title: string;
    company_id: string;
    description?: string;
    recruiter_description?: string;
    candidate_description?: string;
    requirements?: Array<{ id: string; requirement_type: 'mandatory' | 'preferred'; description: string }>;
    applications?: Array<any>;
}

interface RoleDetailsTabsProps {
    roleId: string;
}

export default function RoleDetailsTabs({ roleId }: RoleDetailsTabsProps) {
    const { getToken } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'recruiter' | 'candidate' | 'requirements' | 'pipeline'>('recruiter');

    useEffect(() => {
        fetchJob();
    }, [roleId]);

    const fetchJob = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                console.error('No auth token available');
                return;
            }

            const client = createAuthenticatedClient(token);
            const response = await client.get(`/jobs/${roleId}`, {
                params: { include: 'requirements,applications' }
            }) as { data: Job };
            const jobData = response.data;

            setJob(jobData);
        } catch (error) {
            console.error('Error fetching job:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="card bg-base-200 shadow">
                <div className="card-body">
                    <div className="flex items-center justify-center py-12">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="card bg-base-200 shadow">
                <div className="card-body">
                    <div className="alert alert-error">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>Job details not found</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            {/* Tabs */}
            <div role="tablist" className="tabs tabs-lift">
                <button
                    role="tab"
                    className={`tab ${activeTab === 'recruiter' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('recruiter')}
                >
                    <i className="fa-solid fa-user-tie mr-2"></i>
                    Recruiter Details
                </button>
                <button
                    role="tab"
                    className={`tab ${activeTab === 'candidate' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('candidate')}
                >
                    <i className="fa-solid fa-user mr-2"></i>
                    Candidate Details
                </button>
                <button
                    role="tab"
                    className={`tab ${activeTab === 'requirements' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('requirements')}
                >
                    <i className="fa-solid fa-list-check mr-2"></i>
                    Requirements
                </button>
                <button
                    role="tab"
                    className={`tab ${activeTab === 'pipeline' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('pipeline')}
                >
                    <i className="fa-solid fa-users mr-2"></i>
                    Candidate Pipeline <span className='badge badge-info ml-2'>{job.applications?.length}</span>
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-base-100 rounded-xl rounded-tl-none p-6">
                {/* Recruiter Info Tab */}
                {activeTab === 'recruiter' && (
                    <div className=''>
                        {(job.recruiter_description || job.description) ? (
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Description</h3>
                                <p className="text-base-content/80 whitespace-pre-wrap">
                                    {job.recruiter_description || job.description}
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-base-content/60">
                                <i className="fa-solid fa-info-circle text-4xl mb-3"></i>
                                <p>No recruiter description provided.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Candidate Info Tab */}
                {activeTab === 'candidate' && (
                    <div>
                        {job.candidate_description ? (
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Description</h3>
                                <p className="text-base-content/80 whitespace-pre-wrap">
                                    {job.candidate_description}
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-base-content/60">
                                <i className="fa-solid fa-info-circle text-4xl mb-3"></i>
                                <p>No candidate description provided.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Requirements Tab */}
                {activeTab === 'requirements' && (
                    <div>
                        {job.requirements && job.requirements.length > 0 ? (
                            <>
                                {/* Mandatory Requirements */}
                                {job.requirements.filter(r => r.requirement_type === 'mandatory').length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-lg mb-3">
                                            <i className="fa-solid fa-check-circle mr-2 text-success"></i>
                                            Mandatory Requirements
                                        </h3>
                                        <ul className="list-disc list-inside space-y-2">
                                            {job.requirements
                                                .filter(r => r.requirement_type === 'mandatory')
                                                .map(r => (
                                                    <li key={r.id} className="text-base-content/80">{r.description}</li>
                                                ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Preferred Requirements */}
                                {job.requirements.filter(r => r.requirement_type === 'preferred').length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-lg mb-3">
                                            <i className="fa-solid fa-star mr-2 text-warning"></i>
                                            Preferred Requirements
                                        </h3>
                                        <ul className="list-disc list-inside space-y-2">
                                            {job.requirements
                                                .filter(r => r.requirement_type === 'preferred')
                                                .map(r => (
                                                    <li key={r.id} className="text-base-content/70">{r.description}</li>
                                                ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-base-content/60">
                                <i className="fa-solid fa-info-circle text-4xl mb-3"></i>
                                <p>No requirements specified.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
