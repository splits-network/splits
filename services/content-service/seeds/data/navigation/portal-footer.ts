import type { FooterNavConfig } from "@splits-network/shared-types";

export const portalFooterNav = {
    app: "portal" as const,
    location: "footer" as const,
    config: {
        sections: [
            {
                title: "Platform",
                links: [
                    { label: "Features", href: "/features" },
                    { label: "Pricing", href: "/pricing" },
                    { label: "How It Works", href: "/how-it-works" },
                    { label: "Transparency", href: "/transparency" },
                    { label: "Integrations", href: "/integration-partners" },
                    { label: "Updates", href: "/updates" },
                ],
            },
            {
                title: "Company",
                links: [
                    { label: "About Us", href: "/about" },
                    { label: "Careers", href: "/careers" },
                    { label: "Blog", href: "/blog" },
                    { label: "Press", href: "/press" },
                    { label: "Brand Kit", href: "/brand" },
                    { label: "Partners", href: "/partners" },
                ],
            },
            {
                title: "Resources",
                links: [
                    { label: "Help Center", href: "#" },
                    { label: "Contact Us", href: "/contact" },
                    { label: "Documentation", href: "/documentation" },
                    { label: "API Reference", href: "#" },
                    { label: "System Status", href: "/status" },
                ],
            },
            {
                title: "Legal",
                links: [
                    { label: "Privacy Policy", href: "/privacy-policy" },
                    { label: "Terms of Service", href: "/terms-of-service" },
                    { label: "Cookie Policy", href: "/cookie-policy" },
                    { label: "Security", href: "#" },
                ],
            },
        ],
        socialLinks: [
            {
                icon: "fa-brands fa-x-twitter",
                href: "https://x.com/employ_network",
                label: "Twitter",
            },
            {
                icon: "fa-brands fa-instagram",
                href: "https://www.instagram.com/employ_networks/",
                label: "Instagram",
            },
            {
                icon: "fa-brands fa-linkedin-in",
                href: "https://www.linkedin.com/company/employment-networks-inc",
                label: "LinkedIn",
            },
            {
                icon: "fa-brands fa-facebook",
                href: "https://www.facebook.com/profile.php?id=61586842350461",
                label: "Facebook",
            },
            {
                icon: "fa-brands fa-github",
                href: "https://github.com/splits-network",
                label: "GitHub",
            },
            {
                icon: "fa-brands fa-youtube",
                href: "https://www.youtube.com/@employ_networks",
                label: "YouTube",
            },
        ],
        trustStats: [
            { value: "2,847", label: "Recruiters" },
            { value: "518", label: "Companies" },
            { value: "12,340", label: "Candidates" },
            { value: "$42M+", label: "In Placements" },
        ],
        legalLinks: [
            { label: "Privacy", href: "/privacy-policy" },
            { label: "Terms", href: "/terms-of-service" },
            { label: "Cookies", href: "/cookie-policy" },
            { label: "Sitemap", href: "/sitemap.xml" },
        ],
    } satisfies FooterNavConfig,
};
