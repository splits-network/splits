import Link from 'next/link';
import ApplicationsClient from './components/applications-client';

export default function ApplicationsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Applications</h1>
                    <p className="text-base-content/70 mt-1">
                        Monitor every candidate submission across stages and personas.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link href="/portal/applications/pending" className="btn btn-ghost gap-2">
                        <i className="fa-solid fa-inbox"></i>
                        Pending Reviews
                    </Link>
                    <Link href="/portal/roles" className="btn btn-primary gap-2">
                        <i className="fa-solid fa-user-plus"></i>
                        Submit Candidate
                    </Link>
                </div>
            </div>

            <ApplicationsClient />
        </div>
    );
}
