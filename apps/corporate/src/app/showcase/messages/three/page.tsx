"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin();
}

// -- Animation constants (Swiss precision) ------------------------------------
const D = { fast: 0.25, normal: 0.45, slow: 0.7, entrance: 0.9 };
const E = {
    precise: "power3.out",
    mechanical: "power2.inOut",
    snap: "power4.out",
};
const S = { tight: 0.04, normal: 0.08, message: 0.06 };

// -- Types --------------------------------------------------------------------
interface User {
    id: string;
    name: string;
    initials: string;
    role: "Recruiter" | "Company" | "Candidate" | "Admin";
    status: "online" | "away" | "offline";
}

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    read: boolean;
}

interface Conversation {
    id: string;
    participants: User[];
    messages: Message[];
    subject: string;
    category: "placement" | "general" | "urgent" | "system";
    pinned: boolean;
}

// -- Role styling map ---------------------------------------------------------
const roleConfig: Record<
    User["role"],
    { accent: string; badge: string; icon: string }
> = {
    Recruiter: {
        accent: "text-primary",
        badge: "bg-primary/10 text-primary border-coral/20",
        icon: "fa-duotone fa-regular fa-user-tie",
    },
    Company: {
        accent: "text-accent",
        badge: "bg-accent/10 text-accent border-yellow/20",
        icon: "fa-duotone fa-regular fa-building",
    },
    Candidate: {
        accent: "text-secondary",
        badge: "bg-secondary/10 text-secondary border-secondary/20",
        icon: "fa-duotone fa-regular fa-user",
    },
    Admin: {
        accent: "text-warning",
        badge: "bg-warning/10 text-warning border-warning/20",
        icon: "fa-duotone fa-regular fa-shield-check",
    },
};

const statusIndicator: Record<User["status"], string> = {
    online: "bg-success",
    away: "bg-warning",
    offline: "bg-base-content/20",
};

// -- Mock Users ---------------------------------------------------------------
const users: Record<string, User> = {
    me: {
        id: "me",
        name: "You",
        initials: "YO",
        role: "Admin",
        status: "online",
    },
    sarah: {
        id: "sarah",
        name: "Sarah Chen",
        initials: "SC",
        role: "Recruiter",
        status: "online",
    },
    marcus: {
        id: "marcus",
        name: "Marcus Webb",
        initials: "MW",
        role: "Company",
        status: "away",
    },
    elena: {
        id: "elena",
        name: "Elena Vasquez",
        initials: "EV",
        role: "Candidate",
        status: "online",
    },
    james: {
        id: "james",
        name: "James Holbrook",
        initials: "JH",
        role: "Recruiter",
        status: "offline",
    },
    priya: {
        id: "priya",
        name: "Priya Sharma",
        initials: "PS",
        role: "Company",
        status: "online",
    },
    alex: {
        id: "alex",
        name: "Alex Nouri",
        initials: "AN",
        role: "Candidate",
        status: "away",
    },
    system: {
        id: "system",
        name: "Splits Network",
        initials: "SN",
        role: "Admin",
        status: "online",
    },
};

// -- Mock Conversations -------------------------------------------------------
const mockConversations: Conversation[] = [
    {
        id: "conv-1",
        subject: "Sr. Frontend Engineer -- Placement Update",
        category: "placement",
        pinned: true,
        participants: [users.me, users.sarah, users.marcus],
        messages: [
            {
                id: "m1a",
                senderId: "sarah",
                text: "Marcus, I have three strong candidates for the Sr. Frontend role. Two have React 19 experience and one has extensive Next.js background. Can we schedule a review?",
                timestamp: "10:14 AM",
                read: true,
            },
            {
                id: "m1b",
                senderId: "marcus",
                text: "That sounds great. We're particularly interested in the Next.js candidate. Can you send over their profile first? We want to move fast on this one.",
                timestamp: "10:22 AM",
                read: true,
            },
            {
                id: "m1c",
                senderId: "sarah",
                text: "Absolutely. Elena Vasquez is the Next.js specialist -- 6 years of experience, currently at a Series B fintech. I'll share her full profile now.",
                timestamp: "10:25 AM",
                read: true,
            },
            {
                id: "m1d",
                senderId: "me",
                text: "I've reviewed the submission pipeline. Elena's profile looks strong. Sarah, please make sure the split-fee terms are confirmed before we proceed to interview.",
                timestamp: "10:41 AM",
                read: true,
            },
            {
                id: "m1e",
                senderId: "sarah",
                text: "Confirmed -- 20% standard split. Marcus already signed the fee agreement last week. We're clear to proceed.",
                timestamp: "10:43 AM",
                read: true,
            },
            {
                id: "m1f",
                senderId: "marcus",
                text: "Perfect. Let's schedule the technical screen for Thursday. I'll loop in our engineering lead.",
                timestamp: "10:58 AM",
                read: false,
            },
        ],
    },
    {
        id: "conv-2",
        subject: "Candidate Introduction -- Alex Nouri",
        category: "general",
        pinned: false,
        participants: [users.me, users.james, users.alex],
        messages: [
            {
                id: "m2a",
                senderId: "james",
                text: "Hi Alex, I'm James from the Splits Network. I came across your profile and think you'd be a strong fit for several backend roles in our network.",
                timestamp: "Yesterday",
                read: true,
            },
            {
                id: "m2b",
                senderId: "alex",
                text: "Thanks James, I appreciate the outreach. I'm currently exploring new opportunities. What kind of roles are you seeing?",
                timestamp: "Yesterday",
                read: true,
            },
            {
                id: "m2c",
                senderId: "james",
                text: "We have openings at three different companies for senior backend engineers. Two are in fintech, one in healthtech. All remote-friendly. Salary ranges from $180K-$220K.",
                timestamp: "Yesterday",
                read: true,
            },
            {
                id: "m2d",
                senderId: "alex",
                text: "The fintech roles sound interesting. I've been working in financial services for the past four years. Can you share more details?",
                timestamp: "Yesterday",
                read: true,
            },
            {
                id: "m2e",
                senderId: "me",
                text: "James, I've tagged Alex's profile with the relevant job IDs. You should see the match scores in the ATS now.",
                timestamp: "9:30 AM",
                read: true,
            },
            {
                id: "m2f",
                senderId: "james",
                text: "Got it, thanks. Alex -- I'll send you the detailed job descriptions by end of day. The match scores are excellent.",
                timestamp: "9:45 AM",
                read: true,
            },
        ],
    },
    {
        id: "conv-3",
        subject: "Billing Inquiry -- Q1 Payouts",
        category: "urgent",
        pinned: false,
        participants: [users.me, users.priya],
        messages: [
            {
                id: "m3a",
                senderId: "priya",
                text: "Hi, I noticed that our Q1 payout statement shows a discrepancy on the Johnson placement. The agreed fee was 20% but the statement reflects 18%. Can you look into this?",
                timestamp: "Yesterday",
                read: true,
            },
            {
                id: "m3b",
                senderId: "me",
                text: "I'll review the placement record and fee agreement right away. Can you confirm the placement ID?",
                timestamp: "Yesterday",
                read: true,
            },
            {
                id: "m3c",
                senderId: "priya",
                text: "Placement ID is PL-2024-0847. The fee agreement was signed on January 15th. We have the documentation if needed.",
                timestamp: "Yesterday",
                read: true,
            },
            {
                id: "m3d",
                senderId: "me",
                text: "Found the issue. The system applied the early-bird discount tier instead of the standard rate. I'm correcting this now. You'll see the adjusted payout within 48 hours.",
                timestamp: "8:15 AM",
                read: true,
            },
            {
                id: "m3e",
                senderId: "priya",
                text: "Thank you for the quick resolution. Should we expect a revised statement as well?",
                timestamp: "8:30 AM",
                read: false,
            },
        ],
    },
    {
        id: "conv-4",
        subject: "System Notification -- New Features",
        category: "system",
        pinned: false,
        participants: [users.me, users.system],
        messages: [
            {
                id: "m4a",
                senderId: "system",
                text: "New feature release: AI-powered candidate matching is now available in your ATS dashboard. Match scores are calculated automatically for all active job postings.",
                timestamp: "Monday",
                read: true,
            },
            {
                id: "m4b",
                senderId: "system",
                text: "Update: The analytics dashboard has been enhanced with placement velocity metrics. Access it from Analytics > Performance.",
                timestamp: "Tuesday",
                read: true,
            },
            {
                id: "m4c",
                senderId: "system",
                text: "Reminder: The February billing cycle closes on February 28th. Please review all pending placements and ensure fee agreements are finalized.",
                timestamp: "Today",
                read: false,
            },
        ],
    },
    {
        id: "conv-5",
        subject: "DevOps Lead -- Pipeline Discussion",
        category: "placement",
        pinned: false,
        participants: [users.me, users.sarah, users.priya],
        messages: [
            {
                id: "m5a",
                senderId: "priya",
                text: "We've opened a new DevOps Lead role. Looking for someone with Kubernetes and Terraform experience. Budget is $200K-$240K. Can you help source?",
                timestamp: "Friday",
                read: true,
            },
            {
                id: "m5b",
                senderId: "sarah",
                text: "I have two candidates who could be a great fit. One is currently a Staff DevOps engineer at a FAANG company. Shall I submit both?",
                timestamp: "Friday",
                read: true,
            },
            {
                id: "m5c",
                senderId: "priya",
                text: "Yes please. Our team is growing fast and we want to fill this within the month. Standard 20% split works for us.",
                timestamp: "Friday",
                read: true,
            },
            {
                id: "m5d",
                senderId: "me",
                text: "I've created the job listing in the ATS. Sarah, you should see it in your available roles. Priya, the fee agreement is ready for signature.",
                timestamp: "Today",
                read: true,
            },
        ],
    },
    {
        id: "conv-6",
        subject: "Interview Feedback -- Elena Vasquez",
        category: "placement",
        pinned: false,
        participants: [users.me, users.marcus, users.elena],
        messages: [
            {
                id: "m6a",
                senderId: "marcus",
                text: "Elena's technical screen went extremely well. Our engineering lead was impressed with her system design approach. We'd like to move to a final round.",
                timestamp: "11:00 AM",
                read: true,
            },
            {
                id: "m6b",
                senderId: "elena",
                text: "Thank you! I really enjoyed the conversation. The team's approach to micro-frontends is exactly what I've been wanting to work on. When would the final round be?",
                timestamp: "11:15 AM",
                read: true,
            },
            {
                id: "m6c",
                senderId: "marcus",
                text: "We're targeting next Monday or Tuesday. It'll be a culture fit conversation with our CTO and VP of Engineering. About 90 minutes total.",
                timestamp: "11:20 AM",
                read: true,
            },
            {
                id: "m6d",
                senderId: "me",
                text: "Excellent progress. I've updated the placement pipeline. Elena, I'll coordinate the scheduling. Marcus, I'll send calendar invites once we confirm a time.",
                timestamp: "11:35 AM",
                read: false,
            },
        ],
    },
    {
        id: "conv-7",
        subject: "Network Expansion -- Healthcare Vertical",
        category: "general",
        pinned: false,
        participants: [users.me, users.james],
        messages: [
            {
                id: "m7a",
                senderId: "james",
                text: "I've been building relationships with several healthcare companies in the Boston area. I think there's a significant opportunity to expand our network into the healthcare vertical.",
                timestamp: "Wednesday",
                read: true,
            },
            {
                id: "m7b",
                senderId: "me",
                text: "That aligns with our Q2 growth targets. How many companies are we talking about?",
                timestamp: "Wednesday",
                read: true,
            },
            {
                id: "m7c",
                senderId: "james",
                text: "Six companies so far, ranging from Series A startups to established health systems. They're all struggling to find specialized tech talent -- data engineers, ML engineers, and full-stack developers with healthcare experience.",
                timestamp: "Wednesday",
                read: true,
            },
            {
                id: "m7d",
                senderId: "james",
                text: "I've prepared a brief on each company. Want me to present at the next team sync?",
                timestamp: "Thursday",
                read: false,
            },
        ],
    },
];

// -- Component ----------------------------------------------------------------
export default function MessagesThreePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const messageListRef = useRef<HTMLDivElement>(null);
    const [activeConversation, setActiveConversation] =
        useState<string>("conv-1");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState<User["role"] | "All">("All");
    const [filterCategory, setFilterCategory] = useState<
        Conversation["category"] | "all"
    >("all");
    const [composerText, setComposerText] = useState("");
    const [conversations, setConversations] = useState(mockConversations);
    const [showMobileInbox, setShowMobileInbox] = useState(true);
    const [animatedConvId, setAnimatedConvId] = useState<string | null>(null);

    const activeConv = conversations.find((c) => c.id === activeConversation);
    const otherParticipants =
        activeConv?.participants.filter((p) => p.id !== "me") ?? [];

    // Filter conversations
    const filteredConversations = conversations.filter((conv) => {
        const matchesSearch =
            searchQuery === "" ||
            conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.participants.some((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        const matchesRole =
            filterRole === "All" ||
            conv.participants.some(
                (p) => p.id !== "me" && p.role === filterRole,
            );
        const matchesCategory =
            filterCategory === "all" || conv.category === filterCategory;
        return matchesSearch && matchesRole && matchesCategory;
    });

    // Unread count
    const totalUnread = conversations.reduce((acc, conv) => {
        return (
            acc +
            conv.messages.filter((m) => !m.read && m.senderId !== "me").length
        );
    }, 0);

    // Scroll to bottom on conversation change
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeConversation]);

    // Animate messages when conversation changes
    useEffect(() => {
        if (!messageListRef.current || !activeConv) return;
        setAnimatedConvId(activeConversation);

        const messages = messageListRef.current.querySelectorAll(".msg-bubble");
        if (messages.length === 0) return;

        gsap.fromTo(
            messages,
            { opacity: 0, y: 20, scale: 0.97 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: D.fast,
                ease: E.precise,
                stagger: S.message,
            },
        );
    }, [activeConversation, activeConv]);

    // Entrance animation
    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    containerRef.current.querySelectorAll("[data-animate]"),
                    { opacity: 1 },
                );
                return;
            }

            const tl = gsap.timeline({ defaults: { ease: E.precise } });

            // Header elements
            tl.fromTo(
                ".msg-header-number",
                { opacity: 0, y: 60, skewY: 5 },
                { opacity: 1, y: 0, skewY: 0, duration: D.entrance },
            );

            tl.fromTo(
                ".msg-header-title",
                { opacity: 0, x: -40 },
                { opacity: 1, x: 0, duration: D.slow },
                "-=0.6",
            );

            tl.fromTo(
                ".msg-header-divider",
                { scaleX: 0 },
                {
                    scaleX: 1,
                    duration: D.normal,
                    transformOrigin: "left center",
                },
                "-=0.3",
            );

            // Stats bar
            tl.fromTo(
                ".msg-stat-cell",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: D.fast, stagger: S.tight },
                "-=0.2",
            );

            // Main panels
            tl.fromTo(
                ".msg-sidebar",
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: D.normal },
                "-=0.2",
            );

            tl.fromTo(
                ".msg-main",
                { opacity: 0, x: 30 },
                { opacity: 1, x: 0, duration: D.normal },
                "-=0.3",
            );

            // Conversation items
            tl.fromTo(
                ".conv-item",
                { opacity: 0, x: -15 },
                { opacity: 1, x: 0, duration: D.fast, stagger: S.tight },
                "-=0.2",
            );
        },
        { scope: containerRef },
    );

    // Send message
    const handleSend = () => {
        if (!composerText.trim() || !activeConv) return;

        const newMessage: Message = {
            id: `m-new-${Date.now()}`,
            senderId: "me",
            text: composerText.trim(),
            timestamp: "Just now",
            read: true,
        };

        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === activeConversation
                    ? { ...conv, messages: [...conv.messages, newMessage] }
                    : conv,
            ),
        );
        setComposerText("");

        // Animate the new message
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (!messageListRef.current) return;
                const allBubbles =
                    messageListRef.current.querySelectorAll(".msg-bubble");
                const lastBubble = allBubbles[allBubbles.length - 1];
                if (lastBubble) {
                    gsap.fromTo(
                        lastBubble,
                        { opacity: 0, y: 20, scale: 0.95 },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: D.fast,
                            ease: E.snap,
                        },
                    );
                }
                messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
            });
        });
    };

    const getLastMessage = (conv: Conversation) => {
        const last = conv.messages[conv.messages.length - 1];
        if (!last) return "";
        const sender = users[last.senderId];
        const prefix =
            last.senderId === "me" ? "You" : (sender?.name.split(" ")[0] ?? "");
        return `${prefix}: ${last.text}`;
    };

    const getUnreadCount = (conv: Conversation) =>
        conv.messages.filter((m) => !m.read && m.senderId !== "me").length;

    const categoryConfig: Record<
        Conversation["category"],
        { label: string; color: string; icon: string }
    > = {
        placement: {
            label: "Placement",
            color: "text-primary",
            icon: "fa-duotone fa-regular fa-handshake",
        },
        general: {
            label: "General",
            color: "text-base-content/50",
            icon: "fa-duotone fa-regular fa-message",
        },
        urgent: {
            label: "Urgent",
            color: "text-error",
            icon: "fa-duotone fa-regular fa-triangle-exclamation",
        },
        system: {
            label: "System",
            color: "text-warning",
            icon: "fa-duotone fa-regular fa-gear",
        },
    };

    return (
        <div
            ref={containerRef}
            className="bg-base-100 text-base-content min-h-screen flex flex-col"
        >
            {/* ── HEADER ──────────────────────────────────────────────────── */}
            <header className="border-b-2 border-neutral">
                <div className="container mx-auto px-6 lg:px-12 pt-12 pb-8">
                    <div className="grid grid-cols-12 gap-4 items-end">
                        {/* Oversized section number */}
                        <div className="col-span-3 lg:col-span-2">
                            <div className="msg-header-number opacity-0 text-[5rem] sm:text-[7rem] lg:text-[9rem] font-black leading-none tracking-tighter text-neutral/8 select-none">
                                07
                            </div>
                        </div>
                        {/* Title block */}
                        <div className="col-span-9 lg:col-span-6 pb-2">
                            <div className="msg-header-title opacity-0">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-base-content/40 mb-2">
                                    Communications
                                </p>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[0.9] tracking-tight">
                                    Messages
                                </h1>
                            </div>
                        </div>
                        {/* Action buttons (desktop) */}
                        <div className="col-span-12 lg:col-span-4 pb-2 hidden lg:flex justify-end gap-3">
                            <button className="msg-stat-cell opacity-0 btn btn-neutral btn-sm font-bold tracking-wide">
                                <i className="fa-duotone fa-regular fa-pen-to-square mr-2" />
                                New Message
                            </button>
                            <button className="msg-stat-cell opacity-0 btn btn-ghost btn-sm font-bold tracking-wide border border-base-300">
                                <i className="fa-duotone fa-regular fa-sliders mr-2" />
                                Settings
                            </button>
                        </div>
                    </div>

                    <div
                        className="msg-header-divider h-[2px] bg-neutral/10 mt-6 mb-6"
                        style={{ transformOrigin: "left center" }}
                    />

                    {/* Stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-[2px] bg-neutral/5">
                        {[
                            {
                                label: "Total Threads",
                                value: String(conversations.length),
                                icon: "fa-duotone fa-regular fa-messages",
                            },
                            {
                                label: "Unread",
                                value: String(totalUnread),
                                icon: "fa-duotone fa-regular fa-envelope",
                            },
                            {
                                label: "Active Now",
                                value: String(
                                    Object.values(users).filter(
                                        (u) =>
                                            u.status === "online" &&
                                            u.id !== "me",
                                    ).length,
                                ),
                                icon: "fa-duotone fa-regular fa-circle-dot",
                            },
                            {
                                label: "This Week",
                                value: "24",
                                icon: "fa-duotone fa-regular fa-calendar-week",
                            },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="msg-stat-cell opacity-0 bg-base-100 p-4"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <i
                                        className={`${stat.icon} text-xs text-base-content/30`}
                                    />
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-base-content/40">
                                        {stat.label}
                                    </span>
                                </div>
                                <div className="text-2xl font-black tracking-tight">
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* ── MOBILE TOGGLE ───────────────────────────────────────────── */}
            <div className="lg:hidden border-b border-base-300 px-4 py-3 flex gap-2">
                <button
                    onClick={() => setShowMobileInbox(true)}
                    className={`btn btn-sm flex-1 font-bold tracking-wide ${showMobileInbox ? "btn-neutral" : "btn-ghost"}`}
                >
                    <i className="fa-duotone fa-regular fa-inbox mr-2" />
                    Inbox
                </button>
                <button
                    onClick={() => setShowMobileInbox(false)}
                    className={`btn btn-sm flex-1 font-bold tracking-wide ${!showMobileInbox ? "btn-neutral" : "btn-ghost"}`}
                >
                    <i className="fa-duotone fa-regular fa-message mr-2" />
                    Thread
                </button>
            </div>

            {/* ── MAIN LAYOUT ─────────────────────────────────────────────── */}
            <div
                className="flex-1 flex overflow-hidden"
                style={{ height: "calc(100vh - 320px)" }}
            >
                {/* ── SIDEBAR / CONVERSATION LIST ──────────────────────────── */}
                <aside
                    className={`msg-sidebar opacity-0 w-full lg:w-[420px] border-r-2 border-neutral/10 flex flex-col bg-base-100 ${
                        showMobileInbox ? "flex" : "hidden lg:flex"
                    }`}
                >
                    {/* Search + Filters */}
                    <div className="p-4 border-b border-base-300 space-y-3">
                        {/* Search */}
                        <div className="relative">
                            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-sm" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input input-sm w-full pl-9 bg-base-200/50 border-base-300 font-medium tracking-wide text-sm focus:outline-none focus:border-neutral"
                            />
                        </div>

                        {/* Filter row */}
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {/* Category filter */}
                            {(
                                [
                                    "all",
                                    "placement",
                                    "urgent",
                                    "general",
                                    "system",
                                ] as const
                            ).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`btn btn-xs font-bold tracking-wider uppercase whitespace-nowrap ${
                                        filterCategory === cat
                                            ? "btn-neutral"
                                            : "btn-ghost border border-base-300"
                                    }`}
                                >
                                    {cat === "all"
                                        ? "All"
                                        : categoryConfig[cat].label}
                                </button>
                            ))}
                        </div>

                        {/* Role filter */}
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {(
                                [
                                    "All",
                                    "Recruiter",
                                    "Company",
                                    "Candidate",
                                    "Admin",
                                ] as const
                            ).map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setFilterRole(role)}
                                    className={`btn btn-xs font-bold tracking-wider uppercase whitespace-nowrap ${
                                        filterRole === role
                                            ? "btn-neutral"
                                            : "btn-ghost border border-base-300"
                                    }`}
                                >
                                    {role !== "All" && (
                                        <i
                                            className={`${roleConfig[role].icon} mr-1 text-[10px]`}
                                        />
                                    )}
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 && (
                            <div className="p-8 text-center">
                                <i className="fa-duotone fa-regular fa-inbox text-4xl text-base-content/10 mb-4 block" />
                                <p className="text-sm text-base-content/40 font-medium">
                                    No conversations found
                                </p>
                            </div>
                        )}

                        {/* Pinned section */}
                        {filteredConversations.some((c) => c.pinned) && (
                            <div className="px-4 pt-4 pb-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/30">
                                    <i className="fa-duotone fa-regular fa-thumbtack mr-1" />
                                    Pinned
                                </span>
                            </div>
                        )}
                        {filteredConversations
                            .filter((c) => c.pinned)
                            .map((conv) => (
                                <ConversationItem
                                    key={conv.id}
                                    conv={conv}
                                    isActive={conv.id === activeConversation}
                                    unread={getUnreadCount(conv)}
                                    lastMessage={getLastMessage(conv)}
                                    categoryConfig={categoryConfig}
                                    onClick={() => {
                                        setActiveConversation(conv.id);
                                        setShowMobileInbox(false);
                                    }}
                                />
                            ))}

                        {/* All conversations */}
                        {filteredConversations.some((c) => !c.pinned) && (
                            <div className="px-4 pt-4 pb-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/30">
                                    <i className="fa-duotone fa-regular fa-clock-rotate-left mr-1" />
                                    Recent
                                </span>
                            </div>
                        )}
                        {filteredConversations
                            .filter((c) => !c.pinned)
                            .map((conv) => (
                                <ConversationItem
                                    key={conv.id}
                                    conv={conv}
                                    isActive={conv.id === activeConversation}
                                    unread={getUnreadCount(conv)}
                                    lastMessage={getLastMessage(conv)}
                                    categoryConfig={categoryConfig}
                                    onClick={() => {
                                        setActiveConversation(conv.id);
                                        setShowMobileInbox(false);
                                    }}
                                />
                            ))}
                    </div>
                </aside>

                {/* ── MESSAGE THREAD VIEW ──────────────────────────────────── */}
                <main
                    className={`msg-main opacity-0 flex-1 flex flex-col bg-base-100 ${
                        !showMobileInbox ? "flex" : "hidden lg:flex"
                    }`}
                >
                    {activeConv ? (
                        <>
                            {/* Thread header */}
                            <div className="border-b-2 border-neutral/10 px-6 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Category badge */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span
                                                className={`text-[10px] font-bold uppercase tracking-[0.2em] ${categoryConfig[activeConv.category].color}`}
                                            >
                                                <i
                                                    className={`${categoryConfig[activeConv.category].icon} mr-1`}
                                                />
                                                {
                                                    categoryConfig[
                                                        activeConv.category
                                                    ].label
                                                }
                                            </span>
                                            {activeConv.pinned && (
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/30">
                                                    <i className="fa-duotone fa-regular fa-thumbtack mr-1" />
                                                    Pinned
                                                </span>
                                            )}
                                        </div>

                                        {/* Subject */}
                                        <h2 className="text-lg lg:text-xl font-black tracking-tight truncate">
                                            {activeConv.subject}
                                        </h2>

                                        {/* Participants */}
                                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                                            {otherParticipants.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="flex items-center gap-2"
                                                >
                                                    <div className="relative">
                                                        <div
                                                            className={`w-6 h-6 flex items-center justify-center text-[9px] font-black tracking-tight border ${roleConfig[p.role].badge}`}
                                                        >
                                                            {p.initials}
                                                        </div>
                                                        <div
                                                            className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-base-100 ${statusIndicator[p.status]}`}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-base-content/60">
                                                        {p.name}
                                                    </span>
                                                    <span
                                                        className={`text-[9px] font-bold uppercase tracking-wider ${roleConfig[p.role].accent}`}
                                                    >
                                                        {p.role}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Thread actions */}
                                    <div className="flex gap-2 shrink-0">
                                        <button className="btn btn-ghost btn-sm btn-square border border-base-300">
                                            <i className="fa-duotone fa-regular fa-thumbtack text-xs" />
                                        </button>
                                        <button className="btn btn-ghost btn-sm btn-square border border-base-300">
                                            <i className="fa-duotone fa-regular fa-archive text-xs" />
                                        </button>
                                        <button className="btn btn-ghost btn-sm btn-square border border-base-300">
                                            <i className="fa-duotone fa-regular fa-ellipsis-vertical text-xs" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div
                                ref={messageListRef}
                                className="flex-1 overflow-y-auto px-6 py-6 space-y-1"
                            >
                                {activeConv.messages.map((msg, i) => {
                                    const sender = users[msg.senderId];
                                    const isMe = msg.senderId === "me";
                                    const showAvatar =
                                        i === 0 ||
                                        activeConv.messages[i - 1].senderId !==
                                            msg.senderId;
                                    const isLastInGroup =
                                        i === activeConv.messages.length - 1 ||
                                        activeConv.messages[i + 1].senderId !==
                                            msg.senderId;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`msg-bubble flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"} ${showAvatar ? "mt-5" : "mt-0.5"}`}
                                            style={{
                                                opacity:
                                                    animatedConvId ===
                                                    activeConversation
                                                        ? undefined
                                                        : 1,
                                            }}
                                        >
                                            {/* Avatar column */}
                                            <div className="w-9 shrink-0 flex flex-col items-center">
                                                {showAvatar && sender ? (
                                                    <div className="relative">
                                                        <div
                                                            className={`w-9 h-9 flex items-center justify-center text-[11px] font-black tracking-tight border-2 ${
                                                                isMe
                                                                    ? "bg-neutral text-neutral-content border-neutral"
                                                                    : roleConfig[
                                                                          sender
                                                                              .role
                                                                      ].badge
                                                            }`}
                                                        >
                                                            {sender.initials}
                                                        </div>
                                                        <div
                                                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-base-100 ${statusIndicator[sender.status]}`}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-9" />
                                                )}
                                            </div>

                                            {/* Message content */}
                                            <div
                                                className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}
                                            >
                                                {/* Sender name */}
                                                {showAvatar && sender && (
                                                    <div
                                                        className={`flex items-center gap-2 mb-1 ${isMe ? "flex-row-reverse" : ""}`}
                                                    >
                                                        <span className="text-xs font-bold tracking-tight">
                                                            {isMe
                                                                ? "You"
                                                                : sender.name}
                                                        </span>
                                                        <span
                                                            className={`text-[9px] font-bold uppercase tracking-wider ${isMe ? "text-base-content/40" : roleConfig[sender.role].accent}`}
                                                        >
                                                            {sender.role}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Bubble */}
                                                <div
                                                    className={`px-4 py-2.5 text-sm leading-relaxed ${
                                                        isMe
                                                            ? "bg-neutral text-neutral-content"
                                                            : "bg-base-200/70 text-base-content border border-base-300"
                                                    } ${
                                                        showAvatar &&
                                                        isLastInGroup
                                                            ? "" // single message
                                                            : showAvatar
                                                              ? isMe
                                                                  ? "" // first of group, sent
                                                                  : "" // first of group, received
                                                              : "" // continuation
                                                    }`}
                                                >
                                                    {msg.text}
                                                </div>

                                                {/* Timestamp + read status */}
                                                {isLastInGroup && (
                                                    <div
                                                        className={`flex items-center gap-2 mt-1 ${isMe ? "flex-row-reverse" : ""}`}
                                                    >
                                                        <span className="text-[10px] text-base-content/30 font-medium tracking-wide">
                                                            {msg.timestamp}
                                                        </span>
                                                        {isMe && (
                                                            <i
                                                                className={`text-[10px] ${msg.read ? "fa-duotone fa-regular fa-check-double text-primary/50" : "fa-duotone fa-regular fa-check text-base-content/20"}`}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messageEndRef} />
                            </div>

                            {/* Composer */}
                            <div className="border-t-2 border-neutral/10 px-6 py-4">
                                {/* Typing area */}
                                <div className="flex gap-3 items-end">
                                    {/* Attachment & formatting */}
                                    <div className="flex gap-1 pb-1">
                                        <button className="btn btn-ghost btn-sm btn-square text-base-content/30 hover:text-base-content">
                                            <i className="fa-duotone fa-regular fa-paperclip text-sm" />
                                        </button>
                                        <button className="btn btn-ghost btn-sm btn-square text-base-content/30 hover:text-base-content">
                                            <i className="fa-duotone fa-regular fa-face-smile text-sm" />
                                        </button>
                                    </div>

                                    {/* Input */}
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={composerText}
                                            onChange={(e) =>
                                                setComposerText(e.target.value)
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
                                            placeholder="Type a message..."
                                            rows={1}
                                            className="textarea textarea-sm w-full bg-base-200/50 border-base-300 font-medium text-sm resize-none focus:outline-none focus:border-neutral min-h-[40px] max-h-[120px]"
                                        />
                                    </div>

                                    {/* Send */}
                                    <button
                                        onClick={handleSend}
                                        disabled={!composerText.trim()}
                                        className="btn btn-neutral btn-sm font-bold tracking-wide px-5 mb-0.5"
                                    >
                                        Send
                                        <i className="fa-duotone fa-regular fa-paper-plane-top ml-2" />
                                    </button>
                                </div>

                                {/* Helper text */}
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-base-content/25 font-medium tracking-wide">
                                        Press Enter to send, Shift+Enter for new
                                        line
                                    </span>
                                    <span className="text-[10px] text-base-content/25 font-medium tracking-wide">
                                        {composerText.length > 0 &&
                                            `${composerText.length} characters`}
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty state */
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-[8rem] font-black leading-none tracking-tighter text-neutral/5 select-none mb-4">
                                    --
                                </div>
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-base-content/30 mb-2">
                                    No Conversation Selected
                                </p>
                                <p className="text-sm text-base-content/40">
                                    Choose a thread from the sidebar to begin
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

// -- Conversation List Item Component -----------------------------------------
function ConversationItem({
    conv,
    isActive,
    unread,
    lastMessage,
    categoryConfig,
    onClick,
}: {
    conv: Conversation;
    isActive: boolean;
    unread: number;
    lastMessage: string;
    categoryConfig: Record<
        Conversation["category"],
        { label: string; color: string; icon: string }
    >;
    onClick: () => void;
}) {
    const otherParticipants = conv.participants.filter((p) => p.id !== "me");
    const catConf = categoryConfig[conv.category];

    return (
        <button
            onClick={onClick}
            className={`conv-item opacity-0 w-full text-left px-4 py-4 border-b border-base-300/50 transition-colors duration-200 group ${
                isActive
                    ? "bg-neutral/5 border-l-2 border-l-neutral"
                    : "hover:bg-base-200/50 border-l-2 border-l-transparent"
            }`}
        >
            <div className="flex items-start gap-3">
                {/* Lead participant avatar */}
                <div className="relative shrink-0 mt-0.5">
                    <div
                        className={`w-10 h-10 flex items-center justify-center text-xs font-black tracking-tight border-2 ${
                            otherParticipants[0]
                                ? roleConfig[otherParticipants[0].role].badge
                                : ""
                        }`}
                    >
                        {otherParticipants[0]?.initials ?? "??"}
                    </div>
                    {otherParticipants[0] && (
                        <div
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-base-100 ${statusIndicator[otherParticipants[0].status]}`}
                        />
                    )}
                    {/* Stacked indicator for multi-participant */}
                    {otherParticipants.length > 1 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-base-100 border border-base-300 flex items-center justify-center">
                            <span className="text-[8px] font-black text-base-content/50">
                                +{otherParticipants.length - 1}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Top row: category + time */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                            className={`text-[9px] font-bold uppercase tracking-[0.2em] ${catConf.color}`}
                        >
                            <i className={`${catConf.icon} mr-1`} />
                            {catConf.label}
                        </span>
                        <span className="text-[10px] text-base-content/30 font-medium tracking-wide shrink-0">
                            {conv.messages[conv.messages.length - 1]?.timestamp}
                        </span>
                    </div>

                    {/* Subject */}
                    <h3
                        className={`text-sm font-bold tracking-tight truncate mb-1 ${unread > 0 ? "text-base-content" : "text-base-content/70"}`}
                    >
                        {conv.subject}
                    </h3>

                    {/* Last message preview */}
                    <p className="text-xs text-base-content/40 truncate leading-relaxed">
                        {lastMessage}
                    </p>

                    {/* Participant pills */}
                    <div className="flex items-center gap-1.5 mt-2">
                        {otherParticipants.map((p) => (
                            <span
                                key={p.id}
                                className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${roleConfig[p.role].badge}`}
                            >
                                {p.name.split(" ")[0]}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Unread badge */}
                {unread > 0 && (
                    <div className="shrink-0 mt-1">
                        <div className="w-5 h-5 bg-primary flex items-center justify-center">
                            <span className="text-[9px] font-black text-primary-content">
                                {unread}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </button>
    );
}
