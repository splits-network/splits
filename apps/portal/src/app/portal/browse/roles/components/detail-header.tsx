import { Job } from "./types";

interface DetailHeaderProps {
    job: Job;
    onClose: () => void;
}

export default function DetailHeader({ job, onClose }: DetailHeaderProps) {
    return (
        <div className="p-4 sm:p-6 border-b border-base-300 bg-base-100 flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <button
                        onClick={onClose}
                        className="md:hidden btn btn-ghost btn-circle btn-sm -ml-2"
                    >
                        <i className="fa-regular fa-arrow-left" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold text-base-content line-clamp-1">
                        {job.title}
                    </h1>
                </div>

                <div className="flex items-center gap-2 text-base-content/60 text-sm">
                    <i className="fa-duotone fa-building" />
                    <span className="font-medium">
                        {job.company?.name || "Confidential Company"}
                    </span>
                    {job.location && (
                        <>
                            <span className="mx-1">•</span>
                            <i className="fa-duotone fa-location-dot" />
                            <span>{job.location}</span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button className="btn btn-ghost btn-sm hidden sm:inline-flex">
                    <i className="fa-regular fa-pen-to-square" />
                    Edit
                </button>
                <button className="btn btn-primary btn-sm">
                    Propose Candidate
                </button>
            </div>
        </div>
    );
}
