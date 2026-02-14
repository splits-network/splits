"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin();
}

// ─── Animation constants ────────────────────────────────────────────────────
const D = { fast: 0.3, normal: 0.5, hero: 0.8, build: 0.6 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)", elastic: "elastic.out(1, 0.5)" };
const S = { tight: 0.04, normal: 0.08, loose: 0.12 };

// ─── Color palette (Blueprint Construction) ─────────────────────────────────
const BG = {
    deep: "#0a1628",
    mid: "#0d1d33",
    card: "#0f2847",
    dark: "#081220",
    input: "#0b1a2e",
};

const ROLE_STYLES: Record<string, { color: string; bg: string; border: string; icon: string; label: string }> = {
    recruiter: {
        color: "#22d3ee",
        bg: "rgba(34,211,238,0.08)",
        border: "rgba(34,211,238,0.25)",
        icon: "fa-duotone fa-regular fa-hard-hat",
        label: "Recruiter",
    },
    company: {
        color: "#a78bfa",
        bg: "rgba(167,139,250,0.08)",
        border: "rgba(167,139,250,0.25)",
        icon: "fa-duotone fa-regular fa-compass-drafting",
        label: "Company",
    },
    candidate: {
        color: "#34d399",
        bg: "rgba(52,211,153,0.08)",
        border: "rgba(52,211,153,0.25)",
        icon: "fa-duotone fa-regular fa-user-helmet-safety",
        label: "Candidate",
    },
    admin: {
        color: "#fb923c",
        bg: "rgba(251,146,60,0.08)",
        border: "rgba(251,146,60,0.25)",
        icon: "fa-duotone fa-regular fa-shield-halved",
        label: "Admin",
    },
};

// ─── Mock Data ───────────────────────────────────────────────────────────────

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    read: boolean;
}

interface Conversation {
    id: string;
    contactName: string;
    contactRole: keyof typeof ROLE_STYLES;
    contactAvatar: string;
    lastMessage: string;
    lastTimestamp: string;
    unreadCount: number;
    online: boolean;
    messages: Message[];
}

const CURRENT_USER_ID = "me";

const conversations: Conversation[] = [
    {
        id: "conv-1",
        contactName: "Sarah Chen",
        contactRole: "recruiter",
        contactAvatar: "SC",
        lastMessage: "I have 3 strong candidates ready for the Senior Engineer role.",
        lastTimestamp: "2 min ago",
        unreadCount: 3,
        online: true,
        messages: [
            { id: "m1", senderId: "sarah", text: "Hi! I saw your Senior Engineer posting on the marketplace.", timestamp: "10:15 AM", read: true },
            { id: "m2", senderId: CURRENT_USER_ID, text: "Hey Sarah! Yes, we are actively looking to fill that position. Do you have candidates in mind?", timestamp: "10:18 AM", read: true },
            { id: "m3", senderId: "sarah", text: "Absolutely. I specialize in backend engineers with distributed systems experience.", timestamp: "10:20 AM", read: true },
            { id: "m4", senderId: CURRENT_USER_ID, text: "That is exactly what we need. What kind of split are you looking at?", timestamp: "10:22 AM", read: true },
            { id: "m5", senderId: "sarah", text: "Standard 50/50 works for me. I have placed 12 engineers this quarter alone.", timestamp: "10:24 AM", read: true },
            { id: "m6", senderId: CURRENT_USER_ID, text: "Impressive track record. Let us set up a call to discuss the specifics.", timestamp: "10:26 AM", read: true },
            { id: "m7", senderId: "sarah", text: "I have 3 strong candidates ready for the Senior Engineer role.", timestamp: "10:30 AM", read: false },
        ],
    },
    {
        id: "conv-2",
        contactName: "Marcus Webb",
        contactRole: "company",
        contactAvatar: "MW",
        lastMessage: "Can we schedule a pipeline review for Thursday?",
        lastTimestamp: "15 min ago",
        unreadCount: 1,
        online: true,
        messages: [
            { id: "m1", senderId: "marcus", text: "Good morning! Quick update on the DevOps position.", timestamp: "9:00 AM", read: true },
            { id: "m2", senderId: CURRENT_USER_ID, text: "Morning Marcus. How is the search going?", timestamp: "9:05 AM", read: true },
            { id: "m3", senderId: "marcus", text: "We have narrowed it down to 4 finalists from your submissions.", timestamp: "9:08 AM", read: true },
            { id: "m4", senderId: CURRENT_USER_ID, text: "Great to hear. Any standouts from the batch?", timestamp: "9:10 AM", read: true },
            { id: "m5", senderId: "marcus", text: "The candidate with AWS and Kubernetes experience is leading. Can we schedule a pipeline review for Thursday?", timestamp: "9:45 AM", read: false },
        ],
    },
    {
        id: "conv-3",
        contactName: "Priya Patel",
        contactRole: "candidate",
        contactAvatar: "PP",
        lastMessage: "Thank you for the interview prep materials! Very helpful.",
        lastTimestamp: "1 hr ago",
        unreadCount: 0,
        online: false,
        messages: [
            { id: "m1", senderId: CURRENT_USER_ID, text: "Hi Priya, congratulations on making it to the final round at TechCorp!", timestamp: "Yesterday", read: true },
            { id: "m2", senderId: "priya", text: "Thank you! I am a bit nervous. Any tips for the system design round?", timestamp: "Yesterday", read: true },
            { id: "m3", senderId: CURRENT_USER_ID, text: "I have sent you some prep materials. Focus on scalability patterns and trade-off discussions.", timestamp: "Yesterday", read: true },
            { id: "m4", senderId: "priya", text: "Thank you for the interview prep materials! Very helpful.", timestamp: "8:30 AM", read: true },
        ],
    },
    {
        id: "conv-4",
        contactName: "James Holloway",
        contactRole: "admin",
        contactAvatar: "JH",
        lastMessage: "Your account has been upgraded to Pro tier. New features are now active.",
        lastTimestamp: "3 hrs ago",
        unreadCount: 0,
        online: true,
        messages: [
            { id: "m1", senderId: "james", text: "Hi there! I noticed you have been hitting some rate limits on the API.", timestamp: "Yesterday", read: true },
            { id: "m2", senderId: CURRENT_USER_ID, text: "Yes, we have been scaling up our recruiter network and need higher limits.", timestamp: "Yesterday", read: true },
            { id: "m3", senderId: "james", text: "I can upgrade your account to Pro tier which includes 10x the API quota and priority support.", timestamp: "Yesterday", read: true },
            { id: "m4", senderId: CURRENT_USER_ID, text: "That would be great. How do we proceed?", timestamp: "Yesterday", read: true },
            { id: "m5", senderId: "james", text: "Your account has been upgraded to Pro tier. New features are now active.", timestamp: "6:00 AM", read: true },
        ],
    },
    {
        id: "conv-5",
        contactName: "Elena Vasquez",
        contactRole: "recruiter",
        contactAvatar: "EV",
        lastMessage: "The placement for DataFlow Inc went through. Fee split processed!",
        lastTimestamp: "5 hrs ago",
        unreadCount: 0,
        online: false,
        messages: [
            { id: "m1", senderId: "elena", text: "Great news! DataFlow Inc accepted our candidate for the ML Engineer position.", timestamp: "Yesterday", read: true },
            { id: "m2", senderId: CURRENT_USER_ID, text: "Fantastic! That was a tough one to fill. Congrats on the placement.", timestamp: "Yesterday", read: true },
            { id: "m3", senderId: "elena", text: "Agreed. The 60/40 split we negotiated worked out well for both of us.", timestamp: "Yesterday", read: true },
            { id: "m4", senderId: CURRENT_USER_ID, text: "Looking forward to collaborating again. Do you have bandwidth for more roles?", timestamp: "Yesterday", read: true },
            { id: "m5", senderId: "elena", text: "The placement for DataFlow Inc went through. Fee split processed!", timestamp: "4:15 AM", read: true },
        ],
    },
    {
        id: "conv-6",
        contactName: "David Kim",
        contactRole: "company",
        contactAvatar: "DK",
        lastMessage: "We need to fill 5 new positions by end of Q1. Sending JDs now.",
        lastTimestamp: "Yesterday",
        unreadCount: 2,
        online: false,
        messages: [
            { id: "m1", senderId: "david", text: "Hey, our engineering team is expanding rapidly. We need help staffing up.", timestamp: "Yesterday", read: true },
            { id: "m2", senderId: CURRENT_USER_ID, text: "Happy to help. What roles are you looking to fill?", timestamp: "Yesterday", read: true },
            { id: "m3", senderId: "david", text: "2 Frontend Engineers, 2 Backend Engineers, and 1 Engineering Manager.", timestamp: "Yesterday", read: false },
            { id: "m4", senderId: "david", text: "We need to fill 5 new positions by end of Q1. Sending JDs now.", timestamp: "Yesterday", read: false },
        ],
    },
    {
        id: "conv-7",
        contactName: "Amara Osei",
        contactRole: "candidate",
        contactAvatar: "AO",
        lastMessage: "Just accepted the offer! Starting March 1st.",
        lastTimestamp: "Yesterday",
        unreadCount: 0,
        online: false,
        messages: [
            { id: "m1", senderId: CURRENT_USER_ID, text: "Amara, I have excellent news. NexGen has extended an offer!", timestamp: "2 days ago", read: true },
            { id: "m2", senderId: "amara", text: "Oh my gosh, really?! What are the details?", timestamp: "2 days ago", read: true },
            { id: "m3", senderId: CURRENT_USER_ID, text: "Senior Product Designer, $145K base + equity. Full remote. Offer letter is in your portal.", timestamp: "2 days ago", read: true },
            { id: "m4", senderId: "amara", text: "This is incredible. Let me review it tonight.", timestamp: "2 days ago", read: true },
            { id: "m5", senderId: "amara", text: "Just accepted the offer! Starting March 1st.", timestamp: "Yesterday", read: true },
        ],
    },
    {
        id: "conv-8",
        contactName: "Tom Bradley",
        contactRole: "recruiter",
        contactAvatar: "TB",
        lastMessage: "Shared my candidate pipeline spreadsheet in the documents section.",
        lastTimestamp: "2 days ago",
        unreadCount: 0,
        online: false,
        messages: [
            { id: "m1", senderId: "tom", text: "Hey, I am interested in collaborating on some of your open roles.", timestamp: "3 days ago", read: true },
            { id: "m2", senderId: CURRENT_USER_ID, text: "Sure Tom. What verticals do you specialize in?", timestamp: "3 days ago", read: true },
            { id: "m3", senderId: "tom", text: "Healthcare IT and fintech primarily. 8 years of experience.", timestamp: "3 days ago", read: true },
            { id: "m4", senderId: "tom", text: "Shared my candidate pipeline spreadsheet in the documents section.", timestamp: "2 days ago", read: true },
        ],
    },
];

// ─── Page Component ─────────────────────────────────────────────────────────

export default function MessagesEightPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageListRef = useRef<HTMLDivElement>(null);

    const [selectedConvId, setSelectedConvId] = useState<string>("conv-1");
    const [searchQuery, setSearchQuery] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [convData, setConvData] = useState(conversations);
    const [mobileShowThread, setMobileShowThread] = useState(false);
    const [filterRole, setFilterRole] = useState<string>("all");

    const selectedConv = convData.find((c) => c.id === selectedConvId);

    // Scroll to bottom when conversation changes or new message
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedConvId, convData]);

    // Animate new messages
    const animateNewMessage = () => {
        if (!messageListRef.current) return;
        const messages = messageListRef.current.querySelectorAll(".bp-msg-bubble");
        const lastMsg = messages[messages.length - 1];
        if (lastMsg) {
            gsap.fromTo(
                lastMsg,
                { opacity: 0, y: 20, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: D.fast, ease: E.bounce },
            );
        }
    };

    // GSAP initial animations
    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            // Header
            const headerTl = gsap.timeline({ defaults: { ease: E.smooth } });
            headerTl.fromTo(
                $1(".bp-msg-header"),
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: D.normal },
            );

            // Sidebar
            gsap.fromTo(
                $1(".bp-msg-sidebar"),
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: D.build, ease: E.smooth, delay: 0.15 },
            );

            // Conversation items stagger in
            gsap.fromTo(
                $(".bp-conv-item"),
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: D.fast, ease: E.smooth, stagger: S.tight, delay: 0.3 },
            );

            // Thread panel
            gsap.fromTo(
                $1(".bp-msg-thread"),
                { opacity: 0, x: 30 },
                { opacity: 1, x: 0, duration: D.build, ease: E.smooth, delay: 0.2 },
            );

            // Messages stagger in
            gsap.fromTo(
                $(".bp-msg-bubble"),
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: D.fast, ease: E.smooth, stagger: S.tight, delay: 0.4 },
            );

            // Input bar
            gsap.fromTo(
                $1(".bp-msg-input-bar"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.normal, ease: E.smooth, delay: 0.5 },
            );

            // Blueprint decorations
            gsap.fromTo(
                $(".bp-corner-mark"),
                { opacity: 0, scale: 0 },
                { opacity: 1, scale: 1, duration: D.fast, ease: E.elastic, stagger: S.normal, delay: 0.6 },
            );
        },
        { scope: containerRef },
    );

    const handleSendMessage = () => {
        if (!messageInput.trim() || !selectedConv) return;

        const newMessage: Message = {
            id: `m-new-${Date.now()}`,
            senderId: CURRENT_USER_ID,
            text: messageInput.trim(),
            timestamp: "Just now",
            read: true,
        };

        setConvData((prev) =>
            prev.map((conv) =>
                conv.id === selectedConvId
                    ? {
                          ...conv,
                          messages: [...conv.messages, newMessage],
                          lastMessage: newMessage.text,
                          lastTimestamp: "Just now",
                      }
                    : conv,
            ),
        );

        setMessageInput("");
        setTimeout(animateNewMessage, 50);
    };

    const handleSelectConversation = (convId: string) => {
        setSelectedConvId(convId);
        setMobileShowThread(true);

        // Mark as read
        setConvData((prev) =>
            prev.map((conv) =>
                conv.id === convId
                    ? {
                          ...conv,
                          unreadCount: 0,
                          messages: conv.messages.map((m) => ({ ...m, read: true })),
                      }
                    : conv,
            ),
        );

        // Animate message bubbles on conversation switch
        setTimeout(() => {
            if (!messageListRef.current) return;
            const bubbles = messageListRef.current.querySelectorAll(".bp-msg-bubble");
            gsap.fromTo(
                bubbles,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: D.fast, ease: E.smooth, stagger: S.tight },
            );
        }, 50);
    };

    const filteredConversations = convData.filter((conv) => {
        const matchesSearch =
            conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === "all" || conv.contactRole === filterRole;
        return matchesSearch && matchesRole;
    });

    const totalUnread = convData.reduce((sum, c) => sum + c.unreadCount, 0);

    return (
        <div ref={containerRef} className="h-screen flex flex-col" style={{ backgroundColor: BG.deep }}>
            {/* Blueprint grid overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Corner dimension marks */}
            <div className="bp-corner-mark fixed top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-cyan-500/20 z-50 pointer-events-none" />
            <div className="bp-corner-mark fixed top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-cyan-500/20 z-50 pointer-events-none" />
            <div className="bp-corner-mark fixed bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-cyan-500/20 z-50 pointer-events-none" />
            <div className="bp-corner-mark fixed bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-cyan-500/20 z-50 pointer-events-none" />

            {/* ══════════════════════════════════════════════════════════════
                HEADER - Command Center Bar
               ══════════════════════════════════════════════════════════════ */}
            <header
                className="bp-msg-header relative z-20 flex items-center justify-between px-6 py-4 border-b opacity-0"
                style={{ backgroundColor: BG.mid, borderColor: "rgba(34,211,238,0.15)" }}
            >
                <div className="flex items-center gap-4">
                    {/* Mobile back button */}
                    {mobileShowThread && (
                        <button
                            onClick={() => setMobileShowThread(false)}
                            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                        >
                            <i className="fa-duotone fa-regular fa-arrow-left text-sm" />
                        </button>
                    )}

                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center border border-cyan-500/30"
                            style={{ backgroundColor: "rgba(34,211,238,0.1)" }}
                        >
                            <i className="fa-duotone fa-regular fa-messages text-lg text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white text-lg leading-tight">Command Center</h1>
                            <p className="text-xs font-mono text-cyan-400/60">COMMS // BLUEPRINT v2.0</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {totalUnread > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20" style={{ backgroundColor: "rgba(34,211,238,0.08)" }}>
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-xs font-mono text-cyan-400">{totalUnread} UNREAD</span>
                        </div>
                    )}

                    <button
                        className="w-9 h-9 rounded-lg flex items-center justify-center border border-cyan-500/20 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                        title="Settings"
                    >
                        <i className="fa-duotone fa-regular fa-gear text-sm" />
                    </button>
                </div>
            </header>

            {/* ══════════════════════════════════════════════════════════════
                MAIN CONTENT - Split View
               ══════════════════════════════════════════════════════════════ */}
            <div className="flex-1 flex overflow-hidden relative z-10">
                {/* ── SIDEBAR - Conversation List ── */}
                <aside
                    className={`bp-msg-sidebar w-full lg:w-[380px] flex-shrink-0 flex flex-col border-r opacity-0 ${
                        mobileShowThread ? "hidden lg:flex" : "flex"
                    }`}
                    style={{ backgroundColor: BG.mid, borderColor: "rgba(34,211,238,0.1)" }}
                >
                    {/* Search and Filter */}
                    <div className="p-4 space-y-3" style={{ borderBottom: "1px solid rgba(34,211,238,0.1)" }}>
                        {/* Search */}
                        <div className="relative">
                            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cyan-500/40" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-cyan-500/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 transition-colors"
                                style={{ backgroundColor: BG.input }}
                            />
                        </div>

                        {/* Role filter tabs */}
                        <div className="flex gap-1">
                            {[
                                { key: "all", label: "All", icon: "fa-duotone fa-regular fa-layer-group" },
                                { key: "recruiter", label: "Rec", icon: ROLE_STYLES.recruiter.icon },
                                { key: "company", label: "Co", icon: ROLE_STYLES.company.icon },
                                { key: "candidate", label: "Cand", icon: ROLE_STYLES.candidate.icon },
                                { key: "admin", label: "Adm", icon: ROLE_STYLES.admin.icon },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilterRole(tab.key)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-mono transition-all"
                                    style={{
                                        backgroundColor:
                                            filterRole === tab.key ? "rgba(34,211,238,0.12)" : "transparent",
                                        color: filterRole === tab.key ? "#22d3ee" : "#64748b",
                                        border:
                                            filterRole === tab.key
                                                ? "1px solid rgba(34,211,238,0.3)"
                                                : "1px solid transparent",
                                    }}
                                >
                                    <i className={`${tab.icon} text-[10px]`} />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredConversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <i className="fa-duotone fa-regular fa-inbox text-3xl text-cyan-500/20 mb-3 block" />
                                <p className="text-sm text-slate-500 font-mono">NO MATCHING THREADS</p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => {
                                const role = ROLE_STYLES[conv.contactRole];
                                const isSelected = conv.id === selectedConvId;

                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => handleSelectConversation(conv.id)}
                                        className={`bp-conv-item w-full text-left p-4 transition-all duration-200 opacity-0 border-l-2 ${
                                            isSelected ? "border-l-cyan-400" : "border-l-transparent hover:border-l-cyan-500/30"
                                        }`}
                                        style={{
                                            backgroundColor: isSelected ? "rgba(34,211,238,0.06)" : "transparent",
                                            borderBottom: "1px solid rgba(34,211,238,0.06)",
                                        }}
                                    >
                                        <div className="flex gap-3">
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div
                                                    className="w-11 h-11 rounded-lg flex items-center justify-center text-sm font-bold border"
                                                    style={{
                                                        backgroundColor: role.bg,
                                                        borderColor: role.border,
                                                        color: role.color,
                                                    }}
                                                >
                                                    {conv.contactAvatar}
                                                </div>
                                                {/* Online indicator */}
                                                {conv.online && (
                                                    <div
                                                        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
                                                        style={{
                                                            backgroundColor: "#22c55e",
                                                            borderColor: BG.mid,
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className={`text-sm font-semibold truncate ${conv.unreadCount > 0 ? "text-white" : "text-slate-300"}`}>
                                                        {conv.contactName}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 ml-2">
                                                        {conv.lastTimestamp}
                                                    </span>
                                                </div>

                                                {/* Role badge */}
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <i className={`${role.icon} text-[9px]`} style={{ color: role.color }} />
                                                    <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: role.color }}>
                                                        {role.label}
                                                    </span>
                                                </div>

                                                {/* Last message preview */}
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? "text-slate-300" : "text-slate-500"}`}>
                                                        {conv.lastMessage}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <div
                                                            className="flex-shrink-0 ml-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                                            style={{ backgroundColor: "#22d3ee", color: "#0a1628" }}
                                                        >
                                                            {conv.unreadCount}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Sidebar footer */}
                    <div
                        className="p-3 flex items-center justify-between"
                        style={{
                            borderTop: "1px solid rgba(34,211,238,0.1)",
                            backgroundColor: BG.dark,
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-[10px] font-mono text-slate-500">ONLINE</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-600">
                            {convData.length} THREADS
                        </span>
                    </div>
                </aside>

                {/* ── THREAD VIEW - Message Display ── */}
                <main
                    className={`bp-msg-thread flex-1 flex flex-col opacity-0 ${
                        !mobileShowThread ? "hidden lg:flex" : "flex"
                    }`}
                    style={{ backgroundColor: BG.deep }}
                >
                    {selectedConv ? (
                        <>
                            {/* Thread Header */}
                            <div
                                className="flex items-center justify-between px-6 py-4 border-b"
                                style={{
                                    backgroundColor: BG.mid,
                                    borderColor: "rgba(34,211,238,0.1)",
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold border"
                                            style={{
                                                backgroundColor: ROLE_STYLES[selectedConv.contactRole].bg,
                                                borderColor: ROLE_STYLES[selectedConv.contactRole].border,
                                                color: ROLE_STYLES[selectedConv.contactRole].color,
                                            }}
                                        >
                                            {selectedConv.contactAvatar}
                                        </div>
                                        {selectedConv.online && (
                                            <div
                                                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                                                style={{ backgroundColor: "#22c55e", borderColor: BG.mid }}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-white">{selectedConv.contactName}</h2>
                                        <div className="flex items-center gap-2">
                                            <i
                                                className={`${ROLE_STYLES[selectedConv.contactRole].icon} text-[10px]`}
                                                style={{ color: ROLE_STYLES[selectedConv.contactRole].color }}
                                            />
                                            <span
                                                className="text-[10px] font-mono uppercase tracking-wider"
                                                style={{ color: ROLE_STYLES[selectedConv.contactRole].color }}
                                            >
                                                {ROLE_STYLES[selectedConv.contactRole].label}
                                            </span>
                                            <span className="text-slate-600 text-[10px]">|</span>
                                            <span className="text-[10px] font-mono text-slate-500">
                                                {selectedConv.online ? "ONLINE" : "OFFLINE"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-cyan-500/15 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                                        <i className="fa-duotone fa-regular fa-phone text-xs" />
                                    </button>
                                    <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-cyan-500/15 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                                        <i className="fa-duotone fa-regular fa-video text-xs" />
                                    </button>
                                    <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-cyan-500/15 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                                        <i className="fa-duotone fa-regular fa-circle-info text-xs" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div ref={messageListRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                {/* Thread start indicator */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                                    <span className="text-[10px] font-mono text-cyan-500/30 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-lock text-[8px]" />
                                        ENCRYPTED THREAD START
                                    </span>
                                    <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                                </div>

                                {selectedConv.messages.map((msg) => {
                                    const isMine = msg.senderId === CURRENT_USER_ID;
                                    const contactRole = ROLE_STYLES[selectedConv.contactRole];

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`bp-msg-bubble flex ${isMine ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`flex gap-3 max-w-[75%] ${isMine ? "flex-row-reverse" : ""}`}>
                                                {/* Avatar */}
                                                {!isMine && (
                                                    <div
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border flex-shrink-0 mt-1"
                                                        style={{
                                                            backgroundColor: contactRole.bg,
                                                            borderColor: contactRole.border,
                                                            color: contactRole.color,
                                                        }}
                                                    >
                                                        {selectedConv.contactAvatar}
                                                    </div>
                                                )}

                                                {/* Message bubble */}
                                                <div>
                                                    <div
                                                        className={`rounded-xl px-4 py-3 border ${
                                                            isMine ? "rounded-tr-sm" : "rounded-tl-sm"
                                                        }`}
                                                        style={{
                                                            backgroundColor: isMine ? "rgba(34,211,238,0.1)" : BG.card,
                                                            borderColor: isMine
                                                                ? "rgba(34,211,238,0.2)"
                                                                : "rgba(34,211,238,0.08)",
                                                        }}
                                                    >
                                                        <p className={`text-sm leading-relaxed ${isMine ? "text-cyan-100" : "text-slate-300"}`}>
                                                            {msg.text}
                                                        </p>
                                                    </div>
                                                    <div className={`flex items-center gap-2 mt-1 ${isMine ? "justify-end" : ""}`}>
                                                        <span className="text-[10px] font-mono text-slate-600">
                                                            {msg.timestamp}
                                                        </span>
                                                        {isMine && (
                                                            <i
                                                                className={`fa-duotone fa-regular fa-check-double text-[10px] ${
                                                                    msg.read ? "text-cyan-500/60" : "text-slate-600"
                                                                }`}
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* My avatar */}
                                                {isMine && (
                                                    <div
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border flex-shrink-0 mt-1"
                                                        style={{
                                                            backgroundColor: "rgba(34,211,238,0.1)",
                                                            borderColor: "rgba(34,211,238,0.25)",
                                                            color: "#22d3ee",
                                                        }}
                                                    >
                                                        ME
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Bar */}
                            <div
                                className="bp-msg-input-bar px-6 py-4 border-t opacity-0"
                                style={{
                                    backgroundColor: BG.mid,
                                    borderColor: "rgba(34,211,238,0.1)",
                                }}
                            >
                                {/* Typing indicator area */}
                                <div className="flex items-center gap-2 mb-2 h-4">
                                    <div className="text-[10px] font-mono text-cyan-500/30 flex items-center gap-1.5">
                                        <i className="fa-duotone fa-regular fa-shield-check text-[8px]" />
                                        SECURE CHANNEL
                                    </div>
                                </div>

                                <div className="flex items-end gap-3">
                                    {/* Attachment button */}
                                    <button className="w-9 h-9 rounded-lg flex items-center justify-center border border-cyan-500/15 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-paperclip text-sm" />
                                    </button>

                                    {/* Text input */}
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            placeholder="Type a message..."
                                            rows={1}
                                            className="w-full px-4 py-2.5 rounded-lg border border-cyan-500/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 transition-colors resize-none"
                                            style={{ backgroundColor: BG.input }}
                                        />
                                    </div>

                                    {/* Emoji button */}
                                    <button className="w-9 h-9 rounded-lg flex items-center justify-center border border-cyan-500/15 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-face-smile text-sm" />
                                    </button>

                                    {/* Send button */}
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim()}
                                        className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all flex-shrink-0"
                                        style={{
                                            backgroundColor: messageInput.trim()
                                                ? "#22d3ee"
                                                : "rgba(34,211,238,0.08)",
                                            borderColor: messageInput.trim()
                                                ? "#22d3ee"
                                                : "rgba(34,211,238,0.15)",
                                            color: messageInput.trim() ? "#0a1628" : "rgba(34,211,238,0.3)",
                                            cursor: messageInput.trim() ? "pointer" : "default",
                                        }}
                                    >
                                        <i className="fa-duotone fa-regular fa-paper-plane-top text-sm" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty state */
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div
                                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/20"
                                    style={{ backgroundColor: "rgba(34,211,238,0.05)" }}
                                >
                                    <i className="fa-duotone fa-regular fa-messages text-3xl text-cyan-500/30" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-400 mb-2">Select a Conversation</h3>
                                <p className="text-sm text-slate-600 font-mono">
                                    Choose a thread from the sidebar to begin
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Custom scrollbar styles */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(34, 211, 238, 0.15);
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(34, 211, 238, 0.3);
                }
            `}</style>
        </div>
    );
}
