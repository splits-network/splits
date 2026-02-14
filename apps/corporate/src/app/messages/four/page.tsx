"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type UserRole = "recruiter" | "company" | "candidate" | "admin";

interface User {
    id: string;
    name: string;
    role: UserRole;
    avatar: string;
    online: boolean;
}

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    read: boolean;
}

interface Conversation {
    id: string;
    participants: User[];
    messages: Message[];
    pinned: boolean;
    category: "direct" | "job" | "placement";
    subject?: string;
}

/* ─── Role Config ────────────────────────────────────────────────────────── */

const ROLE_CONFIG: Record<
    UserRole,
    { label: string; icon: string; badgeClass: string }
> = {
    recruiter: {
        label: "Recruiter",
        icon: "fa-duotone fa-regular fa-user-tie",
        badgeClass: "badge-primary",
    },
    company: {
        label: "Company",
        icon: "fa-duotone fa-regular fa-building",
        badgeClass: "badge-secondary",
    },
    candidate: {
        label: "Candidate",
        icon: "fa-duotone fa-regular fa-user",
        badgeClass: "badge-accent",
    },
    admin: {
        label: "Admin",
        icon: "fa-duotone fa-regular fa-shield-halved",
        badgeClass: "badge-warning",
    },
};

/* ─── Mock Users ─────────────────────────────────────────────────────────── */

const CURRENT_USER: User = {
    id: "me",
    name: "You",
    role: "recruiter",
    avatar: "MC",
    online: true,
};

const users: Record<string, User> = {
    sarah: {
        id: "sarah",
        name: "Sarah Mitchell",
        role: "company",
        avatar: "SM",
        online: true,
    },
    james: {
        id: "james",
        name: "James Chen",
        role: "candidate",
        avatar: "JC",
        online: false,
    },
    priya: {
        id: "priya",
        name: "Priya Sharma",
        role: "recruiter",
        avatar: "PS",
        online: true,
    },
    david: {
        id: "david",
        name: "David Okonkwo",
        role: "admin",
        avatar: "DO",
        online: true,
    },
    rachel: {
        id: "rachel",
        name: "Rachel Kim",
        role: "candidate",
        avatar: "RK",
        online: false,
    },
    marcus: {
        id: "marcus",
        name: "Marcus Johnson",
        role: "company",
        avatar: "MJ",
        online: true,
    },
    alex: {
        id: "alex",
        name: "Alex Thompson",
        role: "recruiter",
        avatar: "AT",
        online: false,
    },
    maria: {
        id: "maria",
        name: "Maria Garcia",
        role: "candidate",
        avatar: "MG",
        online: true,
    },
};

/* ─── Mock Conversations ─────────────────────────────────────────────────── */

function d(daysAgo: number, hoursAgo: number = 0): Date {
    const now = new Date();
    now.setDate(now.getDate() - daysAgo);
    now.setHours(now.getHours() - hoursAgo);
    return now;
}

const conversations: Conversation[] = [
    {
        id: "conv-1",
        participants: [CURRENT_USER, users.sarah],
        pinned: true,
        category: "job",
        subject: "Senior React Developer Role",
        messages: [
            {
                id: "m1",
                senderId: "sarah",
                text: "Hi! We just opened a Senior React Developer position. Base salary range is $160-190K with equity. Interested in sourcing candidates?",
                timestamp: d(0, 3),
                read: true,
            },
            {
                id: "m2",
                senderId: "me",
                text: "Absolutely. I have two strong candidates in mind already. One has 6 years with React and a background in fintech, the other led a frontend team at a Series B startup.",
                timestamp: d(0, 2),
                read: true,
            },
            {
                id: "m3",
                senderId: "sarah",
                text: "Both sound great. Can you submit their profiles by end of week? We're looking to move fast on this one. The hiring manager wants to start interviews next Monday.",
                timestamp: d(0, 1),
                read: true,
            },
            {
                id: "m4",
                senderId: "me",
                text: "I'll have both profiles polished and submitted by Thursday. Should I include their salary expectations in the submission?",
                timestamp: d(0, 0),
                read: true,
            },
            {
                id: "m5",
                senderId: "sarah",
                text: "Yes please, that would be helpful. Also include any notice period details. Looking forward to the submissions!",
                timestamp: d(0, 0),
                read: false,
            },
        ],
    },
    {
        id: "conv-2",
        participants: [CURRENT_USER, users.james],
        pinned: false,
        category: "placement",
        subject: "Interview Prep - Acme Corp",
        messages: [
            {
                id: "m6",
                senderId: "me",
                text: "Great news, James! Acme Corp wants to bring you in for a final round interview. It'll be a system design discussion followed by a culture fit conversation with the VP of Engineering.",
                timestamp: d(1, 5),
                read: true,
            },
            {
                id: "m7",
                senderId: "james",
                text: "That's exciting! When are they thinking? I need at least a couple days to prepare for system design.",
                timestamp: d(1, 4),
                read: true,
            },
            {
                id: "m8",
                senderId: "me",
                text: "They're flexible. I suggested next Wednesday or Thursday. I'll also send you some prep materials tonight - they tend to focus on distributed systems and data modeling.",
                timestamp: d(1, 3),
                read: true,
            },
            {
                id: "m9",
                senderId: "james",
                text: "Wednesday works perfectly. Thanks for the heads up on the focus areas. I'll review my notes on consistent hashing and event-driven architectures.",
                timestamp: d(1, 1),
                read: true,
            },
        ],
    },
    {
        id: "conv-3",
        participants: [CURRENT_USER, users.priya],
        pinned: true,
        category: "direct",
        messages: [
            {
                id: "m10",
                senderId: "priya",
                text: "Hey! I saw you placed three candidates at TechStart last quarter. I'm working their new DevOps role. Any tips on what the hiring manager is like?",
                timestamp: d(0, 6),
                read: true,
            },
            {
                id: "m11",
                senderId: "me",
                text: "Yeah, Rachel Kim is great to work with. She values practical experience over certifications. Make sure your candidates can talk about real incident response scenarios.",
                timestamp: d(0, 5),
                read: true,
            },
            {
                id: "m12",
                senderId: "priya",
                text: "Super helpful. I have a candidate with 4 years of SRE experience at a fintech startup. Think that'd be a good fit?",
                timestamp: d(0, 4),
                read: true,
            },
            {
                id: "m13",
                senderId: "me",
                text: "Sounds perfect. Fintech SRE experience will resonate well. Submit through the platform and mention their uptime improvements if they have metrics.",
                timestamp: d(0, 2),
                read: true,
            },
            {
                id: "m14",
                senderId: "priya",
                text: "Done! Just submitted. Thanks for the insight. Let's grab coffee next week and compare notes on the Q1 pipeline.",
                timestamp: d(0, 1),
                read: false,
            },
        ],
    },
    {
        id: "conv-4",
        participants: [CURRENT_USER, users.david],
        pinned: false,
        category: "direct",
        messages: [
            {
                id: "m15",
                senderId: "david",
                text: "Quick update: We've rolled out the new split-fee calculation engine. All existing agreements have been migrated. If you notice any discrepancies in your earnings dashboard, let me know immediately.",
                timestamp: d(2, 0),
                read: true,
            },
            {
                id: "m16",
                senderId: "me",
                text: "Thanks David. I'll review my recent placements and cross-check the numbers. When does the new dispute resolution flow go live?",
                timestamp: d(1, 22),
                read: true,
            },
            {
                id: "m17",
                senderId: "david",
                text: "Next Tuesday. You'll get an email with the full changelog. The new system allows real-time arbitration instead of the 48-hour wait.",
                timestamp: d(1, 20),
                read: true,
            },
        ],
    },
    {
        id: "conv-5",
        participants: [CURRENT_USER, users.rachel],
        pinned: false,
        category: "placement",
        subject: "Backend Engineer Offer",
        messages: [
            {
                id: "m18",
                senderId: "me",
                text: "Rachel, I'm thrilled to tell you that the offer is official. $145K base, 0.15% equity, full benefits, and they're offering a $10K signing bonus.",
                timestamp: d(3, 2),
                read: true,
            },
            {
                id: "m19",
                senderId: "rachel",
                text: "Oh my gosh, that's even better than I expected! The signing bonus is a wonderful surprise. I'm definitely accepting.",
                timestamp: d(3, 1),
                read: true,
            },
            {
                id: "m20",
                senderId: "me",
                text: "Fantastic! I'll let them know. They'll send the formal offer letter within 24 hours. Start date is March 3rd. Congratulations!",
                timestamp: d(3, 0),
                read: true,
            },
            {
                id: "m21",
                senderId: "rachel",
                text: "Thank you so much for everything. You made this process so smooth. I'll watch for the offer letter!",
                timestamp: d(2, 23),
                read: true,
            },
        ],
    },
    {
        id: "conv-6",
        participants: [CURRENT_USER, users.marcus],
        pinned: false,
        category: "job",
        subject: "VP Engineering Search",
        messages: [
            {
                id: "m22",
                senderId: "marcus",
                text: "We need to fill our VP of Engineering role urgently. Board is pushing for someone with enterprise SaaS experience. Budget is $280-320K. Can we set up a call to discuss the ideal profile?",
                timestamp: d(0, 8),
                read: true,
            },
            {
                id: "m23",
                senderId: "me",
                text: "I'd love to help with this search. I have a few executive-level candidates in my network. Let me check my calendar for a call slot.",
                timestamp: d(0, 7),
                read: true,
            },
            {
                id: "m24",
                senderId: "marcus",
                text: "How about tomorrow at 2pm EST? I'll have our CTO on the call too so you can get the full picture of what we need technically.",
                timestamp: d(0, 5),
                read: false,
            },
        ],
    },
    {
        id: "conv-7",
        participants: [CURRENT_USER, users.alex],
        pinned: false,
        category: "direct",
        messages: [
            {
                id: "m25",
                senderId: "alex",
                text: "Hey, are you going to the Recruiting Summit next month? I'm thinking about attending the workshop on AI-driven sourcing.",
                timestamp: d(4, 0),
                read: true,
            },
            {
                id: "m26",
                senderId: "me",
                text: "I've already registered. The AI sourcing workshop looks interesting but I'm more excited about the panel on marketplace dynamics. Want to team up for the networking sessions?",
                timestamp: d(3, 22),
                read: true,
            },
            {
                id: "m27",
                senderId: "alex",
                text: "Absolutely. Let's plan to meet at the registration desk. I'll register today.",
                timestamp: d(3, 20),
                read: true,
            },
        ],
    },
    {
        id: "conv-8",
        participants: [CURRENT_USER, users.maria],
        pinned: false,
        category: "placement",
        subject: "UX Designer Screening",
        messages: [
            {
                id: "m28",
                senderId: "me",
                text: "Hi Maria! I reviewed your portfolio and it's impressive. The case study on the healthcare app redesign was particularly strong. I'd like to submit you for a Senior UX Designer role at a Series C startup.",
                timestamp: d(0, 10),
                read: true,
            },
            {
                id: "m29",
                senderId: "maria",
                text: "Thank you! I'm very interested. Can you tell me more about the company culture and what the design team looks like?",
                timestamp: d(0, 9),
                read: true,
            },
            {
                id: "m30",
                senderId: "me",
                text: "It's a collaborative environment with a 6-person design team. They use Figma, have a mature design system, and the head of design has a strong research background. Fully remote with quarterly offsites.",
                timestamp: d(0, 8),
                read: true,
            },
            {
                id: "m31",
                senderId: "maria",
                text: "That sounds like exactly what I'm looking for. Please go ahead and submit my profile. I can be available for interviews starting next week.",
                timestamp: d(0, 6),
                read: false,
            },
        ],
    },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFullTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function getOtherParticipant(conv: Conversation): User {
    return conv.participants.find((p) => p.id !== CURRENT_USER.id) || conv.participants[0];
}

function getUnreadCount(conv: Conversation): number {
    return conv.messages.filter(
        (m) => !m.read && m.senderId !== CURRENT_USER.id,
    ).length;
}

function getLastMessage(conv: Conversation): Message {
    return conv.messages[conv.messages.length - 1];
}

/* ─── Category Config ────────────────────────────────────────────────────── */

const CATEGORY_CONFIG: Record<
    Conversation["category"],
    { label: string; icon: string }
> = {
    direct: { label: "Direct", icon: "fa-duotone fa-regular fa-comment" },
    job: { label: "Job", icon: "fa-duotone fa-regular fa-briefcase" },
    placement: {
        label: "Placement",
        icon: "fa-duotone fa-regular fa-handshake",
    },
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function MessagesFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const [selectedConvId, setSelectedConvId] = useState<string | null>(
        "conv-1",
    );
    const [allConversations, setAllConversations] =
        useState<Conversation[]>(conversations);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<
        "all" | Conversation["category"]
    >("all");
    const [composerText, setComposerText] = useState("");
    const [mobileShowThread, setMobileShowThread] = useState(false);

    const selectedConv = allConversations.find(
        (c) => c.id === selectedConvId,
    );

    /* ─── Filtered conversations ─────────────────────────────── */
    const filteredConversations = allConversations
        .filter((c) => {
            if (filterCategory !== "all" && c.category !== filterCategory)
                return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const other = getOtherParticipant(c);
                const matchesName = other.name.toLowerCase().includes(q);
                const matchesSubject = c.subject
                    ?.toLowerCase()
                    .includes(q);
                const matchesMessage = c.messages.some((m) =>
                    m.text.toLowerCase().includes(q),
                );
                return matchesName || matchesSubject || matchesMessage;
            }
            return true;
        })
        .sort((a, b) => {
            // Pinned first, then by latest message
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return (
                getLastMessage(b).timestamp.getTime() -
                getLastMessage(a).timestamp.getTime()
            );
        });

    /* ─── Scroll to bottom on conversation change ────────────── */
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "instant" });
        }
    }, [selectedConvId]);

    /* ─── Send message ───────────────────────────────────────── */
    function handleSend() {
        if (!composerText.trim() || !selectedConvId) return;

        const newMessage: Message = {
            id: `m-new-${Date.now()}`,
            senderId: CURRENT_USER.id,
            text: composerText.trim(),
            timestamp: new Date(),
            read: true,
        };

        setAllConversations((prev) =>
            prev.map((c) =>
                c.id === selectedConvId
                    ? { ...c, messages: [...c.messages, newMessage] }
                    : c,
            ),
        );
        setComposerText("");

        // Animate new message in
        requestAnimationFrame(() => {
            if (messageEndRef.current) {
                messageEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
            const lastBubble = containerRef.current?.querySelector(
                ".cin-msg-bubble:last-child",
            );
            if (lastBubble) {
                gsap.fromTo(
                    lastBubble,
                    { opacity: 0, y: 20, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.4,
                        ease: "back.out(1.4)",
                    },
                );
            }
        });
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function handleSelectConversation(convId: string) {
        setSelectedConvId(convId);
        setMobileShowThread(true);

        // Mark messages as read
        setAllConversations((prev) =>
            prev.map((c) =>
                c.id === convId
                    ? {
                          ...c,
                          messages: c.messages.map((m) => ({
                              ...m,
                              read: true,
                          })),
                      }
                    : c,
            ),
        );
    }

    /* ─── GSAP entrance ──────────────────────────────────────── */
    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                gsap.set(
                    containerRef.current.querySelectorAll(".cin-anim"),
                    { opacity: 1, y: 0, x: 0 },
                );
                return;
            }

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // Header entrance
            tl.fromTo(
                ".cin-msg-header",
                { opacity: 0, y: -30 },
                { opacity: 1, y: 0, duration: 0.6 },
            );

            // Sidebar slide in
            tl.fromTo(
                ".cin-msg-sidebar",
                { opacity: 0, x: -40 },
                { opacity: 1, x: 0, duration: 0.7 },
                0.15,
            );

            // Thread area fade in
            tl.fromTo(
                ".cin-msg-thread",
                { opacity: 0, x: 40 },
                { opacity: 1, x: 0, duration: 0.7 },
                0.25,
            );

            // Stagger conversation items
            tl.fromTo(
                ".cin-conv-item",
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    stagger: 0.05,
                },
                0.4,
            );

            // Stagger message bubbles
            tl.fromTo(
                ".cin-msg-bubble",
                { opacity: 0, y: 15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.35,
                    stagger: 0.04,
                },
                0.6,
            );
        },
        { scope: containerRef, dependencies: [selectedConvId] },
    );

    /* ─── Derived ────────────────────────────────────────────── */
    const totalUnread = allConversations.reduce(
        (sum, c) => sum + getUnreadCount(c),
        0,
    );

    /* ═══════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════ */
    return (
        <div ref={containerRef} className="cin-page min-h-screen bg-neutral">
            {/* ── Cinematic Header Bar ─────────────────────────────── */}
            <header className="cin-msg-header opacity-0 sticky top-0 z-50 bg-neutral border-b border-white/[0.06]">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Mobile back button */}
                        {mobileShowThread && (
                            <button
                                onClick={() => setMobileShowThread(false)}
                                className="lg:hidden btn btn-ghost btn-sm btn-square text-white/60"
                            >
                                <i className="fa-regular fa-arrow-left" />
                            </button>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-messages text-primary text-sm" />
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-lg leading-tight tracking-tight">
                                    Messages
                                </h1>
                                <p className="text-white/40 text-xs tracking-wide">
                                    {totalUnread > 0
                                        ? `${totalUnread} unread`
                                        : "All caught up"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="btn btn-ghost btn-sm btn-square text-white/50 hover:text-white hover:bg-white/[0.06]">
                            <i className="fa-duotone fa-regular fa-gear text-sm" />
                        </button>
                        <button className="btn btn-ghost btn-sm btn-square text-white/50 hover:text-white hover:bg-white/[0.06]">
                            <i className="fa-duotone fa-regular fa-pen-to-square text-sm" />
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Main Layout ──────────────────────────────────────── */}
            <div className="max-w-[1600px] mx-auto flex" style={{ height: "calc(100vh - 4rem)" }}>
                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                   SIDEBAR — Conversation List
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <aside
                    className={`cin-msg-sidebar opacity-0 w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-neutral ${
                        mobileShowThread ? "hidden lg:flex" : "flex"
                    }`}
                >
                    {/* Search & Filter */}
                    <div className="p-4 space-y-3 border-b border-white/[0.06]">
                        <div className="relative">
                            <i className="fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                className="input input-sm w-full pl-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus:border-primary/40 focus:bg-white/[0.06] transition-colors"
                            />
                        </div>

                        <div className="flex gap-1.5">
                            {(
                                [
                                    "all",
                                    "direct",
                                    "job",
                                    "placement",
                                ] as const
                            ).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`btn btn-xs font-medium tracking-wide transition-all duration-200 ${
                                        filterCategory === cat
                                            ? "bg-primary/20 text-primary border-primary/30 hover:bg-primary/25"
                                            : "btn-ghost text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                                    }`}
                                >
                                    {cat === "all" ? (
                                        "All"
                                    ) : (
                                        <>
                                            <i
                                                className={`${CATEGORY_CONFIG[cat].icon} text-[10px] mr-1`}
                                            />
                                            {CATEGORY_CONFIG[cat].label}
                                        </>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        {filteredConversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-white/30">
                                <i className="fa-duotone fa-regular fa-inbox text-3xl mb-3" />
                                <p className="text-sm">
                                    No conversations found
                                </p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => {
                                const other = getOtherParticipant(conv);
                                const lastMsg = getLastMessage(conv);
                                const unread = getUnreadCount(conv);
                                const isSelected =
                                    conv.id === selectedConvId;
                                const roleConf =
                                    ROLE_CONFIG[other.role];

                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() =>
                                            handleSelectConversation(
                                                conv.id,
                                            )
                                        }
                                        className={`cin-conv-item opacity-0 w-full text-left px-4 py-3.5 flex gap-3 transition-all duration-200 border-b border-white/[0.03] group ${
                                            isSelected
                                                ? "bg-primary/[0.08] border-l-2 border-l-primary"
                                                : "hover:bg-white/[0.03] border-l-2 border-l-transparent"
                                        }`}
                                    >
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <div
                                                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold tracking-tight ${
                                                    isSelected
                                                        ? "bg-primary/20 text-primary"
                                                        : "bg-white/[0.06] text-white/60"
                                                }`}
                                            >
                                                {other.avatar}
                                            </div>
                                            {other.online && (
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-neutral" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span
                                                    className={`font-semibold text-sm truncate ${
                                                        unread > 0
                                                            ? "text-white"
                                                            : "text-white/80"
                                                    }`}
                                                >
                                                    {other.name}
                                                </span>
                                                <span className="text-[11px] text-white/30 ml-2 flex-shrink-0">
                                                    {formatTime(
                                                        lastMsg.timestamp,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span
                                                    className={`badge badge-xs ${roleConf.badgeClass} gap-1 font-medium`}
                                                >
                                                    <i
                                                        className={`${roleConf.icon} text-[8px]`}
                                                    />
                                                    {roleConf.label}
                                                </span>
                                                {conv.pinned && (
                                                    <i className="fa-solid fa-thumbtack text-[9px] text-primary/60 rotate-45" />
                                                )}
                                                {conv.subject && (
                                                    <span className="text-[11px] text-white/25 truncate">
                                                        {conv.subject}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <p
                                                    className={`text-xs truncate flex-1 ${
                                                        unread > 0
                                                            ? "text-white/60 font-medium"
                                                            : "text-white/30"
                                                    }`}
                                                >
                                                    {lastMsg.senderId ===
                                                    CURRENT_USER.id
                                                        ? "You: "
                                                        : ""}
                                                    {lastMsg.text}
                                                </p>
                                                {unread > 0 && (
                                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-content text-[10px] font-bold flex items-center justify-center">
                                                        {unread}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Sidebar footer */}
                    <div className="p-3 border-t border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                {CURRENT_USER.avatar}
                            </div>
                            <div>
                                <p className="text-white/70 text-xs font-medium">
                                    {CURRENT_USER.name}
                                </p>
                                <p className="text-white/30 text-[10px]">
                                    {ROLE_CONFIG[CURRENT_USER.role].label}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-success" />
                            <span className="text-[10px] text-white/30">
                                Online
                            </span>
                        </div>
                    </div>
                </aside>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                   THREAD — Message View
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <main
                    className={`cin-msg-thread opacity-0 flex-1 flex flex-col min-w-0 ${
                        !mobileShowThread ? "hidden lg:flex" : "flex"
                    }`}
                >
                    {selectedConv ? (
                        <>
                            {/* Thread Header */}
                            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-neutral/80 backdrop-blur-sm">
                                <div className="flex items-center gap-3 min-w-0">
                                    {(() => {
                                        const other =
                                            getOtherParticipant(
                                                selectedConv,
                                            );
                                        const roleConf =
                                            ROLE_CONFIG[other.role];
                                        return (
                                            <>
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                                                        {other.avatar}
                                                    </div>
                                                    {other.online && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-neutral" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h2 className="text-white font-bold text-sm truncate">
                                                            {other.name}
                                                        </h2>
                                                        <span
                                                            className={`badge badge-xs ${roleConf.badgeClass} gap-1`}
                                                        >
                                                            <i
                                                                className={`${roleConf.icon} text-[8px]`}
                                                            />
                                                            {roleConf.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-white/30 text-xs">
                                                        {other.online
                                                            ? "Online"
                                                            : "Offline"}
                                                        {selectedConv.subject &&
                                                            ` \u00b7 ${selectedConv.subject}`}
                                                    </p>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                <div className="flex items-center gap-1">
                                    <button className="btn btn-ghost btn-sm btn-square text-white/40 hover:text-white hover:bg-white/[0.06]">
                                        <i className="fa-duotone fa-regular fa-phone text-sm" />
                                    </button>
                                    <button className="btn btn-ghost btn-sm btn-square text-white/40 hover:text-white hover:bg-white/[0.06]">
                                        <i className="fa-duotone fa-regular fa-video text-sm" />
                                    </button>
                                    <button className="btn btn-ghost btn-sm btn-square text-white/40 hover:text-white hover:bg-white/[0.06]">
                                        <i className="fa-duotone fa-regular fa-circle-info text-sm" />
                                    </button>
                                    <div className="dropdown dropdown-end">
                                        <button
                                            tabIndex={0}
                                            className="btn btn-ghost btn-sm btn-square text-white/40 hover:text-white hover:bg-white/[0.06]"
                                        >
                                            <i className="fa-regular fa-ellipsis-vertical text-sm" />
                                        </button>
                                        <ul
                                            tabIndex={0}
                                            className="dropdown-content menu p-2 shadow-2xl bg-base-300 rounded-lg w-48 border border-white/[0.08]"
                                        >
                                            <li>
                                                <a className="text-white/70 text-xs">
                                                    <i className="fa-regular fa-thumbtack w-4" />
                                                    Pin conversation
                                                </a>
                                            </li>
                                            <li>
                                                <a className="text-white/70 text-xs">
                                                    <i className="fa-regular fa-bell-slash w-4" />
                                                    Mute notifications
                                                </a>
                                            </li>
                                            <li>
                                                <a className="text-white/70 text-xs">
                                                    <i className="fa-regular fa-archive w-4" />
                                                    Archive
                                                </a>
                                            </li>
                                            <li>
                                                <a className="text-error/70 text-xs">
                                                    <i className="fa-regular fa-trash w-4" />
                                                    Delete conversation
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Subject Banner */}
                            {selectedConv.subject && (
                                <div className="px-6 py-2.5 bg-white/[0.02] border-b border-white/[0.04] flex items-center gap-2">
                                    <i
                                        className={`${CATEGORY_CONFIG[selectedConv.category].icon} text-primary/60 text-xs`}
                                    />
                                    <span className="text-white/50 text-xs font-medium tracking-wide">
                                        {selectedConv.subject}
                                    </span>
                                    <span className="text-white/20 text-[10px] uppercase tracking-widest ml-auto">
                                        {
                                            CATEGORY_CONFIG[
                                                selectedConv.category
                                            ].label
                                        }
                                    </span>
                                </div>
                            )}

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 scrollbar-thin">
                                {/* Date separator for first message */}
                                <div className="flex items-center gap-3 my-4">
                                    <div className="flex-1 h-px bg-white/[0.06]" />
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-medium">
                                        {selectedConv.messages[0].timestamp.toLocaleDateString(
                                            "en-US",
                                            {
                                                weekday: "long",
                                                month: "long",
                                                day: "numeric",
                                            },
                                        )}
                                    </span>
                                    <div className="flex-1 h-px bg-white/[0.06]" />
                                </div>

                                {selectedConv.messages.map(
                                    (msg, idx) => {
                                        const isMine =
                                            msg.senderId ===
                                            CURRENT_USER.id;
                                        const sender = isMine
                                            ? CURRENT_USER
                                            : users[msg.senderId];
                                        const roleConf =
                                            ROLE_CONFIG[sender.role];

                                        // Check if we need a date separator
                                        const prevMsg =
                                            idx > 0
                                                ? selectedConv
                                                      .messages[
                                                      idx - 1
                                                  ]
                                                : null;
                                        const showDateSep =
                                            prevMsg &&
                                            msg.timestamp.toDateString() !==
                                                prevMsg.timestamp.toDateString();

                                        // Check if same sender as previous (for grouping)
                                        const sameSender =
                                            prevMsg &&
                                            prevMsg.senderId ===
                                                msg.senderId &&
                                            !showDateSep;

                                        return (
                                            <div key={msg.id}>
                                                {showDateSep && (
                                                    <div className="flex items-center gap-3 my-4">
                                                        <div className="flex-1 h-px bg-white/[0.06]" />
                                                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-medium">
                                                            {msg.timestamp.toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    weekday:
                                                                        "long",
                                                                    month: "long",
                                                                    day: "numeric",
                                                                },
                                                            )}
                                                        </span>
                                                        <div className="flex-1 h-px bg-white/[0.06]" />
                                                    </div>
                                                )}

                                                <div
                                                    className={`cin-msg-bubble flex gap-3 ${
                                                        isMine
                                                            ? "flex-row-reverse"
                                                            : ""
                                                    } ${
                                                        sameSender
                                                            ? "mt-1"
                                                            : "mt-4"
                                                    }`}
                                                >
                                                    {/* Avatar (hide for grouped messages) */}
                                                    <div className="flex-shrink-0 w-8">
                                                        {!sameSender && (
                                                            <div
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                                    isMine
                                                                        ? "bg-primary/20 text-primary"
                                                                        : "bg-white/[0.06] text-white/50"
                                                                }`}
                                                            >
                                                                {
                                                                    sender.avatar
                                                                }
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Bubble */}
                                                    <div
                                                        className={`max-w-[70%] min-w-0 ${isMine ? "items-end" : "items-start"} flex flex-col`}
                                                    >
                                                        {!sameSender && (
                                                            <div
                                                                className={`flex items-center gap-2 mb-1 ${isMine ? "flex-row-reverse" : ""}`}
                                                            >
                                                                <span className="text-white/60 text-xs font-semibold">
                                                                    {isMine
                                                                        ? "You"
                                                                        : sender.name}
                                                                </span>
                                                                <span
                                                                    className={`text-[9px] ${roleConf.badgeClass} badge badge-xs`}
                                                                >
                                                                    {
                                                                        roleConf.label
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div
                                                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                                isMine
                                                                    ? "bg-primary text-primary-content rounded-br-md"
                                                                    : "bg-white/[0.06] text-white/80 rounded-bl-md"
                                                            }`}
                                                        >
                                                            {msg.text}
                                                        </div>

                                                        <div
                                                            className={`flex items-center gap-1.5 mt-1 ${isMine ? "flex-row-reverse" : ""}`}
                                                        >
                                                            <span className="text-[10px] text-white/20">
                                                                {formatFullTime(
                                                                    msg.timestamp,
                                                                )}
                                                            </span>
                                                            {isMine && (
                                                                <i
                                                                    className={`fa-solid fa-check-double text-[9px] ${
                                                                        msg.read
                                                                            ? "text-primary/60"
                                                                            : "text-white/20"
                                                                    }`}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                                <div ref={messageEndRef} />
                            </div>

                            {/* Composer */}
                            <div className="p-4 border-t border-white/[0.06] bg-neutral/80 backdrop-blur-sm">
                                <div className="flex items-end gap-3">
                                    {/* Attachment buttons */}
                                    <div className="flex gap-1 pb-1.5">
                                        <button className="btn btn-ghost btn-xs btn-square text-white/30 hover:text-white/60 hover:bg-white/[0.06]">
                                            <i className="fa-duotone fa-regular fa-paperclip text-sm" />
                                        </button>
                                        <button className="btn btn-ghost btn-xs btn-square text-white/30 hover:text-white/60 hover:bg-white/[0.06]">
                                            <i className="fa-duotone fa-regular fa-image text-sm" />
                                        </button>
                                    </div>

                                    {/* Text input */}
                                    <div className="flex-1 relative">
                                        <textarea
                                            ref={inputRef}
                                            value={composerText}
                                            onChange={(e) =>
                                                setComposerText(
                                                    e.target.value,
                                                )
                                            }
                                            onKeyDown={handleKeyDown}
                                            placeholder="Type a message..."
                                            rows={1}
                                            className="textarea w-full min-h-[40px] max-h-32 bg-white/[0.04] border-white/[0.08] text-white text-sm placeholder:text-white/25 focus:border-primary/40 focus:bg-white/[0.06] resize-none py-2.5 leading-relaxed transition-colors"
                                        />
                                    </div>

                                    {/* Send button */}
                                    <button
                                        onClick={handleSend}
                                        disabled={!composerText.trim()}
                                        className={`btn btn-sm btn-square mb-0.5 transition-all duration-300 ${
                                            composerText.trim()
                                                ? "btn-primary shadow-lg shadow-primary/20"
                                                : "btn-ghost text-white/20"
                                        }`}
                                    >
                                        <i className="fa-solid fa-paper-plane-top text-sm" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-[10px] text-white/15">
                                        Press Enter to send, Shift+Enter for new line
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button className="btn btn-ghost btn-xs text-white/20 hover:text-white/40 gap-1">
                                            <i className="fa-regular fa-face-smile text-xs" />
                                        </button>
                                        <button className="btn btn-ghost btn-xs text-white/20 hover:text-white/40 gap-1">
                                            <i className="fa-regular fa-at text-xs" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-6">
                                <i className="fa-duotone fa-regular fa-messages text-3xl text-white/10" />
                            </div>
                            <h3 className="text-white/30 text-lg font-bold mb-2">
                                Select a conversation
                            </h3>
                            <p className="text-white/15 text-sm max-w-xs text-center leading-relaxed">
                                Choose a conversation from the sidebar to view messages and continue the discussion.
                            </p>
                        </div>
                    )}
                </main>
            </div>

            {/* ── Inline Styles for scrollbar ──────────────────────── */}
            <style jsx>{`
                .scrollbar-thin::-webkit-scrollbar {
                    width: 4px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.06);
                    border-radius: 4px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.12);
                }
            `}</style>
        </div>
    );
}
