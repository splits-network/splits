'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

/* ─── Types ────────────────────────────────────────────────────────── */

export type LinkableEntityType = 'company' | 'job' | 'application' | 'candidate';

export interface LinkedEntity {
    entity_type: LinkableEntityType;
    entity_id: string;
    label: string;
}

interface EntityLinkerProps {
    entities: LinkedEntity[];
    onChange: (entities: LinkedEntity[]) => void;
    /** Pre-fill from context page */
    defaultEntityType?: LinkableEntityType;
    defaultEntityId?: string;
    defaultLabel?: string;
}

interface EntitySearchResult {
    id: string;
    label: string;
    subtitle?: string;
}

const ENTITY_TYPES: { value: LinkableEntityType; label: string; icon: string }[] = [
    { value: 'company', label: 'Company', icon: 'fa-building' },
    { value: 'job', label: 'Job', icon: 'fa-briefcase' },
    { value: 'application', label: 'Application', icon: 'fa-file-lines' },
    { value: 'candidate', label: 'Candidate', icon: 'fa-user' },
];

/* ─── Component ────────────────────────────────────────────────────── */

export function EntityLinker({
    entities,
    onChange,
    defaultEntityType,
    defaultEntityId,
    defaultLabel,
}: EntityLinkerProps) {
    const { getToken } = useAuth();
    const [isExpanded, setIsExpanded] = useState(
        !!(defaultEntityType && defaultEntityId) || entities.length > 0,
    );
    const [entityType, setEntityType] = useState<LinkableEntityType>(
        defaultEntityType || 'company',
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<EntitySearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    /* ── Auto-add default entity ── */
    useEffect(() => {
        if (defaultEntityType && defaultEntityId && defaultLabel && entities.length === 0) {
            onChange([{
                entity_type: defaultEntityType,
                entity_id: defaultEntityId,
                label: defaultLabel,
            }]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Search entities ── */
    const searchEntities = useCallback(async (query: string) => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        setSearching(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);

            let endpoint = '';
            switch (entityType) {
                case 'company':
                    endpoint = `/companies?search=${encodeURIComponent(query)}&limit=10`;
                    break;
                case 'job':
                    endpoint = `/jobs?search=${encodeURIComponent(query)}&limit=10`;
                    break;
                case 'application':
                    endpoint = `/applications?search=${encodeURIComponent(query)}&limit=10`;
                    break;
                case 'candidate':
                    endpoint = `/candidates?search=${encodeURIComponent(query)}&limit=10`;
                    break;
            }

            const res = await client.get(endpoint) as { data: any[] };
            const items = res.data || [];

            const mapped: EntitySearchResult[] = items.map((item: any) => {
                switch (entityType) {
                    case 'company':
                        return { id: item.id, label: item.name, subtitle: item.industry };
                    case 'job':
                        return { id: item.id, label: item.title, subtitle: item.company_name };
                    case 'application':
                        return {
                            id: item.id,
                            label: `${item.candidate_name || 'Unknown'} - ${item.job_title || 'Unknown'}`,
                            subtitle: item.stage,
                        };
                    case 'candidate':
                        return {
                            id: item.id,
                            label: `${item.first_name} ${item.last_name}`,
                            subtitle: item.email,
                        };
                    default:
                        return { id: item.id, label: item.name || item.title || item.id };
                }
            });

            setResults(mapped);
        } catch {
            setResults([]);
        } finally {
            setSearching(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityType]);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setShowResults(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchEntities(value), 250);
    };

    const addEntity = (result: EntitySearchResult) => {
        if (entities.some((e) => e.entity_id === result.id && e.entity_type === entityType)) return;
        onChange([...entities, { entity_type: entityType, entity_id: result.id, label: result.label }]);
        setSearchQuery('');
        setResults([]);
        setShowResults(false);
    };

    const removeEntity = (entityId: string, type: LinkableEntityType) => {
        onChange(entities.filter((e) => !(e.entity_id === entityId && e.entity_type === type)));
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

    const typeConfig = ENTITY_TYPES.find((t) => t.value === entityType);

    return (
        <div className="space-y-3">
            {/* Toggle header */}
            <button
                type="button"
                className="flex items-center gap-2 w-full text-left"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <i className={`fa-duotone fa-regular fa-chevron-${isExpanded ? 'down' : 'right'} text-sm text-base-content/50`} />
                <span className="text-sm font-bold uppercase tracking-wider text-base-content/50">
                    Link to Entity
                </span>
                <span className="text-sm text-base-content/40">(optional)</span>
            </button>

            {isExpanded && (
                <div className="space-y-3">
                    {/* Linked entities */}
                    {entities.length > 0 && (
                        <div className="space-y-2">
                            {entities.map((entity) => {
                                const config = ENTITY_TYPES.find((t) => t.value === entity.entity_type);
                                return (
                                    <div
                                        key={`${entity.entity_type}-${entity.entity_id}`}
                                        className="flex items-center gap-3 px-4 py-3 bg-base-200 border border-base-300"
                                    >
                                        <i className={`fa-duotone fa-regular ${config?.icon || 'fa-link'} text-primary`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{entity.label}</p>
                                            <p className="text-sm text-base-content/50">{config?.label}</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs btn-circle"
                                            onClick={() => removeEntity(entity.entity_id, entity.entity_type)}
                                        >
                                            <i className="fa-duotone fa-regular fa-xmark" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Entity type selector + search */}
                    <div className="flex gap-2">
                        <select
                            value={entityType}
                            onChange={(e) => {
                                setEntityType(e.target.value as LinkableEntityType);
                                setSearchQuery('');
                                setResults([]);
                            }}
                            className="select w-40"
                        >
                            {ENTITY_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>

                        <div ref={containerRef} className="relative flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                                placeholder={`Search ${typeConfig?.label || 'entity'}...`}
                                className="input w-full"
                            />

                            {showResults && searchQuery.length >= 2 && (
                                <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 shadow-lg max-h-48 overflow-y-auto">
                                    {searching && (
                                        <div className="p-3 text-center">
                                            <span className="loading loading-spinner loading-sm" />
                                        </div>
                                    )}
                                    {!searching && results.length === 0 && (
                                        <div className="p-3 text-sm text-base-content/50 text-center">
                                            No results found
                                        </div>
                                    )}
                                    {results.map((r) => (
                                        <button
                                            key={r.id}
                                            type="button"
                                            className="w-full text-left px-4 py-2.5 hover:bg-base-200 transition-colors border-b border-base-300 last:border-b-0"
                                            onClick={() => addEntity(r)}
                                        >
                                            <p className="text-sm font-bold truncate">{r.label}</p>
                                            {r.subtitle && (
                                                <p className="text-sm text-base-content/50 truncate">{r.subtitle}</p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
