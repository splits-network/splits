"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import gsap from "gsap";

// ── Types -------------------------------------------------------------------

interface User {
    id: string;
    name: string;
    initials: string;
    role: "recruiter" | "company" | "candidate" | "admin";
    online: boolean;
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
    pinned: boolean;
    archived: boolean;
    label?: string;
}

// ── Constants ---------------------------------------------------------------

const ROLE_CONFIG: Record<
    User["role"],
    { label: string; color: string; bg: string; icon: string }
> = {
    recruiter: {
        label: "Recruiter",
        color: "text-[#233876]",
        bg: "bg-[#233876]/8",
        icon: "fa-user-tie",
    },
    company: {
        label: "Company",
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        icon: "fa-building",
    },
    candidate: {
        label: "Candidate",
        color: "text-amber-700",
        bg: "bg-amber-50",
        icon: "fa-user",
    },
    admin: {
        label: "Admin",
        color: "text-rose-700",
        bg: "bg-rose-50",
        icon: "fa-shield-halved",
    },
};

const CURRENT_USER: User = {
    id: "me",
    name: "You",
    initials: "ME",
    role: "recruiter",
    online: true,
};

// ── Mock Data ---------------------------------------------------------------

const mockUsers: User[] = [
    {
        id: "u1",
        name: "Sarah Chen",
        initials: "SC",
        role: "candidate",
        online: true,
    },
    {
        id: "u2",
        name: "Marcus Rivera",
        initials: "MR",
        role: "recruiter",
        online: false,
    },
    {
        id: "u3",
        name: "TechCorp HR",
        initials: "TC",
        role: "company",
        online: true,
    },
    {
        id: "u4",
        name: "Jamie Park",
        initials: "JP",
        role: "candidate",
        online: true,
    },
    {
        id: "u5",
        name: "Alex Morgan",
        initials: "AM",
        role: "admin",
        online: false,
    },
    {
        id: "u6",
        name: "Robin Patel",
        initials: "RP",
        role: "recruiter",
        online: true,
    },
    {
        id: "u7",
        name: "DesignCo Talent",
        initials: "DT",
        role: "company",
        online: false,
    },
    {
        id: "u8",
        name: "Taylor Kim",
        initials: "TK",
        role: "candidate",
        online: true,
    },
];

const mockConversations: Conversation[] = [
    {
        id: "c1",
        participants: [CURRENT_USER, mockUsers[0]],
        pinned: true,
        archived: false,
        label: "Placement",
        messages: [
            {
                id: "m1",
                senderId: "u1",
                text: "Hi! I wanted to follow up on the Senior Engineer position at TechCorp. Do you have any updates on the timeline?",
                timestamp: "2026-02-14T09:15:00Z",
                read: true,
            },
            {
                id: "m2",
                senderId: "me",
                text: "Great news, Sarah! The hiring manager reviewed your portfolio and wants to move forward with a final round interview. Are you available next week?",
                timestamp: "2026-02-14T09:22:00Z",
                read: true,
            },
            {
                id: "m3",
                senderId: "u1",
                text: "That's amazing! I'm available Tuesday through Thursday. I'd prefer an afternoon slot if possible.",
                timestamp: "2026-02-14T09:25:00Z",
                read: true,
            },
            {
                id: "m4",
                senderId: "me",
                text: "Perfect. I'll coordinate with TechCorp and get back to you with the confirmed slot by end of day. They were really impressed with your system design approach.",
                timestamp: "2026-02-14T09:30:00Z",
                read: true,
            },
            {
                id: "m5",
                senderId: "u1",
                text: "Thank you so much for pushing this forward! Should I prepare anything specific for the final round?",
                timestamp: "2026-02-14T09:33:00Z",
                read: false,
            },
        ],
    },
    {
        id: "c2",
        participants: [CURRENT_USER, mockUsers[2]],
        pinned: true,
        archived: false,
        label: "Active Role",
        messages: [
            {
                id: "m6",
                senderId: "u3",
                text: "We need to update the job description for the Frontend Developer role. The team decided to require Next.js experience.",
                timestamp: "2026-02-14T08:00:00Z",
                read: true,
            },
            {
                id: "m7",
                senderId: "me",
                text: "Understood. I'll update the listing and re-share it with our recruiter network. Should we adjust the salary range as well?",
                timestamp: "2026-02-14T08:15:00Z",
                read: true,
            },
            {
                id: "m8",
                senderId: "u3",
                text: "Yes, bump it to $140K-$180K. We're struggling to attract senior talent at the current range. Also, can we add remote flexibility?",
                timestamp: "2026-02-14T08:22:00Z",
                read: false,
            },
        ],
    },
    {
        id: "c3",
        participants: [CURRENT_USER, mockUsers[1]],
        pinned: false,
        archived: false,
        messages: [
            {
                id: "m9",
                senderId: "u2",
                text: "Hey, I have a candidate who might be a great fit for the DesignCo UX Lead position. She has 8 years of experience and just left a FAANG company.",
                timestamp: "2026-02-13T16:45:00Z",
                read: true,
            },
            {
                id: "m10",
                senderId: "me",
                text: "That sounds promising! Can you send over her profile? I'll submit it to DesignCo directly. What split arrangement are you thinking?",
                timestamp: "2026-02-13T17:00:00Z",
                read: true,
            },
            {
                id: "m11",
                senderId: "u2",
                text: "I was thinking 50/50 on the fee. I'll send her resume and portfolio over tonight. She's currently interviewing at two other places so we should move quickly.",
                timestamp: "2026-02-13T17:10:00Z",
                read: true,
            },
        ],
    },
    {
        id: "c4",
        participants: [CURRENT_USER, mockUsers[3]],
        pinned: false,
        archived: false,
        label: "Interview",
        messages: [
            {
                id: "m12",
                senderId: "u4",
                text: "Just finished the technical assessment for the Data Scientist role. I think it went really well! The machine learning section was particularly fun.",
                timestamp: "2026-02-13T14:30:00Z",
                read: true,
            },
            {
                id: "m13",
                senderId: "me",
                text: "Glad to hear that, Jamie! I'll follow up with AnalyticsCo for feedback. In the meantime, are there any other roles you'd like me to keep an eye on?",
                timestamp: "2026-02-13T15:00:00Z",
                read: true,
            },
            {
                id: "m14",
                senderId: "u4",
                text: "Yes! If anything comes up in ML Engineering or AI Research, I'd be very interested. Preferably remote or Bay Area based.",
                timestamp: "2026-02-13T15:12:00Z",
                read: true,
            },
        ],
    },
    {
        id: "c5",
        participants: [CURRENT_USER, mockUsers[4]],
        pinned: false,
        archived: false,
        messages: [
            {
                id: "m15",
                senderId: "u5",
                text: "Quick heads up - we're rolling out updated compliance guidelines for candidate data handling next Monday. I'll send the documentation over the weekend.",
                timestamp: "2026-02-12T11:00:00Z",
                read: true,
            },
            {
                id: "m16",
                senderId: "me",
                text: "Thanks for the notice, Alex. Will there be a training session or just documentation?",
                timestamp: "2026-02-12T11:30:00Z",
                read: true,
            },
            {
                id: "m17",
                senderId: "u5",
                text: "There will be a mandatory 30-minute webinar on Tuesday at 2 PM EST. I'll send calendar invites to all recruiters. The new guidelines affect how we store resumes and personal information.",
                timestamp: "2026-02-12T11:45:00Z",
                read: true,
            },
        ],
    },
    {
        id: "c6",
        participants: [CURRENT_USER, mockUsers[5]],
        pinned: false,
        archived: false,
        label: "Split Fee",
        messages: [
            {
                id: "m18",
                senderId: "u6",
                text: "The placement for CloudSys went through! Taylor Kim accepted the offer. Fee is $32,000 - our 60/40 split means $19,200 for you.",
                timestamp: "2026-02-11T10:00:00Z",
                read: true,
            },
            {
                id: "m19",
                senderId: "me",
                text: "Excellent work, Robin! That's a great outcome. I'll process the invoice through the platform. Do you have any other candidates in the pipeline?",
                timestamp: "2026-02-11T10:30:00Z",
                read: true,
            },
            {
                id: "m20",
                senderId: "u6",
                text: "Actually yes, I have a strong DevOps engineer looking. Let me know if any of your clients need infrastructure talent.",
                timestamp: "2026-02-11T10:45:00Z",
                read: true,
            },
        ],
    },
    {
        id: "c7",
        participants: [CURRENT_USER, mockUsers[6]],
        pinned: false,
        archived: true,
        messages: [
            {
                id: "m21",
                senderId: "u7",
                text: "We've decided to put the UX Lead search on hold for now. Budget constraints from Q1 planning.",
                timestamp: "2026-02-08T09:00:00Z",
                read: true,
            },
            {
                id: "m22",
                senderId: "me",
                text: "Understood. I'll mark the role as paused in our system. Should I keep the candidate pipeline warm for when you're ready to resume?",
                timestamp: "2026-02-08T09:20:00Z",
                read: true,
            },
            {
                id: "m23",
                senderId: "u7",
                text: "Yes, please do. We expect to restart the search in Q2. I'll reach out when we have budget approval.",
                timestamp: "2026-02-08T09:35:00Z",
                read: true,
            },
        ],
    },
    {
        id: "c8",
        participants: [CURRENT_USER, mockUsers[7]],
        pinned: false,
        archived: false,
        messages: [
            {
                id: "m24",
                senderId: "u8",
                text: "Hi! I saw the Backend Engineer role at CloudSys on the platform. Is that position still open? My background is in Go and distributed systems.",
                timestamp: "2026-02-14T07:30:00Z",
                read: true,
            },
            {
                id: "m25",
                senderId: "me",
                text: "Hi Taylor! Actually, that specific role was just filled. But CloudSys has a new opening for a Platform Engineer that might be an even better fit for your skillset. Want me to send you the details?",
                timestamp: "2026-02-14T07:45:00Z",
                read: true,
            },
            {
                id: "m26",
                senderId: "u8",
                text: "Yes, please! That sounds right up my alley. I'd also love to know the salary range and whether they offer equity.",
                timestamp: "2026-02-14T07:50:00Z",
                read: false,
            },
        ],
    },
];

// ── Sidebar Nav -------------------------------------------------------------

const sidebarNav = [
    { id: "dashboard", label: "Dashboard", icon: "fa-grid-2" },
    { id: "roles", label: "Roles", icon: "fa-briefcase" },
    { id: "recruiters", label: "Recruiters", icon: "fa-user-tie" },
    { id: "candidates", label: "Candidates", icon: "fa-users" },
    { id: "companies", label: "Companies", icon: "fa-building" },
    { id: "applications", label: "Applications", icon: "fa-file-lines" },
    { id: "messages", label: "Messages", icon: "fa-comments", active: true },
    { id: "placements", label: "Placements", icon: "fa-badge-check" },
];

// ── Helpers -----------------------------------------------------------------

function formatTime(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffDays === 0) {
        return d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMessageTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function getOtherUser(conv: Conversation): User {
    return conv.participants.find((p) => p.id !== "me") ?? conv.participants[0];
}

function getUnreadCount(conv: Conversation): number {
    return conv.messages.filter((m) => !m.read && m.senderId !== "me").length;
}

// ── Component ---------------------------------------------------------------

export default function MessagesNinePage() {
    const [selectedId, setSelectedId] = useState<string | null>("c1");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "unread" | "pinned">("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const [conversations, setConversations] =
        useState<Conversation[]>(mockConversations);

    const containerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageListRef = useRef<HTMLDivElement>(null);

    // Filtered conversations
    const filteredConversations = useMemo(() => {
        let list = conversations.filter((c) => !c.archived);

        if (filter === "unread") {
            list = list.filter((c) => getUnreadCount(c) > 0);
        } else if (filter === "pinned") {
            list = list.filter((c) => c.pinned);
        }

        if (search) {
            const q = search.toLowerCase();
            list = list.filter((c) => {
                const other = getOtherUser(c);
                const lastMsg = c.messages[c.messages.length - 1];
                return (
                    other.name.toLowerCase().includes(q) ||
                    lastMsg?.text.toLowerCase().includes(q) ||
                    c.label?.toLowerCase().includes(q)
                );
            });
        }

        // Sort: pinned first, then by last message time
        return list.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            const aTime = new Date(
                a.messages[a.messages.length - 1]?.timestamp ?? 0,
            ).getTime();
            const bTime = new Date(
                b.messages[b.messages.length - 1]?.timestamp ?? 0,
            ).getTime();
            return bTime - aTime;
        });
    }, [conversations, filter, search]);

    const selectedConversation = useMemo(
        () => conversations.find((c) => c.id === selectedId) ?? null,
        [conversations, selectedId],
    );

    const totalUnread = useMemo(
        () =>
            conversations
                .filter((c) => !c.archived)
                .reduce((sum, c) => sum + getUnreadCount(c), 0),
        [conversations],
    );

    // Scroll to bottom on conversation change or new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedConversation?.messages.length, selectedId]);

    // Animate message thread when conversation changes
    useEffect(() => {
        if (!messageListRef.current) return;
        const msgs =
            messageListRef.current.querySelectorAll(".msg-bubble");
        gsap.fromTo(
            msgs,
            { opacity: 0, y: 16, scale: 0.97 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.3,
                stagger: 0.04,
                ease: "power3.out",
            },
        );
    }, [selectedId]);

    // Initial load animation
    useEffect(() => {
        if (!containerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;

        gsap.fromTo(
            containerRef.current.querySelector(".msg-sidebar-panel"),
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" },
        );
        gsap.fromTo(
            containerRef.current.querySelector(".msg-thread-panel"),
            { opacity: 0, x: 30 },
            { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", delay: 0.1 },
        );
    }, []);

    // Send message handler
    const handleSend = useCallback(() => {
        if (!messageInput.trim() || !selectedId) return;

        const newMsg: Message = {
            id: `m-new-${Date.now()}`,
            senderId: "me",
            text: messageInput.trim(),
            timestamp: new Date().toISOString(),
            read: true,
        };

        setConversations((prev) =>
            prev.map((c) =>
                c.id === selectedId
                    ? { ...c, messages: [...c.messages, newMsg] }
                    : c,
            ),
        );
        setMessageInput("");

        // Animate the new message
        requestAnimationFrame(() => {
            if (!messageListRef.current) return;
            const lastMsg =
                messageListRef.current.querySelector(".msg-bubble:last-child");
            if (lastMsg) {
                gsap.fromTo(
                    lastMsg,
                    { opacity: 0, y: 20, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.35,
                        ease: "back.out(1.4)",
                    },
                );
            }
        });
    }, [messageInput, selectedId]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend],
    );

    const handleSelectConversation = useCallback((id: string) => {
        setSelectedId(id);
        setSidebarOpen(false);
    }, []);

    // ── Render ---------------------------------------------------------------
    return (
        <div ref={containerRef} className="min-h-screen bg-white flex">
            {/* Dotted grid background */}
            <div
                className="fixed inset-0 opacity-[0.06] pointer-events-none z-0"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #233876 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Nav Sidebar ──────────────────────────────────── */}
            <aside
                className={`fixed lg:sticky top-0 left-0 z-50 lg:z-20 h-screen w-[220px] flex-shrink-0 bg-white border-r-2 border-[#233876]/10 flex flex-col transition-transform duration-200 ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="px-5 py-5 border-b border-dashed border-[#233876]/10">
                    <div className="font-mono text-[9px] tracking-[0.3em] text-[#233876]/25 uppercase mb-1">
                        Splits Network
                    </div>
                    <div className="font-bold text-sm text-[#0f1b3d]">
                        Portal
                    </div>
                </div>

                <nav className="flex-1 py-3 overflow-y-auto">
                    {sidebarNav.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSidebarOpen(false)}
                            className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                                item.active
                                    ? "bg-[#233876]/5 text-[#233876] border-r-[3px] border-r-[#233876]"
                                    : "text-[#0f1b3d]/40 hover:text-[#0f1b3d]/70 hover:bg-[#f7f8fa]"
                            }`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${item.icon} w-4 text-center text-sm ${
                                    item.active ? "text-[#233876]" : ""
                                }`}
                            />
                            <span
                                className={`text-sm ${
                                    item.active ? "font-semibold" : "font-medium"
                                }`}
                            >
                                {item.label}
                            </span>
                            {item.id === "messages" && totalUnread > 0 && (
                                <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center bg-[#233876] text-white font-mono text-[10px] font-bold px-1.5">
                                    {totalUnread}
                                </span>
                            )}
                            {item.active && (
                                <span className="ml-auto w-1.5 h-1.5 bg-[#233876]" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="px-5 py-4 border-t border-dashed border-[#233876]/10">
                    <div className="font-mono text-[9px] tracking-wider text-[#233876]/20 uppercase">
                        v9.0 // Clean Architecture
                    </div>
                </div>
            </aside>

            {/* ── Main Content ──────────────────────────────────── */}
            <div className="relative z-10 flex-1 min-w-0 flex">
                {/* ── Conversation List Panel ─────────────────────── */}
                <div className="msg-sidebar-panel w-full sm:w-[340px] md:w-[380px] flex-shrink-0 border-r-2 border-[#233876]/10 flex flex-col h-screen sm:relative">
                    {/* Panel Header */}
                    <header className="border-b border-[#233876]/10 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
                        <div className="px-5 py-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSidebarOpen(true)}
                                        className="lg:hidden w-8 h-8 border-2 border-[#233876]/15 flex items-center justify-center text-[#233876]/40 hover:text-[#233876] hover:border-[#233876]/40 transition-colors"
                                    >
                                        <i className="fa-duotone fa-regular fa-bars text-sm" />
                                    </button>
                                    <div>
                                        <div className="font-mono text-[9px] tracking-[0.3em] text-[#233876]/30 uppercase">
                                            REF: MSG-09 // Communications
                                        </div>
                                        <h1 className="text-lg font-bold text-[#0f1b3d]">
                                            Messages
                                        </h1>
                                    </div>
                                </div>
                                <button className="w-8 h-8 border-2 border-[#233876]/15 flex items-center justify-center text-[#233876]/40 hover:text-[#233876] hover:border-[#233876]/40 hover:bg-[#233876]/5 transition-colors">
                                    <i className="fa-duotone fa-regular fa-pen-to-square text-sm" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative mb-3">
                                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#233876]/25 text-xs" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search conversations..."
                                    className="w-full pl-9 pr-3 py-2 bg-[#f7f8fa] border-2 border-[#233876]/8 font-mono text-xs text-[#0f1b3d] placeholder:text-[#233876]/25 focus:border-[#233876]/30 focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Filter tabs */}
                            <div className="flex gap-1">
                                {(
                                    [
                                        ["all", "All"],
                                        ["unread", "Unread"],
                                        ["pinned", "Pinned"],
                                    ] as const
                                ).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setFilter(key)}
                                        className={`px-3 py-1.5 font-mono text-[10px] tracking-wide uppercase transition-colors ${
                                            filter === key
                                                ? "bg-[#233876] text-white"
                                                : "text-[#233876]/40 hover:text-[#233876] hover:bg-[#233876]/5"
                                        }`}
                                    >
                                        {label}
                                        {key === "unread" && totalUnread > 0 && (
                                            <span className="ml-1.5">
                                                ({totalUnread})
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </header>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-12 h-12 border-2 border-[#233876]/15 flex items-center justify-center mx-auto mb-3">
                                    <i className="fa-duotone fa-regular fa-inbox text-lg text-[#233876]/25" />
                                </div>
                                <div className="font-mono text-xs text-[#233876]/30">
                                    No conversations found
                                </div>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => {
                                const other = getOtherUser(conv);
                                const lastMsg =
                                    conv.messages[conv.messages.length - 1];
                                const unread = getUnreadCount(conv);
                                const isSelected = conv.id === selectedId;
                                const roleConf = ROLE_CONFIG[other.role];

                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() =>
                                            handleSelectConversation(conv.id)
                                        }
                                        className={`w-full text-left px-5 py-4 border-b border-[#233876]/6 transition-all ${
                                            isSelected
                                                ? "bg-[#233876]/5 border-l-[3px] border-l-[#233876]"
                                                : "hover:bg-[#f7f8fa] border-l-[3px] border-l-transparent"
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div
                                                    className={`w-10 h-10 ${roleConf.bg} flex items-center justify-center`}
                                                >
                                                    <span
                                                        className={`font-bold text-xs ${roleConf.color}`}
                                                    >
                                                        {other.initials}
                                                    </span>
                                                </div>
                                                {other.online && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        {conv.pinned && (
                                                            <i className="fa-duotone fa-regular fa-thumbtack text-[9px] text-[#233876]/30" />
                                                        )}
                                                        <span
                                                            className={`text-sm truncate ${
                                                                unread > 0
                                                                    ? "font-bold text-[#0f1b3d]"
                                                                    : "font-medium text-[#0f1b3d]/80"
                                                            }`}
                                                        >
                                                            {other.name}
                                                        </span>
                                                    </div>
                                                    <span className="font-mono text-[10px] text-[#233876]/30 flex-shrink-0 ml-2">
                                                        {formatTime(
                                                            lastMsg?.timestamp ??
                                                                "",
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 ${roleConf.bg} ${roleConf.color} font-mono text-[8px] uppercase tracking-wider`}
                                                    >
                                                        <i
                                                            className={`fa-duotone fa-regular ${roleConf.icon} text-[7px]`}
                                                        />
                                                        {roleConf.label}
                                                    </span>
                                                    {conv.label && (
                                                        <span className="px-1.5 py-0.5 bg-[#233876]/5 text-[#233876]/50 font-mono text-[8px] uppercase tracking-wider">
                                                            {conv.label}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <p
                                                        className={`text-xs truncate flex-1 ${
                                                            unread > 0
                                                                ? "text-[#0f1b3d]/70 font-medium"
                                                                : "text-[#0f1b3d]/40"
                                                        }`}
                                                    >
                                                        {lastMsg?.senderId ===
                                                        "me"
                                                            ? "You: "
                                                            : ""}
                                                        {lastMsg?.text ?? ""}
                                                    </p>
                                                    {unread > 0 && (
                                                        <span className="flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center bg-[#233876] text-white font-mono text-[9px] font-bold px-1">
                                                            {unread}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* List Footer Stats */}
                    <div className="border-t border-dashed border-[#233876]/10 px-5 py-3 bg-[#f7f8fa]">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] text-[#233876]/25 uppercase tracking-wider">
                                {filteredConversations.length} conversations
                            </span>
                            <span className="font-mono text-[9px] text-[#233876]/25 uppercase tracking-wider">
                                {totalUnread} unread
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Message Thread Panel ────────────────────────── */}
                <div
                    className={`msg-thread-panel flex-1 min-w-0 flex-col h-screen ${
                        selectedConversation
                            ? "hidden sm:flex"
                            : "hidden sm:flex"
                    }`}
                >
                    {selectedConversation ? (
                        <>
                            {/* Thread Header */}
                            <header className="border-b border-[#233876]/10 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
                                <div className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            {(() => {
                                                const other = getOtherUser(
                                                    selectedConversation,
                                                );
                                                const roleConf =
                                                    ROLE_CONFIG[other.role];
                                                return (
                                                    <div className="relative">
                                                        <div
                                                            className={`w-10 h-10 ${roleConf.bg} flex items-center justify-center`}
                                                        >
                                                            <span
                                                                className={`font-bold text-xs ${roleConf.color}`}
                                                            >
                                                                {other.initials}
                                                            </span>
                                                        </div>
                                                        {other.online && (
                                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white" />
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="font-bold text-[#0f1b3d]">
                                                        {
                                                            getOtherUser(
                                                                selectedConversation,
                                                            ).name
                                                        }
                                                    </h2>
                                                    {(() => {
                                                        const other =
                                                            getOtherUser(
                                                                selectedConversation,
                                                            );
                                                        const roleConf =
                                                            ROLE_CONFIG[
                                                                other.role
                                                            ];
                                                        return (
                                                            <span
                                                                className={`inline-flex items-center gap-1 px-2 py-0.5 ${roleConf.bg} ${roleConf.color} font-mono text-[9px] uppercase tracking-wider`}
                                                            >
                                                                <i
                                                                    className={`fa-duotone fa-regular ${roleConf.icon} text-[8px]`}
                                                                />
                                                                {roleConf.label}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span
                                                        className={`font-mono text-[10px] ${
                                                            getOtherUser(
                                                                selectedConversation,
                                                            ).online
                                                                ? "text-emerald-600"
                                                                : "text-[#233876]/30"
                                                        }`}
                                                    >
                                                        {getOtherUser(
                                                            selectedConversation,
                                                        ).online
                                                            ? "Online"
                                                            : "Offline"}
                                                    </span>
                                                    {selectedConversation.label && (
                                                        <>
                                                            <span className="text-[#233876]/15">
                                                                //
                                                            </span>
                                                            <span className="font-mono text-[10px] text-[#233876]/30 uppercase tracking-wider">
                                                                {
                                                                    selectedConversation.label
                                                                }
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Header actions */}
                                        <div className="flex items-center gap-2">
                                            <button className="w-8 h-8 border-2 border-[#233876]/15 flex items-center justify-center text-[#233876]/30 hover:text-[#233876] hover:border-[#233876]/40 transition-colors">
                                                <i className="fa-duotone fa-regular fa-phone text-sm" />
                                            </button>
                                            <button className="w-8 h-8 border-2 border-[#233876]/15 flex items-center justify-center text-[#233876]/30 hover:text-[#233876] hover:border-[#233876]/40 transition-colors">
                                                <i className="fa-duotone fa-regular fa-video text-sm" />
                                            </button>
                                            <button className="w-8 h-8 border-2 border-[#233876]/15 flex items-center justify-center text-[#233876]/30 hover:text-[#233876] hover:border-[#233876]/40 transition-colors">
                                                <i className="fa-duotone fa-regular fa-ellipsis-vertical text-sm" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </header>

                            {/* Messages Area */}
                            <div
                                ref={messageListRef}
                                className="flex-1 overflow-y-auto px-6 py-6"
                            >
                                {/* Date separator */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex-1 border-t border-dashed border-[#233876]/10" />
                                    <span className="font-mono text-[9px] tracking-[0.2em] text-[#233876]/25 uppercase">
                                        {new Date(
                                            selectedConversation.messages[0]
                                                ?.timestamp ?? "",
                                        ).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                    <div className="flex-1 border-t border-dashed border-[#233876]/10" />
                                </div>

                                {/* Message bubbles */}
                                {selectedConversation.messages.map((msg) => {
                                    const isMine = msg.senderId === "me";
                                    const sender = isMine
                                        ? CURRENT_USER
                                        : getOtherUser(selectedConversation);
                                    const roleConf = ROLE_CONFIG[sender.role];

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`msg-bubble flex gap-3 mb-4 ${
                                                isMine
                                                    ? "flex-row-reverse"
                                                    : ""
                                            }`}
                                        >
                                            {/* Avatar */}
                                            <div
                                                className={`w-8 h-8 ${roleConf.bg} flex items-center justify-center flex-shrink-0 self-end`}
                                            >
                                                <span
                                                    className={`font-bold text-[10px] ${roleConf.color}`}
                                                >
                                                    {sender.initials}
                                                </span>
                                            </div>

                                            {/* Bubble */}
                                            <div
                                                className={`max-w-[70%] ${
                                                    isMine
                                                        ? "items-end"
                                                        : "items-start"
                                                }`}
                                            >
                                                <div
                                                    className={`px-4 py-3 ${
                                                        isMine
                                                            ? "bg-[#233876] text-white"
                                                            : "bg-[#f7f8fa] border-2 border-[#233876]/8 text-[#0f1b3d]"
                                                    }`}
                                                >
                                                    <p className="text-sm leading-relaxed">
                                                        {msg.text}
                                                    </p>
                                                </div>
                                                <div
                                                    className={`flex items-center gap-2 mt-1.5 ${
                                                        isMine
                                                            ? "justify-end"
                                                            : "justify-start"
                                                    }`}
                                                >
                                                    <span className="font-mono text-[9px] text-[#233876]/25">
                                                        {formatMessageTime(
                                                            msg.timestamp,
                                                        )}
                                                    </span>
                                                    {isMine && (
                                                        <i
                                                            className={`fa-duotone fa-regular fa-check-double text-[10px] ${
                                                                msg.read
                                                                    ? "text-[#233876]/40"
                                                                    : "text-[#233876]/15"
                                                            }`}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Compose Area */}
                            <div className="border-t-2 border-[#233876]/10 bg-white">
                                <div className="px-6 py-4">
                                    {/* Typing indicator line */}
                                    <div className="font-mono text-[9px] text-[#233876]/20 uppercase tracking-wider mb-2">
                                        Compose Message // REF:{" "}
                                        {selectedConversation.id.toUpperCase()}
                                    </div>

                                    <div className="flex items-end gap-3">
                                        {/* Attachment button */}
                                        <button className="w-9 h-9 border-2 border-[#233876]/15 flex items-center justify-center text-[#233876]/30 hover:text-[#233876] hover:border-[#233876]/40 hover:bg-[#233876]/5 transition-colors flex-shrink-0 mb-0.5">
                                            <i className="fa-duotone fa-regular fa-paperclip text-sm" />
                                        </button>

                                        {/* Input */}
                                        <div className="flex-1 relative">
                                            <textarea
                                                value={messageInput}
                                                onChange={(e) =>
                                                    setMessageInput(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={handleKeyDown}
                                                placeholder="Type a message..."
                                                rows={1}
                                                className="w-full px-4 py-2.5 bg-[#f7f8fa] border-2 border-[#233876]/10 text-sm text-[#0f1b3d] placeholder:text-[#233876]/25 focus:border-[#233876]/30 focus:outline-none transition-colors resize-none"
                                                style={{
                                                    minHeight: "40px",
                                                    maxHeight: "120px",
                                                }}
                                            />
                                        </div>

                                        {/* Emoji button */}
                                        <button className="w-9 h-9 border-2 border-[#233876]/15 flex items-center justify-center text-[#233876]/30 hover:text-[#233876] hover:border-[#233876]/40 hover:bg-[#233876]/5 transition-colors flex-shrink-0 mb-0.5">
                                            <i className="fa-duotone fa-regular fa-face-smile text-sm" />
                                        </button>

                                        {/* Send button */}
                                        <button
                                            onClick={handleSend}
                                            disabled={!messageInput.trim()}
                                            className={`w-9 h-9 flex items-center justify-center flex-shrink-0 mb-0.5 transition-all ${
                                                messageInput.trim()
                                                    ? "bg-[#233876] text-white hover:bg-[#1a2a5c]"
                                                    : "bg-[#233876]/10 text-[#233876]/25 cursor-not-allowed"
                                            }`}
                                        >
                                            <i className="fa-duotone fa-regular fa-paper-plane-top text-sm" />
                                        </button>
                                    </div>

                                    {/* Keyboard hint */}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-3">
                                            <button className="text-[#233876]/20 hover:text-[#233876]/50 transition-colors">
                                                <i className="fa-duotone fa-regular fa-bold text-xs" />
                                            </button>
                                            <button className="text-[#233876]/20 hover:text-[#233876]/50 transition-colors">
                                                <i className="fa-duotone fa-regular fa-italic text-xs" />
                                            </button>
                                            <button className="text-[#233876]/20 hover:text-[#233876]/50 transition-colors">
                                                <i className="fa-duotone fa-regular fa-link text-xs" />
                                            </button>
                                            <button className="text-[#233876]/20 hover:text-[#233876]/50 transition-colors">
                                                <i className="fa-duotone fa-regular fa-list text-xs" />
                                            </button>
                                        </div>
                                        <span className="font-mono text-[9px] text-[#233876]/20">
                                            Press Enter to send // Shift+Enter
                                            for new line
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty state */
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 border-2 border-dashed border-[#233876]/15 flex items-center justify-center mx-auto mb-5">
                                    <i className="fa-duotone fa-regular fa-comments text-3xl text-[#233876]/20" />
                                </div>
                                <h3 className="font-bold text-lg text-[#0f1b3d]/60 mb-2">
                                    Select a Conversation
                                </h3>
                                <p className="font-mono text-xs text-[#233876]/30 max-w-[280px]">
                                    Choose a conversation from the list to view
                                    messages and continue your discussions.
                                </p>
                                <div className="mt-6 flex items-center justify-center gap-3">
                                    <div className="w-2 h-2 bg-[#233876]/10" />
                                    <div className="w-2 h-2 bg-[#233876]/20" />
                                    <div className="w-2 h-2 bg-[#233876]/10" />
                                </div>
                                <div className="font-mono text-[9px] text-[#233876]/15 mt-4 tracking-[0.3em] uppercase">
                                    MSG-09 // Ready
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
