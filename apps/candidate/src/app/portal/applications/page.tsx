import { Suspense } from "react";
import ApplicationsContent from "./components/applications-content";

function ApplicationsLoading() {
    return (
        <div>
            <div className="mb-8">
                <div className="h-10 w-64 bg-base-300 animate-pulse rounded mb-2" />
                <div className="h-6 w-96 bg-base-300 animate-pulse rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="stats bg-base-100 shadow">
                        <div className="stat">
                            <div className="h-16 bg-base-300 animate-pulse rounded" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center items-center min-h-[400px]">
                <span className="loading loading-spinner loading-lg" />
            </div>
        </div>
    );
}

export default function ApplicationsNewPage() {
    return (
        <Suspense fallback={<ApplicationsLoading />}>
            <ApplicationsContent />
        </Suspense>
    );
}
