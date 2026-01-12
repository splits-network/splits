'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import ApplicationHeader from './components/application-header';
import ApplicationTabs from './components/application-tabs';

export default function ApplicationDetailPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <>
            <div className="flex">
                <Link href="/portal/applications" className="btn btn-ghost btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                    Back to Applications
                </Link>
            </div>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="w-full md:flex-1 md:mr-4 space-y-6">
                    <ApplicationHeader applicationId={id} />
                    <ApplicationTabs applicationId={id} />
                </div>
                <div className="w-full md:w-64 lg:w-72 xl:w-80 shrink-0 mt-6 md:mt-0">
                    {/* Sidebar content can go here */}
                    <div className="card bg-base-200 shadow">
                        <div className="card-body">
                            <h3 className="font-semibold text-lg mb-3">
                                <i className="fa-duotone fa-regular fa-info-circle mr-2 text-info"></i>
                                Quick Info
                            </h3>
                            <p className="text-base-content/70 text-sm">
                                Additional application information will appear here.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
