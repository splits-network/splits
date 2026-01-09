'use client';

export default function JobsHeader() {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <h1 className="text-4xl font-bold mt-1">Browse Jobs</h1>
                <p className="text-base-content/70 mt-2">
                    Discover curated opportunities from hiring teams on Splits. Use intelligent search to find the right match faster.
                </p>
            </div>
        </div>
    );
}
