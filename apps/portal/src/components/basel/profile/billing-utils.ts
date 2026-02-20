import type { BaselSemanticColor } from "@splits-network/basel-ui";

/* ─── Subscription Status ────────────────────────────────────────────────── */

export type SubscriptionStatus =
    | "active"
    | "past_due"
    | "canceled"
    | "trialing"
    | "incomplete";

export type BillingPeriod = "monthly" | "annual";

export function subscriptionStatusColor(
    status?: string,
): BaselSemanticColor {
    switch (status) {
        case "active":
            return "success";
        case "trialing":
            return "info";
        case "past_due":
            return "error";
        case "canceled":
            return "warning";
        case "incomplete":
            return "error";
        default:
            return "neutral";
    }
}

export function formatSubscriptionStatus(status?: string): string {
    const labels: Record<string, string> = {
        active: "Active",
        trialing: "Trial",
        past_due: "Past Due",
        canceled: "Canceled",
        incomplete: "Incomplete",
    };
    return labels[status || ""] || "Unknown";
}

/* ─── Invoice Status ─────────────────────────────────────────────────────── */

export type InvoiceStatus =
    | "paid"
    | "open"
    | "void"
    | "uncollectible"
    | "draft";

export function invoiceStatusColor(status?: string): BaselSemanticColor {
    switch (status) {
        case "paid":
            return "success";
        case "open":
            return "warning";
        case "void":
            return "neutral";
        case "uncollectible":
            return "error";
        case "draft":
            return "neutral";
        default:
            return "neutral";
    }
}

export function formatInvoiceStatus(status?: string): string {
    const labels: Record<string, string> = {
        paid: "Paid",
        open: "Open",
        void: "Void",
        uncollectible: "Failed",
        draft: "Draft",
    };
    return labels[status || ""] || "Unknown";
}

/* ─── Shared Formatters ──────────────────────────────────────────────────── */

export function formatDate(dateString: string | null): string {
    if (!dateString) return "\u2014";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function formatPrice(
    amount: number,
    currency: string = "usd",
): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(amount / 100);
}

export function getBillingPeriod(
    periodStart: string,
    periodEnd: string,
): string {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    const startMonth = start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
    const endMonth = end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return `${startMonth} \u2013 ${endMonth}`;
}

export function getCardBrandIcon(brand: string): string {
    const brandIcons: Record<string, string> = {
        visa: "fa-brands fa-cc-visa",
        mastercard: "fa-brands fa-cc-mastercard",
        amex: "fa-brands fa-cc-amex",
        discover: "fa-brands fa-cc-discover",
        diners: "fa-brands fa-cc-diners-club",
        jcb: "fa-brands fa-cc-jcb",
        stripe: "fa-brands fa-cc-stripe",
    };
    return (
        brandIcons[brand.toLowerCase()] ||
        "fa-duotone fa-regular fa-credit-card"
    );
}

export function formatCardBrand(brand: string): string {
    const brandNames: Record<string, string> = {
        visa: "Visa",
        mastercard: "Mastercard",
        amex: "American Express",
        discover: "Discover",
        diners: "Diners Club",
        jcb: "JCB",
    };
    return (
        brandNames[brand.toLowerCase()] ||
        brand.charAt(0).toUpperCase() + brand.slice(1)
    );
}
