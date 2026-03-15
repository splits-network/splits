"use client";

import { useState } from "react";
import type { Application, ApplicationDocument } from "../../types";
import DocumentViewerModal from "../../components/modals/document-viewer-modal";

const COMPANY_DOC_TYPES = [
    "offer_letter",
    "employment_contract",
    "benefits_summary",
    "company_handbook",
    "nda",
    "company_document",
];

const DOC_ICONS: Record<string, string> = {
    offer_letter: "fa-file-signature",
    employment_contract: "fa-file-contract",
    benefits_summary: "fa-heart-pulse",
    company_handbook: "fa-book",
    nda: "fa-shield-check",
    company_document: "fa-building",
};

interface StepReviewDocumentsProps {
    application: Application;
}

export default function StepReviewDocuments({
    application,
}: StepReviewDocumentsProps) {
    const [selectedDoc, setSelectedDoc] = useState<ApplicationDocument | null>(
        null,
    );

    const documents = application.documents || [];
    const offerDocs = documents.filter((d) =>
        COMPANY_DOC_TYPES.includes(d.document_type || ""),
    );
    const otherDocs = documents.filter(
        (d) => !COMPANY_DOC_TYPES.includes(d.document_type || ""),
    );

    return (
        <div>
            <h2 className="text-2xl font-black tracking-tight mb-1">
                Offer Documents
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                The company has attached documents for you to review before
                accepting.
            </p>

            {/* Offer documents */}
            {offerDocs.length > 0 && (
                <div className="mb-8">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        <i className="fa-duotone fa-regular fa-file-contract mr-2" />
                        Company Documents
                    </p>
                    <div className="space-y-[2px]">
                        {offerDocs.map((doc) => (
                            <button
                                key={doc.id}
                                onClick={() => setSelectedDoc(doc)}
                                className="flex items-center gap-4 w-full p-4 bg-base-200 hover:bg-base-300 transition-colors text-left"
                            >
                                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <i
                                        className={`fa-duotone fa-regular ${DOC_ICONS[doc.document_type || ""] || "fa-file"} text-primary`}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold truncate">
                                        {doc.file_name}
                                    </p>
                                    <p className="text-sm text-base-content/50">
                                        {doc.document_type
                                            ?.replace(/_/g, " ")
                                            .toUpperCase()}
                                        {doc.file_size &&
                                            ` · ${(doc.file_size / 1024).toFixed(0)} KB`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-primary">
                                    <span className="text-sm font-semibold hidden sm:inline">
                                        View
                                    </span>
                                    <i className="fa-duotone fa-regular fa-arrow-right" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Other documents (resume, cover letter, etc.) */}
            {otherDocs.length > 0 && (
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Your Documents
                    </p>
                    <div className="space-y-[2px]">
                        {otherDocs.map((doc) => (
                            <button
                                key={doc.id}
                                onClick={() => setSelectedDoc(doc)}
                                className="flex items-center gap-4 w-full p-4 bg-base-200/50 hover:bg-base-200 transition-colors text-left"
                            >
                                <i className="fa-duotone fa-regular fa-file text-base-content/40" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                        {doc.file_name}
                                    </p>
                                    <p className="text-sm text-base-content/40">
                                        {doc.document_type
                                            ?.replace(/_/g, " ")
                                            .toUpperCase()}
                                    </p>
                                </div>
                                <i className="fa-duotone fa-regular fa-eye text-base-content/30" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Guidance */}
            <div className="bg-base-200 border-l-4 border-info p-4 mt-8">
                <p className="text-sm text-base-content/70">
                    <i className="fa-duotone fa-regular fa-lightbulb text-info mr-2" />
                    Review all documents carefully before proceeding. If you have
                    questions about any terms, reach out to your recruiter or the
                    company directly.
                </p>
            </div>

            <DocumentViewerModal
                document={selectedDoc}
                isOpen={!!selectedDoc}
                onClose={() => setSelectedDoc(null)}
            />
        </div>
    );
}
