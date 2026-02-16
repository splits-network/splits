"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── Role Colours & Badges ──────────────────────────────────────────────── */

type UserRole = "recruiter" | "company" | "candidate" | "admin";

const roleMeta: Record<
    UserRole,
    {
        label: string;
        color: string;
        bgClass: string;
        textClass: string;
        icon: string;
    }
> = {
    recruiter: {
        label: "Recruiter",
        color: "primary",
        bgClass: "bg-primary text-primary-content",
        textClass: "text-primary",
        icon: "fa-duotone fa-regular fa-user-tie",
    },
    company: {
        label: "Company",
        color: "secondary",
        bgClass: "bg-secondary text-secondary-content",
        textClass: "text-secondary",
        icon: "fa-duotone fa-regular fa-building",
    },
    candidate: {
        label: "Candidate",
        color: "accent",
        bgClass: "bg-accent text-accent-content",
        textClass: "text-accent",
        icon: "fa-duotone fa-regular fa-user",
    },
    admin: {
        label: "Admin",
        color: "neutral",
        bgClass: "bg-neutral text-neutral-content",
        textClass: "text-neutral",
        icon: "fa-duotone fa-regular fa-shield-halved",
    },
};

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    read: boolean;
}

interface Contact {
    id: string;
    name: string;
    initials: string;
    role: UserRole;
    online: boolean;
}

interface Conversation {
    id: string;
    contact: Contact;
    messages: Message[];
    unread: number;
    pinned: boolean;
}

/* ─── Current User ───────────────────────────────────────────────────────── */

const currentUser: Contact = {
    id: "me",
    name: "You",
    initials: "YO",
    role: "recruiter",
    online: true,
};

/* ─── Mock Conversations ─────────────────────────────────────────────────── */

const mockConversations: Conversation[] = [
    {
        id: "c1",
        contact: {
            id: "u1",
            name: "Sarah Chen",
            initials: "SC",
            role: "company",
            online: true,
        },
        unread: 2,
        pinned: true,
        messages: [
            {
                id: "m1",
                senderId: "u1",
                text: "Hi! We just posted 3 new Senior Engineer roles. The split terms are 20% with a 90-day guarantee. Interested in working them?",
                timestamp: "10:14 AM",
                read: true,
            },
            {
                id: "m2",
                senderId: "me",
                text: "Absolutely, Sarah. I have a strong pipeline for senior engineering. Can you share the full JDs so I can start matching?",
                timestamp: "10:18 AM",
                read: true,
            },
            {
                id: "m3",
                senderId: "u1",
                text: "Sent them over through the portal. Two are remote-first, one is hybrid in Austin. Salary bands are $180k-$220k base.",
                timestamp: "10:22 AM",
                read: true,
            },
            {
                id: "m4",
                senderId: "me",
                text: "Perfect. I already have 2 candidates in mind for the Austin role. Let me prep their profiles and submit by EOD.",
                timestamp: "10:25 AM",
                read: true,
            },
            {
                id: "m5",
                senderId: "u1",
                text: "That would be great. Also, we are fast-tracking the remote roles -- ideally want first submissions within 48 hours.",
                timestamp: "10:30 AM",
                read: false,
            },
            {
                id: "m6",
                senderId: "u1",
                text: "One more thing -- the hiring manager for the Austin role prefers candidates with fintech experience. Just a heads up.",
                timestamp: "10:32 AM",
                read: false,
            },
        ],
    },
    {
        id: "c2",
        contact: {
            id: "u2",
            name: "Marcus Rivera",
            initials: "MR",
            role: "candidate",
            online: false,
        },
        unread: 0,
        pinned: false,
        messages: [
            {
                id: "m7",
                senderId: "me",
                text: "Marcus, great news! TechCorp loved your profile. They want to schedule a technical interview this week. Are you available Thursday or Friday?",
                timestamp: "Yesterday",
                read: true,
            },
            {
                id: "m8",
                senderId: "u2",
                text: "That is amazing! Thursday afternoon works best for me. After 2pm EST if possible.",
                timestamp: "Yesterday",
                read: true,
            },
            {
                id: "m9",
                senderId: "me",
                text: "I will coordinate with the hiring team and send you a calendar invite. The interview will be about 90 minutes -- system design + coding.",
                timestamp: "Yesterday",
                read: true,
            },
            {
                id: "m10",
                senderId: "u2",
                text: "Sounds good. I have been brushing up on distributed systems. Any tips on what they focus on?",
                timestamp: "Yesterday",
                read: true,
            },
            {
                id: "m11",
                senderId: "me",
                text: "They love seeing candidates think through scalability tradeoffs. Focus on real-world architecture decisions rather than textbook answers. You will do great.",
                timestamp: "Yesterday",
                read: true,
            },
        ],
    },
    {
        id: "c3",
        contact: {
            id: "u3",
            name: "Elena Volkov",
            initials: "EV",
            role: "recruiter",
            online: true,
        },
        unread: 1,
        pinned: false,
        messages: [
            {
                id: "m12",
                senderId: "u3",
                text: "Hey! I saw you are working the DataFlow VP of Engineering role. I have a candidate who would be perfect but they are in my network, not yours. Want to co-split?",
                timestamp: "9:45 AM",
                read: true,
            },
            {
                id: "m13",
                senderId: "me",
                text: "Interesting. What is their background? The client specifically wants someone with Series B-to-IPO scaling experience.",
                timestamp: "9:52 AM",
                read: true,
            },
            {
                id: "m14",
                senderId: "u3",
                text: "She led engineering at two startups through IPO. Currently VP Eng at a public company with 200+ engineers. Exactly what they are looking for.",
                timestamp: "9:58 AM",
                read: true,
            },
            {
                id: "m15",
                senderId: "u3",
                text: "I can send her full profile over. If we submit together and she gets placed, we split the fee 50/50. Standard marketplace terms.",
                timestamp: "10:01 AM",
                read: false,
            },
        ],
    },
    {
        id: "c4",
        contact: {
            id: "u4",
            name: "James Okoro",
            initials: "JO",
            role: "admin",
            online: true,
        },
        unread: 0,
        pinned: true,
        messages: [
            {
                id: "m16",
                senderId: "u4",
                text: "Quick update: We have rolled out the new placement tracking dashboard. All active placements now show real-time status updates.",
                timestamp: "8:00 AM",
                read: true,
            },
            {
                id: "m17",
                senderId: "u4",
                text: "Also, your account has been upgraded to Pro tier. You now have access to AI candidate matching and priority support.",
                timestamp: "8:02 AM",
                read: true,
            },
            {
                id: "m18",
                senderId: "me",
                text: "Thanks James! The new dashboard looks great. Quick question -- can I export placement data to CSV now?",
                timestamp: "8:30 AM",
                read: true,
            },
            {
                id: "m19",
                senderId: "u4",
                text: "Yes! There is an export button in the top right of the placements table. Supports CSV and PDF formats.",
                timestamp: "8:35 AM",
                read: true,
            },
        ],
    },
    {
        id: "c5",
        contact: {
            id: "u5",
            name: "Priya Patel",
            initials: "PP",
            role: "company",
            online: false,
        },
        unread: 0,
        pinned: false,
        messages: [
            {
                id: "m20",
                senderId: "u5",
                text: "We placed David Kim last month through your submission. Just wanted to let you know he is doing phenomenal. Great match.",
                timestamp: "Feb 10",
                read: true,
            },
            {
                id: "m21",
                senderId: "me",
                text: "That is wonderful to hear, Priya! David was one of my top candidates. Glad the fit is working out.",
                timestamp: "Feb 10",
                read: true,
            },
            {
                id: "m22",
                senderId: "u5",
                text: "We have 2 more headcount opening up next quarter. I will post them on the platform as soon as we finalize the JDs. Would love for you to work them again.",
                timestamp: "Feb 10",
                read: true,
            },
            {
                id: "m23",
                senderId: "me",
                text: "Count me in. Just ping me when they go live and I will start sourcing immediately.",
                timestamp: "Feb 10",
                read: true,
            },
        ],
    },
    {
        id: "c6",
        contact: {
            id: "u6",
            name: "Alex Novak",
            initials: "AN",
            role: "candidate",
            online: true,
        },
        unread: 3,
        pinned: false,
        messages: [
            {
                id: "m24",
                senderId: "me",
                text: "Alex, I found a Product Manager role at InnovateCo that matches your background perfectly. Fully remote, $160-$185k range.",
                timestamp: "11:00 AM",
                read: true,
            },
            {
                id: "m25",
                senderId: "u6",
                text: "That sounds great! I have been looking for something exactly like that. What is the company culture like?",
                timestamp: "11:15 AM",
                read: true,
            },
            {
                id: "m26",
                senderId: "me",
                text: "Very collaborative, async-first. They do quarterly off-sites. Strong product-led growth culture. I have placed 3 people there and all love it.",
                timestamp: "11:20 AM",
                read: true,
            },
            {
                id: "m27",
                senderId: "u6",
                text: "I am definitely interested. Can you submit my profile?",
                timestamp: "11:30 AM",
                read: false,
            },
            {
                id: "m28",
                senderId: "u6",
                text: "Also, I just updated my resume on the platform with my latest project metrics. The conversion rate improvements I led.",
                timestamp: "11:32 AM",
                read: false,
            },
            {
                id: "m29",
                senderId: "u6",
                text: "One more thing -- I have a hard stop on salary below $165k. Just want to make sure that is within range before we proceed.",
                timestamp: "11:35 AM",
                read: false,
            },
        ],
    },
    {
        id: "c7",
        contact: {
            id: "u7",
            name: "Diana Wu",
            initials: "DW",
            role: "recruiter",
            online: false,
        },
        unread: 0,
        pinned: false,
        messages: [
            {
                id: "m30",
                senderId: "u7",
                text: "Congrats on hitting 10 placements this quarter! You are crushing it on the leaderboard.",
                timestamp: "Feb 8",
                read: true,
            },
            {
                id: "m31",
                senderId: "me",
                text: "Thanks Diana! The marketplace model really works. Having transparent terms from the start makes everything move faster.",
                timestamp: "Feb 8",
                read: true,
            },
        ],
    },
    {
        id: "c8",
        contact: {
            id: "u8",
            name: "Robert Tanaka",
            initials: "RT",
            role: "company",
            online: true,
        },
        unread: 1,
        pinned: false,
        messages: [
            {
                id: "m32",
                senderId: "u8",
                text: "We need to fill a Director of Data Science role urgently. Budget is $250-$300k. 25% placement fee. Can you prioritize this?",
                timestamp: "11:45 AM",
                read: true,
            },
            {
                id: "m33",
                senderId: "me",
                text: "On it, Robert. I have a shortlist of 4 strong candidates. Let me reach out today and get back to you with availability.",
                timestamp: "11:50 AM",
                read: true,
            },
            {
                id: "m34",
                senderId: "u8",
                text: "Great. The VP wants to see candidates by Wednesday. We can do back-to-back interviews Thursday if anyone is strong.",
                timestamp: "11:55 AM",
                read: false,
            },
        ],
    },
];

/* ─── Page Component ─────────────────────────────────────────────────────── */

export default function MessagesOne() {
    const mainRef = useRef<HTMLElement>(null);
    const threadRef = useRef<HTMLDivElement>(null);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const [selectedId, setSelectedId] = useState<string>("c1");
    const [searchQuery, setSearchQuery] = useState("");
    const [composeText, setComposeText] = useState("");
    const [conversations, setConversations] = useState(mockConversations);
    const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
    const [mobileShowThread, setMobileShowThread] = useState(false);

    const selected =
        conversations.find((c) => c.id === selectedId) ?? conversations[0];

    /* ── Filter conversations ─────────────────────────────────── */
    const filtered = conversations
        .filter((c) => {
            const matchesSearch =
                !searchQuery ||
                c.contact.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                c.messages.some((m) =>
                    m.text.toLowerCase().includes(searchQuery.toLowerCase()),
                );
            const matchesRole =
                filterRole === "all" || c.contact.role === filterRole;
            return matchesSearch && matchesRole;
        })
        .sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return 0;
        });

    /* ── Scroll to bottom when conversation changes ───────────── */
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedId, conversations]);

    /* ── Mark messages read on select ─────────────────────────── */
    useEffect(() => {
        setConversations((prev) =>
            prev.map((c) =>
                c.id === selectedId
                    ? {
                          ...c,
                          unread: 0,
                          messages: c.messages.map((m) => ({
                              ...m,
                              read: true,
                          })),
                      }
                    : c,
            ),
        );
    }, [selectedId]);

    /* ── Send message ─────────────────────────────────────────── */
    const handleSend = () => {
        if (!composeText.trim()) return;
        const newMsg: Message = {
            id: `m-${Date.now()}`,
            senderId: "me",
            text: composeText.trim(),
            timestamp: "Just now",
            read: true,
        };
        setConversations((prev) =>
            prev.map((c) =>
                c.id === selectedId
                    ? { ...c, messages: [...c.messages, newMsg] }
                    : c,
            ),
        );
        setComposeText("");
    };

    /* ── GSAP Animations ──────────────────────────────────────── */
    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const $ = (sel: string) => mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => mainRef.current!.querySelector(sel);

            /* Header entrance */
            const headerTl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            headerTl
                .fromTo(
                    $1(".msg-header-kicker"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                )
                .fromTo(
                    $(".msg-header-word"),
                    { opacity: 0, y: 60, rotateX: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.8,
                        stagger: 0.1,
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".msg-header-stat-bar"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.4",
                );

            /* Inbox panel slide */
            gsap.fromTo(
                $1(".inbox-panel"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    delay: 0.3,
                },
            );

            /* Thread panel slide */
            gsap.fromTo(
                $1(".thread-panel"),
                { opacity: 0, x: 40 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    delay: 0.4,
                },
            );

            /* Conversation items stagger */
            gsap.fromTo(
                $(".conv-item"),
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: "power2.out",
                    delay: 0.5,
                },
            );
        },
        { scope: mainRef },
    );

    /* ── Animate new messages on thread change ────────────────── */
    useEffect(() => {
        if (!threadRef.current) return;
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReducedMotion) return;

        const bubbles = threadRef.current.querySelectorAll(".msg-bubble");
        gsap.fromTo(
            bubbles,
            { opacity: 0, y: 20, scale: 0.97 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.3,
                stagger: 0.04,
                ease: "power2.out",
            },
        );
    }, [selectedId]);

    /* ── Total unread count ───────────────────────────────────── */
    const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

    /* ── Helper: select conversation ──────────────────────────── */
    const selectConversation = (id: string) => {
        setSelectedId(id);
        setMobileShowThread(true);
    };

    return (
        <main
            ref={mainRef}
            className="min-h-screen bg-base-100 overflow-hidden"
        >
            {/* ═══════════════════════════════════════════════════════
                HEADER — Editorial split-screen style
               ═══════════════════════════════════════════════════════ */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                {/* Diagonal accent bar */}
                <div
                    className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                />

                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl">
                        <p className="msg-header-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">
                            Communications Hub
                        </p>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-6">
                            <span className="msg-header-word inline-block opacity-0">
                                Your
                            </span>{" "}
                            <span className="msg-header-word inline-block opacity-0 text-primary">
                                messages.
                            </span>{" "}
                            <br className="hidden md:block" />
                            <span className="msg-header-word inline-block opacity-0">
                                All in
                            </span>{" "}
                            <span className="msg-header-word inline-block opacity-0">
                                one place.
                            </span>
                        </h1>

                        {/* Stat bar */}
                        <div className="msg-header-stat-bar flex flex-wrap gap-8 mt-8 opacity-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-envelope text-primary-content" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black">
                                        {conversations.length}
                                    </div>
                                    <div className="text-xs uppercase tracking-wider opacity-60">
                                        Conversations
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-accent flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-bell text-accent-content" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black">
                                        {totalUnread}
                                    </div>
                                    <div className="text-xs uppercase tracking-wider opacity-60">
                                        Unread
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-circle-check text-secondary-content" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black">
                                        {
                                            conversations.filter(
                                                (c) => c.contact.online,
                                            ).length
                                        }
                                    </div>
                                    <div className="text-xs uppercase tracking-wider opacity-60">
                                        Online Now
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SPLIT-SCREEN MESSAGING — 40% inbox / 60% thread
               ═══════════════════════════════════════════════════════ */}
            <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
                <div className="flex gap-0 lg:gap-6 h-[calc(100vh-20rem)] min-h-[500px]">
                    {/* ── INBOX PANEL (left 40%) ─────────────────────── */}
                    <div
                        className={`inbox-panel opacity-0 flex flex-col w-full lg:w-[38%] bg-base-200 border border-base-300 overflow-hidden ${
                            mobileShowThread ? "hidden lg:flex" : "flex"
                        }`}
                    >
                        {/* Inbox header */}
                        <div className="p-4 border-b border-base-300 bg-base-200">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-black tracking-tight">
                                    Inbox
                                </h2>
                                <button className="btn btn-ghost btn-sm btn-square">
                                    <i className="fa-duotone fa-regular fa-pen-to-square text-base-content/60" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative mb-3">
                                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-sm" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="input input-sm w-full pl-9 bg-base-100 border-base-300 focus:border-coral focus:outline-none"
                                />
                            </div>

                            {/* Role filter pills */}
                            <div className="flex gap-1.5 flex-wrap">
                                {(
                                    [
                                        "all",
                                        "recruiter",
                                        "company",
                                        "candidate",
                                        "admin",
                                    ] as const
                                ).map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setFilterRole(role)}
                                        className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
                                            filterRole === role
                                                ? role === "all"
                                                    ? "bg-neutral text-neutral-content"
                                                    : roleMeta[role].bgClass
                                                : "bg-base-100 text-base-content/60 hover:bg-base-300"
                                        }`}
                                    >
                                        {role === "all"
                                            ? "All"
                                            : roleMeta[role].label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Conversation list */}
                        <div className="flex-1 overflow-y-auto">
                            {filtered.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full opacity-40">
                                    <i className="fa-duotone fa-regular fa-inbox text-4xl mb-3" />
                                    <p className="text-sm">
                                        No conversations found
                                    </p>
                                </div>
                            )}
                            {filtered.map((conv) => {
                                const lastMsg =
                                    conv.messages[conv.messages.length - 1];
                                const isActive = conv.id === selectedId;
                                const meta = roleMeta[conv.contact.role];

                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() =>
                                            selectConversation(conv.id)
                                        }
                                        className={`conv-item opacity-0 w-full text-left p-4 border-b border-base-300 transition-all hover:bg-base-300/50 ${
                                            isActive
                                                ? "bg-base-100 border-l-4 border-l-primary"
                                                : "border-l-4 border-l-transparent"
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div
                                                    className={`w-11 h-11 flex items-center justify-center font-bold text-sm ${meta.bgClass}`}
                                                >
                                                    {conv.contact.initials}
                                                </div>
                                                {conv.contact.online && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success border-2 border-base-200 rounded-full" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        {conv.pinned && (
                                                            <i className="fa-duotone fa-regular fa-thumbtack text-xs text-primary flex-shrink-0" />
                                                        )}
                                                        <span
                                                            className={`font-bold text-sm truncate ${
                                                                conv.unread > 0
                                                                    ? "text-base-content"
                                                                    : "text-base-content/80"
                                                            }`}
                                                        >
                                                            {conv.contact.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] text-base-content/40 flex-shrink-0 ml-2">
                                                        {lastMsg.timestamp}
                                                    </span>
                                                </div>

                                                {/* Role badge */}
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <i
                                                        className={`${meta.icon} text-[10px] ${meta.textClass}`}
                                                    />
                                                    <span
                                                        className={`text-[10px] font-semibold uppercase tracking-wider ${meta.textClass}`}
                                                    >
                                                        {meta.label}
                                                    </span>
                                                </div>

                                                {/* Preview */}
                                                <div className="flex items-center justify-between">
                                                    <p
                                                        className={`text-xs truncate max-w-[85%] ${
                                                            conv.unread > 0
                                                                ? "text-base-content/70 font-medium"
                                                                : "text-base-content/50"
                                                        }`}
                                                    >
                                                        {lastMsg.senderId ===
                                                            "me" && (
                                                            <span className="text-base-content/30 mr-1">
                                                                You:
                                                            </span>
                                                        )}
                                                        {lastMsg.text}
                                                    </p>
                                                    {conv.unread > 0 && (
                                                        <span className="flex-shrink-0 w-5 h-5 bg-accent text-accent-content text-[10px] font-bold flex items-center justify-center rounded-full">
                                                            {conv.unread}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── THREAD PANEL (right 60%) ────────────────────── */}
                    <div
                        className={`thread-panel opacity-0 flex flex-col flex-1 bg-base-100 border border-base-300 overflow-hidden ${
                            mobileShowThread ? "flex" : "hidden lg:flex"
                        }`}
                    >
                        {/* Thread header */}
                        <div className="flex items-center gap-4 p-4 border-b border-base-300 bg-base-100">
                            {/* Mobile back button */}
                            <button
                                onClick={() => setMobileShowThread(false)}
                                className="btn btn-ghost btn-sm btn-square lg:hidden"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left" />
                            </button>

                            {/* Contact info */}
                            <div className="flex items-center gap-3 flex-1">
                                <div className="relative">
                                    <div
                                        className={`w-10 h-10 flex items-center justify-center font-bold text-sm ${
                                            roleMeta[selected.contact.role]
                                                .bgClass
                                        }`}
                                    >
                                        {selected.contact.initials}
                                    </div>
                                    {selected.contact.online && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-base-100 rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">
                                        {selected.contact.name}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <i
                                            className={`${roleMeta[selected.contact.role].icon} text-[10px] ${roleMeta[selected.contact.role].textClass}`}
                                        />
                                        <span
                                            className={`text-[10px] font-semibold uppercase tracking-wider ${roleMeta[selected.contact.role].textClass}`}
                                        >
                                            {
                                                roleMeta[selected.contact.role]
                                                    .label
                                            }
                                        </span>
                                        <span className="text-base-content/30 mx-1">
                                            |
                                        </span>
                                        <span className="text-[10px] text-base-content/50">
                                            {selected.contact.online
                                                ? "Online"
                                                : "Offline"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Thread actions */}
                            <div className="flex gap-1">
                                <button
                                    className="btn btn-ghost btn-sm btn-square"
                                    title="Search in conversation"
                                >
                                    <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/50" />
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm btn-square"
                                    title="View profile"
                                >
                                    <i className="fa-duotone fa-regular fa-user text-base-content/50" />
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm btn-square"
                                    title="More options"
                                >
                                    <i className="fa-duotone fa-regular fa-ellipsis-vertical text-base-content/50" />
                                </button>
                            </div>
                        </div>

                        {/* Messages area */}
                        <div
                            ref={threadRef}
                            className="flex-1 overflow-y-auto p-6 space-y-1"
                        >
                            {/* Date separator */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 h-px bg-base-300" />
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-base-content/30">
                                    {selected.messages[0]?.timestamp.includes(
                                        ":",
                                    )
                                        ? "Today"
                                        : selected.messages[0]?.timestamp}
                                </span>
                                <div className="flex-1 h-px bg-base-300" />
                            </div>

                            {selected.messages.map((msg, idx) => {
                                const isMine = msg.senderId === "me";
                                const sender = isMine
                                    ? currentUser
                                    : selected.contact;
                                const meta = roleMeta[sender.role];

                                /* Group consecutive messages from same sender */
                                const prevMsg = selected.messages[idx - 1];
                                const isGrouped =
                                    prevMsg?.senderId === msg.senderId;

                                return (
                                    <div
                                        key={msg.id}
                                        className={`msg-bubble flex gap-3 ${
                                            isMine ? "flex-row-reverse" : ""
                                        } ${isGrouped ? "mt-1" : "mt-5"}`}
                                    >
                                        {/* Avatar — only show for first in group */}
                                        {!isGrouped ? (
                                            <div
                                                className={`w-9 h-9 flex-shrink-0 flex items-center justify-center font-bold text-xs mt-1 ${meta.bgClass}`}
                                            >
                                                {sender.initials}
                                            </div>
                                        ) : (
                                            <div className="w-9 flex-shrink-0" />
                                        )}

                                        {/* Bubble */}
                                        <div
                                            className={`max-w-[70%] ${
                                                isMine ? "text-right" : ""
                                            }`}
                                        >
                                            {/* Name + time — only for first in group */}
                                            {!isGrouped && (
                                                <div
                                                    className={`flex items-center gap-2 mb-1 ${
                                                        isMine
                                                            ? "flex-row-reverse"
                                                            : ""
                                                    }`}
                                                >
                                                    <span className="text-xs font-bold">
                                                        {isMine
                                                            ? "You"
                                                            : sender.name}
                                                    </span>
                                                    <span className="text-[10px] text-base-content/40">
                                                        {msg.timestamp}
                                                    </span>
                                                </div>
                                            )}

                                            <div
                                                className={`px-4 py-2.5 text-sm leading-relaxed ${
                                                    isMine
                                                        ? "bg-primary text-primary-content"
                                                        : "bg-base-200 text-base-content"
                                                }`}
                                                style={
                                                    isMine
                                                        ? {
                                                              clipPath:
                                                                  isGrouped
                                                                      ? undefined
                                                                      : "polygon(0 0, 100% 0, 100% 100%, 0 100%, 0% 8px)",
                                                          }
                                                        : {
                                                              clipPath:
                                                                  isGrouped
                                                                      ? undefined
                                                                      : "polygon(0 0, 100% 0, 100% 100%, 0% 100%, 0 8px)",
                                                          }
                                                }
                                            >
                                                {msg.text}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messageEndRef} />
                        </div>

                        {/* Compose bar */}
                        <div className="border-t border-base-300 p-4 bg-base-100">
                            {/* Typing indicator area */}
                            <div className="h-5 mb-2">
                                {selected.contact.online && (
                                    <p className="text-[11px] text-base-content/30 flex items-center gap-1.5">
                                        <span className="inline-flex gap-0.5">
                                            <span
                                                className="w-1 h-1 bg-base-content/30 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: "0ms",
                                                }}
                                            />
                                            <span
                                                className="w-1 h-1 bg-base-content/30 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: "150ms",
                                                }}
                                            />
                                            <span
                                                className="w-1 h-1 bg-base-content/30 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: "300ms",
                                                }}
                                            />
                                        </span>
                                        {selected.contact.name.split(" ")[0]} is
                                        online
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2 items-end">
                                {/* Attachment */}
                                <button
                                    className="btn btn-ghost btn-sm btn-square flex-shrink-0 self-end"
                                    title="Attach file"
                                >
                                    <i className="fa-duotone fa-regular fa-paperclip text-base-content/50" />
                                </button>

                                {/* Text input */}
                                <div className="flex-1 relative">
                                    <textarea
                                        value={composeText}
                                        onChange={(e) =>
                                            setComposeText(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" &&
                                                !e.shiftKey
                                            ) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder={`Message ${selected.contact.name}...`}
                                        rows={1}
                                        className="textarea textarea-sm w-full bg-base-200 border-base-300 focus:border-coral focus:outline-none resize-none leading-relaxed min-h-[2.5rem] max-h-32"
                                        style={
                                            {
                                                fieldSizing: "content",
                                            } as React.CSSProperties
                                        }
                                    />
                                </div>

                                {/* Emoji */}
                                <button
                                    className="btn btn-ghost btn-sm btn-square flex-shrink-0 self-end"
                                    title="Emoji"
                                >
                                    <i className="fa-duotone fa-regular fa-face-smile text-base-content/50" />
                                </button>

                                {/* Send */}
                                <button
                                    onClick={handleSend}
                                    disabled={!composeText.trim()}
                                    className="btn btn-primary btn-sm flex-shrink-0 self-end"
                                >
                                    <i className="fa-duotone fa-regular fa-paper-plane-top" />
                                    <span className="hidden sm:inline">
                                        Send
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FOOTER ACCENT — Editorial style
               ═══════════════════════════════════════════════════════ */}
            <section className="bg-neutral text-neutral-content py-8">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-comments text-primary-content" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">
                                    Splits Network Messaging
                                </p>
                                <p className="text-xs opacity-50">
                                    Secure, real-time communication across the
                                    entire recruiting ecosystem
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6 text-xs opacity-50">
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-lock" />
                                End-to-end encrypted
                            </span>
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-bolt" />
                                Real-time delivery
                            </span>
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-shield-check" />
                                GDPR compliant
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
