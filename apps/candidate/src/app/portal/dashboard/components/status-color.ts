/**
 * Basel status color system for candidate dashboard.
 * Uses DaisyUI semantic tokens only -- no Memphis accent cycling.
 */

/** Pipeline stage -> DaisyUI semantic badge/text classes */
export function stageColor(stage: string): string {
    switch (stage.toLowerCase()) {
        case "in review":
            return "bg-info/15 text-info";
        case "submitted":
            return "bg-primary/15 text-primary";
        case "screen":
            return "bg-secondary/15 text-secondary";
        case "interview":
            return "bg-warning/15 text-warning";
        case "offer":
            return "bg-accent/15 text-accent";
        case "hired":
            return "bg-success/15 text-success";
        default:
            return "bg-base-content/15 text-base-content/50";
    }
}

/** Pipeline stage -> solid bar color class */
export function stageBarColor(stage: string): string {
    switch (stage.toLowerCase()) {
        case "in review":
            return "bg-info";
        case "submitted":
            return "bg-primary";
        case "screen":
            return "bg-secondary";
        case "interview":
            return "bg-warning";
        case "offer":
            return "bg-accent";
        case "hired":
            return "bg-success";
        default:
            return "bg-base-content/30";
    }
}

/** Pipeline stage -> text color class */
export function stageTextColor(stage: string): string {
    switch (stage.toLowerCase()) {
        case "in review":
            return "text-info";
        case "submitted":
            return "text-primary";
        case "screen":
            return "text-secondary";
        case "interview":
            return "text-warning";
        case "offer":
            return "text-accent";
        case "hired":
            return "text-success";
        default:
            return "text-base-content/50";
    }
}

/** Urgency level -> DaisyUI alert classes */
export function urgencyColor(level: "error" | "warning" | "info"): string {
    switch (level) {
        case "error":
            return "bg-error/10 border-error text-error";
        case "warning":
            return "bg-warning/10 border-warning text-warning";
        case "info":
            return "bg-info/10 border-info text-info";
    }
}

/** Recruiter relationship status -> badge classes */
export function relationshipColor(status: string): string {
    switch (status) {
        case "active":
            return "bg-success/15 text-success";
        case "expiring":
            return "bg-warning/15 text-warning";
        case "expired":
            return "bg-base-content/15 text-base-content/50";
        default:
            return "bg-base-content/15 text-base-content/50";
    }
}