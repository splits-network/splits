import type { Metadata } from "next";
import { PartnersContent } from "./partners-content";

export const metadata: Metadata = {
    title: "Partners",
    description:
        "Partner with Splits Network to expand your recruiting reach.",
};

export default function PartnersPage() {
    return <PartnersContent />;
}
