import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: 'Status',
    description: 'Live system status for Applicant Network services and platform health.',
    ...buildCanonical("/public/status"),
};

export default function StatusLayout({ children }: { children: ReactNode }) {
    return children;
}
