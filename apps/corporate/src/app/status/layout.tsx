import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Status | Employment Networks",
    description: "Live platform status for Employment Networks services.",
    ...buildCanonical("/status"),
};

export default function StatusLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
