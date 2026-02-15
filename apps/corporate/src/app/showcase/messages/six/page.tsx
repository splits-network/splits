"use client";

import { useState, useRef, useEffect } from "react";
import { MemphisMessengerAnimator } from "./memphis-messenger-animator";

// ─── Memphis Color Palette ──────────────────────────────────────────────────
const MEMPHIS = {
    coral: "#FF6B6B",
    teal: "#4ECDC4",
    yellow: "#FFE66D",
    purple: "#A78BFA",
    navy: "#1A1A2E",
    cream: "#F5F0EB",
    white: "#FFFFFF",
    darkGray: "#2D2D44",
};

// ─── Role Color Map ─────────────────────────────────────────────────────────
const ROLE_STYLES: Record<string, { color: string; bg: string; icon: string; label: string }> = {
    recruiter: { color: MEMPHIS.coral, bg: MEMPHIS.coral, icon: "fa-duotone fa-regular fa-user-tie", label: "Recruiter" },
    company: { color: MEMPHIS.yellow, bg: MEMPHIS.yellow, icon: "fa-duotone fa-regular fa-building", label: "Company" },
    candidate: { color: MEMPHIS.teal, bg: MEMPHIS.teal, icon: "fa-duotone fa-regular fa-user", label: "Candidate" },
    admin: { color: MEMPHIS.purple, bg: MEMPHIS.purple, icon: "fa-duotone fa-regular fa-shield-halved", label: "Admin" },
};

// ─── Types ──────────────────────────────────────────────────────────────────
interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    read: boolean;
}

interface Conversation {
    id: string;
    contact: {
        id: string;
        name: string;
        initials: string;
        role: "recruiter" | "company" | "candidate" | "admin";
        avatarColor: string;
    };
    messages: Message[];
    unreadCount: number;
    pinned: boolean;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────
const CURRENT_USER_ID = "me";

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: "conv-1",
        contact: { id: "u1", name: "Marcus Thompson", initials: "MT", role: "recruiter", avatarColor: MEMPHIS.coral },
        pinned: true,
        unreadCount: 3,
        messages: [
            { id: "m1", senderId: "u1", text: "Hey! I've got a strong candidate for the Senior Frontend role at TechCorp. 4 years React, Next.js, and a killer portfolio.", timestamp: "10:32 AM", read: true },
            { id: "m2", senderId: CURRENT_USER_ID, text: "That sounds great, Marcus. What's their salary expectation?", timestamp: "10:35 AM", read: true },
            { id: "m3", senderId: "u1", text: "They're looking at $145K-$160K range. Flexible on remote vs hybrid.", timestamp: "10:37 AM", read: true },
            { id: "m4", senderId: CURRENT_USER_ID, text: "Perfect range. Can you send over their resume? I'd love to set up a screener for this week.", timestamp: "10:40 AM", read: true },
            { id: "m5", senderId: "u1", text: "Absolutely! Sending the profile package now. Also wanted to mention -- they have a competing offer from a Series B startup, so timing is tight.", timestamp: "10:42 AM", read: false },
            { id: "m6", senderId: "u1", text: "I think a 50/50 split would be fair on this one given the candidate quality. What do you think?", timestamp: "10:43 AM", read: false },
            { id: "m7", senderId: "u1", text: "Let me know if you want to hop on a quick call to discuss the details.", timestamp: "10:45 AM", read: false },
        ],
    },
    {
        id: "conv-2",
        contact: { id: "u2", name: "Sarah Chen", initials: "SC", role: "company", avatarColor: MEMPHIS.yellow },
        pinned: true,
        unreadCount: 1,
        messages: [
            { id: "m8", senderId: CURRENT_USER_ID, text: "Hi Sarah! Just following up on the 3 candidates I submitted last week for the Product Manager role.", timestamp: "Yesterday", read: true },
            { id: "m9", senderId: "u2", text: "Hi! Thanks for following up. We interviewed all three and really liked Candidate B -- the one with the fintech background.", timestamp: "Yesterday", read: true },
            { id: "m10", senderId: CURRENT_USER_ID, text: "That's fantastic news! James is a great fit. What are the next steps?", timestamp: "Yesterday", read: true },
            { id: "m11", senderId: "u2", text: "We'd like to bring him back for a final round with the VP next Tuesday. Can you coordinate availability?", timestamp: "Yesterday", read: true },
            { id: "m12", senderId: "u2", text: "Also, we have two new engineering roles opening up. I'll send you the JDs this afternoon. Exciting stuff!", timestamp: "9:15 AM", read: false },
        ],
    },
    {
        id: "conv-3",
        contact: { id: "u3", name: "Priya Sharma", initials: "PS", role: "candidate", avatarColor: MEMPHIS.teal },
        pinned: false,
        unreadCount: 0,
        messages: [
            { id: "m13", senderId: "u3", text: "Hi! I saw the UX Designer role at DesignCo on the platform. I'm very interested -- my portfolio is updated with the projects we discussed.", timestamp: "Mon", read: true },
            { id: "m14", senderId: CURRENT_USER_ID, text: "Great to hear, Priya! I just reviewed your portfolio and it looks amazing. The case study on the healthcare app redesign is exactly what they're looking for.", timestamp: "Mon", read: true },
            { id: "m15", senderId: "u3", text: "Thank you! I'm also open to the remote Product Designer role if that's still available. I noticed it was posted recently.", timestamp: "Mon", read: true },
            { id: "m16", senderId: CURRENT_USER_ID, text: "Both are still open. Let me submit you for the DesignCo role first since it has a tighter timeline. I'll keep you posted on the other one.", timestamp: "Mon", read: true },
        ],
    },
    {
        id: "conv-4",
        contact: { id: "u4", name: "David Park", initials: "DP", role: "admin", avatarColor: MEMPHIS.purple },
        pinned: false,
        unreadCount: 0,
        messages: [
            { id: "m17", senderId: "u4", text: "Quick update: we've rolled out the new split-fee calculator feature. You'll see it in your dashboard under Placements.", timestamp: "Feb 10", read: true },
            { id: "m18", senderId: CURRENT_USER_ID, text: "Awesome, I've been waiting for this! The manual calculations were getting tedious.", timestamp: "Feb 10", read: true },
            { id: "m19", senderId: "u4", text: "Glad to hear it. Also, your recruiter verification has been approved. You now have access to premium job listings.", timestamp: "Feb 10", read: true },
            { id: "m20", senderId: CURRENT_USER_ID, text: "Perfect. Thanks for the fast turnaround, David!", timestamp: "Feb 10", read: true },
        ],
    },
    {
        id: "conv-5",
        contact: { id: "u5", name: "Rachel Morrison", initials: "RM", role: "recruiter", avatarColor: MEMPHIS.coral },
        pinned: false,
        unreadCount: 2,
        messages: [
            { id: "m21", senderId: "u5", text: "Hey! Saw your listing for the DevOps Engineer. I have a candidate who might be perfect -- 6 years AWS, strong Kubernetes background.", timestamp: "11:20 AM", read: true },
            { id: "m22", senderId: CURRENT_USER_ID, text: "Interesting! That role has been tough to fill. What's their current situation?", timestamp: "11:25 AM", read: true },
            { id: "m23", senderId: "u5", text: "Currently at a large bank, looking to move to a more dynamic environment. Available in 2 weeks. They're also open to contract-to-hire.", timestamp: "11:30 AM", read: false },
            { id: "m24", senderId: "u5", text: "Want to set up a three-way call for later today? I think you'll be impressed.", timestamp: "11:32 AM", read: false },
        ],
    },
    {
        id: "conv-6",
        contact: { id: "u6", name: "Alex Rivera", initials: "AR", role: "candidate", avatarColor: MEMPHIS.teal },
        pinned: false,
        unreadCount: 0,
        messages: [
            { id: "m25", senderId: CURRENT_USER_ID, text: "Hi Alex! Congratulations -- TechCorp wants to extend an offer for the Backend Engineer role!", timestamp: "Feb 12", read: true },
            { id: "m26", senderId: "u6", text: "No way, that's incredible!! I'm so excited. What are the details?", timestamp: "Feb 12", read: true },
            { id: "m27", senderId: CURRENT_USER_ID, text: "Base salary of $155K, plus equity and full benefits. They're sending the formal letter tomorrow. I'll review it with you before you sign.", timestamp: "Feb 12", read: true },
            { id: "m28", senderId: "u6", text: "This is amazing. Thank you for all your help through this process. I couldn't have done it without you!", timestamp: "Feb 12", read: true },
        ],
    },
    {
        id: "conv-7",
        contact: { id: "u7", name: "Elena Volkov", initials: "EV", role: "company", avatarColor: MEMPHIS.yellow },
        pinned: false,
        unreadCount: 0,
        messages: [
            { id: "m29", senderId: "u7", text: "We need to fill a VP of Engineering role ASAP. Budget is $250-300K. Can you help source candidates?", timestamp: "Feb 8", read: true },
            { id: "m30", senderId: CURRENT_USER_ID, text: "Absolutely, Elena. That's right in my wheelhouse. I have a few executives in my network who might be a fit. Let me reach out today.", timestamp: "Feb 8", read: true },
            { id: "m31", senderId: "u7", text: "Perfect. We're looking for someone with experience scaling engineering teams from 20 to 100+. Strong preference for SaaS background.", timestamp: "Feb 8", read: true },
        ],
    },
    {
        id: "conv-8",
        contact: { id: "u8", name: "Jordan Blake", initials: "JB", role: "recruiter", avatarColor: MEMPHIS.coral },
        pinned: false,
        unreadCount: 0,
        messages: [
            { id: "m32", senderId: CURRENT_USER_ID, text: "Jordan, I just closed that placement we were working on together! The split is being processed through the platform.", timestamp: "Feb 5", read: true },
            { id: "m33", senderId: "u8", text: "That's great news! Love how smooth the payout process is on here. Already looking at the next collaboration.", timestamp: "Feb 5", read: true },
            { id: "m34", senderId: CURRENT_USER_ID, text: "Same here. I have a batch of new roles coming in from a fintech client. Want to team up again?", timestamp: "Feb 5", read: true },
            { id: "m35", senderId: "u8", text: "Count me in. Send me the details whenever you're ready.", timestamp: "Feb 5", read: true },
        ],
    },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function MessagesSixPage() {
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
    const [activeConvId, setActiveConvId] = useState<string>("conv-1");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState<string>("all");
    const [newMessage, setNewMessage] = useState("");
    const [showMobileThread, setShowMobileThread] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const activeConv = conversations.find((c) => c.id === activeConvId);

    // Auto-scroll messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeConvId, conversations]);

    // Filter conversations
    const filteredConversations = conversations
        .filter((c) => {
            const matchesSearch = c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.messages[c.messages.length - 1]?.text.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = filterRole === "all" || c.contact.role === filterRole;
            return matchesSearch && matchesRole;
        })
        .sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
            if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
            return 0;
        });

    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

    function handleSelectConversation(convId: string) {
        setActiveConvId(convId);
        setShowMobileThread(true);
        // Mark messages as read
        setConversations((prev) =>
            prev.map((c) =>
                c.id === convId
                    ? { ...c, unreadCount: 0, messages: c.messages.map((m) => ({ ...m, read: true })) }
                    : c
            )
        );
    }

    function handleSendMessage() {
        if (!newMessage.trim() || !activeConvId) return;

        const msg: Message = {
            id: `m-new-${Date.now()}`,
            senderId: CURRENT_USER_ID,
            text: newMessage.trim(),
            timestamp: "Just now",
            read: true,
        };

        setConversations((prev) =>
            prev.map((c) =>
                c.id === activeConvId
                    ? { ...c, messages: [...c.messages, msg] }
                    : c
            )
        );

        setNewMessage("");
        inputRef.current?.focus();
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }

    function handleTogglePin(convId: string) {
        setConversations((prev) =>
            prev.map((c) =>
                c.id === convId ? { ...c, pinned: !c.pinned } : c
            )
        );
    }

    const roleStyle = activeConv ? ROLE_STYLES[activeConv.contact.role] : null;

    return (
        <MemphisMessengerAnimator>
            <div className="memphis-messenger min-h-screen" style={{ backgroundColor: MEMPHIS.navy }}>

                {/* ═══════════════════════════════════════════
                    HEADER BAR
                   ═══════════════════════════════════════════ */}
                <header className="messenger-header relative overflow-hidden"
                    style={{ backgroundColor: MEMPHIS.navy, borderBottom: `4px solid ${MEMPHIS.coral}` }}>
                    {/* Memphis background decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-2 right-8 w-10 h-10 rounded-full border-[3px] opacity-20"
                            style={{ borderColor: MEMPHIS.teal }} />
                        <div className="absolute bottom-1 right-24 w-6 h-6 rotate-45 opacity-15"
                            style={{ backgroundColor: MEMPHIS.yellow }} />
                        <div className="absolute top-3 left-[30%] opacity-15"
                            style={{
                                width: 0, height: 0,
                                borderLeft: "8px solid transparent",
                                borderRight: "8px solid transparent",
                                borderBottom: `14px solid ${MEMPHIS.purple}`,
                                transform: "rotate(15deg)",
                            }} />
                        <svg className="absolute bottom-2 left-[50%] opacity-15" width="60" height="16" viewBox="0 0 60 16">
                            <polyline points="0,12 8,4 16,12 24,4 32,12 40,4 48,12 56,4"
                                fill="none" stroke={MEMPHIS.coral} strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="relative z-10 flex items-center justify-between px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                            {/* Mobile back button */}
                            {showMobileThread && (
                                <button
                                    onClick={() => setShowMobileThread(false)}
                                    className="md:hidden w-10 h-10 flex items-center justify-center border-[3px] transition-transform hover:-translate-y-0.5"
                                    style={{ borderColor: MEMPHIS.coral, color: MEMPHIS.white }}
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                                </button>
                            )}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center border-[3px]"
                                    style={{ borderColor: MEMPHIS.coral, backgroundColor: MEMPHIS.coral }}>
                                    <i className="fa-duotone fa-regular fa-messages text-lg" style={{ color: MEMPHIS.white }}></i>
                                </div>
                                <div>
                                    <h1 className="text-lg font-black uppercase tracking-wider" style={{ color: MEMPHIS.white }}>
                                        Messages
                                    </h1>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: MEMPHIS.coral }}>
                                        Splits Network
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {totalUnread > 0 && (
                                <div className="header-badge flex items-center gap-2 px-3 py-1.5 border-[3px]"
                                    style={{ borderColor: MEMPHIS.coral, backgroundColor: MEMPHIS.coral }}>
                                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: MEMPHIS.white }}>
                                        {totalUnread} Unread
                                    </span>
                                </div>
                            )}
                            <button className="w-10 h-10 flex items-center justify-center border-[3px] transition-transform hover:-translate-y-0.5"
                                style={{ borderColor: MEMPHIS.purple, color: MEMPHIS.purple }}>
                                <i className="fa-duotone fa-regular fa-gear"></i>
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center border-[3px] transition-transform hover:-translate-y-0.5"
                                style={{ borderColor: MEMPHIS.teal, color: MEMPHIS.teal }}>
                                <i className="fa-duotone fa-regular fa-pen-to-square"></i>
                            </button>
                        </div>
                    </div>
                </header>

                {/* ═══════════════════════════════════════════
                    MAIN CONTENT - Split View
                   ═══════════════════════════════════════════ */}
                <div className="flex" style={{ height: "calc(100vh - 73px)" }}>

                    {/* ─── LEFT PANEL: Conversation List ─── */}
                    <aside className={`conversation-panel flex-shrink-0 w-full md:w-[360px] lg:w-[400px] flex flex-col border-r-4 ${showMobileThread ? "hidden md:flex" : "flex"}`}
                        style={{ borderColor: MEMPHIS.darkGray, backgroundColor: MEMPHIS.navy }}>

                        {/* Search & Filters */}
                        <div className="p-4 space-y-3" style={{ borderBottom: `3px solid ${MEMPHIS.darkGray}` }}>
                            {/* Search bar */}
                            <div className="relative">
                                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                                    style={{ color: MEMPHIS.teal }} />
                                <input
                                    type="text"
                                    placeholder="SEARCH CONVERSATIONS..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border-[3px] text-xs font-bold uppercase tracking-wider placeholder:opacity-40 outline-none focus:border-[3px]"
                                    style={{
                                        borderColor: MEMPHIS.darkGray,
                                        backgroundColor: "rgba(255,255,255,0.03)",
                                        color: MEMPHIS.white,
                                    }}
                                />
                            </div>

                            {/* Role filter tabs */}
                            <div className="filter-tabs flex gap-1.5 overflow-x-auto pb-1">
                                {[
                                    { key: "all", label: "All", color: MEMPHIS.white },
                                    { key: "recruiter", label: "Rec", color: MEMPHIS.coral },
                                    { key: "company", label: "Co", color: MEMPHIS.yellow },
                                    { key: "candidate", label: "Cand", color: MEMPHIS.teal },
                                    { key: "admin", label: "Admin", color: MEMPHIS.purple },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setFilterRole(tab.key)}
                                        className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-[3px] whitespace-nowrap transition-all hover:-translate-y-0.5"
                                        style={{
                                            borderColor: tab.color,
                                            backgroundColor: filterRole === tab.key ? tab.color : "transparent",
                                            color: filterRole === tab.key
                                                ? (tab.key === "company" || tab.key === "all" ? MEMPHIS.navy : MEMPHIS.white)
                                                : tab.color,
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Conversation List */}
                        <div className="conversation-list flex-1 overflow-y-auto">
                            {filteredConversations.map((conv) => {
                                const style = ROLE_STYLES[conv.contact.role];
                                const lastMsg = conv.messages[conv.messages.length - 1];
                                const isActive = conv.id === activeConvId;
                                const textColor = conv.contact.role === "company" ? MEMPHIS.navy : MEMPHIS.white;

                                return (
                                    <div
                                        key={conv.id}
                                        className="conv-item relative cursor-pointer transition-all border-b-[3px]"
                                        style={{
                                            borderColor: MEMPHIS.darkGray,
                                            backgroundColor: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                                        }}
                                        onClick={() => handleSelectConversation(conv.id)}
                                    >
                                        {/* Active indicator bar */}
                                        {isActive && (
                                            <div className="absolute left-0 top-0 bottom-0 w-[5px]"
                                                style={{ backgroundColor: style.color }} />
                                        )}

                                        <div className="flex items-start gap-3 px-4 py-3.5">
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-12 h-12 flex items-center justify-center border-[3px] text-sm font-black"
                                                    style={{
                                                        borderColor: style.color,
                                                        backgroundColor: style.color,
                                                        color: textColor,
                                                    }}>
                                                    {conv.contact.initials}
                                                </div>
                                                {/* Role icon badge */}
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center border-2"
                                                    style={{
                                                        borderColor: MEMPHIS.navy,
                                                        backgroundColor: style.color,
                                                        color: textColor,
                                                    }}>
                                                    <i className={`${style.icon} text-[8px]`}></i>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        {conv.pinned && (
                                                            <i className="fa-duotone fa-regular fa-thumbtack text-[10px]"
                                                                style={{ color: MEMPHIS.yellow }} />
                                                        )}
                                                        <span className="font-black text-sm uppercase tracking-wide truncate"
                                                            style={{ color: MEMPHIS.white }}>
                                                            {conv.contact.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ml-2"
                                                        style={{ color: conv.unreadCount > 0 ? style.color : "rgba(255,255,255,0.35)" }}>
                                                        {lastMsg?.timestamp}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1 mb-1.5">
                                                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5"
                                                        style={{
                                                            backgroundColor: `${style.color}22`,
                                                            color: style.color,
                                                        }}>
                                                        {style.label}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs truncate pr-2"
                                                        style={{
                                                            color: conv.unreadCount > 0 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)",
                                                            fontWeight: conv.unreadCount > 0 ? 700 : 400,
                                                        }}>
                                                        {lastMsg?.senderId === CURRENT_USER_ID ? "You: " : ""}
                                                        {lastMsg?.text}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[10px] font-black"
                                                            style={{
                                                                backgroundColor: style.color,
                                                                color: textColor,
                                                            }}>
                                                            {conv.unreadCount}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredConversations.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 px-4">
                                    <div className="w-16 h-16 flex items-center justify-center border-[3px] mb-4"
                                        style={{ borderColor: MEMPHIS.darkGray }}>
                                        <i className="fa-duotone fa-regular fa-inbox text-2xl" style={{ color: MEMPHIS.darkGray }}></i>
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-center"
                                        style={{ color: "rgba(255,255,255,0.3)" }}>
                                        No conversations found
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer stats */}
                        <div className="px-4 py-3 flex items-center justify-between"
                            style={{ borderTop: `3px solid ${MEMPHIS.darkGray}`, backgroundColor: "rgba(255,255,255,0.02)" }}>
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>
                                {filteredConversations.length} Conversations
                            </span>
                            <div className="flex gap-2">
                                {Object.entries(ROLE_STYLES).map(([key, rs]) => {
                                    const count = conversations.filter((c) => c.contact.role === key).length;
                                    return (
                                        <div key={key} className="flex items-center gap-1">
                                            <div className="w-2 h-2" style={{ backgroundColor: rs.color }} />
                                            <span className="text-[9px] font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* ─── RIGHT PANEL: Message Thread ─── */}
                    <main className={`message-thread flex-1 flex flex-col ${showMobileThread ? "flex" : "hidden md:flex"}`}
                        style={{ backgroundColor: MEMPHIS.darkGray }}>

                        {activeConv && roleStyle ? (
                            <>
                                {/* Thread header */}
                                <div className="thread-header flex items-center justify-between px-4 md:px-6 py-3"
                                    style={{ borderBottom: `4px solid ${roleStyle.color}`, backgroundColor: MEMPHIS.navy }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 flex items-center justify-center border-[3px] text-xs font-black"
                                            style={{
                                                borderColor: roleStyle.color,
                                                backgroundColor: roleStyle.color,
                                                color: activeConv.contact.role === "company" ? MEMPHIS.navy : MEMPHIS.white,
                                            }}>
                                            {activeConv.contact.initials}
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: MEMPHIS.white }}>
                                                {activeConv.contact.name}
                                            </h2>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5"
                                                    style={{ backgroundColor: roleStyle.color, color: activeConv.contact.role === "company" ? MEMPHIS.navy : MEMPHIS.white }}>
                                                    {roleStyle.label}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                                                    {activeConv.messages.length} messages
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleTogglePin(activeConv.id)}
                                            className="w-9 h-9 flex items-center justify-center border-[3px] transition-transform hover:-translate-y-0.5"
                                            style={{
                                                borderColor: activeConv.pinned ? MEMPHIS.yellow : MEMPHIS.darkGray,
                                                color: activeConv.pinned ? MEMPHIS.yellow : "rgba(255,255,255,0.3)",
                                            }}>
                                            <i className={`fa-duotone fa-regular fa-thumbtack text-xs ${activeConv.pinned ? "" : "opacity-60"}`}></i>
                                        </button>
                                        <button className="w-9 h-9 flex items-center justify-center border-[3px] transition-transform hover:-translate-y-0.5"
                                            style={{ borderColor: MEMPHIS.darkGray, color: "rgba(255,255,255,0.4)" }}>
                                            <i className="fa-duotone fa-regular fa-phone text-xs"></i>
                                        </button>
                                        <button className="w-9 h-9 flex items-center justify-center border-[3px] transition-transform hover:-translate-y-0.5"
                                            style={{ borderColor: MEMPHIS.darkGray, color: "rgba(255,255,255,0.4)" }}>
                                            <i className="fa-duotone fa-regular fa-ellipsis-vertical text-xs"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Messages area */}
                                <div className="messages-area flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
                                    {/* Date divider */}
                                    <div className="flex items-center gap-3 py-2">
                                        <div className="flex-1 h-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 border-[2px]"
                                            style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.25)" }}>
                                            Conversation Start
                                        </span>
                                        <div className="flex-1 h-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
                                    </div>

                                    {activeConv.messages.map((msg) => {
                                        const isSent = msg.senderId === CURRENT_USER_ID;
                                        const bubbleColor = isSent ? MEMPHIS.navy : roleStyle.color;
                                        const bubbleText = isSent
                                            ? MEMPHIS.white
                                            : activeConv.contact.role === "company" ? MEMPHIS.navy : MEMPHIS.white;

                                        return (
                                            <div key={msg.id}
                                                className={`msg-bubble flex gap-3 ${isSent ? "flex-row-reverse" : ""}`}>
                                                {/* Avatar (only for received) */}
                                                {!isSent && (
                                                    <div className="flex-shrink-0 mt-1">
                                                        <div className="w-8 h-8 flex items-center justify-center border-[2px] text-[10px] font-black"
                                                            style={{
                                                                borderColor: roleStyle.color,
                                                                backgroundColor: roleStyle.color,
                                                                color: activeConv.contact.role === "company" ? MEMPHIS.navy : MEMPHIS.white,
                                                            }}>
                                                            {activeConv.contact.initials}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Message bubble */}
                                                <div className={`max-w-[75%] ${isSent ? "items-end" : "items-start"}`}>
                                                    <div className="relative p-3.5 border-[3px]"
                                                        style={{
                                                            borderColor: isSent ? "rgba(255,255,255,0.15)" : roleStyle.color,
                                                            backgroundColor: isSent ? "rgba(255,255,255,0.05)" : `${roleStyle.color}15`,
                                                        }}>
                                                        {/* Corner accent for received */}
                                                        {!isSent && (
                                                            <div className="absolute top-0 right-0 w-3 h-3"
                                                                style={{ backgroundColor: roleStyle.color }} />
                                                        )}
                                                        {/* Corner accent for sent */}
                                                        {isSent && (
                                                            <div className="absolute top-0 left-0 w-3 h-3"
                                                                style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
                                                        )}
                                                        <p className="text-sm leading-relaxed" style={{ color: bubbleText }}>
                                                            {msg.text}
                                                        </p>
                                                    </div>
                                                    <div className={`flex items-center gap-2 mt-1.5 ${isSent ? "justify-end" : ""}`}>
                                                        <span className="text-[9px] font-bold uppercase tracking-wider"
                                                            style={{ color: "rgba(255,255,255,0.25)" }}>
                                                            {msg.timestamp}
                                                        </span>
                                                        {isSent && (
                                                            <i className="fa-duotone fa-regular fa-check-double text-[10px]"
                                                                style={{ color: msg.read ? MEMPHIS.teal : "rgba(255,255,255,0.2)" }} />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Sent avatar */}
                                                {isSent && (
                                                    <div className="flex-shrink-0 mt-1">
                                                        <div className="w-8 h-8 flex items-center justify-center border-[2px] text-[10px] font-black"
                                                            style={{
                                                                borderColor: "rgba(255,255,255,0.2)",
                                                                backgroundColor: "rgba(255,255,255,0.08)",
                                                                color: MEMPHIS.white,
                                                            }}>
                                                            You
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Compose area */}
                                <div className="compose-area px-4 md:px-6 py-4"
                                    style={{ borderTop: `4px solid ${roleStyle.color}`, backgroundColor: MEMPHIS.navy }}>

                                    {/* Quick actions */}
                                    <div className="flex items-center gap-2 mb-3">
                                        {[
                                            { icon: "fa-duotone fa-regular fa-paperclip", color: MEMPHIS.purple, title: "Attach" },
                                            { icon: "fa-duotone fa-regular fa-file-pdf", color: MEMPHIS.coral, title: "Resume" },
                                            { icon: "fa-duotone fa-regular fa-calendar", color: MEMPHIS.teal, title: "Schedule" },
                                            { icon: "fa-duotone fa-regular fa-handshake", color: MEMPHIS.yellow, title: "Propose Split" },
                                        ].map((action) => (
                                            <button
                                                key={action.title}
                                                title={action.title}
                                                className="quick-action flex items-center gap-1.5 px-2.5 py-1.5 border-[2px] text-[9px] font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5"
                                                style={{
                                                    borderColor: `${action.color}44`,
                                                    color: action.color,
                                                    backgroundColor: `${action.color}08`,
                                                }}>
                                                <i className={`${action.icon} text-[10px]`}></i>
                                                <span className="hidden sm:inline">{action.title}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Input row */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 relative">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                placeholder="TYPE YOUR MESSAGE..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                className="w-full px-4 py-3 border-[3px] text-sm font-bold tracking-wider placeholder:opacity-30 outline-none"
                                                style={{
                                                    borderColor: newMessage ? roleStyle.color : MEMPHIS.darkGray,
                                                    backgroundColor: "rgba(255,255,255,0.03)",
                                                    color: MEMPHIS.white,
                                                }}
                                            />
                                        </div>
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                            className="flex-shrink-0 w-12 h-12 flex items-center justify-center border-[3px] transition-all hover:-translate-y-0.5 disabled:opacity-30 disabled:hover:translate-y-0"
                                            style={{
                                                borderColor: roleStyle.color,
                                                backgroundColor: newMessage.trim() ? roleStyle.color : "transparent",
                                                color: newMessage.trim()
                                                    ? (activeConv.contact.role === "company" ? MEMPHIS.navy : MEMPHIS.white)
                                                    : roleStyle.color,
                                            }}>
                                            <i className="fa-duotone fa-regular fa-paper-plane-top text-lg"></i>
                                        </button>
                                    </div>

                                    {/* Typing indicator area */}
                                    <div className="flex items-center gap-2 mt-2 h-4">
                                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.15)" }}>
                                            Press Enter to send
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Empty state */
                            <div className="flex-1 flex flex-col items-center justify-center px-4">
                                {/* Memphis decoration */}
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 flex items-center justify-center border-[4px]"
                                        style={{ borderColor: MEMPHIS.coral }}>
                                        <i className="fa-duotone fa-regular fa-messages text-4xl" style={{ color: MEMPHIS.coral }}></i>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full"
                                        style={{ backgroundColor: MEMPHIS.teal }} />
                                    <div className="absolute -bottom-2 -left-2 w-6 h-6 rotate-45"
                                        style={{ backgroundColor: MEMPHIS.yellow }} />
                                    <div className="absolute -top-1 -left-4"
                                        style={{
                                            width: 0, height: 0,
                                            borderLeft: "10px solid transparent",
                                            borderRight: "10px solid transparent",
                                            borderBottom: `18px solid ${MEMPHIS.purple}`,
                                        }} />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-wider mb-2" style={{ color: MEMPHIS.white }}>
                                    Select a Conversation
                                </h3>
                                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>
                                    Choose from the list to start messaging
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </MemphisMessengerAnimator>
    );
}
