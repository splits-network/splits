"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type {
    CallListItem,
    CallParticipantItem,
    CallEntityLink,
    CallTagLink,
} from "../types";

// ── Artifact Types ──

export type RecordingStatus = "pending" | "recording" | "processing" | "ready" | "failed";
export type TranscriptStatus = "pending" | "processing" | "ready" | "failed";
export type SummaryStatus = "pending" | "processing" | "ready" | "failed";

export interface CallRecording {
    id: string;
    call_id: string;
    recording_status: RecordingStatus;
    egress_id: string | null;
    blob_url: string | null;
    duration_seconds: number | null;
    file_size_bytes: number | null;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
}

export interface CallTranscript {
    id: string;
    call_id: string;
    storage_url: string;
    transcript_status: TranscriptStatus;
    error: string | null;
    language: string;
    created_at: string;
    updated_at: string;
}

export interface CallSummary {
    id: string;
    call_id: string;
    summary: {
        key_points?: string[];
        action_items?: string[];
        decisions?: string[];
        follow_ups?: string[];
    };
    summary_status: SummaryStatus;
    error: string | null;
    model: string | null;
    created_at: string;
    updated_at: string;
}

export interface CallNote {
    id: string;
    call_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    user: {
        first_name: string;
        last_name: string;
    };
}

export interface CallDetail extends CallListItem {
    livekit_room_name: string | null;
    duration_minutes_planned: number | null;
    pre_call_notes: string | null;
    cancelled_by: string | null;
    cancel_reason: string | null;
    recordings?: CallRecording[];
    transcript?: CallTranscript | null;
    summary?: CallSummary | null;
    notes?: CallNote[];
}

// ── Shared Playback State ──

export interface PlaybackState {
    currentTimestamp: number;
    setCurrentTimestamp: (ts: number) => void;
}

// ── Hook ──

export function useCallDetail(callId: string) {
    const { getToken } = useAuth();
    const [call, setCall] = useState<CallDetail | null>(null);
    const [relatedCalls, setRelatedCalls] = useState<CallListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTimestamp, setCurrentTimestamp] = useState(0);

    const fetchCall = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);

            const res = await client.get<{ data: CallDetail }>(
                `/calls/${callId}?include=recordings,transcript,summary,notes,participants,entity_links`
            );
            if (res.data) {
                setCall(res.data);

                // Fetch related calls if entity linked
                const entityLink = res.data.entity_links?.[0];
                if (entityLink) {
                    try {
                        const relRes = await client.get<{
                            data: CallListItem[];
                        }>(
                            `/calls?entity_id=${entityLink.entity_id}&entity_type=${entityLink.entity_type}&limit=5`
                        );
                        if (relRes.data) {
                            setRelatedCalls(
                                relRes.data.filter((c) => c.id !== callId)
                            );
                        }
                    } catch {
                        // Related calls are non-critical
                    }
                }
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load call"
            );
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callId]);

    useEffect(() => {
        fetchCall();
    }, [fetchCall]);

    return {
        call,
        relatedCalls,
        isLoading,
        error,
        refetch: fetchCall,
        currentTimestamp,
        setCurrentTimestamp,
    };
}
