import { BaselAlertBox } from "@splits-network/basel-ui";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import type { Job, Candidate, CandidateDocument } from "./types";

interface StepReviewProps {
    selectedJob: Job;
    selectedCandidate: Candidate;
    pitch: string;
    candidateDocuments: CandidateDocument[];
    selectedDocIds: Set<string>;
    resumeFile: File | null;
}

export default function StepReview({
    selectedJob,
    selectedCandidate,
    pitch,
    candidateDocuments,
    selectedDocIds,
    resumeFile,
}: StepReviewProps) {
    return (
        <div className="space-y-6">
            {/* Review banner */}
            <BaselAlertBox variant="info" title="Review">
                Review the submission below before it goes out. Once confirmed,{" "}
                {selectedCandidate.full_name} will receive an email notification
                and must approve this opportunity before it proceeds to the
                hiring company.
            </BaselAlertBox>

            {/* Role */}
            <div className="bg-base-200 border-l-4 border-primary p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/50 mb-3">
                    <i className="fa-duotone fa-regular fa-briefcase mr-2" />
                    Role
                </p>
                <p className="text-lg font-bold">{selectedJob.title}</p>
                {selectedJob.company_name && (
                    <p className="text-sm text-base-content/60 mt-1">
                        <i className="fa-duotone fa-regular fa-building mr-1" />
                        {selectedJob.company_name}
                    </p>
                )}
                {selectedJob.location && (
                    <p className="text-sm text-base-content/60 mt-1">
                        <i className="fa-duotone fa-regular fa-map-marker-alt mr-1" />
                        {selectedJob.location}
                    </p>
                )}
            </div>

            {/* Candidate */}
            <div className="bg-base-200 border-l-4 border-secondary p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/50 mb-3">
                    <i className="fa-duotone fa-regular fa-user mr-2" />
                    Candidate
                </p>
                <p className="text-lg font-bold">
                    {selectedCandidate.full_name}
                </p>
                <p className="text-sm text-base-content/60 mt-1">
                    {selectedCandidate.email}
                </p>
                {(selectedCandidate.current_title ||
                    selectedCandidate.current_company) && (
                    <p className="text-sm text-base-content/60 mt-1">
                        {selectedCandidate.current_title}
                        {selectedCandidate.current_title &&
                            selectedCandidate.current_company &&
                            " \u2022 "}
                        {selectedCandidate.current_company}
                    </p>
                )}
                {selectedCandidate.location && (
                    <p className="text-sm text-base-content/60 mt-1">
                        <i className="fa-duotone fa-regular fa-map-marker-alt mr-1" />
                        {selectedCandidate.location}
                    </p>
                )}
            </div>

            {/* Pitch */}
            <div className="bg-base-200 border-l-4 border-accent p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/50 mb-3">
                    <i className="fa-duotone fa-regular fa-message mr-2" />
                    Pitch
                </p>
                <div className="prose prose-sm max-w-none">
                    <MarkdownRenderer content={pitch} />
                </div>
            </div>

            {/* Documents */}
            {(selectedDocIds.size > 0 || resumeFile) && (
                <div className="bg-base-200 border-l-4 border-neutral p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/50 mb-3">
                        <i className="fa-duotone fa-regular fa-file mr-2" />
                        Documents
                    </p>
                    <div className="space-y-2">
                        {resumeFile && (
                            <div className="flex items-center gap-2 text-sm">
                                <i className="fa-duotone fa-regular fa-file-arrow-up text-primary" />
                                <span className="font-medium">
                                    {resumeFile.name}
                                </span>
                                <span className="text-base-content/40">
                                    (new upload)
                                </span>
                            </div>
                        )}
                        {Array.from(selectedDocIds).map((docId) => {
                            const doc = candidateDocuments.find(
                                (d) => d.id === docId,
                            );
                            return (
                                doc && (
                                    <div
                                        key={docId}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <i className="fa-duotone fa-regular fa-file text-base-content/40" />
                                        <span className="font-medium">
                                            {doc.file_name || doc.filename || "Document"}
                                        </span>
                                    </div>
                                )
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
