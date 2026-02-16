"use client";

/**
 * Resume Step - Step 3 of Candidate Onboarding
 * Optional resume upload
 */

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useOnboarding } from "../onboarding-provider";
import { createAuthenticatedClient } from "@/lib/api-client";

const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.txt";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ResumeStep() {
    const { state, updateProfileData, candidateId } = useOnboarding();
    const { getToken } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ];
        if (!validTypes.includes(file.type)) {
            setUploadError("Please upload a PDF, DOC, DOCX, or TXT file");
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setUploadError("File size must be less than 10MB");
            return;
        }

        setUploadError(null);
        setUploading(true);

        try {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");

            const apiClient = createAuthenticatedClient(token);

            // Ensure candidateId is available
            if (!candidateId) {
                throw new Error("No candidate ID available for file upload");
            }

            // Direct upload with FormData (matches working pattern)
            const formData = new FormData();
            formData.append("file", file);
            formData.append("entity_type", "candidate");
            formData.append("entity_id", candidateId);
            formData.append("document_type", "resume");

            const response = await apiClient.post("/documents", formData);

            // Update state with document ID from V2 response
            const documentId = response.data?.id || response.id;
            updateProfileData({
                resumeFile: file,
                resumeUploaded: true,
                resumeDocumentId: documentId,
            });
        } catch (error) {
            console.error("[ResumeStep] Upload failed:", error);
            setUploadError(
                error instanceof Error
                    ? error.message
                    : "Failed to upload resume",
            );
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = async () => {
        if (state.profileData.resumeDocumentId) {
            try {
                const token = await getToken();
                if (token) {
                    const apiClient = createAuthenticatedClient(token);
                    await apiClient.delete(
                        `/documents/${state.profileData.resumeDocumentId}`,
                    );
                }
            } catch (error) {
                console.error("[ResumeStep] Failed to delete document:", error);
            }
        }

        updateProfileData({
            resumeFile: null,
            resumeUploaded: false,
            resumeDocumentId: undefined,
        });
        setUploadError(null);
    };

    const hasUploadedResume =
        state.profileData.resumeUploaded && state.profileData.resumeFile;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning/10 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-file-lines text-3xl text-warning"></i>
                </div>
                <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                    Upload Your Resume
                    <span className="badge badge-warning badge-sm">
                        Optional
                    </span>
                </h2>
                <p className="text-base-content/70 text-sm">
                    A resume helps recruiters understand your experience better.
                </p>
            </div>

            {/* Upload Area */}
            <div className="mx-auto">
                {hasUploadedResume ? (
                    // Show uploaded file
                    <div className="border-2 border-success border-dashed rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-file-check text-2xl text-success"></i>
                                </div>
                                <div>
                                    <p className="font-medium truncate max-w-[200px]">
                                        {state.profileData.resumeFile?.name}
                                    </p>
                                    <p className="text-xs text-base-content/60">
                                        {state.profileData.resumeFile?.size
                                            ? `${(state.profileData.resumeFile.size / 1024).toFixed(1)} KB`
                                            : "Uploaded"}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm btn-square"
                                onClick={handleRemoveFile}
                                title="Remove file"
                            >
                                <i className="fa-duotone fa-regular fa-xmark"></i>
                            </button>
                        </div>
                        <p className="text-xs text-success mt-3 text-center">
                            <i className="fa-duotone fa-regular fa-check-circle mr-1"></i>
                            Resume uploaded successfully!
                        </p>
                    </div>
                ) : (
                    // Show upload input
                    <div className="border-2 border-dashed border-base-300 rounded-lg p-8 hover:border-coral transition-colors">
                        <div className="text-center">
                            {uploading ? (
                                <>
                                    <span className="loading loading-spinner loading-lg text-primary"></span>
                                    <p className="mt-3 text-sm text-base-content/70">
                                        Uploading your resume...
                                    </p>
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-cloud-arrow-up text-4xl text-base-content/40"></i>
                                    <p className="mt-3 text-sm">
                                        <label className="link link-primary cursor-pointer">
                                            Click to upload
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept={ACCEPTED_FILE_TYPES}
                                                onChange={handleFileSelect}
                                                disabled={uploading}
                                            />
                                        </label>{" "}
                                        or drag and drop
                                    </p>
                                    <p className="text-xs text-base-content/60 mt-1">
                                        PDF, DOC, DOCX, or TXT - Max 10MB
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {uploadError && (
                    <div className="alert alert-error mt-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span className="text-sm">{uploadError}</span>
                    </div>
                )}
            </div>

            {/* Skip Note */}
            <div className="bg-base-200 rounded-lg p-4 mx-auto">
                <div className="flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-lightbulb text-info text-xl mt-0.5"></i>
                    <div>
                        <h4 className="font-medium text-sm">
                            No resume ready?
                        </h4>
                        <p className="text-xs text-base-content/70 mt-1">
                            No problem! You can skip this step and upload your
                            resume later from your profile page.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
