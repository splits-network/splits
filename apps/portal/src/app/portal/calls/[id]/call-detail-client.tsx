"use client";

import { useState } from "react";
import { useCallDetail } from "../hooks/use-call-detail";
import { useUserProfile } from "@/contexts/user-profile-context";
import { CallDetailHeader } from "./components/call-detail-header";
import { RecordingTab } from "./components/recording-tab";
import { TranscriptTab } from "./components/transcript-tab";
import { SummaryTab } from "./components/summary-tab";
import { PipelineStatus } from "./components/pipeline-status";
import { CallContextPanel } from "./components/call-context-panel";
import { CallNotesSection } from "./components/call-notes-section";
import { CallParticipantsSection } from "./components/call-participants-section";
import { RelatedCallsSection } from "./components/related-calls-section";
import { UpgradePrompt } from "@/components/entitlements/upgrade-prompt";

type TabKey = "recording" | "transcript" | "summary";

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "recording", label: "Recording", icon: "fa-circle-play" },
    { key: "transcript", label: "Transcript", icon: "fa-file-lines" },
    { key: "summary", label: "AI Summary", icon: "fa-sparkles" },
];

export function CallDetailClient({ callId }: { callId: string }) {
    const {
        call,
        relatedCalls,
        isLoading,
        error,
        refetch,
        isPipelineProcessing,
        currentTimestamp,
        setCurrentTimestamp,
    } = useCallDetail(callId);
    const { hasEntitlement } = useUserProfile();
    const [activeTab, setActiveTab] = useState<TabKey>("recording");

    if (isLoading) {
        return (
            <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                <span className="loading loading-spinner loading-lg text-primary mb-6 block" />
                <p className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                    Loading call...
                </p>
            </div>
        );
    }

    if (error || !call) {
        return (
            <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                <i className="fa-duotone fa-regular fa-triangle-exclamation text-5xl text-error/30 mb-6 block" />
                <h3 className="text-2xl font-black tracking-tight mb-2">
                    Failed to load call
                </h3>
                <p className="text-base-content/50 mb-6">
                    {error || "Call not found."}
                </p>
                <a
                    href="/portal/calls"
                    className="btn btn-outline btn-sm"
                    style={{ borderRadius: 0 }}
                >
                    Back to Calls
                </a>
            </div>
        );
    }

    const { recording_enabled, transcription_enabled, ai_analysis_enabled } = call;

    const isTranscriptLocked = !hasEntitlement("call_transcription");
    const isSummaryLocked = !hasEntitlement("ai_call_summary");

    function renderTabContent() {
        if (activeTab === "recording") {
            return (
                <RecordingTab
                    recordings={call!.recordings}
                    currentTimestamp={currentTimestamp}
                    onTimestampChange={setCurrentTimestamp}
                    recordingEnabled={recording_enabled}
                />
            );
        }

        if (activeTab === "transcript") {
            if (isTranscriptLocked) {
                return (
                    <UpgradePrompt
                        entitlement="call_transcription"
                        variant="card"
                    />
                );
            }
            if (!transcription_enabled) {
                return (
                    <div className="border-2 border-base-300 p-8 text-center">
                        <i className="fa-duotone fa-regular fa-file-lines text-4xl text-base-content/15 mb-4 block" />
                        <p className="font-bold mb-1">Transcription Not Enabled</p>
                        <p className="text-sm text-base-content/50">
                            Transcription was not enabled for this call.
                        </p>
                    </div>
                );
            }
            return (
                <TranscriptTab
                    transcript={call!.transcript}
                    currentTimestamp={currentTimestamp}
                    onTimestampSeek={setCurrentTimestamp}
                />
            );
        }

        if (activeTab === "summary") {
            if (isSummaryLocked) {
                return (
                    <UpgradePrompt
                        entitlement="ai_call_summary"
                        variant="card"
                    />
                );
            }
            if (!ai_analysis_enabled) {
                return (
                    <div className="border-2 border-base-300 p-8 text-center">
                        <i className="fa-duotone fa-regular fa-sparkles text-4xl text-base-content/15 mb-4 block" />
                        <p className="font-bold mb-1">AI Analysis Not Enabled</p>
                        <p className="text-sm text-base-content/50">
                            AI analysis was not enabled for this call.
                        </p>
                    </div>
                );
            }
            return <SummaryTab summary={call!.summary} />;
        }

        return null;
    }

    return (
        <div>
            <CallDetailHeader call={call} onRefetch={refetch} />

            <div className="flex flex-col lg:flex-row">
                {/* Main Content — left column */}
                <div className="flex-1 min-w-0 p-6">
                    {/* Pipeline Status */}
                    {isPipelineProcessing && (
                        <div className="mb-6">
                            <PipelineStatus
                                recordings={call.recordings}
                                transcript={call.transcript}
                                summary={call.summary}
                            />
                        </div>
                    )}

                    {/* Tabs */}
                    <div
                        role="tablist"
                        className="tabs tabs-bordered mb-6"
                    >
                        {TABS.map((tab) => {
                            const isLocked =
                                (tab.key === "transcript" && isTranscriptLocked) ||
                                (tab.key === "summary" && isSummaryLocked);
                            return (
                                <button
                                    key={tab.key}
                                    role="tab"
                                    className={`tab gap-2 ${activeTab === tab.key ? "tab-active font-bold" : ""}`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    <i className={`fa-duotone fa-regular ${tab.icon}`} />
                                    {tab.label}
                                    {isLocked && (
                                        <i className="fa-duotone fa-regular fa-lock text-base-content/30 text-xs" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    {renderTabContent()}

                    {/* Below-tab sections */}
                    <div className="mt-8 space-y-8">
                        <CallNotesSection
                            callId={call.id}
                            notes={call.notes || []}
                            onRefetch={refetch}
                        />
                        <CallParticipantsSection
                            participants={call.participants}
                        />
                        <RelatedCallsSection
                            calls={relatedCalls}
                            currentCallId={call.id}
                            entityLink={call.entity_links?.[0] || null}
                        />
                    </div>
                </div>

                {/* Context Panel — right column */}
                <div className="w-full lg:w-[380px] lg:border-l-2 border-base-300 p-6">
                    <CallContextPanel call={call} />
                </div>
            </div>
        </div>
    );
}
