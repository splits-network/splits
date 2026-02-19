"use client";

import Link from "next/link";

/* ─── Types ──────────────────────────────────────────────────────────────── */

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

/**
 * A square button that expands on hover to reveal its label.
 * Basel design: sharp corners (borderRadius: 0), DaisyUI btn classes.
 */
/* btn-xs btn-sm btn-md btn-lg — static strings for Tailwind tree-shaking */
const sizeClass: Record<
    NonNullable<ExpandableButtonBaseProps["size"]>,
    string
> = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
};

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
    const className = `group btn btn-square2 ${sizeClass[size]} ${variant}  flex items-center overflow-hidden transition-all duration-200`;
    const resolvedTitle = title ?? label;

    const content = (
        <>
            {loading ? (
                <span className="loading loading-spinner loading-xs" />
            ) : (
                <div className="flex items-center justify-center w-12 h-12 shrink-0">
                    <i className={`${icon} flex-shrink-0`} />
                </div>
            )}
            <div className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-xs">
                {label}
            </div>
        </>
    );

    if ("href" in rest && rest.href) {
        return (
            <Link
                href={rest.href}
                className={className}
                style={{ borderRadius: 0 }}
                title={resolvedTitle}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            onClick={"onClick" in rest ? rest.onClick : undefined}
            className={className}
            style={{ borderRadius: 0 }}
            title={resolvedTitle}
            disabled={disabled}
        >
            {content}
        </button>
    );
}
