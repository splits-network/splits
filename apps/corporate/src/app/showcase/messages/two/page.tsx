"use client";

import { useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type UserRole = "recruiter" | "company" | "candidate" | "admin";

interface Contact {
    id: string;
    name: string;
    initials: string;
    role: UserRole;
    title: string;
    company: string;
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
    contact: Contact;
    messages: Message[];
    unreadCount: number;
    pinned: boolean;
    lastActivity: string;
}

/* ─── Role Config ────────────────────────────────────────────────────────────── */

const roleConfig: Record<UserRole, { label: string; icon: string; color: string; bg: string }> = {
    recruiter: {
        label: "Recruiter",
        icon: "fa-duotone fa-regular fa-user-tie",
        color: "text-secondary",
        bg: "bg-secondary/10",
    },
    company: {
        label: "Company",
        icon: "fa-duotone fa-regular fa-building",
        color: "text-primary",
        bg: "bg-primary/10",
    },
    candidate: {
        label: "Candidate",
        icon: "fa-duotone fa-regular fa-user",
        color: "text-accent",
        bg: "bg-accent/10",
    },
    admin: {
        label: "Admin",
        icon: "fa-duotone fa-regular fa-shield-halved",
        color: "text-warning",
        bg: "bg-warning/10",
    },
};

/* ─── Current User ───────────────────────────────────────────────────────────── */

const currentUser: Contact = {
    id: "current-user",
    name: "Alexandra Whitfield",
    initials: "AW",
    role: "recruiter",
    title: "Senior Talent Partner",
    company: "Apex Recruiting",
    online: true,
};

/* ─── Mock Conversations ─────────────────────────────────────────────────────── */

const mockConversations: Conversation[] = [
    {
        id: "conv-1",
        contact: {
            id: "c1",
            name: "Marcus Chen",
            initials: "MC",
            role: "company",
            title: "VP of Engineering",
            company: "Meridian Corp",
            online: true,
        },
        messages: [
            { id: "m1", senderId: "c1", text: "Hi Alexandra, we have an urgent opening for a Staff Engineer. The team is growing fast and we need someone who can lead our platform migration to microservices.", timestamp: "10:15 AM", read: true },
            { id: "m2", senderId: "current-user", text: "Marcus, great to hear from you. I actually have two candidates in mind who have deep experience with distributed systems and service decomposition. Both are currently passive but open to conversations.", timestamp: "10:22 AM", read: true },
            { id: "m3", senderId: "c1", text: "That sounds promising. What's the timeline looking like? We'd ideally want to start interviews within the next two weeks. The budget is $220k-$280k base plus equity.", timestamp: "10:28 AM", read: true },
            { id: "m4", senderId: "current-user", text: "Very competitive range. I'll reach out to both candidates today and gauge their interest. Can you share the full job description so I can position the opportunity accurately?", timestamp: "10:35 AM", read: true },
            { id: "m5", senderId: "c1", text: "Just shared the JD via the platform. Also, we're open to a 50/50 split if you want to bring in a sourcing partner from the network. Speed is our priority here.", timestamp: "10:41 AM", read: true },
            { id: "m6", senderId: "current-user", text: "Perfect, I'll review the JD and get back to you by end of day with candidate profiles. The split arrangement sounds great - I know a specialist in platform engineering recruiting who could accelerate the search.", timestamp: "10:48 AM", read: true },
            { id: "m7", senderId: "c1", text: "Excellent. Looking forward to seeing the profiles. Let me know if you need any additional context about the team structure or tech stack.", timestamp: "11:02 AM", read: false },
        ],
        unreadCount: 1,
        pinned: true,
        lastActivity: "11:02 AM",
    },
    {
        id: "conv-2",
        contact: {
            id: "c2",
            name: "Diana Foster",
            initials: "DF",
            role: "recruiter",
            title: "Technical Recruiter",
            company: "Foster Talent Group",
            online: true,
        },
        messages: [
            { id: "m8", senderId: "c2", text: "Hey! Are you open to splitting that Meridian Corp role? I have three strong backend engineers in my pipeline who might be a perfect fit.", timestamp: "11:30 AM", read: true },
            { id: "m9", senderId: "current-user", text: "Diana! Great timing. Marcus just mentioned he's open to a split arrangement. The role is Staff Engineer, $220k-$280k. Let's discuss terms.", timestamp: "11:35 AM", read: true },
            { id: "m10", senderId: "c2", text: "Fantastic. I'm thinking 50/50 on the fee. I can submit candidates by tomorrow morning. My strongest candidate has 12 years of experience with Kubernetes and service mesh architectures.", timestamp: "11:42 AM", read: true },
            { id: "m11", senderId: "current-user", text: "50/50 works for me. Send over the candidate profiles when you're ready and I'll coordinate the introductions with Marcus. This could be a really strong placement for both of us.", timestamp: "11:50 AM", read: true },
            { id: "m12", senderId: "c2", text: "Sending profiles now. Also, I heard there might be two more senior roles opening at Meridian next quarter. Should we position ourselves for those too?", timestamp: "12:05 PM", read: false },
        ],
        unreadCount: 1,
        pinned: true,
        lastActivity: "12:05 PM",
    },
    {
        id: "conv-3",
        contact: {
            id: "c3",
            name: "James Park",
            initials: "JP",
            role: "candidate",
            title: "Staff Software Engineer",
            company: "Currently at Stripe",
            online: false,
        },
        messages: [
            { id: "m13", senderId: "current-user", text: "Hi James, I came across your profile and was really impressed by your work on Stripe's payment orchestration platform. I have an opportunity that I think aligns perfectly with your expertise.", timestamp: "Yesterday", read: true },
            { id: "m14", senderId: "c3", text: "Thanks for reaching out, Alexandra. I'm selectively exploring new opportunities. What can you tell me about the role?", timestamp: "Yesterday", read: true },
            { id: "m15", senderId: "current-user", text: "It's a Staff Engineer position at Meridian Corp, leading their platform migration to microservices. Comp range is $220k-$280k base plus meaningful equity. The engineering culture is exceptional.", timestamp: "Yesterday", read: true },
            { id: "m16", senderId: "c3", text: "The compensation is competitive and the technical challenge sounds interesting. I'd like to learn more about the team size and the scope of the migration. Could we schedule a call this week?", timestamp: "Yesterday", read: true },
            { id: "m17", senderId: "current-user", text: "Absolutely. How does Thursday at 2 PM work? I can share a detailed overview of the team and technical vision beforehand.", timestamp: "Yesterday", read: true },
            { id: "m18", senderId: "c3", text: "Thursday at 2 PM works perfectly. Looking forward to it.", timestamp: "Yesterday", read: true },
        ],
        unreadCount: 0,
        pinned: false,
        lastActivity: "Yesterday",
    },
    {
        id: "conv-4",
        contact: {
            id: "c4",
            name: "Sarah Williams",
            initials: "SW",
            role: "admin",
            title: "Platform Administrator",
            company: "Splits Network",
            online: true,
        },
        messages: [
            { id: "m19", senderId: "c4", text: "Hi Alexandra, just a heads up that we've rolled out the new split-fee calculator tool. It automatically computes the fee distribution based on your partnership agreements.", timestamp: "Yesterday", read: true },
            { id: "m20", senderId: "current-user", text: "That's great news! I've been manually tracking splits in a spreadsheet. This will save a lot of time. Any documentation I should review?", timestamp: "Yesterday", read: true },
            { id: "m21", senderId: "c4", text: "Yes, I'll send you the guide. Also, your account has been upgraded to Pro tier based on your placement volume. You now have access to priority matching and advanced analytics.", timestamp: "Yesterday", read: true },
        ],
        unreadCount: 0,
        pinned: false,
        lastActivity: "Yesterday",
    },
    {
        id: "conv-5",
        contact: {
            id: "c5",
            name: "Nina Vasquez",
            initials: "NV",
            role: "company",
            title: "Head of People",
            company: "Quantum Financial",
            online: false,
        },
        messages: [
            { id: "m22", senderId: "c5", text: "Alexandra, following up on the Data Engineering Lead search. Our CTO would like to fast-track the process. Can we discuss adjusting the candidate requirements?", timestamp: "2 days ago", read: true },
            { id: "m23", senderId: "current-user", text: "Of course, Nina. I have some thoughts on broadening the search criteria without compromising quality. When are you available for a quick sync?", timestamp: "2 days ago", read: true },
            { id: "m24", senderId: "c5", text: "How about tomorrow morning? Also, we may want to consider candidates from adjacent industries like fintech and healthtech.", timestamp: "2 days ago", read: true },
        ],
        unreadCount: 0,
        pinned: false,
        lastActivity: "2 days ago",
    },
    {
        id: "conv-6",
        contact: {
            id: "c6",
            name: "Tom Bradley",
            initials: "TB",
            role: "recruiter",
            title: "Executive Recruiter",
            company: "Bradley & Associates",
            online: false,
        },
        messages: [
            { id: "m25", senderId: "c6", text: "Congrats on the Cirrus Technologies placement! That was a tough one. I'm impressed you closed it in under three weeks.", timestamp: "3 days ago", read: true },
            { id: "m26", senderId: "current-user", text: "Thanks Tom! The split arrangement with your candidate really made the difference. The client was thrilled with the speed. Ready for the next one?", timestamp: "3 days ago", read: true },
            { id: "m27", senderId: "c6", text: "Always. I have a few VP-level candidates who might be interesting for some of your enterprise accounts. Let's catch up next week.", timestamp: "3 days ago", read: true },
        ],
        unreadCount: 0,
        pinned: false,
        lastActivity: "3 days ago",
    },
    {
        id: "conv-7",
        contact: {
            id: "c7",
            name: "Lisa Okafor",
            initials: "LO",
            role: "candidate",
            title: "Principal Engineer",
            company: "Currently at Netflix",
            online: true,
        },
        messages: [
            { id: "m28", senderId: "c7", text: "Hi Alexandra, I wanted to follow up on the CTO opportunity you mentioned last month. Has there been any movement on the search?", timestamp: "4 days ago", read: true },
            { id: "m29", senderId: "current-user", text: "Lisa, great to hear from you! The client has finalized the job requirements and they're ready to move forward. Your background in scaling engineering teams is exactly what they're looking for.", timestamp: "4 days ago", read: true },
            { id: "m30", senderId: "c7", text: "Wonderful. I've been thinking about it and I'm ready to explore this seriously. What are the next steps?", timestamp: "4 days ago", read: true },
        ],
        unreadCount: 0,
        pinned: false,
        lastActivity: "4 days ago",
    },
    {
        id: "conv-8",
        contact: {
            id: "c8",
            name: "Kevin Zhang",
            initials: "KZ",
            role: "company",
            title: "CTO",
            company: "Apex Robotics",
            online: false,
        },
        messages: [
            { id: "m31", senderId: "c8", text: "Alexandra, we need to hire five mobile engineers in Q2. Can Splits Network help us set up a multi-recruiter arrangement to fill these roles efficiently?", timestamp: "5 days ago", read: true },
            { id: "m32", senderId: "current-user", text: "Absolutely, Kevin. A coordinated split-fee approach with specialized mobile recruiters would be ideal for this volume. I can put together a sourcing strategy with two or three trusted partners.", timestamp: "5 days ago", read: true },
        ],
        unreadCount: 0,
        pinned: false,
        lastActivity: "5 days ago",
    },
];

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function getLastMessage(conv: Conversation): Message {
    return conv.messages[conv.messages.length - 1];
}

function truncate(text: string, maxLen: number): string {
    return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function MessagesTwoPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const threadRef = useRef<HTMLDivElement>(null);

    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [activeConvId, setActiveConvId] = useState<string>("conv-1");
    const [searchQuery, setSearchQuery] = useState("");
    const [composeText, setComposeText] = useState("");
    const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
    const [mobileShowThread, setMobileShowThread] = useState(false);

    const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

    /* ─── Animations ─────────────────────────────────────────────────────────── */

    useGSAP(
        () => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            // Header entrance
            gsap.from("[data-header]", {
                y: -30,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
            });

            // Sidebar entrance
            gsap.from("[data-sidebar]", {
                x: -40,
                opacity: 0,
                duration: 0.7,
                ease: "power3.out",
                delay: 0.15,
            });

            // Conversation list items stagger
            gsap.from("[data-conv-item]", {
                x: -20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.04,
                ease: "power2.out",
                delay: 0.3,
            });

            // Thread panel entrance
            gsap.from("[data-thread]", {
                x: 30,
                opacity: 0,
                duration: 0.7,
                ease: "power3.out",
                delay: 0.2,
            });

            // Messages stagger in
            gsap.from("[data-message]", {
                y: 20,
                opacity: 0,
                duration: 0.4,
                stagger: 0.06,
                ease: "power2.out",
                delay: 0.5,
            });

            // Compose area
            gsap.from("[data-compose]", {
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
                delay: 0.7,
            });
        },
        { scope: containerRef },
    );

    /* ─── Animate new messages ───────────────────────────────────────────────── */

    const animateNewMessage = useCallback(() => {
        if (!threadRef.current) return;
        const messages = threadRef.current.querySelectorAll("[data-message]");
        const last = messages[messages.length - 1];
        if (last) {
            gsap.from(last, {
                y: 30,
                opacity: 0,
                scale: 0.95,
                duration: 0.4,
                ease: "back.out(1.4)",
            });
        }
    }, []);

    /* ─── Handlers ───────────────────────────────────────────────────────────── */

    const selectConversation = useCallback((convId: string) => {
        setActiveConvId(convId);
        setMobileShowThread(true);
        // Mark messages as read
        setConversations((prev) =>
            prev.map((c) =>
                c.id === convId
                    ? {
                          ...c,
                          unreadCount: 0,
                          messages: c.messages.map((m) => ({ ...m, read: true })),
                      }
                    : c,
            ),
        );
    }, []);

    const sendMessage = useCallback(() => {
        if (!composeText.trim()) return;
        const newMsg: Message = {
            id: `m-${Date.now()}`,
            senderId: "current-user",
            text: composeText.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
            read: true,
        };
        setConversations((prev) =>
            prev.map((c) =>
                c.id === activeConvId
                    ? { ...c, messages: [...c.messages, newMsg], lastActivity: "Just now" }
                    : c,
            ),
        );
        setComposeText("");
        setTimeout(() => {
            messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
            animateNewMessage();
        }, 50);
    }, [composeText, activeConvId, animateNewMessage]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        },
        [sendMessage],
    );

    /* ─── Filtered conversations ─────────────────────────────────────────────── */

    const filtered = conversations.filter((c) => {
        const matchesSearch =
            !searchQuery ||
            c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            getLastMessage(c).text.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === "all" || c.contact.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const pinnedConvs = filtered.filter((c) => c.pinned);
    const unpinnedConvs = filtered.filter((c) => !c.pinned);

    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

    /* ─── Render ─────────────────────────────────────────────────────────────── */

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100">
            {/* ─── Editorial Header ─────────────────────────────────────────── */}
            <header data-header className="border-b border-base-300 bg-base-100">
                <div className="max-w-[1600px] mx-auto px-6 md:px-10">
                    <div className="flex items-center justify-between py-6">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-base-content/40 font-medium mb-1">
                                Correspondence
                            </p>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">
                                Messages
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            {totalUnread > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-full">
                                    <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                                    <span className="text-xs font-semibold text-secondary tracking-wide">
                                        {totalUnread} unread
                                    </span>
                                </div>
                            )}
                            <div className="hidden md:flex items-center gap-2 text-sm text-base-content/50">
                                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary">
                                    {currentUser.initials}
                                </div>
                                <span className="font-medium text-base-content/70">{currentUser.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ─── Main Layout ──────────────────────────────────────────────── */}
            <div className="max-w-[1600px] mx-auto">
                <div className="flex h-[calc(100vh-100px)]">
                    {/* ─── Conversation Sidebar ─────────────────────────────── */}
                    <aside
                        data-sidebar
                        className={`w-full md:w-[380px] lg:w-[420px] border-r border-base-300 flex flex-col bg-base-100 shrink-0 ${
                            mobileShowThread ? "hidden md:flex" : "flex"
                        }`}
                    >
                        {/* Search & Filter Bar */}
                        <div className="p-4 border-b border-base-300 space-y-3">
                            <div className="relative">
                                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-sm" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-base-200/50 border border-base-300 rounded-lg text-sm focus:outline-none focus:border-secondary/50 transition-colors placeholder:text-base-content/30"
                                />
                            </div>
                            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                                {(["all", "recruiter", "company", "candidate", "admin"] as const).map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setFilterRole(role)}
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap transition-all duration-200 ${
                                            filterRole === role
                                                ? "bg-base-content text-base-100"
                                                : "bg-base-200/60 text-base-content/50 hover:bg-base-200"
                                        }`}
                                    >
                                        {role === "all" ? "All" : roleConfig[role].label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Conversation List */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Pinned Section */}
                            {pinnedConvs.length > 0 && (
                                <div>
                                    <div className="px-5 pt-4 pb-2 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-thumbtack text-[10px] text-base-content/30" />
                                        <span className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold">
                                            Pinned
                                        </span>
                                    </div>
                                    {pinnedConvs.map((conv) => (
                                        <ConversationItem
                                            key={conv.id}
                                            conv={conv}
                                            isActive={conv.id === activeConvId}
                                            onClick={() => selectConversation(conv.id)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* All Conversations */}
                            {unpinnedConvs.length > 0 && (
                                <div>
                                    <div className="px-5 pt-4 pb-2 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-clock text-[10px] text-base-content/30" />
                                        <span className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold">
                                            Recent
                                        </span>
                                    </div>
                                    {unpinnedConvs.map((conv) => (
                                        <ConversationItem
                                            key={conv.id}
                                            conv={conv}
                                            isActive={conv.id === activeConvId}
                                            onClick={() => selectConversation(conv.id)}
                                        />
                                    ))}
                                </div>
                            )}

                            {filtered.length === 0 && (
                                <div className="p-8 text-center">
                                    <i className="fa-duotone fa-regular fa-inbox text-3xl text-base-content/15 mb-3" />
                                    <p className="text-sm text-base-content/40">No conversations found</p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Footer */}
                        <div className="border-t border-base-300 p-4">
                            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-base-content text-base-100 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                                <i className="fa-duotone fa-regular fa-pen-to-square" />
                                New Conversation
                            </button>
                        </div>
                    </aside>

                    {/* ─── Message Thread Panel ─────────────────────────────── */}
                    <div
                        data-thread
                        className={`flex-1 flex flex-col bg-base-100 min-w-0 ${
                            !mobileShowThread ? "hidden md:flex" : "flex"
                        }`}
                    >
                        {/* Thread Header */}
                        <div className="border-b border-base-300 px-6 py-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4 min-w-0">
                                {/* Mobile Back Button */}
                                <button
                                    onClick={() => setMobileShowThread(false)}
                                    className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-base-200 transition-colors"
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-left text-sm" />
                                </button>

                                {/* Contact Avatar */}
                                <div className="relative shrink-0">
                                    <div
                                        className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${
                                            roleConfig[activeConv.contact.role].bg
                                        } ${roleConfig[activeConv.contact.role].color}`}
                                    >
                                        {activeConv.contact.initials}
                                    </div>
                                    {activeConv.contact.online && (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-base-100" />
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-bold text-base-content truncate">
                                            {activeConv.contact.name}
                                        </h2>
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] ${
                                                roleConfig[activeConv.contact.role].bg
                                            } ${roleConfig[activeConv.contact.role].color}`}
                                        >
                                            <i className={`${roleConfig[activeConv.contact.role].icon} text-[9px]`} />
                                            {roleConfig[activeConv.contact.role].label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-base-content/40 truncate">
                                        {activeConv.contact.title} at {activeConv.contact.company}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-base-200 transition-colors text-base-content/40 hover:text-base-content/70">
                                    <i className="fa-duotone fa-regular fa-phone text-sm" />
                                </button>
                                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-base-200 transition-colors text-base-content/40 hover:text-base-content/70">
                                    <i className="fa-duotone fa-regular fa-video text-sm" />
                                </button>
                                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-base-200 transition-colors text-base-content/40 hover:text-base-content/70">
                                    <i className="fa-duotone fa-regular fa-ellipsis-vertical text-sm" />
                                </button>
                            </div>
                        </div>

                        {/* Thread Context Banner */}
                        <div className="px-6 py-3 border-b border-base-200 bg-base-200/30">
                            <div className="flex items-center gap-3 text-xs text-base-content/40">
                                <i className="fa-duotone fa-regular fa-circle-info text-sm" />
                                <span>
                                    Conversation with{" "}
                                    <span className="font-semibold text-base-content/60">
                                        {activeConv.contact.name}
                                    </span>{" "}
                                    &middot;{" "}
                                    <span className="text-base-content/40">
                                        {activeConv.messages.length} messages
                                    </span>{" "}
                                    &middot; Last active {activeConv.lastActivity}
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={threadRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-1">
                            {/* Date Separator */}
                            <div className="flex items-center gap-4 py-4">
                                <div className="flex-1 h-px bg-base-300" />
                                <span className="text-[10px] uppercase tracking-[0.3em] text-base-content/25 font-semibold">
                                    {activeConv.lastActivity === "Just now" || activeConv.lastActivity.includes("AM") || activeConv.lastActivity.includes("PM")
                                        ? "Today"
                                        : activeConv.lastActivity}
                                </span>
                                <div className="flex-1 h-px bg-base-300" />
                            </div>

                            {activeConv.messages.map((msg) => {
                                const isSent = msg.senderId === "current-user";
                                const sender = isSent ? currentUser : activeConv.contact;
                                const role = roleConfig[sender.role];

                                return (
                                    <div
                                        key={msg.id}
                                        data-message
                                        className={`flex gap-3 py-2 ${isSent ? "flex-row-reverse" : ""}`}
                                    >
                                        {/* Avatar */}
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-1 ${role.bg} ${role.color}`}
                                        >
                                            {sender.initials}
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`max-w-[70%] min-w-0 ${isSent ? "items-end" : "items-start"}`}>
                                            <div className={`flex items-center gap-2 mb-1 ${isSent ? "flex-row-reverse" : ""}`}>
                                                <span className="text-xs font-semibold text-base-content/70">
                                                    {sender.name}
                                                </span>
                                                <span className="text-[10px] text-base-content/30">
                                                    {msg.timestamp}
                                                </span>
                                            </div>
                                            <div
                                                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                                    isSent
                                                        ? "bg-base-content text-base-100 rounded-tr-sm"
                                                        : "bg-base-200/70 text-base-content rounded-tl-sm"
                                                }`}
                                            >
                                                {msg.text}
                                            </div>
                                            {isSent && (
                                                <div className="flex justify-end mt-1">
                                                    <span className="text-[10px] text-base-content/25">
                                                        {msg.read ? (
                                                            <>
                                                                <i className="fa-duotone fa-regular fa-check-double text-secondary/60" /> Read
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fa-duotone fa-regular fa-check" /> Sent
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messageEndRef} />
                        </div>

                        {/* Compose Area */}
                        <div data-compose className="border-t border-base-300 px-6 py-4 shrink-0">
                            <div className="flex items-end gap-3">
                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 pb-1">
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-base-200 transition-colors text-base-content/30 hover:text-base-content/50">
                                        <i className="fa-duotone fa-regular fa-paperclip text-sm" />
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-base-200 transition-colors text-base-content/30 hover:text-base-content/50">
                                        <i className="fa-duotone fa-regular fa-face-smile text-sm" />
                                    </button>
                                </div>

                                {/* Text Input */}
                                <div className="flex-1 relative">
                                    <textarea
                                        value={composeText}
                                        onChange={(e) => setComposeText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Write a message..."
                                        rows={1}
                                        className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl text-sm resize-none focus:outline-none focus:border-secondary/50 transition-colors placeholder:text-base-content/30 max-h-32"
                                        style={{ minHeight: "44px" }}
                                    />
                                </div>

                                {/* Send Button */}
                                <button
                                    onClick={sendMessage}
                                    disabled={!composeText.trim()}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 mb-0.5 ${
                                        composeText.trim()
                                            ? "bg-base-content text-base-100 hover:opacity-90 scale-100"
                                            : "bg-base-200 text-base-content/20 scale-95"
                                    }`}
                                >
                                    <i className="fa-duotone fa-regular fa-paper-plane text-sm" />
                                </button>
                            </div>
                            <p className="text-[10px] text-base-content/20 mt-2 text-center tracking-wide">
                                Press Enter to send &middot; Shift + Enter for new line
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Conversation Item Component ────────────────────────────────────────────── */

function ConversationItem({
    conv,
    isActive,
    onClick,
}: {
    conv: Conversation;
    isActive: boolean;
    onClick: () => void;
}) {
    const lastMsg = getLastMessage(conv);
    const role = roleConfig[conv.contact.role];
    const isSentByMe = lastMsg.senderId === "current-user";

    return (
        <button
            data-conv-item
            onClick={onClick}
            className={`w-full text-left px-5 py-4 flex gap-3.5 transition-all duration-200 border-l-2 ${
                isActive
                    ? "bg-base-200/60 border-l-base-content"
                    : "border-l-transparent hover:bg-base-200/30"
            }`}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${role.bg} ${role.color}`}
                >
                    {conv.contact.initials}
                </div>
                {conv.contact.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-base-100" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                        <span
                            className={`text-sm truncate ${
                                conv.unreadCount > 0 ? "font-bold text-base-content" : "font-semibold text-base-content/80"
                            }`}
                        >
                            {conv.contact.name}
                        </span>
                        <i className={`${role.icon} text-[10px] ${role.color} opacity-60`} />
                    </div>
                    <span className="text-[10px] text-base-content/30 shrink-0 ml-2 tabular-nums">
                        {conv.lastActivity}
                    </span>
                </div>
                <p
                    className={`text-xs leading-relaxed truncate ${
                        conv.unreadCount > 0 ? "text-base-content/70 font-medium" : "text-base-content/40"
                    }`}
                >
                    {isSentByMe && (
                        <span className="text-base-content/30">You: </span>
                    )}
                    {truncate(lastMsg.text, 80)}
                </p>
            </div>

            {/* Unread Badge */}
            {conv.unreadCount > 0 && (
                <div className="shrink-0 self-center">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-[10px] font-bold text-white">
                        {conv.unreadCount}
                    </span>
                </div>
            )}
        </button>
    );
}
