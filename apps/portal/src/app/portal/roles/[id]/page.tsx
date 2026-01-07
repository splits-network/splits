import { notFound } from 'next/navigation';
import RoleHeader from './components/role-header';
import RoleDetailsTabs from './components/role-details-tabs';

// This would normally come from the API, but we'll let the client components handle it
async function getJobData(id: string) {
    // In a real app, you might fetch initial data here for SSR
    // For now, we'll let client components handle all fetching
    return { id };
}

export default async function RoleDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="w-full md:flex-1 md:mr-4 space-y-6">
                <RoleHeader roleId={id} />
                <RoleDetailsTabs roleId={id} />
            </div>
            <div className="w-full md:w-64 lg:w-72 xl:w-80 shrink-0 mt-6 md:mt-0">
                <CandidatePipeline roleId={id} />
            </div>
        </div>
    );
}
