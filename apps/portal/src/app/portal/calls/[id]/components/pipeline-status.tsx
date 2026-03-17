"use client";

import type {
    CallRecording,
    CallTranscript,
    CallSummary,
} from "../../hooks/use-call-detail";

interface PipelineStatusProps {
    recordings?: CallRecording[];
    transcript?: CallTranscript | null;
    summary?: CallSummary | null;
}

interface PipelineStep {
    key: string;
    label: string;
    icon: string;
}

const STEPS: PipelineStep[] = [
    { key: "recording", label: "Recording", icon: "fa-circle-play" },
    { key: "transcribing", label: "Transcribing", icon: "fa-file-lines" },
    { key: "summarizing", label: "Summarizing", icon: "fa-sparkles" },
    { key: "complete", label: "Complete", icon: "fa-circle-check" },
];

type StepState = "completed" | "active" | "upcoming" | "failed";

function getStepStates(
    recordings?: CallRecording[],
    transcript?: CallTranscript | null,
    summary?: CallSummary | null
): Record<string, StepState> {
    const states: Record<string, StepState> = {
        recording: "upcoming",
        transcribing: "upcoming",
        summarizing: "upcoming",
        complete: "upcoming",
    };

    // No recordings at all
    if (!recordings || recordings.length === 0) {
        states.recording = "active";
        return states;
    }

    const hasReadyRecording = recordings.some(
        (r) => r.recording_status === "ready"
    );
    const hasFailedRecording =
        !hasReadyRecording &&
        recordings.some((r) => r.recording_status === "failed");

    if (hasFailedRecording) {
        states.recording = "failed";
        return states;
    }

    if (!hasReadyRecording) {
        states.recording = "active";
        return states;
    }

    // Recording is ready
    states.recording = "completed";

    // Check transcript
    if (
        !transcript ||
        transcript.transcript_status === "pending" ||
        transcript.transcript_status === "processing"
    ) {
        states.transcribing = "active";
        return states;
    }

    if (transcript.transcript_status === "failed") {
        states.transcribing = "failed";
        return states;
    }

    // Transcript is ready
    states.transcribing = "completed";

    // Check summary
    if (
        !summary ||
        summary.summary_status === "pending" ||
        summary.summary_status === "processing"
    ) {
        states.summarizing = "active";
        return states;
    }

    if (summary.summary_status === "failed") {
        states.summarizing = "failed";
        return states;
    }

    // Summary is ready
    states.summarizing = "completed";
    states.complete = "completed";
    return states;
}

function getStepClass(state: StepState): string {
    switch (state) {
        case "completed":
            return "step-primary";
        case "active":
            return "step-primary";
        case "failed":
            return "step-error";
        case "upcoming":
        default:
            return "";
    }
}

export function PipelineStatus({
    recordings,
    transcript,
    summary,
}: PipelineStatusProps) {
    const states = getStepStates(recordings, transcript, summary);

    // Don't render if pipeline is complete
    if (states.complete === "completed") return null;

    // Don't render if no recordings exist at all
    if (!recordings || recordings.length === 0) return null;

    return (
        <div className="border-2 border-base-300 bg-base-200 px-6 py-4">
            <ul className="steps steps-horizontal w-full">
                {STEPS.map((step) => {
                    const state = states[step.key];
                    return (
                        <li
                            key={step.key}
                            className={`step ${getStepClass(state)}`}
                        >
                            <span className="flex items-center gap-2 text-sm">
                                {state === "active" ? (
                                    <span className="loading loading-spinner loading-xs" />
                                ) : (
                                    <i
                                        className={`fa-duotone fa-regular ${step.icon}`}
                                    />
                                )}
                                {step.label}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
