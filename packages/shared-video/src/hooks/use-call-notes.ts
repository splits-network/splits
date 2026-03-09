'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCallNotesOptions {
    magicLinkToken?: string;
}

interface UseCallNotesResult {
    content: string;
    setContent: (value: string) => void;
    saving: boolean;
    lastSaved: Date | null;
    error: string | null;
    postToApplication: () => Promise<void>;
}

export function useCallNotes(
    callId: string,
    apiBase: string,
    getToken: () => Promise<string | null>,
    options?: UseCallNotesOptions,
): UseCallNotesResult {
    const [content, setContentState] = useState('');
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const contentRef = useRef(content);
    const pendingSaveRef = useRef(false);
    const mountedRef = useRef(true);

    // Keep contentRef in sync
    contentRef.current = content;

    const magicLinkToken = options?.magicLinkToken;

    // Build auth headers
    const getHeaders = useCallback(async (): Promise<Record<string, string>> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (magicLinkToken) {
            // Magic link users don't have Clerk token
            return headers;
        }

        const token = await getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [magicLinkToken]);

    // Build URL with optional magic link token query param
    const buildUrl = useCallback(
        (path: string) => {
            const url = `${apiBase}/api/v2/interviews/${callId}${path}`;
            if (magicLinkToken) {
                return `${url}?token=${encodeURIComponent(magicLinkToken)}`;
            }
            return url;
        },
        [apiBase, callId, magicLinkToken],
    );

    // Load existing notes on mount
    useEffect(() => {
        async function loadNotes() {
            try {
                const headers = await getHeaders();
                const notesUrl = magicLinkToken
                    ? `${buildUrl('/notes')}&mine=true`
                    : `${buildUrl('/notes')}?mine=true`;
                const response = await fetch(notesUrl, {
                    method: 'GET',
                    headers,
                });

                if (!response.ok) return;

                const result = await response.json();
                if (result.data?.content && mountedRef.current) {
                    setContentState(result.data.content);
                }
            } catch {
                // Non-critical: start with empty notes if load fails
            }
        }

        loadNotes();
    }, [buildUrl, getHeaders]);

    // Save notes to backend
    const saveNotes = useCallback(
        async (noteContent: string) => {
            if (!noteContent.trim()) return;

            setSaving(true);
            setError(null);
            pendingSaveRef.current = false;

            try {
                const headers = await getHeaders();
                const body: Record<string, string> = { content: noteContent };
                if (magicLinkToken) {
                    body.token = magicLinkToken;
                }

                const response = await fetch(buildUrl('/notes'), {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    throw new Error('Failed to save notes');
                }

                if (mountedRef.current) {
                    setLastSaved(new Date());
                    setError(null);
                }
            } catch (err) {
                if (mountedRef.current) {
                    setError(err instanceof Error ? err.message : 'Save failed');
                }
            } finally {
                if (mountedRef.current) {
                    setSaving(false);
                }
            }
        },
        [buildUrl, getHeaders, magicLinkToken],
    );

    // Set content with debounced auto-save
    const setContent = useCallback(
        (value: string) => {
            setContentState(value);
            pendingSaveRef.current = true;

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
                saveNotes(value);
            }, 2000);
        },
        [saveNotes],
    );

    // Post notes to application notes
    const postToApplication = useCallback(async () => {
        // Flush any pending save first
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }

        const currentContent = contentRef.current;
        if (currentContent.trim()) {
            // Save current content before posting
            if (pendingSaveRef.current) {
                await saveNotes(currentContent);
            }

            try {
                const headers = await getHeaders();
                const body: Record<string, string> = {};
                if (magicLinkToken) {
                    body.token = magicLinkToken;
                }

                await fetch(buildUrl('/notes/post-to-application'), {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(body),
                });
            } catch {
                // Best-effort: don't block disconnect if posting fails
            }
        }
    }, [saveNotes, getHeaders, buildUrl, magicLinkToken]);

    // Cleanup on unmount: flush pending save
    useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            // Flush pending save synchronously-ish
            if (pendingSaveRef.current && contentRef.current.trim()) {
                saveNotes(contentRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        content,
        setContent,
        saving,
        lastSaved,
        error,
        postToApplication,
    };
}
