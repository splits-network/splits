"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSmartResume } from "./use-smart-resume";
import { SmartResumeHeader } from "./smart-resume-header";
import { ImportReview } from "./import-review";
import { ResizableSplit } from "./resizable-split";
import { ResumePreview } from "./resume-preview";
import { TabExperiences } from "./tab-experiences";
import { TabProjects } from "./tab-projects";
import { TabTasks } from "./tab-tasks";
import { TabSkills } from "./tab-skills";
import { TabEducation } from "./tab-education";
import { TabCertifications } from "./tab-certifications";
import { TabPublications } from "./tab-publications";
import type { SmartResumeTab } from "./types";

const TABS: { id: SmartResumeTab; label: string; icon: string }[] = [
    {
        id: "experience",
        label: "Experience",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        id: "projects",
        label: "Projects",
        icon: "fa-duotone fa-regular fa-diagram-project",
    },
    {
        id: "tasks",
        label: "Tasks",
        icon: "fa-duotone fa-regular fa-list-check",
    },
    { id: "skills", label: "Skills", icon: "fa-duotone fa-regular fa-tags" },
    {
        id: "education",
        label: "Education",
        icon: "fa-duotone fa-regular fa-graduation-cap",
    },
    {
        id: "certifications",
        label: "Certs",
        icon: "fa-duotone fa-regular fa-certificate",
    },
    {
        id: "publications",
        label: "Pubs",
        icon: "fa-duotone fa-regular fa-file-lines",
    },
];

export function SmartResumeShell() {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<SmartResumeTab>("experience");
    const [previewData, setPreviewData] = useState<any>(null);
    const [previewDocumentId, setPreviewDocumentId] = useState<string>();

    const resume = useSmartResume(getToken);

    // AI parse-resume is disabled — officeparser handles extraction in document-processing-service
    // To re-enable AI enrichment later, uncomment and wire back to resume.parseResume
    // const handleParseResume = async (documentId: string) => {
    //     const result = await resume.parseResume(documentId);
    //     if (result?.mode === "preview") {
    //         setPreviewData(result);
    //         setPreviewDocumentId(documentId);
    //     }
    // };

    const handleCommitImport = async (
        selections: any[],
        profileUpdates?: Record<string, any>,
        documentId?: string,
    ) => {
        await resume.commitImport(selections, profileUpdates, documentId);
        setPreviewData(null);
        setPreviewDocumentId(undefined);
    };

    if (resume.loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    if (resume.error) {
        return (
            <div className="container mx-auto px-6 py-12">
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation" />
                    <span>{resume.error}</span>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={resume.refresh}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (previewData) {
        return (
            <ImportReview
                previewData={previewData}
                documentId={previewDocumentId}
                onCommit={handleCommitImport}
                onCancel={() => {
                    setPreviewData(null);
                    setPreviewDocumentId(undefined);
                }}
            />
        );
    }

    const editorPanel = (
        <div className="p-6 lg:p-8">
            {/* Tab navigation */}
            <div role="tablist" className="tabs tabs-border mb-8">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        className={`tab gap-2 ${activeTab === tab.id ? "tab-active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <i className={tab.icon} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === "experience" && (
                <TabExperiences
                    experiences={resume.experiences}
                    onCreate={(f) => resume.createEntry("experiences", f)}
                    onUpdate={(id, f) =>
                        resume.updateEntry("experiences", id, f)
                    }
                    onDelete={(id) => resume.deleteEntry("experiences", id)}
                    onToggleVisibility={(id, c) =>
                        resume.toggleVisibility("experiences", id, c)
                    }
                />
            )}
            {activeTab === "projects" && (
                <TabProjects
                    projects={resume.projects}
                    experiences={resume.experiences}
                    onCreate={(f) => resume.createEntry("projects", f)}
                    onUpdate={(id, f) => resume.updateEntry("projects", id, f)}
                    onDelete={(id) => resume.deleteEntry("projects", id)}
                    onToggleVisibility={(id, c) =>
                        resume.toggleVisibility("projects", id, c)
                    }
                />
            )}
            {activeTab === "tasks" && (
                <TabTasks
                    tasks={resume.tasks}
                    experiences={resume.experiences}
                    projects={resume.projects}
                    onCreate={(f) => resume.createEntry("tasks", f)}
                    onUpdate={(id, f) => resume.updateEntry("tasks", id, f)}
                    onDelete={(id) => resume.deleteEntry("tasks", id)}
                    onToggleVisibility={(id, c) =>
                        resume.toggleVisibility("tasks", id, c)
                    }
                />
            )}
            {activeTab === "skills" && (
                <TabSkills
                    skills={resume.skills}
                    onCreate={(f) => resume.createEntry("skills", f)}
                    onUpdate={(id, f) => resume.updateEntry("skills", id, f)}
                    onDelete={(id) => resume.deleteEntry("skills", id)}
                    onToggleVisibility={(id, c) =>
                        resume.toggleVisibility("skills", id, c)
                    }
                />
            )}
            {activeTab === "education" && (
                <TabEducation
                    education={resume.education}
                    onCreate={(f) => resume.createEntry("education", f)}
                    onUpdate={(id, f) => resume.updateEntry("education", id, f)}
                    onDelete={(id) => resume.deleteEntry("education", id)}
                    onToggleVisibility={(id, c) =>
                        resume.toggleVisibility("education", id, c)
                    }
                />
            )}
            {activeTab === "certifications" && (
                <TabCertifications
                    certifications={resume.certifications}
                    onCreate={(f) => resume.createEntry("certifications", f)}
                    onUpdate={(id, f) =>
                        resume.updateEntry("certifications", id, f)
                    }
                    onDelete={(id) => resume.deleteEntry("certifications", id)}
                    onToggleVisibility={(id, c) =>
                        resume.toggleVisibility("certifications", id, c)
                    }
                />
            )}
            {activeTab === "publications" && (
                <TabPublications
                    publications={resume.publications}
                    onCreate={(f) => resume.createEntry("publications", f)}
                    onUpdate={(id, f) =>
                        resume.updateEntry("publications", id, f)
                    }
                    onDelete={(id) => resume.deleteEntry("publications", id)}
                    onToggleVisibility={(id, c) =>
                        resume.toggleVisibility("publications", id, c)
                    }
                />
            )}
        </div>
    );

    const previewPanel = (
        <div className="border-l border-base-300 h-full bg-base-200/30">
            <div className="px-6 py-3 border-b border-base-300 bg-base-100">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40">
                    Resume Preview
                </p>
            </div>
            <ResumePreview
                profile={resume.profile}
                experiences={resume.experiences}
                projects={resume.projects}
                skills={resume.skills}
                education={resume.education}
                certifications={resume.certifications}
                publications={resume.publications}
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-base-100 flex flex-col">
            {/* Desktop: resizable split. Mobile: editor only (preview hidden) */}
            <div
                className="flex-1 hidden lg:block"
                style={{ height: "calc(100vh - 200px)" }}
            >
                <ResizableSplit
                    left={
                        <>
                            <SmartResumeHeader
                                profile={resume.profile}
                                candidateId={resume.candidateId}
                                onUpdateProfile={resume.updateProfile}
                                onImportComplete={resume.refresh}
                                onGenerateResume={resume.generateResume}
                            />
                            {editorPanel}
                        </>
                    }
                    right={previewPanel}
                    defaultLeftPercent={60}
                    minLeftPercent={40}
                    maxLeftPercent={75}
                />
            </div>

            {/* Mobile: editor only */}
            <div className="lg:hidden">{editorPanel}</div>
        </div>
    );
}
