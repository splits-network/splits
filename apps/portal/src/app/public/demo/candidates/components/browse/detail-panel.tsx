"use client";

import { useState } from "react";
import { Candidate } from "@splits-network/shared-types";
import { DetailHeader } from "./detail-header";
import { DetailInfo } from "./detail-info";
import { DetailApplications } from "./detail-applications";
import { DetailNotes } from "./detail-notes";
import { DetailActivity } from "./detail-activity";

interface DetailPanelProps {
    candidate: Candidate | null;
    onEdit: () => void;
    onDelete: () => void;
    loading: boolean;
}

export function DetailPanel({
    candidate,
    onEdit,
    onDelete,
    loading,
}: DetailPanelProps) {
    const [activeTab, setActiveTab] = useState<
        "overview" | "applications" | "notes" | "activity"
    >("overview");

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <i className="fa-duotone fa-regular fa-user-plus text-4xl text-base-content/30 mb-4"></i>
                <h3 className="text-lg font-medium mb-2">Select a candidate</h3>
                <p className="text-base-content/70">
                    Choose a candidate from the list to view their details
                </p>
            </div>
        );
    }

    const tabs = [
        { id: "overview", label: "Overview", icon: "fa-user" },
        { id: "applications", label: "Applications", icon: "fa-briefcase" },
        { id: "notes", label: "Notes", icon: "fa-note" },
        { id: "activity", label: "Activity", icon: "fa-clock" },
    ] as const;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b border-base-200 bg-base-50">
                <DetailHeader
                    candidate={candidate}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </div>

            {/* Tabs */}
            <div className="border-b border-base-200 bg-base-50">
                <div className="tabs tabs-border px-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab ${activeTab === tab.id ? "tab-active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <i
                                className={`fa-duotone fa-regular ${tab.icon} mr-2`}
                            ></i>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === "overview" && (
                    <DetailInfo candidate={candidate} />
                )}
                {activeTab === "applications" && (
                    <DetailApplications candidate={candidate} />
                )}
                {activeTab === "notes" && <DetailNotes candidate={candidate} />}
                {activeTab === "activity" && (
                    <DetailActivity candidate={candidate} />
                )}
            </div>
        </div>
    );
}
