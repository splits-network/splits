'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { usePresence } from '@/hooks/use-presence';
import { Presence } from '@/components/presense';
import { BaselFormField } from '@splits-network/basel-ui';

/* ─── Types ────────────────────────────────────────────────────────── */

export interface Participant {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    role: 'host' | 'participant' | 'observer';
    is_email_only?: boolean;
}

interface ParticipantPickerProps {
    participants: Participant[];
    onChange: (participants: Participant[]) => void;
    /** Current user ID — auto-added as host, not removable */
    currentUserId?: string;
}

interface UserSearchResult {
    id: string;
    clerk_user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    role: string;
}

/* ─── Component ────────────────────────────────────────────────────── */

export function ParticipantPicker({
    participants,
    onChange,
    currentUserId,
}: ParticipantPickerProps) {
    const { getToken } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserSearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [showEmailInput, setShowEmailInput] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const participantUserIds = participants.map((p) => p.user_id);
    const presence = usePresence(participantUserIds, { enabled: participants.length > 0 });

    /* ── Search users ── */
    const searchUsers = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            return;
        }
        setSearching(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = await client.get(`/users?search=${encodeURIComponent(searchQuery)}&limit=10`) as {
                data: UserSearchResult[];
            };
            const filtered = (res.data || []).filter(
                (u) => !participants.some((p) => p.user_id === u.id),
            );
            setResults(filtered);
        } catch {
            setResults([]);
        } finally {
            setSearching(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [participants]);

    const handleQueryChange = (value: string) => {
        setQuery(value);
        setShowResults(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchUsers(value), 250);
    };

    /* ── Add participant from search ── */
    const addParticipant = (user: UserSearchResult) => {
        const newParticipant: Participant = {
            user_id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            avatar_url: user.avatar_url,
            role: 'participant',
        };
        onChange([...participants, newParticipant]);
        setQuery('');
        setResults([]);
        setShowResults(false);
    };

    /* ── Add by email ── */
    const addByEmail = () => {
        const email = emailInput.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
        if (participants.some((p) => p.email === email)) return;

        const newParticipant: Participant = {
            user_id: `email:${email}`,
            first_name: email.split('@')[0],
            last_name: '',
            email,
            avatar_url: null,
            role: 'participant',
            is_email_only: true,
        };
        onChange([...participants, newParticipant]);
        setEmailInput('');
        setShowEmailInput(false);
    };

    /* ── Remove participant ── */
    const removeParticipant = (userId: string) => {
        if (userId === currentUserId) return;
        onChange(participants.filter((p) => p.user_id !== userId));
    };

    /* ── Close dropdown on outside click ── */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <BaselFormField label="Participants">
            {/* Selected participants */}
            {participants.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {participants.map((p) => (
                        <div
                            key={p.user_id}
                            className="badge badge-lg gap-2 pr-1"
                        >
                            <div className="flex items-center gap-1.5">
                                {p.avatar_url ? (
                                    <img
                                        src={p.avatar_url}
                                        alt=""
                                        className="w-5 h-5 object-cover"
                                    />
                                ) : (
                                    <div className="w-5 h-5 bg-base-300 flex items-center justify-center">
                                        <span className="text-sm font-bold text-base-content/50">
                                            {p.first_name[0]}
                                        </span>
                                    </div>
                                )}
                                <span className="text-sm">
                                    {p.first_name} {p.last_name}
                                </span>
                                {p.role === 'host' && (
                                    <span className="badge badge-primary badge-sm">Host</span>
                                )}
                                {!p.is_email_only && presence[p.user_id] && (
                                    <Presence
                                        status={presence[p.user_id]?.status}
                                        size="xs"
                                        variant="dot"
                                    />
                                )}
                            </div>
                            {p.user_id !== currentUserId && (
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-xs btn-circle"
                                    onClick={() => removeParticipant(p.user_id)}
                                >
                                    <i className="fa-duotone fa-regular fa-xmark text-sm" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Search input */}
            <div ref={containerRef} className="relative">
                <div className="join w-full">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onFocus={() => query.length >= 2 && setShowResults(true)}
                        placeholder="Search by name or email..."
                        className="input join-item w-full"
                    />
                    <button
                        type="button"
                        className="btn join-item"
                        onClick={() => setShowEmailInput(!showEmailInput)}
                        title="Add by email"
                    >
                        <i className="fa-duotone fa-regular fa-envelope" />
                    </button>
                </div>

                {/* Search results dropdown */}
                {showResults && (query.length >= 2) && (
                    <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 shadow-lg max-h-60 overflow-y-auto">
                        {searching && (
                            <div className="p-3 text-center">
                                <span className="loading loading-spinner loading-sm" />
                            </div>
                        )}
                        {!searching && results.length === 0 && (
                            <div className="p-3 text-sm text-base-content/50 text-center">
                                No users found
                            </div>
                        )}
                        {results.map((user) => (
                            <button
                                key={user.id}
                                type="button"
                                className="w-full text-left px-4 py-3 hover:bg-base-200 transition-colors flex items-center gap-3 border-b border-base-300 last:border-b-0"
                                onClick={() => addParticipant(user)}
                            >
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt=""
                                        className="w-8 h-8 object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 bg-base-300 flex items-center justify-center">
                                        <span className="text-sm font-bold text-base-content/50">
                                            {user.first_name?.[0]}{user.last_name?.[0]}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">
                                        {user.first_name} {user.last_name}
                                    </p>
                                    <p className="text-sm text-base-content/50 truncate">
                                        {user.email}
                                    </p>
                                </div>
                                <span className="badge badge-sm">{user.role}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Add by email input */}
            {showEmailInput && (
                <div className="join w-full">
                    <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addByEmail())}
                        placeholder="Enter email address..."
                        className="input join-item w-full"
                    />
                    <button
                        type="button"
                        className="btn btn-primary join-item"
                        onClick={addByEmail}
                        disabled={!emailInput.trim()}
                    >
                        Add
                    </button>
                </div>
            )}
        </BaselFormField>
    );
}
