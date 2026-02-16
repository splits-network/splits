import React from 'react';

export interface SocialLinkProps {
    icon: string;
    color: string;
    label: string;
    href?: string;
}

/**
 * Memphis square social media link button with colored border and hover lift.
 */
export function SocialLink({ icon, color, label, href = '#' }: SocialLinkProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            className="w-10 h-10 flex items-center justify-center transition-all hover:-translate-y-1"
            style={{
                border: `3px solid ${color}`,
                color,
            }}
        >
            <i className={`${icon} text-sm`} />
        </a>
    );
}
