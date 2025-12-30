'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatSalary, formatDate } from '@/lib/utils';
import ApplicationWizardModal from '@/components/application-wizard-modal';

interface Job {
    id: string;
    title: string;
    company?: { name: string; description?: string };
    location?: string;
    salary_min?: number;
    salary_max?: number;
    employment_type?: string;
    open_to_relocation?: boolean;
    posted_at?: string;
    description?: string;
    candidate_description?: string;
}

interface JobDetailClientProps {
    job: Job;
    isAuthenticated: boolean;
    hasActiveRecruiter: boolean;
    existingApplication: any;
}

export default function JobDetailClient({
    job,
    isAuthenticated,
    hasActiveRecruiter,
    existingApplication,
}: JobDetailClientProps) {
    const [showWizard, setShowWizard] = useState(false);

    // Determine button text and icon based on state
    const getButtonConfig = () => {
        if (!isAuthenticated) {
            return {
                text: 'Get Started',
                icon: 'fa-rocket',
                action: () => {
                    window.location.href = `/sign-in?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`;
                },
            };
        }

        if (existingApplication) {
            return {
                text: 'Already Applied',
                icon: 'fa-check-circle',
                action: () => { },
                disabled: true,
            };
        }

        return {
            text: hasActiveRecruiter ? 'Send to Recruiter' : 'Apply Now',
            icon: hasActiveRecruiter ? 'fa-user-tie' : 'fa-paper-plane',
            action: () => setShowWizard(true),
        };
    };

    const buttonConfig = getButtonConfig();

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Link href="/jobs" className="btn btn-ghost mb-6">
                    <i className="fa-solid fa-arrow-left"></i>
                    Back to Jobs
                </Link>

                {/* Job Header */}
                <div className="card bg-base-100 shadow mb-6">
                    <div className="card-body">
                        <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
                        <h2 className="text-2xl font-semibold mb-4">{job.company?.name || 'Company'}</h2>

                        <div className="flex flex-wrap gap-4 mb-6">
                            {job.location && (
                                <div className="badge badge-lg">
                                    <i className="fa-solid fa-location-dot mr-2"></i>
                                    {job.location}
                                </div>
                            )}
                            {job.employment_type && (
                                <div className="badge badge-lg">
                                    <i className="fa-solid fa-briefcase mr-2"></i>
                                    {job.employment_type.replace('_', '-')}
                                </div>
                            )}
                            {job.open_to_relocation && (
                                <div className="badge badge-lg badge-success">
                                    <i className="fa-solid fa-house mr-2"></i>
                                    Remote
                                </div>
                            )}
                            {job.posted_at && (
                                <div className="badge badge-lg">
                                    <i className="fa-solid fa-calendar mr-2"></i>
                                    Posted {formatDate(job.posted_at)}
                                </div>
                            )}
                        </div>

                        <div className="divider"></div>

                        <div className="flex justify-between items-center">
                            <div>
                                {job.salary_min && job.salary_max && (
                                    <>
                                        <p className="text-sm text-base-content/70 mb-1">Salary Range</p>
                                        <p className="text-2xl font-bold text-primary">
                                            {formatSalary(job.salary_min, job.salary_max)}
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {existingApplication ? (
                                    <>
                                        <button className="btn btn-primary btn-lg" disabled>
                                            <i className={`fa-solid ${buttonConfig.icon}`}></i>
                                            {buttonConfig.text}
                                        </button>
                                        <Link
                                            href={`/applications/${existingApplication.id}`}
                                            className="btn btn-outline btn-lg"
                                        >
                                            <i className="fa-solid fa-arrow-right"></i>
                                            View Application
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        onClick={buttonConfig.action}
                                        className="btn btn-primary btn-lg"
                                        disabled={buttonConfig.disabled}
                                    >
                                        <i className={`fa-solid ${buttonConfig.icon}`}></i>
                                        {buttonConfig.text}
                                    </button>
                                )}
                                <button className="btn btn-outline btn-lg">
                                    <i className="fa-solid fa-bookmark"></i>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Company */}
                {job.company?.description && (
                    <div className="card bg-base-100 shadow mb-6">
                        <div className="card-body">
                            <h3 className="card-title text-xl mb-4">
                                <i className="fa-solid fa-building"></i>
                                About {job.company?.name || 'Company'}
                            </h3>
                            <p className="whitespace-pre-line">{job.company.description}</p>
                        </div>
                    </div>
                )}

                {/* Job Description */}
                {(job.candidate_description || job.description) && (
                    <div className="card bg-base-100 shadow mb-6">
                        <div className="card-body">
                            <h3 className="card-title text-xl mb-4">
                                <i className="fa-solid fa-file-lines"></i>
                                Job Description
                            </h3>
                            <p className="whitespace-pre-line">{job.candidate_description || job.description}</p>
                        </div>
                    </div>
                )}

                {/* Apply CTA for non-authenticated users */}
                {!isAuthenticated && (
                    <div className="card bg-primary text-white shadow">
                        <div className="card-body text-center">
                            <h3 className="text-2xl font-bold mb-4">Ready to Apply?</h3>
                            <p className="mb-6">
                                Create an account to apply with one click and track your application.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link
                                    href={`/sign-up?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`}
                                    className="btn btn-lg bg-white text-primary hover:bg-gray-100"
                                >
                                    <i className="fa-solid fa-user-plus"></i>
                                    Create Account
                                </Link>
                                <Link
                                    href={`/sign-in?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`}
                                    className="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-primary"
                                >
                                    <i className="fa-solid fa-right-to-bracket"></i>
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Application Wizard Modal */}
            {showWizard && (
                <ApplicationWizardModal
                    jobId={job.id}
                    jobTitle={job.title}
                    companyName={job.company?.name || 'Company'}
                    onClose={() => setShowWizard(false)}
                    onSuccess={(applicationId) => {
                        setShowWizard(false);
                    }}
                />
            )}
        </>
    );
}
