"use client";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselRadioCardOption {
    /** Option value */
    value: string;
    /** Display label */
    label: string;
    /** FontAwesome icon class (optional) */
    icon?: string;
}

export interface BaselRadioCardGroupProps {
    /** Available radio card options */
    options: BaselRadioCardOption[];
    /** Currently selected value */
    value: string;
    /** Called when the selection changes */
    onChange: (value: string) => void;
    /** HTML name attribute for the radio group */
    name: string;
    /** DaisyUI semantic color for the selected card border (default: "primary") */
    color?: "primary" | "secondary" | "accent" | "info" | "success" | "warning";
    /** Additional className on the container */
    className?: string;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const COLOR_BORDER_MAP: Record<string, string> = {
    primary: "border-primary",
    secondary: "border-secondary",
    accent: "border-accent",
    info: "border-info",
    success: "border-success",
    warning: "border-warning",
};

const COLOR_BG_MAP: Record<string, string> = {
    primary: "bg-primary/5",
    secondary: "bg-secondary/5",
    accent: "bg-accent/5",
    info: "bg-info/5",
    success: "bg-success/5",
    warning: "bg-warning/5",
};

const COLOR_RADIO_MAP: Record<string, string> = {
    primary: "radio-primary",
    secondary: "radio-secondary",
    accent: "radio-accent",
    info: "radio-info",
    success: "radio-success",
    warning: "radio-warning",
};

const COLOR_TEXT_MAP: Record<string, string> = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    info: "text-info",
    success: "text-success",
    warning: "text-warning",
};

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel radio card group — styled radio option cards with icon support.
 * Each option renders as a selectable card with a radio button, icon, and label.
 */
export function BaselRadioCardGroup({
    options,
    value,
    onChange,
    name,
    color = "primary",
    className,
}: BaselRadioCardGroupProps) {
    const selectedBorder = COLOR_BORDER_MAP[color] || COLOR_BORDER_MAP.primary;
    const selectedBg = COLOR_BG_MAP[color] || COLOR_BG_MAP.primary;

    return (
        <div className={`space-y-2 ${className || ""}`}>
            {options.map((opt) => {
                const isSelected = value === opt.value;

                return (
                    <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${
                            isSelected
                                ? `${selectedBorder} ${selectedBg}`
                                : "border-base-300 bg-base-200 hover:border-base-content/20"
                        }`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={opt.value}
                            checked={isSelected}
                            onChange={(e) => onChange(e.target.value)}
                            className={`radio ${COLOR_RADIO_MAP[color]} radio-sm`}
                        />
                        {opt.icon && (
                            <i
                                className={`${opt.icon} text-sm ${
                                    isSelected
                                        ? COLOR_TEXT_MAP[color]
                                        : "text-base-content/40"
                                }`}
                            />
                        )}
                        <span
                            className={`text-sm font-semibold ${
                                isSelected
                                    ? "text-base-content"
                                    : "text-base-content/60"
                            }`}
                        >
                            {opt.label}
                        </span>
                    </label>
                );
            })}
        </div>
    );
}
