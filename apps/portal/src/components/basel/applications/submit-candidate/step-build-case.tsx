import { useRef } from "react";
import { MarkdownEditor } from "@splits-network/shared-ui";
import type { Job, Candidate, CandidateDocument } from "./types";

interface StepBuildCaseProps {
    selectedJob: Job | null;
    selectedCandidate: Candidate;
    pitch: string;
    onPitchChange: (pitch: string) => void;
    candidateDocuments: CandidateDocument[];
    selectedDocIds: Set<string>;
    onSelectedDocIdsChange: (ids: Set<string>) => void;
    resumeFile: File | null;
    onResumeFileChange: (file: File | null) => void;
    onFileError: (message: string) => void;
    /** Company users sending a recommendation — no documents, optional message */
    isRecommendation?: boolean;
}

export default function StepBuildCase({
    selectedJob,
    selectedCandidate,
    pitch,
    onPitchChange,
    candidateDocuments,
    selectedDocIds,
    onSelectedDocIdsChange,
    resumeFile,
    onResumeFileChange,
    onFileError,
    isRecommendation,
}: StepBuildCaseProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];
            if (!allowedTypes.includes(file.type)) {
                onFileError("Please upload a PDF or Word document (.pdf, .doc, .docx)");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                onFileError("File size must be less than 10MB");
                return;
            }
            onResumeFileChange(file);
        }
    };

    return (
        <div className="space-y-6">
            {/* Context cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-base-200 border-l-4 border-primary p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/50 mb-2">
                        <i className="fa-duotone fa-regular fa-briefcase mr-2" />
                        Role
                    </p>
                    <p className="font-bold text-lg">{selectedJob?.title}</p>
                    {selectedJob?.company_name && (
                        <p className="text-sm text-base-content/60">
                            {selectedJob.company_name}
                        </p>
                    )}
                </div>

                <div className="bg-base-200 border-l-4 border-secondary p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/50 mb-2">
                        <i className="fa-duotone fa-regular fa-user mr-2" />
                        Candidate
                    </p>
                    <p className="font-bold text-lg">
                        {selectedCandidate.full_name}
                    </p>
                    <p className="text-sm text-base-content/60">
                        {selectedCandidate.email}
                    </p>
                </div>
            </div>

            {/* Message / Pitch */}
            <div>
                <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                    {isRecommendation ? "Message to Candidate" : "Your Pitch"}{" "}
                    {!isRecommendation && <span className="text-error">*</span>}
                </label>
                <MarkdownEditor
                    value={pitch}
                    onChange={onPitchChange}
                    placeholder={
                        isRecommendation
                            ? "Optional — add a note about why this role is a good fit for them."
                            : "Explain why this candidate is positioned for this specific role. Speak to their background, their fit, and what sets them apart."
                    }
                    height={isRecommendation ? 150 : 220}
                    maxLength={isRecommendation ? 2000 : 500}
                    showCount
                />
            </div>

            {/* Documents from profile — recruiters only */}
            {!isRecommendation && candidateDocuments.length > 0 && (
                <fieldset>
                    <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3 block">
                        Supporting Documents
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {candidateDocuments.map((doc) => (
                            <label
                                key={doc.id}
                                className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                                    selectedDocIds.has(doc.id)
                                        ? "border-primary bg-primary/5"
                                        : "border-base-300 hover:border-base-content/20"
                                }`}
                                style={{ borderRadius: 0 }}
                            >
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary checkbox-sm"
                                    checked={selectedDocIds.has(doc.id)}
                                    onChange={(e) => {
                                        const newSelected = new Set(
                                            selectedDocIds,
                                        );
                                        if (e.target.checked) {
                                            newSelected.add(doc.id);
                                        } else {
                                            newSelected.delete(doc.id);
                                        }
                                        onSelectedDocIdsChange(newSelected);
                                    }}
                                />
                                <i className="fa-duotone fa-regular fa-file text-base-content/40" />
                                <span className="text-sm font-medium">
                                    {doc.file_name || doc.filename || "Document"}
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>
            )}

            {/* Resume upload — recruiters only */}
            {!isRecommendation && (
                <fieldset>
                    <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                        Attach Additional Resume
                    </label>
                    <p className="text-sm text-base-content/40 mb-3">
                        Optional — attach a current version or one tailored to this
                        role.
                    </p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="file-input w-full"
                        style={{ borderRadius: 0 }}
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                    />
                    {resumeFile && (
                        <div className="mt-3 flex items-center gap-3 bg-base-200 p-3">
                            <i className="fa-duotone fa-regular fa-file text-primary" />
                            <span className="text-sm font-medium flex-1">
                                {resumeFile.name}
                            </span>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                style={{ borderRadius: 0 }}
                                onClick={() => {
                                    onResumeFileChange(null);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                    }
                                }}
                            >
                                <i className="fa-duotone fa-regular fa-xmark" />
                            </button>
                        </div>
                    )}
                </fieldset>
            )}
        </div>
    );
}
