import Link from 'next/link';
import JobsListClient from './components/jobs-list';

interface JobsPageProps {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getParam = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value ?? '';
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
    const resolvedParams = searchParams ? await searchParams : undefined;
    const initialSearch = getParam(resolvedParams?.q);
    const initialLocation = getParam(resolvedParams?.location);
    const initialType = getParam(resolvedParams?.employment_type);
    const initialPageParam = getParam(resolvedParams?.page);
    const initialPage = initialPageParam ? parseInt(initialPageParam, 10) || 1 : 1;

    return (
        <div className="container mx-auto px-4 py-10 space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-4xl font-bold mt-1">Browse Jobs</h1>
                    <p className="text-base-content/70 mt-2">
                        Discover curated opportunities from hiring teams on Splits  Use filters or switch views to find the right match faster.
                    </p>
                </div>
            </div>

            <JobsListClient
                initialSearch={initialSearch}
                initialLocation={initialLocation}
                initialType={initialType}
                initialPage={initialPage}
            />
        </div>
    );
}
