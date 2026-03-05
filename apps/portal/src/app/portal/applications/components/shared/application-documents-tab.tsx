"use client";

import { useState } from "react";
import DocumentViewerModal from "@/app/portal/applications/components/modals/document-viewer-modal";
import { categorizeDocuments } from "../../lib/permission-utils";
import type { Application } from "../../types";

interface DocumentsTabProps {
    application: Application;
}

export function ApplicationDocumentsTab({ application }: DocumentsTabProps) {
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    const documents = application.documents || [];
    const { candidateDocuments, companyDocuments } = categorizeDocuments(documents);

    if (documents.length === 0) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-file text-4xl mb-2 block" />
                <p>No documents attached to this application.</p>
            </div>
        );
    }

    const getDocIcon = (docType: string | null) => {
        switch (docType) {
            case "resume": return "fa-file-user";
            case "cover_letter": return "fa-file-lines";
            case "portfolio": return "fa-folder-open";
            case "reference": return "fa-file-certificate";
            default: return "fa-file";
        }
    };

    const renderDocumentList = (docs: any[], title: string) => (
        <div className="border-l-4 border-primary">
            <div className="px-6 py-3 border-b border-base-300">
                <h4 className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                    {title}
                </h4>
            </div>
            <div className="divide-y divide-base-200">
                {docs.map((doc: any) => (
                    <div
                        key={doc.id}
                        className="flex items-center justify-between px-6 py-3 bg-base-200/50 hover:bg-base-200 transition-colors"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <i className={`fa-duotone fa-regular ${getDocIcon(doc.document_type)} text-primary`} />
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm truncate">{doc.file_name}</div>
                                <div className="text-xs text-base-content/50">
                                    {doc.document_type?.replace("_", " ").toUpperCase()}
                                    {doc.file_size && ` \u2022 ${(doc.file_size / 1024).toFixed(1)} KB`}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {doc.metadata?.is_primary && (
                                <span className="text-sm uppercase tracking-[0.2em] font-bold px-2 py-0.5 bg-primary/15 text-primary">
                                    Primary
                                </span>
                            )}
                            <button
                                onClick={() => { setSelectedDocument(doc); setShowDocumentModal(true); }}
                                className="btn btn-ghost btn-sm btn-square"
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <div className="space-y-6">
                {candidateDocuments.length > 0 && renderDocumentList(candidateDocuments, "From Candidate")}
                {companyDocuments.length > 0 && renderDocumentList(companyDocuments, "From Company")}
            </div>
            <DocumentViewerModal
                document={selectedDocument}
                isOpen={showDocumentModal}
                onClose={() => { setShowDocumentModal(false); setSelectedDocument(null); }}
            />
        </>
    );
}
