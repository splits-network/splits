import type { Metadata } from "next";
import ContactBaselClient from "./contact-client";

export const metadata: Metadata = {
    title: "Contact Us | Splits Network",
    description:
        "Get in touch with Splits Network. Questions about our recruiting marketplace? Partnership opportunities? We're here to help transform split-fee recruiting.",
};

export default function ContactBaselPage() {
    return <ContactBaselClient />;
}
