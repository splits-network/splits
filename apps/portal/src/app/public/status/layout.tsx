import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: 'Platform Status',
    description: 'Live service status for Splits Network platform health.',
    ...buildCanonical("/public/status"),
};

export default function StatusLayout({ children }: { children: ReactNode }) {
    return children;
}
