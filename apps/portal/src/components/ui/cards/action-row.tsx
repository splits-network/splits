'use client';

import Link from 'next/link';

interface ActionRowBase {
    /** Label text */
    label: string;
    /** Icon class (FontAwesome) for the label */
    icon?: string;
    /** Text displayed on the action */
    actionLabel: string;
    /** Icon class (FontAwesome) for the action */
    actionIcon?: string;
    /** Disabled state */
    disabled?: boolean;
}

interface ActionRowLink extends ActionRowBase {
    /** URL for link actions */
    href: string;
    /** Open in new tab (external links) */
    external?: boolean;
    onClick?: never;
}

interface ActionRowButton extends ActionRowBase {
    href?: never;
    external?: never;
    /** Click handler for button actions */
    onClick: () => void;
}

export type ActionRowProps = ActionRowLink | ActionRowButton;

export function ActionRow({ label, icon, actionLabel, actionIcon, disabled, ...rest }: ActionRowProps) {
    const actionClasses = 'text-sm font-medium text-primary hover:text-primary-focus flex items-center gap-1.5 transition-colors';
    const disabledClasses = 'text-sm font-medium text-base-content/30 pointer-events-none flex items-center gap-1.5';

    const actionContent = (
        <>
            {actionIcon && <i className={`fa-duotone fa-regular ${actionIcon} text-xs`}></i>}
            {actionLabel}
        </>
    );

    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-base-content/70 flex items-center gap-2">
                {icon && <i className={`fa-duotone fa-regular ${icon} text-xs`}></i>}
                {label}
            </span>
            {'href' in rest && rest.href ? (
                rest.external ? (
                    <a href={rest.href} target="_blank" rel="noopener noreferrer" className={disabled ? disabledClasses : actionClasses}>
                        {actionContent}
                    </a>
                ) : (
                    <Link href={rest.href} className={disabled ? disabledClasses : actionClasses}>
                        {actionContent}
                    </Link>
                )
            ) : (
                <button
                    type="button"
                    onClick={'onClick' in rest ? rest.onClick : undefined}
                    disabled={disabled}
                    className={disabled ? disabledClasses : actionClasses}
                >
                    {actionContent}
                </button>
            )}
        </div>
    );
}
