"use client";

/* ─── Wizard Step Labels ────────────────────────────────────────────────── */

export const WIZARD_STEPS = [
    { label: "Personal Information" },
    { label: "Address" },
    { label: "Bank Account" },
    { label: "Review & Submit" },
];

/* ─── US States ─────────────────────────────────────────────────────────── */

export const US_STATES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "DC",
] as const;

export const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

/* ─── Form State Types ──────────────────────────────────────────────────── */

export interface PersonalInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dobMonth: string;
    dobDay: string;
    dobYear: string;
    ssnLast4: string;
}

export interface AddressInfo {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
}

export interface BankInfo {
    accountHolderName: string;
    routingNumber: string;
    accountNumber: string;
    confirmAccountNumber: string;
}

/* ─── ABA Routing Number Checksum ──────────────────────────────────────── */

/** Validates an ABA routing number using the checksum algorithm */
export function validateRoutingChecksum(routing: string): boolean {
    if (!/^\d{9}$/.test(routing)) return false;
    const d = routing.split("").map(Number);
    const sum =
        3 * (d[0] + d[3] + d[6]) +
        7 * (d[1] + d[4] + d[7]) +
        1 * (d[2] + d[5] + d[8]);
    return sum % 10 === 0;
}
