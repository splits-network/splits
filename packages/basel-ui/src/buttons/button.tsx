"use client";

import Link from "next/link";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface ButtonBaseProps {
    icon?: string;
    children?: React.ReactNode;
    variant?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    disabled?: boolean;
    loading?: boolean;
    title?: string;
    className?: string;
}

interface ButtonClickProps extends ButtonBaseProps {
    onClick: () => void;
    href?: never;
}

interface ButtonLinkProps extends ButtonBaseProps {
    href: string;
    onClick?: never;
}

export type ButtonProps = ButtonClickProps | ButtonLinkProps;

/**
 * A standard button component with Basel design.
 * Basel design: sharp corners (borderRadius: 0), DaisyUI btn classes.
 */
/* btn-xs btn-sm btn-md btn-lg — static strings for Tailwind tree-shaking */
const sizeClass: Record<NonNullable<ButtonBaseProps["size"]>, string> = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
    xl: "btn-xl",
};

export function Button({
    icon,
    children,
    variant = "btn-primary",
    size = "sm",
    disabled,
    loading,
    title,
    className = "",
    ...rest
}: ButtonProps) {
    const baseClassName = `btn ${sizeClass[size]} ${variant} ${className}`;

    const content = (
        <>
            {loading ? (
                <span className="loading loading-spinner loading-xs" />
            ) : icon ? (
                <i className={`${icon} flex-shrink-0`} />
            ) : null}
            {children}
        </>
    );

    if ("href" in rest && rest.href) {
        return (
            <Link
                href={rest.href}
                className={baseClassName}
                style={{ borderRadius: 0 }}
                title={title}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            onClick={"onClick" in rest ? rest.onClick : undefined}
            className={baseClassName}
            style={{ borderRadius: 0 }}
            title={title}
            disabled={disabled || loading}
        >
            {content}
        </button>
    );
}
