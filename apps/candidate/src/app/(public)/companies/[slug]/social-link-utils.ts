/**
 * Social link icon detection and label extraction.
 * Maps URL domains to FontAwesome icons and readable platform names.
 */

interface SocialPlatform {
    icon: string;
    name: string;
}

const PLATFORM_MAP: Record<string, SocialPlatform> = {
    "linkedin.com": { icon: "fa-brands fa-linkedin-in", name: "LinkedIn" },
    "twitter.com": { icon: "fa-brands fa-x-twitter", name: "X / Twitter" },
    "x.com": { icon: "fa-brands fa-x-twitter", name: "X" },
    "facebook.com": { icon: "fa-brands fa-facebook", name: "Facebook" },
    "instagram.com": { icon: "fa-brands fa-instagram", name: "Instagram" },
    "tiktok.com": { icon: "fa-brands fa-tiktok", name: "TikTok" },
    "glassdoor.com": { icon: "fa-duotone fa-regular fa-star", name: "Glassdoor" },
    "substack.com": { icon: "fa-duotone fa-regular fa-newspaper", name: "Substack" },
    "github.com": { icon: "fa-brands fa-github", name: "GitHub" },
    "youtube.com": { icon: "fa-brands fa-youtube", name: "YouTube" },
    "medium.com": { icon: "fa-brands fa-medium", name: "Medium" },
    "threads.net": { icon: "fa-brands fa-threads", name: "Threads" },
    "pinterest.com": { icon: "fa-brands fa-pinterest", name: "Pinterest" },
    "reddit.com": { icon: "fa-brands fa-reddit", name: "Reddit" },
    "discord.com": { icon: "fa-brands fa-discord", name: "Discord" },
    "discord.gg": { icon: "fa-brands fa-discord", name: "Discord" },
    "slack.com": { icon: "fa-brands fa-slack", name: "Slack" },
    "dribbble.com": { icon: "fa-brands fa-dribbble", name: "Dribbble" },
    "behance.net": { icon: "fa-brands fa-behance", name: "Behance" },
    "stackoverflow.com": {
        icon: "fa-brands fa-stack-overflow",
        name: "Stack Overflow",
    },
    "twitch.tv": { icon: "fa-brands fa-twitch", name: "Twitch" },
};

const FALLBACK: SocialPlatform = {
    icon: "fa-duotone fa-regular fa-link",
    name: "Website",
};

function extractDomain(url: string): string | null {
    try {
        const hostname = new URL(url).hostname.replace("www.", "");
        return hostname;
    } catch {
        return null;
    }
}

export function getSocialPlatform(url: string): SocialPlatform {
    const domain = extractDomain(url);
    if (!domain) return FALLBACK;

    // Check exact match first, then check if domain ends with a known platform
    if (PLATFORM_MAP[domain]) return PLATFORM_MAP[domain];
    for (const [key, platform] of Object.entries(PLATFORM_MAP)) {
        if (domain.endsWith(`.${key}`) || domain === key) return platform;
    }
    return FALLBACK;
}

export function getSocialLabel(
    url: string,
    customLabel?: string | null,
): string {
    if (customLabel) return customLabel;
    return getSocialPlatform(url).name;
}

export function getSocialIcon(url: string): string {
    return getSocialPlatform(url).icon;
}
