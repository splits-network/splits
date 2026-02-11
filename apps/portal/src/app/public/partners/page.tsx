import type { Metadata } from "next";
import { PartnersContent } from "./partners-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Partners",
    description: "Partner with Splits Network to expand your recruiting reach, co-market roles, and unlock shared opportunities across the network.",
    openGraph: {
        title: "Partners",
        description: "Partner with Splits Network to expand your recruiting reach, co-market roles, and unlock shared opportunities across the network.",
        url: "https://splits.network/public/partners",
    },
    ...buildCanonical("/public/partners"),
};

export default function PartnersPage() {
    return <PartnersContent />;
}
