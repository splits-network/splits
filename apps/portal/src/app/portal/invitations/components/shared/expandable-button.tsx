"use client";

import Link from "next/link";

interface ExpandableButtonBaseProps {
    icon: string;
    label: string;
    variant?: string;
    size?: "xs" | "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
    title?: string;
}

interface ExpandableButtonClickProps extends ExpandableButtonBaseProps {
    onClick: () => void;
    href?: never;
}

interface ExpandableButtonLinkProps extends ExpandableButtonBaseProps {
    href: string;
    onClick?: never;
}

export type ExpandableButtonProps =
    | ExpandableButtonClickProps
    | ExpandableButtonLinkProps;

export function ExpandableButton({
    icon,
    label,
    variant = "btn-ghost",
    size = "sm",
    disabled,
    loading,
    title,
    ...rest
}: ExpandableButtonProps) {
    const className = `group btn btn-${size} ${variant} btn-square hover:w-auto px-0 hover:px-2 gap-0 hover:gap-1.5 transition-all duration-200`;
    const resolvedTitle = title ?? label;

    const content = (
        <>
            {loading ? (
                <span className="loading loading-spinner loading-xs" />
            ) : (
                <i className={`${icon} flex-shrink-0`} />
            )}
            <span className="whitespace-nowrap hidden transition-visibility duration-200 group-hover:block text-xs font-semibold">
                {label}
            </span>
        </>
    );

    if ("href" in rest && rest.href) {
        return (
            <Link href={rest.href} className={className} title={resolvedTitle}>
                {content}
            </Link>
        );
    }

    return (
        <button
            onClick={"onClick" in rest ? rest.onClick : undefined}
            className={className}
            title={resolvedTitle}
            disabled={disabled}
        >
            {content}
        </button>
    );
}
