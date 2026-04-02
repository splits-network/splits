"use client";

import { useState } from "react";
import type { ApplicationDocument } from "../../types";
import DocumentViewerModal from "../modals/document-viewer-modal";

const COMPANY_DOC_TYPES = [
    "offer_letter",
    "employment_contract",
    "benefits_summary",
    "company_handbook",
    "nda",
    "company_document",
];

function getDocIcon(docType: string | null) {
    switch (docType) {
        case "resume":
            return "fa-file-text";
        case "cover_letter":
            return "fa-file-lines";
        case "offer_letter":
            return "fa-file-signature";
        case "employment_contract":
            return "fa-file-contract";
        default:
            if (COMPANY_DOC_TYPES.includes(docType || "")) return "fa-building";
            return "fa-file";
    }
}

interface ApplicationDocumentsTabProps {
    documents: ApplicationDocument[];
}

export function ApplicationDocumentsTab({ documents }: ApplicationDocumentsTabProps) {
    const [selectedDocument, setSelectedDocument] = useState<ApplicationDocument | null>(null);
    const [showModal, setShowModal] = useState(false);

    if (documents.length === 0) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-regular fa-file text-4xl mb-2 block" />
                <p>No documents attached to this application.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-2">
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-base-200 hover:bg-base-200/80 transition-colors"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <i className={`fa-duotone fa-regular ${getDocIcon(doc.document_type)} text-primary`} />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{doc.file_name}</p>
                                <p className="text-xs text-base-content/50">
                                    {doc.document_type?.replace(/_/g, " ").toUpperCase()}
                                    {doc.file_size && ` \u2022 ${(doc.file_size / 1024).toFixed(1)} KB`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {doc.metadata?.is_primary && (
                                <span className="text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 bg-primary/15 text-primary">
                                    Primary
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSelectedDocument(doc);
                                    setShowModal(true);
                                }}
                                className="btn btn-ghost btn-sm btn-square"
                                style={{ borderRadius: 0 }}
                                title="View document"
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <DocumentViewerModal
                document={selectedDocument}
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedDocument(null);
                }}
            />
        </>
    );
}
