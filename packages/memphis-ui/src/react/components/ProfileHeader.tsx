import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface ProfileHeaderProps {
    /** Person's name */
    name: string;
    /** Title or role */
    title: string;
    /** Metadata items (company, location, etc.) */
    metadata?: { icon: string; text: string; accent: AccentColor }[];
    /** Badge labels (e.g., "Verified", "Top Performer") */
    badges?: { label: string; accent: AccentColor }[];
    /** Accent color for the avatar */
    avatarAccent?: AccentColor;
    /** Whether the profile is verified (shows check badge on avatar) */
    verified?: boolean;
    /** Action buttons */
    actions?: React.ReactNode;
    /** Custom class name */
    className?: string;
}

/**
 * ProfileHeader - Profile header section with avatar and info
 *
 * Memphis compliant profile header with initials avatar, badges, metadata, and actions.
 * Designed for dark backgrounds.
 * Extracted from profiles-six showcase.
 */
export function ProfileHeader({
    name,
    title,
    metadata = [],
    badges = [],
    avatarAccent = 'coral',
    verified = false,
    actions,
    className = '',
}: ProfileHeaderProps) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('');

    return (
        <div className={[`accent-${avatarAccent}`, 'border-b-4 bg-dark border-dark', className].filter(Boolean).join(' ')}>
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div
                                className="w-28 h-28 border-4 flex items-center justify-center border-accent bg-accent"
                            >
                                <span className="text-4xl font-black text-on-accent">
                                    {initials}
                                </span>
                            </div>
                            {verified && (
                                <div
                                    className="absolute -bottom-2 -right-2 w-8 h-8 flex items-center justify-center border-xs accent-teal bg-accent"
                                >
                                    <i className="fa-solid fa-check text-xs text-dark" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            {badges.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    {badges.map((badge, i) => (
                                        <span
                                            key={i}
                                            className={`accent-${badge.accent} px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-accent text-on-accent`}
                                        >
                                            {badge.label}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-1 text-white">
                                {name}
                            </h1>
                            <p className="text-sm font-bold mb-3 text-accent">
                                {title}
                            </p>
                            {metadata.length > 0 && (
                                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-white/50">
                                    {metadata.map((item, i) => (
                                        <span key={i} className={`accent-${item.accent}`}>
                                            <i
                                                className={`${item.icon} mr-1 text-accent`}
                                            />
                                            {item.text}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {actions && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {actions}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
