"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Blueprint Design Tokens ────────────────────────────────────────────────
const BG_PRIMARY = "#0a0e17";
const BG_SECONDARY = "#0d1220";
const BG_TERTIARY = "#111827";
const BLUE = "#3b5ccc";
const TEAL = "#14b8a6";
const GREEN = "#22c55e";
const PURPLE = "#a78bfa";
const AMBER = "#eab308";
const TEXT_PRIMARY = "#c8ccd4";

// ─── Types ──────────────────────────────────────────────────────────────────

type UserRole = "recruiter" | "company" | "candidate" | "admin";

interface Participant {
    id: string;
    name: string;
    initials: string;
    role: UserRole;
    status: "online" | "away" | "offline";
}

interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
    read: boolean;
}

interface Conversation {
    id: string;
    participant: Participant;
    messages: Message[];
    subject: string;
    pinned: boolean;
    category: "direct" | "job" | "placement" | "system";
}

// ─── Role Config ────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; borderColor: string; bgColor: string; icon: string }> = {
    recruiter: {
        label: "RECRUITER",
        color: `text-[${BLUE}]`,
        borderColor: `border-[${BLUE}]/30`,
        bgColor: `bg-[${BLUE}]/10`,
        icon: "fa-duotone fa-regular fa-user-tie",
    },
    company: {
        label: "COMPANY",
        color: `text-[${TEAL}]`,
        borderColor: `border-[${TEAL}]/30`,
        bgColor: `bg-[${TEAL}]/10`,
        icon: "fa-duotone fa-regular fa-building",
    },
    candidate: {
        label: "CANDIDATE",
        color: `text-[${PURPLE}]`,
        borderColor: `border-[${PURPLE}]/30`,
        bgColor: `bg-[${PURPLE}]/10`,
        icon: "fa-duotone fa-regular fa-user",
    },
    admin: {
        label: "ADMIN",
        color: `text-[${AMBER}]`,
        borderColor: `border-[${AMBER}]/30`,
        bgColor: `bg-[${AMBER}]/10`,
        icon: "fa-duotone fa-regular fa-shield-check",
    },
};

// Hard-code Tailwind-safe classes for roles since dynamic template literals won't work
const ROLE_STYLES: Record<UserRole, { text: string; border: string; bg: string; dot: string; tagBg: string; tagBorder: string }> = {
    recruiter: {
        text: "text-[#3b5ccc]",
        border: "border-[#3b5ccc]/30",
        bg: "bg-[#3b5ccc]/10",
        dot: "bg-[#3b5ccc]",
        tagBg: "bg-[#3b5ccc]/5",
        tagBorder: "border-[#3b5ccc]/20",
    },
    company: {
        text: "text-[#14b8a6]",
        border: "border-[#14b8a6]/30",
        bg: "bg-[#14b8a6]/10",
        dot: "bg-[#14b8a6]",
        tagBg: "bg-[#14b8a6]/5",
        tagBorder: "border-[#14b8a6]/20",
    },
    candidate: {
        text: "text-[#a78bfa]",
        border: "border-[#a78bfa]/30",
        bg: "bg-[#a78bfa]/10",
        dot: "bg-[#a78bfa]",
        tagBg: "bg-[#a78bfa]/5",
        tagBorder: "border-[#a78bfa]/20",
    },
    admin: {
        text: "text-[#eab308]",
        border: "border-[#eab308]/30",
        bg: "bg-[#eab308]/10",
        dot: "bg-[#eab308]",
        tagBg: "bg-[#eab308]/5",
        tagBorder: "border-[#eab308]/20",
    },
};

const STATUS_COLORS: Record<string, string> = {
    online: "bg-[#22c55e]",
    away: "bg-[#eab308]",
    offline: "bg-[#c8ccd4]/30",
};

// ─── Mock Data ──────────────────────────────────────────────────────────────

const CURRENT_USER_ID = "self";

const mockConversations: Conversation[] = [
    {
        id: "conv-001",
        participant: {
            id: "user-001",
            name: "Marcus Rivera",
            initials: "MR",
            role: "recruiter",
            status: "online",
        },
        subject: "Re: Senior Engineer Pipeline",
        pinned: true,
        category: "job",
        messages: [
            {
                id: "msg-001a",
                senderId: "user-001",
                content: "Hey, I've got 3 strong candidates for the Senior Engineer role at TechCorp. Two are currently interviewing elsewhere so we need to move quickly.",
                timestamp: "2026-02-14T09:15:00Z",
                read: true,
            },
            {
                id: "msg-001b",
                senderId: CURRENT_USER_ID,
                content: "That's great news. Can you send over their profiles? I'll get them queued for the hiring manager review this afternoon.",
                timestamp: "2026-02-14T09:22:00Z",
                read: true,
            },
            {
                id: "msg-001c",
                senderId: "user-001",
                content: "Already uploaded to the ATS. Candidate IDs are #4821, #4822, and #4825. The last one has 8 years of distributed systems experience -- perfect fit.",
                timestamp: "2026-02-14T09:28:00Z",
                read: true,
            },
            {
                id: "msg-001d",
                senderId: CURRENT_USER_ID,
                content: "Perfect. I'll flag them for priority review. What's your read on salary expectations?",
                timestamp: "2026-02-14T09:35:00Z",
                read: true,
            },
            {
                id: "msg-001e",
                senderId: "user-001",
                content: "Two are in the $180-200K range. The senior one (#4825) is looking at $210-230K but worth every penny. She led the migration at Stripe.",
                timestamp: "2026-02-14T09:41:00Z",
                read: false,
            },
        ],
    },
    {
        id: "conv-002",
        participant: {
            id: "user-002",
            name: "Jennifer Thompson",
            initials: "JT",
            role: "company",
            status: "online",
        },
        subject: "VP Engineering Search Update",
        pinned: true,
        category: "placement",
        messages: [
            {
                id: "msg-002a",
                senderId: "user-002",
                content: "Just wanted to follow up on the VP of Engineering search. The board is meeting next week and they'd like to see at least 2 finalists.",
                timestamp: "2026-02-14T08:30:00Z",
                read: true,
            },
            {
                id: "msg-002b",
                senderId: CURRENT_USER_ID,
                content: "Understood. We have David Park and Sarah Chen both completing final rounds this week. I'll have detailed assessment reports ready by Thursday.",
                timestamp: "2026-02-14T08:45:00Z",
                read: true,
            },
            {
                id: "msg-002c",
                senderId: "user-002",
                content: "Excellent. Can you also include compensation benchmarks? We want to make sure our offer is competitive enough to close quickly.",
                timestamp: "2026-02-14T10:02:00Z",
                read: false,
            },
        ],
    },
    {
        id: "conv-003",
        participant: {
            id: "user-003",
            name: "Alex Nakamura",
            initials: "AN",
            role: "candidate",
            status: "away",
        },
        subject: "Interview Prep: Product Manager Role",
        pinned: false,
        category: "job",
        messages: [
            {
                id: "msg-003a",
                senderId: "user-003",
                content: "Hi, I received the interview schedule for the PM role at Meridian Labs. Quick question -- should I prepare a case study presentation for the panel round?",
                timestamp: "2026-02-13T16:20:00Z",
                read: true,
            },
            {
                id: "msg-003b",
                senderId: CURRENT_USER_ID,
                content: "Yes, definitely prepare a 15-minute case study. They love seeing structured problem-solving. Focus on a product you shipped from 0-to-1. I'll send you their evaluation rubric.",
                timestamp: "2026-02-13T16:45:00Z",
                read: true,
            },
            {
                id: "msg-003c",
                senderId: "user-003",
                content: "Thanks! I'll work on the mobile onboarding redesign case from my last role. That had clear metrics. Any other tips for their culture?",
                timestamp: "2026-02-13T17:10:00Z",
                read: true,
            },
        ],
    },
    {
        id: "conv-004",
        participant: {
            id: "user-004",
            name: "System Monitor",
            initials: "SM",
            role: "admin",
            status: "online",
        },
        subject: "Placement Alert: Fee Settlement",
        pinned: false,
        category: "system",
        messages: [
            {
                id: "msg-004a",
                senderId: "user-004",
                content: "AUTOMATED ALERT: Placement #PL-2847 confirmed. Split-fee settlement of $18,750 has been initiated. Payout ETA: 3 business days. Transaction ID: TXN-99421.",
                timestamp: "2026-02-14T07:00:00Z",
                read: true,
            },
            {
                id: "msg-004b",
                senderId: "user-004",
                content: "AUTOMATED ALERT: Invoice #INV-5523 generated for TechCorp placement fee. Total: $37,500 (50/50 split). View in billing dashboard.",
                timestamp: "2026-02-14T07:01:00Z",
                read: true,
            },
        ],
    },
    {
        id: "conv-005",
        participant: {
            id: "user-005",
            name: "Priya Deshmukh",
            initials: "PD",
            role: "recruiter",
            status: "offline",
        },
        subject: "New Niche: Healthcare AI",
        pinned: false,
        category: "direct",
        messages: [
            {
                id: "msg-005a",
                senderId: "user-005",
                content: "I've been building out a new pipeline in healthcare AI. Got 12 passive candidates sourced from the last conference. Want to co-work some of these roles?",
                timestamp: "2026-02-13T14:00:00Z",
                read: true,
            },
            {
                id: "msg-005b",
                senderId: CURRENT_USER_ID,
                content: "Absolutely -- we just picked up 3 healthcare AI companies this quarter. Let's sync on which candidates map to which roles. Free tomorrow at 2pm?",
                timestamp: "2026-02-13T14:30:00Z",
                read: true,
            },
            {
                id: "msg-005c",
                senderId: "user-005",
                content: "2pm works. I'll prepare a brief on each candidate with their specialization areas. Some have really interesting backgrounds in clinical NLP.",
                timestamp: "2026-02-13T15:00:00Z",
                read: true,
            },
        ],
    },
    {
        id: "conv-006",
        participant: {
            id: "user-006",
            name: "Daniel Okafor",
            initials: "DO",
            role: "company",
            status: "away",
        },
        subject: "Bulk Hiring: Engineering Team",
        pinned: false,
        category: "job",
        messages: [
            {
                id: "msg-006a",
                senderId: "user-006",
                content: "We just closed our Series B and need to scale the engineering team from 8 to 25 by Q3. Can the network handle that volume with quality?",
                timestamp: "2026-02-12T11:00:00Z",
                read: true,
            },
            {
                id: "msg-006b",
                senderId: CURRENT_USER_ID,
                content: "Congrats on the raise! We've handled similar ramps before. I'd recommend we break it into 3 waves: backend, frontend, then infrastructure. Let me put together a staffing plan.",
                timestamp: "2026-02-12T11:30:00Z",
                read: true,
            },
        ],
    },
    {
        id: "conv-007",
        participant: {
            id: "user-007",
            name: "Lisa Wang",
            initials: "LW",
            role: "candidate",
            status: "online",
        },
        subject: "Offer Discussion: Staff Engineer",
        pinned: false,
        category: "placement",
        messages: [
            {
                id: "msg-007a",
                senderId: CURRENT_USER_ID,
                content: "Great news -- Quantum Analytics wants to extend an offer for the Staff Engineer position! Base: $235K, RSUs: $120K/4yr, signing: $25K. What are your thoughts?",
                timestamp: "2026-02-14T11:00:00Z",
                read: true,
            },
            {
                id: "msg-007b",
                senderId: "user-007",
                content: "This is exciting! The base and RSUs look strong. I was hoping for a bit more on the signing bonus since I'm leaving unvested equity. Could we ask for $40K?",
                timestamp: "2026-02-14T11:15:00Z",
                read: false,
            },
        ],
    },
    {
        id: "conv-008",
        participant: {
            id: "user-008",
            name: "Ryan Kowalski",
            initials: "RK",
            role: "admin",
            status: "online",
        },
        subject: "Platform Update: v2.1 Release",
        pinned: false,
        category: "system",
        messages: [
            {
                id: "msg-008a",
                senderId: "user-008",
                content: "Platform update deployed. v2.1 includes: improved candidate matching algorithm (18% better precision), bulk actions in ATS, and real-time payout tracking. No downtime expected.",
                timestamp: "2026-02-14T06:00:00Z",
                read: true,
            },
        ],
    },
];

// ─── Utility Functions ──────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    if (isYesterday) {
        return "YESTERDAY";
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

function formatMessageTime(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function getUnreadCount(conv: Conversation): number {
    return conv.messages.filter((m) => !m.read && m.senderId !== CURRENT_USER_ID).length;
}

function getLastMessage(conv: Conversation): Message {
    return conv.messages[conv.messages.length - 1];
}

// ─── Category Config ────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; icon: string }> = {
    direct: { label: "DIRECT", icon: "fa-duotone fa-regular fa-message" },
    job: { label: "JOB", icon: "fa-duotone fa-regular fa-briefcase" },
    placement: { label: "PLACEMENT", icon: "fa-duotone fa-regular fa-circle-check" },
    system: { label: "SYSTEM", icon: "fa-duotone fa-regular fa-gear" },
};

// ─── Conversation List Item ─────────────────────────────────────────────────

function ConversationItem({
    conversation,
    isSelected,
    onClick,
}: {
    conversation: Conversation;
    isSelected: boolean;
    onClick: () => void;
}) {
    const p = conversation.participant;
    const roleStyle = ROLE_STYLES[p.role];
    const lastMsg = getLastMessage(conversation);
    const unread = getUnreadCount(conversation);
    const catConfig = CATEGORY_CONFIG[conversation.category];

    return (
        <div
            onClick={onClick}
            className={`msg-conv-item px-4 py-3.5 cursor-pointer group transition-colors border-b border-[#3b5ccc]/5 relative ${
                isSelected
                    ? "bg-[#3b5ccc]/[0.08] border-l-2 border-l-[#3b5ccc]"
                    : "hover:bg-[#0d1220]/80 border-l-2 border-l-transparent"
            }`}
        >
            {/* Top row: Avatar + Name + Time */}
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`w-9 h-9 border ${roleStyle.border} ${roleStyle.bg} flex items-center justify-center flex-shrink-0 relative`}>
                    <span className={`font-mono text-[10px] font-bold ${roleStyle.text}`}>
                        {p.initials}
                    </span>
                    {/* Status dot */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${STATUS_COLORS[p.status]} border-2 border-[#0a0e17]`}></div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                            {conversation.pinned && (
                                <i className="fa-duotone fa-regular fa-thumbtack text-[8px] text-[#3b5ccc]/40 flex-shrink-0"></i>
                            )}
                            <span className={`text-sm font-medium truncate ${unread > 0 ? "text-white" : "text-[#c8ccd4]/80"}`}>
                                {p.name}
                            </span>
                            <span className={`font-mono text-[8px] tracking-wider ${roleStyle.text} opacity-60 flex-shrink-0`}>
                                [{ROLE_CONFIG[p.role].label}]
                            </span>
                        </div>
                        <span className="font-mono text-[9px] text-[#c8ccd4]/25 flex-shrink-0">
                            {formatTimestamp(lastMsg.timestamp)}
                        </span>
                    </div>

                    {/* Subject */}
                    <div className="flex items-center gap-1.5 mb-1">
                        <i className={`${catConfig.icon} text-[8px] text-[#3b5ccc]/30`}></i>
                        <span className="font-mono text-[9px] text-[#3b5ccc]/40 tracking-wider truncate">
                            {conversation.subject}
                        </span>
                    </div>

                    {/* Preview + Unread badge */}
                    <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate leading-relaxed ${unread > 0 ? "text-[#c8ccd4]/60" : "text-[#c8ccd4]/30"}`}>
                            {lastMsg.senderId === CURRENT_USER_ID && (
                                <span className="font-mono text-[#3b5ccc]/40 mr-1">&gt;</span>
                            )}
                            {lastMsg.content.length > 70 ? lastMsg.content.slice(0, 70) + "..." : lastMsg.content}
                        </p>
                        {unread > 0 && (
                            <span className="flex-shrink-0 w-5 h-5 bg-[#3b5ccc] flex items-center justify-center font-mono text-[9px] text-white font-bold">
                                {unread}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Message Bubble ─────────────────────────────────────────────────────────

function MessageBubble({
    message,
    participant,
    showAvatar,
}: {
    message: Message;
    participant: Participant;
    showAvatar: boolean;
}) {
    const isSelf = message.senderId === CURRENT_USER_ID;
    const roleStyle = ROLE_STYLES[participant.role];

    if (isSelf) {
        return (
            <div className="msg-bubble flex justify-end mb-3">
                <div className="max-w-[75%]">
                    <div className="bg-[#3b5ccc]/15 border border-[#3b5ccc]/20 px-4 py-3 relative">
                        {/* Sender tag */}
                        <div className="flex items-center justify-between gap-4 mb-1.5">
                            <span className="font-mono text-[9px] text-[#3b5ccc]/50 tracking-wider">
                                YOU
                            </span>
                            <span className="font-mono text-[9px] text-[#c8ccd4]/20">
                                {formatMessageTime(message.timestamp)}
                            </span>
                        </div>
                        <p className="text-sm text-[#c8ccd4]/80 leading-relaxed">
                            {message.content}
                        </p>
                        {/* Read indicator */}
                        <div className="flex justify-end mt-1.5">
                            <i className={`fa-duotone fa-regular fa-check-double text-[9px] ${message.read ? "text-[#3b5ccc]/60" : "text-[#c8ccd4]/20"}`}></i>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="msg-bubble flex items-start gap-3 mb-3">
            {/* Avatar */}
            <div className={`w-8 h-8 border ${roleStyle.border} ${roleStyle.bg} flex items-center justify-center flex-shrink-0 ${showAvatar ? "visible" : "invisible"}`}>
                <span className={`font-mono text-[9px] font-bold ${roleStyle.text}`}>
                    {participant.initials}
                </span>
            </div>

            {/* Message */}
            <div className="max-w-[75%]">
                <div className={`border ${roleStyle.border} bg-[${BG_SECONDARY}] px-4 py-3`} style={{ backgroundColor: BG_SECONDARY }}>
                    {/* Sender tag */}
                    <div className="flex items-center justify-between gap-4 mb-1.5">
                        <div className="flex items-center gap-2">
                            <span className={`font-mono text-[9px] tracking-wider ${roleStyle.text}`}>
                                {participant.name.toUpperCase()}
                            </span>
                            <span className={`font-mono text-[7px] tracking-wider ${roleStyle.text} opacity-40`}>
                                [{ROLE_CONFIG[participant.role].label}]
                            </span>
                        </div>
                        <span className="font-mono text-[9px] text-[#c8ccd4]/20">
                            {formatMessageTime(message.timestamp)}
                        </span>
                    </div>
                    <p className="text-sm text-[#c8ccd4]/70 leading-relaxed">
                        {message.content}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── Thread View ────────────────────────────────────────────────────────────

function ThreadView({
    conversation,
    onBack,
    onSend,
}: {
    conversation: Conversation;
    onBack: () => void;
    onSend: (convId: string, text: string) => void;
}) {
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const threadRef = useRef<HTMLDivElement>(null);
    const p = conversation.participant;
    const roleStyle = ROLE_STYLES[p.role];

    // Auto-scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [conversation.messages.length]);

    // Animate messages on conversation change
    useEffect(() => {
        if (!threadRef.current) return;
        const bubbles = threadRef.current.querySelectorAll(".msg-bubble");
        gsap.fromTo(
            bubbles,
            { opacity: 0, y: 15 },
            {
                opacity: 1,
                y: 0,
                duration: 0.3,
                ease: "power3.out",
                stagger: 0.05,
            },
        );
    }, [conversation.id]);

    const handleSend = useCallback(() => {
        const text = inputText.trim();
        if (!text) return;
        onSend(conversation.id, text);
        setInputText("");
    }, [inputText, conversation.id, onSend]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend],
    );

    // Group consecutive messages from same sender
    const shouldShowAvatar = (idx: number): boolean => {
        if (idx === 0) return true;
        return conversation.messages[idx].senderId !== conversation.messages[idx - 1].senderId;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Thread Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#3b5ccc]/10 bg-[#0a0e17] flex-shrink-0">
                <div className="flex items-center gap-3">
                    {/* Back button (mobile) */}
                    <button
                        onClick={onBack}
                        className="lg:hidden w-8 h-8 border border-[#3b5ccc]/20 flex items-center justify-center text-[#c8ccd4]/40 hover:text-white transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left text-xs"></i>
                    </button>

                    {/* Avatar */}
                    <div className={`w-10 h-10 border ${roleStyle.border} ${roleStyle.bg} flex items-center justify-center relative`}>
                        <span className={`font-mono text-xs font-bold ${roleStyle.text}`}>
                            {p.initials}
                        </span>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${STATUS_COLORS[p.status]} border-2 border-[#0a0e17]`}></div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{p.name}</span>
                            <span className={`font-mono text-[8px] tracking-wider ${roleStyle.text}`}>
                                [{ROLE_CONFIG[p.role].label}]
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`font-mono text-[9px] ${p.status === "online" ? "text-[#22c55e]/60" : p.status === "away" ? "text-[#eab308]/60" : "text-[#c8ccd4]/20"}`}>
                                {p.status.toUpperCase()}
                            </span>
                            <span className="font-mono text-[9px] text-[#c8ccd4]/15">|</span>
                            <span className="font-mono text-[9px] text-[#c8ccd4]/25 truncate">
                                {conversation.subject}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thread actions */}
                <div className="flex items-center gap-1">
                    <button className="w-8 h-8 border border-[#3b5ccc]/10 flex items-center justify-center text-[#c8ccd4]/20 hover:text-[#c8ccd4]/50 hover:border-[#3b5ccc]/30 transition-colors">
                        <i className="fa-duotone fa-regular fa-phone text-xs"></i>
                    </button>
                    <button className="w-8 h-8 border border-[#3b5ccc]/10 flex items-center justify-center text-[#c8ccd4]/20 hover:text-[#c8ccd4]/50 hover:border-[#3b5ccc]/30 transition-colors">
                        <i className="fa-duotone fa-regular fa-video text-xs"></i>
                    </button>
                    <button className="w-8 h-8 border border-[#3b5ccc]/10 flex items-center justify-center text-[#c8ccd4]/20 hover:text-[#c8ccd4]/50 hover:border-[#3b5ccc]/30 transition-colors">
                        <i className="fa-duotone fa-regular fa-ellipsis-vertical text-xs"></i>
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={threadRef}
                className="flex-1 overflow-y-auto px-5 py-4 bp-scrollbar"
                style={{ backgroundColor: BG_PRIMARY }}
            >
                {/* Thread context banner */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#3b5ccc]/10">
                        <i className={`${CATEGORY_CONFIG[conversation.category].icon} text-[9px] text-[#3b5ccc]/30`}></i>
                        <span className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-wider">
                            {conversation.subject.toUpperCase()} // {CATEGORY_CONFIG[conversation.category].label}
                        </span>
                    </div>
                </div>

                {/* Messages */}
                {conversation.messages.map((msg, idx) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        participant={msg.senderId === CURRENT_USER_ID ? { id: CURRENT_USER_ID, name: "You", initials: "YU", role: "admin", status: "online" } : p}
                        showAvatar={shouldShowAvatar(idx)}
                    />
                ))}

                <div ref={messagesEndRef} />
            </div>

            {/* Compose Area */}
            <div className="flex-shrink-0 border-t border-[#3b5ccc]/10 px-4 py-3" style={{ backgroundColor: BG_SECONDARY }}>
                {/* Typing indicator area */}
                <div className="flex items-center gap-3">
                    {/* Attachment button */}
                    <button className="w-9 h-9 border border-[#3b5ccc]/15 flex items-center justify-center text-[#c8ccd4]/20 hover:text-[#3b5ccc] hover:border-[#3b5ccc]/30 transition-colors flex-shrink-0">
                        <i className="fa-duotone fa-regular fa-paperclip text-sm"></i>
                    </button>

                    {/* Input */}
                    <div className="flex-1 relative">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="TYPE_MESSAGE..."
                            rows={1}
                            className="w-full bg-[#0a0e17] border border-[#3b5ccc]/15 text-[#c8ccd4] px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-[#3b5ccc]/40 transition-colors resize-none placeholder:text-[#c8ccd4]/15 tracking-wider"
                        />
                    </div>

                    {/* Send button */}
                    <button
                        onClick={handleSend}
                        className={`w-9 h-9 flex items-center justify-center flex-shrink-0 transition-colors border ${
                            inputText.trim()
                                ? "bg-[#3b5ccc] border-[#3b5ccc] text-white hover:bg-[#3b5ccc]/90"
                                : "border-[#3b5ccc]/15 text-[#c8ccd4]/20"
                        }`}
                    >
                        <i className="fa-duotone fa-regular fa-paper-plane text-sm"></i>
                    </button>
                </div>

                {/* Hint */}
                <div className="flex items-center justify-between mt-2 font-mono text-[9px] text-[#c8ccd4]/15">
                    <span>ENTER TO SEND // SHIFT+ENTER FOR NEW LINE</span>
                    <span>{inputText.length > 0 ? `${inputText.length} CHARS` : ""}</span>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MessagesSevenPage() {
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedConversation = conversations.find((c) => c.id === selectedConvId) || null;

    // Filter conversations
    const filteredConversations = conversations
        .filter((conv) => {
            const matchesSearch =
                !searchQuery ||
                conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                conv.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = categoryFilter === "all" || conv.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            // Pinned first, then by last message timestamp
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            const aTime = new Date(getLastMessage(a).timestamp).getTime();
            const bTime = new Date(getLastMessage(b).timestamp).getTime();
            return bTime - aTime;
        });

    // Handle sending a message
    const handleSend = useCallback((convId: string, text: string) => {
        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === convId
                    ? {
                          ...conv,
                          messages: [
                              ...conv.messages,
                              {
                                  id: `msg-new-${Date.now()}`,
                                  senderId: CURRENT_USER_ID,
                                  content: text,
                                  timestamp: new Date().toISOString(),
                                  read: false,
                              },
                          ],
                      }
                    : conv,
            ),
        );
    }, []);

    // Mark messages as read when selecting conversation
    useEffect(() => {
        if (!selectedConvId) return;
        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === selectedConvId
                    ? {
                          ...conv,
                          messages: conv.messages.map((m) => ({ ...m, read: true })),
                      }
                    : conv,
            ),
        );
    }, [selectedConvId]);

    // Total unread count
    const totalUnread = conversations.reduce((sum, c) => sum + getUnreadCount(c), 0);

    // Boot animation
    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                ".msg-header-ref",
                { opacity: 0 },
                { opacity: 1, duration: 0.25 },
            );
            tl.fromTo(
                ".msg-page-title",
                { opacity: 0, clipPath: "inset(0 100% 0 0)" },
                { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 },
                "-=0.1",
            );
            tl.fromTo(
                ".msg-controls",
                { opacity: 0, y: -10 },
                { opacity: 1, y: 0, duration: 0.4 },
                "-=0.3",
            );
            tl.fromTo(
                ".msg-main-panel",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 },
                "-=0.2",
            );

            // Stagger conversation items
            tl.fromTo(
                ".msg-conv-item",
                { opacity: 0, x: -15 },
                { opacity: 1, x: 0, duration: 0.3, stagger: 0.04 },
                "-=0.3",
            );

            // Pulse dot
            gsap.to(".msg-pulse-dot", {
                opacity: 0.3,
                duration: 1,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
        },
        { scope: containerRef },
    );

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image:
                        linear-gradient(rgba(59, 92, 204, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 92, 204, 0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
                .bp-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .bp-scrollbar::-webkit-scrollbar-track {
                    background: #0a0e17;
                }
                .bp-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(59, 92, 204, 0.3);
                }
                .bp-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(59, 92, 204, 0.5);
                }
            `}</style>

            <div
                ref={containerRef}
                className="min-h-screen bg-[#0a0e17] text-[#c8ccd4] relative"
            >
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04] pointer-events-none"></div>

                {/* ─── Page Header ─────────────────────────────────────── */}
                <header className="relative z-10 border-b border-[#3b5ccc]/10">
                    <div className="container mx-auto px-4 py-5">
                        {/* Top refs */}
                        <div className="msg-header-ref flex justify-between items-center mb-4 opacity-0">
                            <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">
                                REF: SN-MSG07-2026
                            </div>
                            <div className="flex items-center gap-4 font-mono text-[10px] text-[#c8ccd4]/30">
                                <span>
                                    THREADS: {conversations.length}
                                </span>
                                {totalUnread > 0 && (
                                    <span className="text-[#3b5ccc]">
                                        UNREAD: {totalUnread}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[#22c55e] msg-pulse-dot"></span>
                                    CONNECTED
                                </span>
                            </div>
                        </div>

                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <h1 className="msg-page-title text-3xl md:text-4xl font-bold text-white mb-1 opacity-0">
                                    Message{" "}
                                    <span className="text-[#3b5ccc]">Terminal</span>
                                </h1>
                                <p className="font-mono text-xs text-[#c8ccd4]/30 tracking-wider">
                                    // SECURE COMMUNICATIONS INTERFACE
                                </p>
                            </div>

                            {/* Compose new button */}
                            <button className="msg-controls opacity-0 px-5 py-2.5 bg-[#3b5ccc] text-white font-mono text-xs tracking-wider hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc] flex items-center gap-2 flex-shrink-0">
                                <i className="fa-duotone fa-regular fa-pen-to-square text-[10px]"></i>
                                NEW_MESSAGE
                            </button>
                        </div>
                    </div>
                </header>

                {/* ─── Main Content ───────────────────────────────────── */}
                <div className="msg-main-panel opacity-0 relative z-10">
                    <div className="container mx-auto px-4 py-4">
                        <div className="border border-[#3b5ccc]/15 flex" style={{ height: "calc(100vh - 180px)" }}>
                            {/* ═══ Left Panel: Conversation List ═══ */}
                            <div className={`flex flex-col border-r border-[#3b5ccc]/10 ${selectedConvId ? "hidden lg:flex" : "flex"} w-full lg:w-[380px] flex-shrink-0`}>
                                {/* Search + Filter Bar */}
                                <div className="px-3 py-3 border-b border-[#3b5ccc]/10 flex-shrink-0" style={{ backgroundColor: BG_SECONDARY }}>
                                    {/* Search */}
                                    <div className="relative mb-2.5">
                                        <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#3b5ccc]/30 text-xs"></i>
                                        <input
                                            type="text"
                                            placeholder="SEARCH_MESSAGES..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-[#0a0e17] border border-[#3b5ccc]/15 text-[#c8ccd4] font-mono text-xs pl-9 pr-4 py-2 focus:outline-none focus:border-[#3b5ccc]/40 placeholder:text-[#c8ccd4]/15 tracking-wider"
                                        />
                                    </div>

                                    {/* Category filters */}
                                    <div className="flex gap-px">
                                        <button
                                            onClick={() => setCategoryFilter("all")}
                                            className={`flex-1 px-2 py-1.5 font-mono text-[9px] tracking-wider transition-colors ${
                                                categoryFilter === "all"
                                                    ? "bg-[#3b5ccc] text-white"
                                                    : "bg-[#0a0e17] text-[#c8ccd4]/30 hover:text-[#c8ccd4]/50"
                                            }`}
                                        >
                                            ALL
                                        </button>
                                        {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
                                            <button
                                                key={key}
                                                onClick={() => setCategoryFilter(key)}
                                                className={`flex-1 px-2 py-1.5 font-mono text-[9px] tracking-wider transition-colors flex items-center justify-center gap-1 ${
                                                    categoryFilter === key
                                                        ? "bg-[#3b5ccc] text-white"
                                                        : "bg-[#0a0e17] text-[#c8ccd4]/30 hover:text-[#c8ccd4]/50"
                                                }`}
                                            >
                                                <i className={`${val.icon} text-[8px]`}></i>
                                                {val.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Conversations list */}
                                <div className="flex-1 overflow-y-auto bp-scrollbar" style={{ backgroundColor: BG_PRIMARY }}>
                                    {filteredConversations.length > 0 ? (
                                        filteredConversations.map((conv) => (
                                            <ConversationItem
                                                key={conv.id}
                                                conversation={conv}
                                                isSelected={selectedConvId === conv.id}
                                                onClick={() => setSelectedConvId(conv.id)}
                                            />
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center px-6">
                                                <div className="w-12 h-12 border border-[#3b5ccc]/15 flex items-center justify-center mx-auto mb-3">
                                                    <i className="fa-duotone fa-regular fa-inbox text-[#3b5ccc]/20 text-lg"></i>
                                                </div>
                                                <div className="font-mono text-[10px] text-[#c8ccd4]/20 tracking-widest">
                                                    // NO MATCHING THREADS
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* List footer stats */}
                                <div className="px-3 py-2 border-t border-[#3b5ccc]/10 flex items-center justify-between font-mono text-[9px] text-[#c8ccd4]/15 flex-shrink-0" style={{ backgroundColor: BG_SECONDARY }}>
                                    <span>
                                        SHOWING: {filteredConversations.length}/{conversations.length}
                                    </span>
                                    <span>
                                        {filteredConversations.reduce((s, c) => s + c.messages.length, 0)} MESSAGES
                                    </span>
                                </div>
                            </div>

                            {/* ═══ Right Panel: Thread View ═══ */}
                            <div className={`flex-1 ${!selectedConvId ? "hidden lg:flex" : "flex"} flex-col`}>
                                {selectedConversation ? (
                                    <ThreadView
                                        conversation={selectedConversation}
                                        onBack={() => setSelectedConvId(null)}
                                        onSend={handleSend}
                                    />
                                ) : (
                                    /* Empty State */
                                    <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: BG_PRIMARY }}>
                                        <div className="text-center">
                                            {/* Terminal icon */}
                                            <div className="w-20 h-20 border border-[#3b5ccc]/15 flex items-center justify-center mx-auto mb-6 relative">
                                                <i className="fa-duotone fa-regular fa-terminal text-[#3b5ccc]/20 text-2xl"></i>
                                                {/* Corner ticks */}
                                                <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-[#3b5ccc]/20"></div>
                                                <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-[#3b5ccc]/20"></div>
                                                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-[#3b5ccc]/20"></div>
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-[#3b5ccc]/20"></div>
                                            </div>

                                            <div className="font-mono text-sm text-[#c8ccd4]/30 tracking-wider mb-2">
                                                SELECT A THREAD
                                            </div>
                                            <div className="font-mono text-[10px] text-[#c8ccd4]/15 tracking-wider">
                                                // CHOOSE A CONVERSATION FROM THE LEFT PANEL
                                            </div>

                                            {/* Decorative divider */}
                                            <div className="mt-8 h-px bg-[#3b5ccc]/10 max-w-[200px] mx-auto relative">
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border border-[#3b5ccc]/20 rotate-45"></div>
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border border-[#3b5ccc]/20 rotate-45"></div>
                                            </div>

                                            {/* Quick stats */}
                                            <div className="mt-8 flex items-center justify-center gap-6 font-mono text-[9px] text-[#c8ccd4]/15">
                                                <div className="text-center">
                                                    <div className="text-[#3b5ccc]/40 text-lg font-bold mb-0.5">{conversations.length}</div>
                                                    <div>THREADS</div>
                                                </div>
                                                <div className="w-px h-8 bg-[#3b5ccc]/10"></div>
                                                <div className="text-center">
                                                    <div className="text-[#3b5ccc]/40 text-lg font-bold mb-0.5">
                                                        {conversations.reduce((s, c) => s + c.messages.length, 0)}
                                                    </div>
                                                    <div>MESSAGES</div>
                                                </div>
                                                <div className="w-px h-8 bg-[#3b5ccc]/10"></div>
                                                <div className="text-center">
                                                    <div className="text-[#22c55e]/40 text-lg font-bold mb-0.5">
                                                        {conversations.filter((c) => c.participant.status === "online").length}
                                                    </div>
                                                    <div>ONLINE</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Footer Status Bar ───────────────────────────────── */}
                <footer className="relative z-10 border-t border-[#3b5ccc]/10">
                    <div className="container mx-auto px-4 py-2.5 flex items-center justify-between font-mono text-[10px] text-[#c8ccd4]/20">
                        <div className="flex items-center gap-4">
                            <span>PROTOCOL: ENCRYPTED</span>
                            <span>LATENCY: 12ms</span>
                            {selectedConversation && (
                                <span className="text-[#3b5ccc]/40">
                                    ACTIVE: {selectedConversation.participant.name.toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="tracking-widest">
                            EMPLOYMENT NETWORKS INC. // MSG-TERMINAL v2.1
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
