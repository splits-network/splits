"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = "recruiter" | "company" | "candidate" | "admin";

interface User {
    id: string;
    name: string;
    role: UserRole;
    initials: string;
    online: boolean;
}

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    read: boolean;
    attachmentName?: string;
}

interface Conversation {
    id: string;
    participants: User[];
    messages: Message[];
    pinned: boolean;
    archived: boolean;
    channel?: string;
}

// ─── Role Config ──────────────────────────────────────────────────────────────

const roleConfig: Record<
    UserRole,
    {
        label: string;
        color: string;
        borderColor: string;
        bgColor: string;
        icon: string;
    }
> = {
    recruiter: {
        label: "RECRUITER",
        color: "text-info",
        borderColor: "border-info/30",
        bgColor: "bg-info/10",
        icon: "fa-duotone fa-regular fa-user-tie",
    },
    company: {
        label: "COMPANY",
        color: "text-warning",
        borderColor: "border-warning/30",
        bgColor: "bg-warning/10",
        icon: "fa-duotone fa-regular fa-building",
    },
    candidate: {
        label: "CANDIDATE",
        color: "text-success",
        borderColor: "border-success/30",
        bgColor: "bg-success/10",
        icon: "fa-duotone fa-regular fa-user",
    },
    admin: {
        label: "ADMIN",
        color: "text-accent",
        borderColor: "border-yellow/30",
        bgColor: "bg-accent/10",
        icon: "fa-duotone fa-regular fa-shield-halved",
    },
};

// ─── Current User ─────────────────────────────────────────────────────────────

const currentUser: User = {
    id: "me",
    name: "Alex Morgan",
    role: "admin",
    initials: "AM",
    online: true,
};

// ─── Mock Users ───────────────────────────────────────────────────────────────

const users: Record<string, User> = {
    me: currentUser,
    u1: {
        id: "u1",
        name: "Sarah Chen",
        role: "recruiter",
        initials: "SC",
        online: true,
    },
    u2: {
        id: "u2",
        name: "Marcus Rivera",
        role: "company",
        initials: "MR",
        online: false,
    },
    u3: {
        id: "u3",
        name: "Priya Patel",
        role: "candidate",
        initials: "PP",
        online: true,
    },
    u4: {
        id: "u4",
        name: "James O'Brien",
        role: "recruiter",
        initials: "JO",
        online: true,
    },
    u5: {
        id: "u5",
        name: "Nina Kozlov",
        role: "company",
        initials: "NK",
        online: false,
    },
    u6: {
        id: "u6",
        name: "David Kim",
        role: "candidate",
        initials: "DK",
        online: false,
    },
    u7: {
        id: "u7",
        name: "Rachel Torres",
        role: "admin",
        initials: "RT",
        online: true,
    },
    u8: {
        id: "u8",
        name: "Liam Foster",
        role: "recruiter",
        initials: "LF",
        online: false,
    },
    u9: {
        id: "u9",
        name: "Emily Nakamura",
        role: "candidate",
        initials: "EN",
        online: true,
    },
};

// ─── Mock Conversations ───────────────────────────────────────────────────────

const mockConversations: Conversation[] = [
    {
        id: "c1",
        participants: [users.me!, users.u1!],
        pinned: true,
        archived: false,
        messages: [
            {
                id: "m1a",
                senderId: "u1",
                text: "Hey Alex, I have 3 strong candidates for the Senior Frontend role at TechCorp. All have 5+ years React experience.",
                timestamp: "2026-02-14T09:15:00Z",
                read: true,
            },
            {
                id: "m1b",
                senderId: "me",
                text: "That's great Sarah! Can you send me their profiles? We need to move fast on this one.",
                timestamp: "2026-02-14T09:18:00Z",
                read: true,
            },
            {
                id: "m1c",
                senderId: "u1",
                text: "Already shared them in the ATS. Candidate #47 is exceptional - she led the React migration at Stripe.",
                timestamp: "2026-02-14T09:22:00Z",
                read: true,
            },
            {
                id: "m1d",
                senderId: "me",
                text: "I see her profile now. Impressive background. Let's schedule interviews for next week.",
                timestamp: "2026-02-14T09:25:00Z",
                read: true,
            },
            {
                id: "m1e",
                senderId: "u1",
                text: "Perfect. I'll coordinate with the candidates and send you time slots by EOD.",
                timestamp: "2026-02-14T09:28:00Z",
                read: true,
            },
            {
                id: "m1f",
                senderId: "u1",
                text: "Also, quick update on the DevOps placement - Marcus confirmed the start date for March 1st. Split fee paperwork is ready for your review.",
                timestamp: "2026-02-14T10:45:00Z",
                read: false,
            },
        ],
    },
    {
        id: "c2",
        participants: [users.me!, users.u2!],
        pinned: false,
        archived: false,
        messages: [
            {
                id: "m2a",
                senderId: "u2",
                text: "Hi Alex, we need to fill 5 engineering positions in Q2. Budget approved for recruiter splits at 15%.",
                timestamp: "2026-02-13T14:30:00Z",
                read: true,
            },
            {
                id: "m2b",
                senderId: "me",
                text: "Great news Marcus. I'll assign top-tier recruiters to each role. Can you share the JDs?",
                timestamp: "2026-02-13T14:45:00Z",
                read: true,
            },
            {
                id: "m2c",
                senderId: "u2",
                text: "Sending them over now. Priority is the Staff Engineer role - we've been trying to fill it for 3 months.",
                timestamp: "2026-02-13T15:00:00Z",
                read: true,
            },
            {
                id: "m2d",
                senderId: "me",
                text: "Understood. I'll put Sarah Chen on it - she has the deepest bench for senior engineering talent.",
                timestamp: "2026-02-13T15:10:00Z",
                read: true,
            },
            {
                id: "m2e",
                senderId: "u2",
                text: "Sounds good. Also, the invoice for last month's placements - can we discuss the payment schedule?",
                timestamp: "2026-02-14T08:00:00Z",
                read: false,
            },
        ],
    },
    {
        id: "c3",
        participants: [users.me!, users.u3!],
        pinned: false,
        archived: false,
        messages: [
            {
                id: "m3a",
                senderId: "u3",
                text: "Hello! I just completed my technical assessment for the Full Stack role. How did I do?",
                timestamp: "2026-02-12T16:00:00Z",
                read: true,
            },
            {
                id: "m3b",
                senderId: "me",
                text: "Hi Priya! You scored in the top 10%. The hiring manager was really impressed with your system design approach.",
                timestamp: "2026-02-12T16:30:00Z",
                read: true,
            },
            {
                id: "m3c",
                senderId: "u3",
                text: "That's wonderful to hear! What are the next steps?",
                timestamp: "2026-02-12T16:35:00Z",
                read: true,
            },
            {
                id: "m3d",
                senderId: "me",
                text: "Final round interview with the VP of Engineering next Tuesday. I'll send the calendar invite shortly.",
                timestamp: "2026-02-12T16:40:00Z",
                read: true,
            },
            {
                id: "m3e",
                senderId: "u3",
                text: "Looking forward to it. Thank you for the updates!",
                timestamp: "2026-02-12T16:45:00Z",
                read: true,
            },
        ],
    },
    {
        id: "c4",
        participants: [users.me!, users.u4!],
        pinned: true,
        archived: false,
        messages: [
            {
                id: "m4a",
                senderId: "u4",
                text: "Alex, I'm closing the Acme Corp placement today. Split fee is $18,500 - 60/40 as agreed.",
                timestamp: "2026-02-14T08:00:00Z",
                read: true,
            },
            {
                id: "m4b",
                senderId: "me",
                text: "Excellent work James. I'll process the payout today.",
                timestamp: "2026-02-14T08:05:00Z",
                read: true,
            },
            {
                id: "m4c",
                senderId: "u4",
                text: "Thanks! Also got a warm lead on 3 more positions at their Seattle office. Want me to pursue?",
                timestamp: "2026-02-14T08:10:00Z",
                read: true,
            },
            {
                id: "m4d",
                senderId: "me",
                text: "Absolutely. Create the job listings and I'll approve them. Acme is becoming one of our best clients.",
                timestamp: "2026-02-14T08:15:00Z",
                read: true,
            },
            {
                id: "m4e",
                senderId: "u4",
                text: "On it. Will have them drafted by lunch.",
                timestamp: "2026-02-14T08:20:00Z",
                read: false,
            },
        ],
    },
    {
        id: "c5",
        participants: [users.me!, users.u5!],
        pinned: false,
        archived: false,
        messages: [
            {
                id: "m5a",
                senderId: "me",
                text: "Hi Nina, welcome to Splits Network! Your company account is now active.",
                timestamp: "2026-02-11T10:00:00Z",
                read: true,
            },
            {
                id: "m5b",
                senderId: "u5",
                text: "Thank you! We're excited to start using the platform. We have 12 open positions we'd like to post.",
                timestamp: "2026-02-11T10:15:00Z",
                read: true,
            },
            {
                id: "m5c",
                senderId: "me",
                text: "That's a great start. I've upgraded your plan to Enterprise. You can now post unlimited jobs and access our full recruiter network.",
                timestamp: "2026-02-11T10:20:00Z",
                read: true,
            },
            {
                id: "m5d",
                senderId: "u5",
                text: "Perfect. One question - how does the recruiter matching algorithm work? We want to make sure we get the most relevant recruiters.",
                timestamp: "2026-02-11T10:30:00Z",
                read: true,
            },
        ],
    },
    {
        id: "c6",
        participants: [users.me!, users.u6!],
        pinned: false,
        archived: false,
        messages: [
            {
                id: "m6a",
                senderId: "u6",
                text: "Hi, I wanted to update my resume on the platform but I'm having trouble uploading the PDF.",
                timestamp: "2026-02-10T13:00:00Z",
                read: true,
            },
            {
                id: "m6b",
                senderId: "me",
                text: "Sorry about that David. Try using Chrome and make sure the file is under 10MB. If it persists, I can upload it for you.",
                timestamp: "2026-02-10T13:10:00Z",
                read: true,
            },
            {
                id: "m6c",
                senderId: "u6",
                text: "Chrome worked! Thanks. Also, are there any new ML Engineer positions? I'm looking to make a move.",
                timestamp: "2026-02-10T13:15:00Z",
                read: true,
            },
        ],
    },
    {
        id: "c7",
        participants: [users.me!, users.u7!],
        pinned: false,
        archived: false,
        channel: "ops",
        messages: [
            {
                id: "m7a",
                senderId: "u7",
                text: "Platform health check: All services green. 99.97% uptime this month.",
                timestamp: "2026-02-14T07:00:00Z",
                read: true,
            },
            {
                id: "m7b",
                senderId: "me",
                text: "Great report Rachel. Any concerns for the upcoming deploy?",
                timestamp: "2026-02-14T07:05:00Z",
                read: true,
            },
            {
                id: "m7c",
                senderId: "u7",
                text: "The new matching algorithm will go live at 2am EST Sunday. I've set up monitoring alerts. Rolling back is one click if anything goes sideways.",
                timestamp: "2026-02-14T07:10:00Z",
                read: true,
            },
            {
                id: "m7d",
                senderId: "u7",
                text: "Also flagged 2 suspicious accounts for review. Possible spam recruiters - profiles look auto-generated.",
                timestamp: "2026-02-14T11:30:00Z",
                read: false,
            },
        ],
    },
    {
        id: "c8",
        participants: [users.me!, users.u8!],
        pinned: false,
        archived: true,
        messages: [
            {
                id: "m8a",
                senderId: "u8",
                text: "Hey Alex, I just onboarded last week. The platform is really intuitive. One suggestion - can we get Slack notifications for new job matches?",
                timestamp: "2026-02-08T09:00:00Z",
                read: true,
            },
            {
                id: "m8b",
                senderId: "me",
                text: "Welcome Liam! Slack integration is on our Q2 roadmap. For now, you'll get email notifications. Make sure they're enabled in Settings.",
                timestamp: "2026-02-08T09:10:00Z",
                read: true,
            },
        ],
    },
    {
        id: "c9",
        participants: [users.me!, users.u9!],
        pinned: false,
        archived: false,
        messages: [
            {
                id: "m9a",
                senderId: "u9",
                text: "Hi! I received an offer through the platform from DataFlow Inc. It's exactly what I was looking for!",
                timestamp: "2026-02-13T11:00:00Z",
                read: true,
            },
            {
                id: "m9b",
                senderId: "me",
                text: "Congratulations Emily! That's wonderful news. Did the recruiter help negotiate the compensation?",
                timestamp: "2026-02-13T11:05:00Z",
                read: true,
            },
            {
                id: "m9c",
                senderId: "u9",
                text: "Yes! James helped me get 15% above the initial offer. I'm starting March 15th. Thank you all so much!",
                timestamp: "2026-02-13T11:10:00Z",
                read: true,
            },
            {
                id: "m9d",
                senderId: "me",
                text: "That's what we're here for. Best of luck at DataFlow - they're a great company.",
                timestamp: "2026-02-13T11:15:00Z",
                read: true,
            },
        ],
    },
];

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────

const sidebarSections = [
    {
        key: "inbox",
        label: "Inbox",
        icon: "fa-duotone fa-regular fa-inbox",
        count: 4,
    },
    {
        key: "pinned",
        label: "Pinned",
        icon: "fa-duotone fa-regular fa-thumbtack",
        count: 2,
    },
    {
        key: "archived",
        label: "Archived",
        icon: "fa-duotone fa-regular fa-box-archive",
        count: 1,
    },
];

const filterTabs: { key: UserRole | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "recruiter", label: "Recruiters" },
    { key: "company", label: "Companies" },
    { key: "candidate", label: "Candidates" },
    { key: "admin", label: "Admins" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMessageTime(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function getOtherParticipant(conv: Conversation): User {
    return conv.participants.find((p) => p.id !== "me") ?? currentUser;
}

function getUnreadCount(conv: Conversation): number {
    return conv.messages.filter((m) => !m.read && m.senderId !== "me").length;
}

function getLastMessage(conv: Conversation): Message | undefined {
    return conv.messages[conv.messages.length - 1];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MessagesFivePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const messageListRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const [activeSection, setActiveSection] = useState<string>("inbox");
    const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
    const [search, setSearch] = useState("");
    const [selectedConvId, setSelectedConvId] = useState<string | null>("c1");
    const [conversations, setConversations] =
        useState<Conversation[]>(mockConversations);
    const [newMessage, setNewMessage] = useState("");
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // ─── Filtered conversations ───────────────────────────────────────────────

    const filteredConversations = conversations.filter((conv) => {
        const other = getOtherParticipant(conv);
        const q = search.toLowerCase();

        // Section filter
        if (activeSection === "pinned" && !conv.pinned) return false;
        if (activeSection === "archived" && !conv.archived) return false;
        if (activeSection === "inbox" && conv.archived) return false;

        // Role filter
        if (roleFilter !== "all" && other.role !== roleFilter) return false;

        // Search
        if (q) {
            const lastMsg = getLastMessage(conv);
            const matchesName = other.name.toLowerCase().includes(q);
            const matchesMsg = lastMsg?.text.toLowerCase().includes(q);
            if (!matchesName && !matchesMsg) return false;
        }

        return true;
    });

    const selectedConv =
        conversations.find((c) => c.id === selectedConvId) ?? null;

    // ─── GSAP intro ───────────────────────────────────────────────────────────

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll(".anim-init"), {
                    opacity: 1,
                });
                return;
            }

            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

            tl.fromTo(
                ".msg-sidebar",
                { opacity: 0, x: -40 },
                { opacity: 1, x: 0, duration: 0.5 },
            );
            tl.fromTo(
                ".msg-sidebar-item",
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.25, stagger: 0.03 },
                "-=0.3",
            );
            tl.fromTo(
                ".msg-thread-area",
                { opacity: 0 },
                { opacity: 1, duration: 0.4 },
                "-=0.2",
            );
            tl.fromTo(
                ".msg-conv-item",
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.25, stagger: 0.04 },
                "-=0.3",
            );
            tl.fromTo(
                ".msg-header-bar",
                { opacity: 0, y: -15 },
                { opacity: 1, y: 0, duration: 0.4 },
                "-=0.3",
            );
            tl.fromTo(
                ".msg-bubble",
                { opacity: 0, y: 15, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 0.3, stagger: 0.05 },
                "-=0.2",
            );
            tl.fromTo(
                ".msg-compose-bar",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4 },
                "-=0.2",
            );
        },
        { scope: containerRef },
    );

    // ─── Auto-scroll to bottom ────────────────────────────────────────────────

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedConvId, conversations]);

    // ─── Animate messages on conversation switch ──────────────────────────────

    useEffect(() => {
        if (!messageListRef.current || !selectedConvId) return;
        const bubbles =
            messageListRef.current.querySelectorAll(".msg-bubble-anim");
        if (bubbles.length === 0) return;

        gsap.fromTo(
            bubbles,
            { opacity: 0, y: 12, scale: 0.97 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.25,
                stagger: 0.04,
                ease: "power2.out",
            },
        );
    }, [selectedConvId]);

    // ─── Send Message ─────────────────────────────────────────────────────────

    const handleSend = useCallback(() => {
        if (!newMessage.trim() || !selectedConvId) return;

        const msg: Message = {
            id: `msg-${Date.now()}`,
            senderId: "me",
            text: newMessage.trim(),
            timestamp: new Date().toISOString(),
            read: true,
        };

        setConversations((prev) =>
            prev.map((c) =>
                c.id === selectedConvId
                    ? { ...c, messages: [...c.messages, msg] }
                    : c,
            ),
        );
        setNewMessage("");

        // Animate new message
        requestAnimationFrame(() => {
            if (!messageListRef.current) return;
            const lastBubble = messageListRef.current.querySelector(
                ".msg-bubble-anim:last-child",
            );
            if (lastBubble) {
                gsap.fromTo(
                    lastBubble,
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
    }, [newMessage, selectedConvId]);

    // ─── Select Conversation ──────────────────────────────────────────────────

    const selectConversation = useCallback((convId: string) => {
        setSelectedConvId(convId);
        setMobileSidebarOpen(false);

        // Mark messages as read
        setConversations((prev) =>
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
    }, []);

    // ─── Toggle Pin ───────────────────────────────────────────────────────────

    const togglePin = useCallback((convId: string) => {
        setConversations((prev) =>
            prev.map((c) =>
                c.id === convId ? { ...c, pinned: !c.pinned } : c,
            ),
        );
    }, []);

    // ─── Total unread ─────────────────────────────────────────────────────────

    const totalUnread = conversations.reduce(
        (acc, c) => acc + getUnreadCount(c),
        0,
    );

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-[#09090b] text-[#e5e7eb] overflow-hidden"
        >
            {/* ── Top Status Bar ──────────────────────────────────────── */}
            <div className="msg-header-bar anim-init opacity-0 border-b border-[#27272a] bg-[#09090b] px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Mobile hamburger */}
                    <button
                        className="lg:hidden w-9 h-9 rounded-lg border border-[#27272a] bg-[#18181b] flex items-center justify-center text-[#e5e7eb]/50 hover:text-[#e5e7eb] transition-colors"
                        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    >
                        <i className="fa-duotone fa-regular fa-bars text-sm" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-satellite-dish text-info text-sm" />
                        </div>
                        <div>
                            <h1 className="font-bold text-sm text-[#e5e7eb] tracking-wide">
                                COMMS CENTER
                            </h1>
                            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#e5e7eb]/30">
                                splits network messaging
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Connection indicator */}
                    <div className="hidden sm:flex items-center gap-2 border border-[#27272a] bg-[#18181b] px-3 py-1.5 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span className="font-mono text-[9px] uppercase tracking-wider text-success/70">
                            Connected
                        </span>
                    </div>

                    {/* Unread badge */}
                    {totalUnread > 0 && (
                        <div className="flex items-center gap-2 border border-warning/20 bg-warning/5 px-3 py-1.5 rounded-lg">
                            <i className="fa-duotone fa-regular fa-bell text-warning text-xs" />
                            <span className="font-mono text-[10px] font-bold text-warning">
                                {totalUnread}
                            </span>
                        </div>
                    )}

                    {/* User avatar */}
                    <div className="flex items-center gap-2 border border-[#27272a] bg-[#18181b] px-3 py-1.5 rounded-lg">
                        <div className="w-6 h-6 rounded-md bg-accent/15 border border-yellow/20 flex items-center justify-center">
                            <span className="font-mono text-[8px] font-bold text-accent">
                                {currentUser.initials}
                            </span>
                        </div>
                        <span className="hidden sm:inline font-mono text-[10px] text-[#e5e7eb]/50">
                            {currentUser.name}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Main Layout ─────────────────────────────────────────── */}
            <div className="flex h-[calc(100vh-57px)]">
                {/* ── Left Rail: Section Nav ────────────────────────── */}
                <div
                    className={`msg-sidebar anim-init opacity-0 w-16 border-r border-[#27272a] bg-[#0c0c0e] flex flex-col items-center py-4 gap-1 shrink-0 ${mobileSidebarOpen ? "flex" : "hidden lg:flex"}`}
                >
                    {sidebarSections.map((sec) => (
                        <button
                            key={sec.key}
                            onClick={() => setActiveSection(sec.key)}
                            className={`msg-sidebar-item relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 group ${
                                activeSection === sec.key
                                    ? "bg-info/10 border border-info/25 text-info"
                                    : "border border-transparent text-[#e5e7eb]/30 hover:text-[#e5e7eb]/60 hover:bg-[#18181b]"
                            }`}
                        >
                            <i className={`${sec.icon} text-sm`} />
                            {sec.count > 0 && activeSection !== sec.key && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-info/80 text-[#09090b] flex items-center justify-center font-mono text-[8px] font-bold">
                                    {sec.count}
                                </span>
                            )}
                            {/* Tooltip */}
                            <div className="absolute left-full ml-2 px-2 py-1 bg-[#18181b] border border-[#27272a] rounded-md font-mono text-[9px] uppercase tracking-wider text-[#e5e7eb]/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {sec.label}
                            </div>
                        </button>
                    ))}

                    <div className="w-6 border-t border-[#27272a]/50 my-2" />

                    {/* Quick compose */}
                    <button className="msg-sidebar-item w-11 h-11 rounded-xl border border-dashed border-[#27272a] text-[#e5e7eb]/20 hover:text-info hover:border-info/30 transition-all duration-200 flex items-center justify-center group">
                        <i className="fa-duotone fa-regular fa-pen-to-square text-sm" />
                        <div className="absolute left-full ml-2 px-2 py-1 bg-[#18181b] border border-[#27272a] rounded-md font-mono text-[9px] uppercase tracking-wider text-[#e5e7eb]/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            New Message
                        </div>
                    </button>
                </div>

                {/* ── Conversation List ─────────────────────────────── */}
                <div
                    className={`msg-sidebar anim-init opacity-0 w-80 border-r border-[#27272a] bg-[#0f0f11] flex flex-col shrink-0 ${mobileSidebarOpen ? "flex absolute z-40 left-16 top-0 h-full" : "hidden lg:flex"}`}
                >
                    {/* Search */}
                    <div className="p-3 border-b border-[#27272a]">
                        <div className="relative">
                            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#e5e7eb]/20 text-xs" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search conversations..."
                                className="w-full pl-9 pr-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-[#e5e7eb] placeholder:text-[#e5e7eb]/20 focus:outline-none focus:border-info/30 transition-colors font-mono text-xs"
                            />
                        </div>
                    </div>

                    {/* Role filter tabs */}
                    <div className="flex gap-1 px-3 py-2 border-b border-[#27272a] overflow-x-auto scrollbar-none">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setRoleFilter(tab.key)}
                                className={`shrink-0 px-2.5 py-1 rounded-md font-mono text-[9px] uppercase tracking-wider transition-all duration-200 ${
                                    roleFilter === tab.key
                                        ? "bg-info/10 text-info border border-info/25"
                                        : "text-[#e5e7eb]/30 hover:text-[#e5e7eb]/50 border border-transparent"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Conversation list */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#27272a] scrollbar-track-transparent">
                        {filteredConversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-2">
                                <i className="fa-duotone fa-regular fa-inbox text-2xl text-[#e5e7eb]/10" />
                                <span className="font-mono text-[10px] text-[#e5e7eb]/20 uppercase tracking-wider">
                                    No conversations
                                </span>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => {
                                const other = getOtherParticipant(conv);
                                const lastMsg = getLastMessage(conv);
                                const unread = getUnreadCount(conv);
                                const rc = roleConfig[other.role];
                                const isSelected = selectedConvId === conv.id;

                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() =>
                                            selectConversation(conv.id)
                                        }
                                        className={`msg-conv-item w-full text-left px-3 py-3 border-b border-[#27272a]/40 transition-all duration-200 group ${
                                            isSelected
                                                ? "bg-[#18181b] border-l-2 border-l-info"
                                                : "hover:bg-[#18181b]/50 border-l-2 border-l-transparent"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Avatar */}
                                            <div className="relative shrink-0">
                                                <div
                                                    className={`w-10 h-10 rounded-lg ${rc.bgColor} border ${rc.borderColor} flex items-center justify-center`}
                                                >
                                                    <span
                                                        className={`font-mono text-xs font-bold ${rc.color}`}
                                                    >
                                                        {other.initials}
                                                    </span>
                                                </div>
                                                {other.online && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-[#0f0f11]" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span
                                                            className={`text-sm font-semibold truncate ${unread > 0 ? "text-[#e5e7eb]" : "text-[#e5e7eb]/70"}`}
                                                        >
                                                            {other.name}
                                                        </span>
                                                        {conv.pinned && (
                                                            <i className="fa-duotone fa-regular fa-thumbtack text-[8px] text-info/40" />
                                                        )}
                                                    </div>
                                                    <span className="font-mono text-[9px] text-[#e5e7eb]/25 shrink-0 ml-2">
                                                        {lastMsg
                                                            ? formatTime(
                                                                  lastMsg.timestamp,
                                                              )
                                                            : ""}
                                                    </span>
                                                </div>

                                                {/* Role badge */}
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <i
                                                        className={`${rc.icon} text-[8px] ${rc.color}/60`}
                                                    />
                                                    <span
                                                        className={`font-mono text-[8px] uppercase tracking-[0.15em] ${rc.color}/50`}
                                                    >
                                                        {rc.label}
                                                    </span>
                                                    {conv.channel && (
                                                        <span className="font-mono text-[8px] text-[#e5e7eb]/20 ml-1">
                                                            #{conv.channel}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Last message preview */}
                                                <p
                                                    className={`text-xs truncate ${unread > 0 ? "text-[#e5e7eb]/60 font-medium" : "text-[#e5e7eb]/30"}`}
                                                >
                                                    {lastMsg?.senderId ===
                                                        "me" && (
                                                        <span className="text-[#e5e7eb]/20 mr-1">
                                                            You:
                                                        </span>
                                                    )}
                                                    {lastMsg?.text ??
                                                        "No messages yet"}
                                                </p>
                                            </div>

                                            {/* Unread badge */}
                                            {unread > 0 && (
                                                <div className="shrink-0 mt-1">
                                                    <span className="w-5 h-5 rounded-full bg-info flex items-center justify-center font-mono text-[9px] font-bold text-[#09090b]">
                                                        {unread}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer stats */}
                    <div className="p-3 border-t border-[#27272a] flex items-center justify-between">
                        <span className="font-mono text-[9px] text-[#e5e7eb]/20 uppercase tracking-wider">
                            {filteredConversations.length} conversation
                            {filteredConversations.length !== 1 ? "s" : ""}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-info/40" />
                            <span className="font-mono text-[9px] text-[#e5e7eb]/20">
                                {
                                    Object.values(users).filter(
                                        (u) => u.online && u.id !== "me",
                                    ).length
                                }{" "}
                                online
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Thread / Message Area ─────────────────────────── */}
                <div className="msg-thread-area anim-init opacity-0 flex-1 flex flex-col min-w-0 bg-[#09090b]">
                    {selectedConv ? (
                        <>
                            {/* Thread header */}
                            <div className="border-b border-[#27272a] bg-[#0c0c0e] px-6 py-3 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    {(() => {
                                        const other =
                                            getOtherParticipant(selectedConv);
                                        const rc = roleConfig[other.role];
                                        return (
                                            <>
                                                <div className="relative">
                                                    <div
                                                        className={`w-10 h-10 rounded-lg ${rc.bgColor} border ${rc.borderColor} flex items-center justify-center`}
                                                    >
                                                        <span
                                                            className={`font-mono text-xs font-bold ${rc.color}`}
                                                        >
                                                            {other.initials}
                                                        </span>
                                                    </div>
                                                    {other.online && (
                                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-[#0c0c0e]" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h2 className="font-bold text-sm text-[#e5e7eb]">
                                                        {other.name}
                                                    </h2>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`font-mono text-[9px] uppercase tracking-[0.2em] ${rc.color}/60`}
                                                        >
                                                            {rc.label}
                                                        </span>
                                                        <span className="text-[#e5e7eb]/10">
                                                            |
                                                        </span>
                                                        <span
                                                            className={`font-mono text-[9px] uppercase tracking-wider ${other.online ? "text-success/60" : "text-[#e5e7eb]/20"}`}
                                                        >
                                                            {other.online
                                                                ? "Online"
                                                                : "Offline"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            togglePin(selectedConv.id)
                                        }
                                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                                            selectedConv.pinned
                                                ? "border-info/30 bg-info/10 text-info"
                                                : "border-[#27272a] bg-[#18181b] text-[#e5e7eb]/30 hover:text-[#e5e7eb]/60"
                                        }`}
                                        title={
                                            selectedConv.pinned
                                                ? "Unpin"
                                                : "Pin"
                                        }
                                    >
                                        <i className="fa-duotone fa-regular fa-thumbtack text-xs" />
                                    </button>
                                    <button className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] flex items-center justify-center text-[#e5e7eb]/30 hover:text-[#e5e7eb]/60 transition-colors">
                                        <i className="fa-duotone fa-regular fa-phone text-xs" />
                                    </button>
                                    <button className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] flex items-center justify-center text-[#e5e7eb]/30 hover:text-[#e5e7eb]/60 transition-colors">
                                        <i className="fa-duotone fa-regular fa-video text-xs" />
                                    </button>
                                    <button className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] flex items-center justify-center text-[#e5e7eb]/30 hover:text-[#e5e7eb]/60 transition-colors">
                                        <i className="fa-duotone fa-regular fa-ellipsis-vertical text-xs" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div
                                ref={messageListRef}
                                className="flex-1 overflow-y-auto px-6 py-4 space-y-1 scrollbar-thin scrollbar-thumb-[#27272a] scrollbar-track-transparent"
                            >
                                {/* Date separator */}
                                <div className="flex items-center gap-4 py-4">
                                    <div className="flex-1 border-t border-[#27272a]/30" />
                                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e5e7eb]/15">
                                        {new Date(
                                            selectedConv.messages[0]
                                                ?.timestamp ?? "",
                                        ).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                    <div className="flex-1 border-t border-[#27272a]/30" />
                                </div>

                                {selectedConv.messages.map((msg, idx) => {
                                    const isMine = msg.senderId === "me";
                                    const sender =
                                        users[msg.senderId] ?? currentUser;
                                    const rc = roleConfig[sender.role];

                                    // Show timestamp separator if gap > 30 mins
                                    const prevMsg =
                                        idx > 0
                                            ? selectedConv.messages[idx - 1]
                                            : null;
                                    const showTimeSep =
                                        prevMsg &&
                                        new Date(msg.timestamp).getTime() -
                                            new Date(
                                                prevMsg.timestamp,
                                            ).getTime() >
                                            1800000;

                                    return (
                                        <div key={msg.id}>
                                            {showTimeSep && (
                                                <div className="flex items-center gap-4 py-3">
                                                    <div className="flex-1 border-t border-[#27272a]/20" />
                                                    <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#e5e7eb]/10">
                                                        {formatMessageTime(
                                                            msg.timestamp,
                                                        )}
                                                    </span>
                                                    <div className="flex-1 border-t border-[#27272a]/20" />
                                                </div>
                                            )}

                                            <div
                                                className={`msg-bubble-anim flex gap-3 ${isMine ? "flex-row-reverse" : ""} mb-3 group`}
                                            >
                                                {/* Avatar */}
                                                {!isMine && (
                                                    <div className="shrink-0 mt-1">
                                                        <div
                                                            className={`w-8 h-8 rounded-lg ${rc.bgColor} border ${rc.borderColor} flex items-center justify-center`}
                                                        >
                                                            <span
                                                                className={`font-mono text-[9px] font-bold ${rc.color}`}
                                                            >
                                                                {
                                                                    sender.initials
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Bubble */}
                                                <div
                                                    className={`max-w-[65%] ${isMine ? "items-end" : "items-start"}`}
                                                >
                                                    {/* Name + role (only for received) */}
                                                    {!isMine && (
                                                        <div className="flex items-center gap-2 mb-1 ml-1">
                                                            <span className="text-xs font-semibold text-[#e5e7eb]/60">
                                                                {sender.name}
                                                            </span>
                                                            <span
                                                                className={`font-mono text-[7px] uppercase tracking-wider ${rc.color}/40`}
                                                            >
                                                                {rc.label}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                            isMine
                                                                ? "bg-info/12 border border-info/15 text-[#e5e7eb]/90 rounded-br-md"
                                                                : "bg-[#18181b] border border-[#27272a] text-[#e5e7eb]/75 rounded-bl-md"
                                                        }`}
                                                    >
                                                        {msg.text}
                                                    </div>

                                                    {/* Timestamp */}
                                                    <div
                                                        className={`flex items-center gap-1.5 mt-1 ${isMine ? "justify-end mr-1" : "ml-1"}`}
                                                    >
                                                        <span className="font-mono text-[8px] text-[#e5e7eb]/15 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {formatMessageTime(
                                                                msg.timestamp,
                                                            )}
                                                        </span>
                                                        {isMine && msg.read && (
                                                            <i className="fa-duotone fa-regular fa-check-double text-[8px] text-info/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Sent avatar */}
                                                {isMine && (
                                                    <div className="shrink-0 mt-1">
                                                        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-yellow/20 flex items-center justify-center">
                                                            <span className="font-mono text-[9px] font-bold text-accent">
                                                                {
                                                                    currentUser.initials
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                <div ref={messageEndRef} />
                            </div>

                            {/* Compose bar */}
                            <div className="msg-compose-bar anim-init opacity-0 border-t border-[#27272a] bg-[#0c0c0e] px-6 py-4">
                                {/* Typing indicator */}
                                <div className="h-5 mb-2">
                                    {selectedConv &&
                                        getOtherParticipant(selectedConv)
                                            .online &&
                                        newMessage.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-0.5">
                                                    <span className="w-1 h-1 rounded-full bg-[#e5e7eb]/20 animate-bounce [animation-delay:0ms]" />
                                                    <span className="w-1 h-1 rounded-full bg-[#e5e7eb]/20 animate-bounce [animation-delay:150ms]" />
                                                    <span className="w-1 h-1 rounded-full bg-[#e5e7eb]/20 animate-bounce [animation-delay:300ms]" />
                                                </div>
                                                <span className="font-mono text-[8px] text-[#e5e7eb]/15 uppercase tracking-wider">
                                                    composing
                                                </span>
                                            </div>
                                        )}
                                </div>

                                <div className="flex items-end gap-3">
                                    {/* Attachment button */}
                                    <button className="shrink-0 w-9 h-9 rounded-lg border border-[#27272a] bg-[#18181b] flex items-center justify-center text-[#e5e7eb]/25 hover:text-[#e5e7eb]/50 hover:border-info/20 transition-all duration-200">
                                        <i className="fa-duotone fa-regular fa-paperclip text-sm" />
                                    </button>

                                    {/* Text input */}
                                    <div className="flex-1 relative">
                                        <textarea
                                            ref={inputRef}
                                            value={newMessage}
                                            onChange={(e) =>
                                                setNewMessage(e.target.value)
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
                                            className="w-full px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-sm text-[#e5e7eb] placeholder:text-[#e5e7eb]/15 focus:outline-none focus:border-info/30 transition-colors resize-none font-mono text-xs leading-relaxed"
                                            style={{
                                                minHeight: "40px",
                                                maxHeight: "120px",
                                            }}
                                        />
                                    </div>

                                    {/* Emoji */}
                                    <button className="shrink-0 w-9 h-9 rounded-lg border border-[#27272a] bg-[#18181b] flex items-center justify-center text-[#e5e7eb]/25 hover:text-warning hover:border-warning/20 transition-all duration-200">
                                        <i className="fa-duotone fa-regular fa-face-smile text-sm" />
                                    </button>

                                    {/* Send */}
                                    <button
                                        onClick={handleSend}
                                        disabled={!newMessage.trim()}
                                        className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                            newMessage.trim()
                                                ? "bg-info/15 border border-info/30 text-info hover:bg-info/25"
                                                : "border border-[#27272a] bg-[#18181b] text-[#e5e7eb]/15 cursor-not-allowed"
                                        }`}
                                    >
                                        <i className="fa-duotone fa-regular fa-paper-plane-top text-sm" />
                                    </button>
                                </div>

                                {/* Bottom helpers */}
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-3">
                                        <button className="font-mono text-[8px] text-[#e5e7eb]/15 uppercase tracking-wider hover:text-[#e5e7eb]/30 transition-colors">
                                            <i className="fa-duotone fa-regular fa-bold mr-1" />
                                            Format
                                        </button>
                                        <button className="font-mono text-[8px] text-[#e5e7eb]/15 uppercase tracking-wider hover:text-[#e5e7eb]/30 transition-colors">
                                            <i className="fa-duotone fa-regular fa-at mr-1" />
                                            Mention
                                        </button>
                                    </div>
                                    <span className="font-mono text-[8px] text-[#e5e7eb]/10">
                                        Enter to send | Shift+Enter for new line
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ── Empty State ────────────────────────────────── */
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center mx-auto mb-6">
                                    <i className="fa-duotone fa-regular fa-comments text-3xl text-[#e5e7eb]/10" />
                                </div>
                                <h3 className="font-bold text-lg text-[#e5e7eb]/30 mb-2">
                                    No conversation selected
                                </h3>
                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/15 max-w-xs mx-auto">
                                    Select a conversation from the sidebar or
                                    start a new message
                                </p>

                                {/* Quick stats */}
                                <div className="flex items-center justify-center gap-6 mt-8">
                                    <div className="text-center">
                                        <div className="font-mono text-2xl font-bold text-info/40">
                                            {conversations.length}
                                        </div>
                                        <div className="font-mono text-[8px] uppercase tracking-wider text-[#e5e7eb]/15">
                                            Conversations
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-[#27272a]" />
                                    <div className="text-center">
                                        <div className="font-mono text-2xl font-bold text-warning/40">
                                            {totalUnread}
                                        </div>
                                        <div className="font-mono text-[8px] uppercase tracking-wider text-[#e5e7eb]/15">
                                            Unread
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-[#27272a]" />
                                    <div className="text-center">
                                        <div className="font-mono text-2xl font-bold text-success/40">
                                            {
                                                Object.values(users).filter(
                                                    (u) =>
                                                        u.online &&
                                                        u.id !== "me",
                                                ).length
                                            }
                                        </div>
                                        <div className="font-mono text-[8px] uppercase tracking-wider text-[#e5e7eb]/15">
                                            Online
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
