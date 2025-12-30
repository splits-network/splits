import Link from 'next/link';
import JobsListClient from './components/jobs-list';

interface JobsPageProps {
    searchParams?: { [key: string]: string | string[] | undefined };
}

const getParam = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value ?? '';
};

export default function JobsPage({ searchParams }: JobsPageProps) {
    const initialSearch = getParam(searchParams?.q);
    const initialLocation = getParam(searchParams?.location);
    const initialType = getParam(searchParams?.employment_type);
    const initialPageParam = getParam(searchParams?.page);
    const initialPage = initialPageParam ? parseInt(initialPageParam, 10) || 1 : 1;

    return (
        <div className="container mx-auto px-4 py-10 space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-4xl font-bold mt-1">Browse Jobs</h1>
                    <p className="text-base-content/70 mt-2">
                        Discover curated opportunities from hiring teams on Splits Network. Use filters or switch views to find the right match faster.
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
