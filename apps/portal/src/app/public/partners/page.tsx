import type { Metadata } from "next";
import { PartnersContent } from "./partners-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Partners",
    description:
        "Partner with Splits Network to expand your recruiting reach.",
    ...buildCanonical("/public/partners"),
};

export default function PartnersPage() {
    return <PartnersContent />;
}