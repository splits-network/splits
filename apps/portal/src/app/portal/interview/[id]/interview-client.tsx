'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import { useUser, useAuth } from '@clerk/nextjs';
import {
    type CallState,
    type LocalUserChoices,
    type InterviewContext,
    type TokenResult,
    useInterviewToken,
    useCallDuration,
    getLiveKitUrl,
    defaultRoomOptions,
    VideoLobby,
    VideoRoom,
    PostCallSummary,
} from '@splits-network/shared-video';

interface InterviewClientProps {
    interviewId: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_GATEWAY_URL || process.env.NEXT_PUBLIC_API_URL || '';

export function InterviewClient({ interviewId }: InterviewClientProps) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [callState, setCallState] = useState<CallState>('lobby');
    const [livekitToken, setLivekitToken] = useState<string | null>(null);
    const [userChoices, setUserChoices] = useState<LocalUserChoices | null>(null);
    const [interviewContext, setInterviewContext] = useState<InterviewContext | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const tokenFetchedRef = useRef(false);
    const { fetchAuthenticatedToken, loading, error } = useInterviewToken(API_BASE, getToken);
    const callDuration = useCallDuration();

    // Fetch interview context on mount (but NOT the LiveKit JWT yet)
    useEffect(() => {
        if (tokenFetchedRef.current) return;
        tokenFetchedRef.current = true;

        fetchAuthenticatedToken(interviewId).then((result) => {
            if (result) {
                setInterviewContext(result.interview);
            }
        });
    }, [interviewId, fetchAuthenticatedToken]);

    const handleJoin = useCallback(
        async (choices: LocalUserChoices) => {
            setUserChoices(choices);
            setCallState('connecting');

            // Fetch a fresh token for the actual connection
            const result = await fetchAuthenticatedToken(interviewId);
            if (result) {
                setLivekitToken(result.jwt);
            } else {
                setErrorMessage('Failed to connect to interview. Please try again.');
                setCallState('lobby');
            }
        },
        [interviewId, fetchAuthenticatedToken],
    );

    const handleConnected = useCallback(() => {
        setCallState('in-call');
        callDuration.start();
    }, [callDuration]);

    const handleDisconnected = useCallback(() => {
        callDuration.stop();
        setCallState('post-call');
    }, [callDuration]);

    const handleClose = useCallback(() => {
        window.close();
    }, []);

    // Loading state while fetching interview context
    if (loading && !interviewContext) {
        return <LoadingScreen />;
    }

    // Error from token fetch
    if (error && !interviewContext) {
        return <ErrorScreen message={error} onClose={handleClose} />;
    }

    // Interview context not loaded yet
    if (!interviewContext) {
        return <LoadingScreen />;
    }

    const localName = user?.fullName || user?.firstName || 'You';
    const localAvatarUrl = user?.imageUrl;

    switch (callState) {
        case 'lobby':
            return (
                <>
                    <VideoLobby
                        interviewContext={interviewContext}
                        onJoin={handleJoin}
                        localUser={{
                            name: localName,
                            avatarUrl: localAvatarUrl,
                        }}
                    />
                    {errorMessage && (
                        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 alert alert-error shadow-lg max-w-md z-50">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation" />
                            <span className="text-sm">{errorMessage}</span>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setErrorMessage(null)}
                            >
                                Dismiss
                            </button>
                        </div>
                    )}
                </>
            );

        case 'connecting':
        case 'in-call':
            if (!livekitToken) {
                return <LoadingScreen message="Connecting to interview..." />;
            }
            return (
                <LiveKitRoom
                    token={livekitToken}
                    serverUrl={getLiveKitUrl()}
                    connect={true}
                    audio={userChoices?.audioEnabled ?? true}
                    video={userChoices?.videoEnabled ?? true}
                    options={defaultRoomOptions}
                    onConnected={handleConnected}
                    onDisconnected={handleDisconnected}
                >
                    <VideoRoom
                        interviewContext={interviewContext}
                        localName={localName}
                        localAvatarUrl={localAvatarUrl}
                        onDisconnect={handleDisconnected}
                    />
                </LiveKitRoom>
            );

        case 'post-call':
            return (
                <PostCallSummary
                    duration={callDuration.duration}
                    isCandidate={false}
                    onClose={handleClose}
                />
            );

        default:
            return <LoadingScreen />;
    }
}

function LoadingScreen({ message = 'Preparing interview...' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-base-200 gap-4">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="text-sm font-medium text-base-content/60">{message}</p>
        </div>
    );
}

function ErrorScreen({ message, onClose }: { message: string; onClose: () => void }) {
    return (
        <div className="flex items-center justify-center h-screen bg-base-200">
            <div className="card bg-base-100 shadow-lg w-full max-w-md">
                <div className="card-body items-center text-center">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-4xl text-error mb-4" />
                    <h2 className="card-title text-xl font-black">Unable to Join Interview</h2>
                    <p className="text-sm text-base-content/70 mt-2">{message}</p>
                    <div className="card-actions mt-6">
                        <button className="btn btn-primary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
