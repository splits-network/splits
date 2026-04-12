'use client';

import type { CallDetail, EntityData } from '@/lib/types';

interface ContextTabProps {
    call: CallDetail;
    entities: EntityData[];
    isLoading: boolean;
}

function getEntityIcon(entityType: string): string {
    switch (entityType) {
        case 'job': return 'fa-briefcase';
        case 'company': return 'fa-building';
        case 'firm': return 'fa-buildings';
        case 'application': return 'fa-file-user';
        case 'candidate': return 'fa-user';
        default: return 'fa-link';
    }
}

/**
 * Context tab: shows entity data, agenda, and pre-call notes.
 * Falls back to participant profiles when no entity links exist.
 */
export function ContextTab({ call, entities, isLoading }: ContextTabProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-md text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Agenda card */}
            {call.agenda && (
                <div className="border-l-4 border-primary bg-base-200 p-4 shadow-sm">
                    <p className="text-sm font-black uppercase tracking-widest text-base-content/50 mb-2">
                        Agenda
                    </p>
                    <p className="text-sm text-base-content leading-relaxed whitespace-pre-wrap">
                        {call.agenda}
                    </p>
                </div>
            )}

            {/* Pre-call notes (creator only — we show if present in data) */}
            {call.pre_call_notes && (
                <div className="border-l-4 border-warning bg-base-200 p-4 shadow-sm">
                    <p className="text-sm font-black uppercase tracking-widest text-base-content/50 mb-2">
                        <i className="fa-duotone fa-regular fa-lock mr-1" />
                        Pre-call Notes
                    </p>
                    <p className="text-sm text-base-content leading-relaxed whitespace-pre-wrap">
                        {call.pre_call_notes}
                    </p>
                </div>
            )}

            {/* Entity cards */}
            {entities.length > 0 ? (
                <div className="space-y-3">
                    <p className="text-sm font-black uppercase tracking-widest text-base-content/50">
                        Related
                    </p>
                    {entities.map((entity) => (
                        <EntityCard key={`${entity.entity_type}-${entity.entity_id}`} entity={entity} />
                    ))}
                </div>
            ) : (
                <ParticipantFallback call={call} />
            )}
        </div>
    );
}

function EntityCard({ entity }: { entity: EntityData }) {
    return (
        <div className="border-l-4 border-secondary bg-base-200 p-4 space-y-2 shadow-sm">
            <div className="flex items-center gap-3">
                {entity.logo_url ? (
                    <img
                        src={entity.logo_url}
                        alt={entity.name}
                        className="w-10 h-10 rounded-none object-contain bg-base-200 border border-base-300 p-1"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-none bg-base-300 flex items-center justify-center">
                        <i className={`fa-duotone fa-regular ${getEntityIcon(entity.entity_type)} text-base-content/60`} />
                    </div>
                )}
                <div>
                    <p className="font-semibold text-base-content">{entity.name}</p>
                    {entity.subtitle && (
                        <p className="text-sm text-base-content/60">{entity.subtitle}</p>
                    )}
                </div>
            </div>

            {/* Detail fields */}
            {Object.entries(entity.details).length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 border-t border-base-300">
                    {Object.entries(entity.details).map(([key, value]) =>
                        value ? (
                            <div key={key}>
                                <p className="text-sm text-base-content/50 uppercase tracking-wide">
                                    {key.replace(/_/g, ' ')}
                                </p>
                                <p className="text-sm text-base-content font-medium">{value}</p>
                            </div>
                        ) : null,
                    )}
                </div>
            )}
        </div>
    );
}

function ParticipantFallback({ call }: { call: CallDetail }) {
    return (
        <div className="space-y-3">
            <p className="text-sm font-black uppercase tracking-widest text-base-content/50">
                Participants
            </p>
            {call.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2">
                    <div className="avatar placeholder">
                        <div className="w-10 h-10 rounded-none bg-secondary text-secondary-content flex items-center justify-center">
                            {p.user.avatar_url ? (
                                <img
                                    src={p.user.avatar_url}
                                    alt={p.user.name || ''}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-sm font-bold">
                                    {(p.user.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-base-content">
                            {p.user.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-base-content/50 uppercase tracking-wide">{p.role}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
