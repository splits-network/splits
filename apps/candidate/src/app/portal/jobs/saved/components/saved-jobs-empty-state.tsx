"use client";

import Link from "next/link";

export default function SavedJobsEmptyState() {
    return (
        <div className="text-center py-20 bg-base-100 border-2 border-base-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-base-200 mb-6">
                <i className="fa-duotone fa-regular fa-bookmark text-2xl text-base-content/50" />
            </div>
            <h3 className="text-xl font-black tracking-tight mb-2">
                No saved jobs yet
            </h3>
            <p className="text-base-content/60 max-w-md mx-auto mb-8 font-medium">
                When you see a job you're interested in but aren't ready to
                apply for, save it here to keep track of it.
            </p>
            <Link href="/jobs" className="btn btn-primary btn-wide">
                Browse Jobs
            </Link>
        </div>
    );
}
