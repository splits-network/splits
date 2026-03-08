"use client";

import { MarkdownEditor } from "@splits-network/shared-ui";
import CompanyDocumentUpload, {
    StagedDocument,
} from "@/components/documents/company-document-upload";

interface StepOfferDetailsProps {
    salary: string;
    setSalary: (v: string) => void;
    startDate: string;
    setStartDate: (v: string) => void;
    notes: string;
    setNotes: (v: string) => void;
    showDocUpload: boolean;
    setShowDocUpload: (v: boolean) => void;
    stagedDocuments: StagedDocument[];
    setStagedDocuments: (docs: StagedDocument[]) => void;
    applicationId: string;
}

export default function StepOfferDetails({
    salary,
    setSalary,
    startDate,
    setStartDate,
    notes,
    setNotes,
    showDocUpload,
    setShowDocUpload,
    stagedDocuments,
    setStagedDocuments,
    applicationId,
}: StepOfferDetailsProps) {
    return (
        <div>
            <h2 className="text-2xl font-black tracking-tight mb-1">
                Offer Details
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Configure the compensation and start date for this offer.
            </p>

            <div className="space-y-6">
                {/* Salary */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Annual Salary (USD) *</legend>
                    <input
                        type="number"
                        className="input w-full"
                        placeholder="e.g. 120000"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        min={0}
                        required
                    />
                    <p className="fieldset-label">
                        Enter the annual base salary for this offer.
                    </p>
                </fieldset>

                {/* Start Date */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Proposed Start Date *</legend>
                    <input
                        type="date"
                        className="input w-full"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                    <p className="fieldset-label">
                        The expected first day for this candidate.
                    </p>
                </fieldset>

                {/* Document Upload */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <i className="fa-duotone fa-regular fa-file-contract text-primary" />
                        <span className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/50">
                            Offer Documents (Optional)
                        </span>
                        <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            style={{ borderRadius: 0 }}
                            onClick={() => setShowDocUpload(!showDocUpload)}
                        >
                            {showDocUpload ? (
                                <>
                                    <i className="fa-duotone fa-regular fa-chevron-up" />
                                    Hide
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-chevron-down" />
                                    Add Documents
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-sm text-base-content/40 mb-3">
                        Upload offer letters, contracts, or other documents to include with your offer.
                    </p>

                    {showDocUpload && (
                        <div className="bg-base-100 border border-base-300 p-4">
                            <CompanyDocumentUpload
                                entityType="application"
                                entityId={applicationId}
                                staged={true}
                                onFilesStaged={(files) => setStagedDocuments(files)}
                                onError={(error) => console.error("Document staging failed:", error)}
                                compact={true}
                                maxSizeKB={5120}
                            />
                        </div>
                    )}

                    {!showDocUpload && stagedDocuments.length > 0 && (
                        <p className="text-sm text-success">
                            <i className="fa-duotone fa-regular fa-check mr-1" />
                            {stagedDocuments.length} document{stagedDocuments.length !== 1 ? "s" : ""} ready to upload
                        </p>
                    )}
                </div>

                {/* Notes */}
                <MarkdownEditor
                    label="Message for the Recruiter (Optional)"
                    value={notes}
                    onChange={setNotes}
                    placeholder="Add any notes or context for the recruiter about this offer..."
                    height={160}
                    preview="edit"
                />
            </div>
        </div>
    );
}
