"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── types ─── */

type UserRole = "recruiter" | "company" | "candidate" | "admin";

interface User {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
  online: boolean;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
  attachment?: { name: string; size: string; type: string };
}

interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  pinned: boolean;
  muted: boolean;
  subject?: string;
}

/* ─── role config ─── */

const roleConfig: Record<
  UserRole,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
  }
> = {
  recruiter: {
    label: "REC",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    icon: "fa-user-tie",
  },
  company: {
    label: "COM",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    borderColor: "border-secondary/20",
    icon: "fa-building",
  },
  candidate: {
    label: "CAN",
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/20",
    icon: "fa-user",
  },
  admin: {
    label: "ADM",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
    icon: "fa-shield-halved",
  },
};

/* ─── current user ─── */

const currentUser: User = {
  id: "u-self",
  name: "Sarah Chen",
  initials: "SC",
  role: "admin",
  online: true,
};

/* ─── mock users ─── */

const users: Record<string, User> = {
  "u-self": currentUser,
  "u-1": {
    id: "u-1",
    name: "Marcus Webb",
    initials: "MW",
    role: "recruiter",
    online: true,
  },
  "u-2": {
    id: "u-2",
    name: "Lisa Park",
    initials: "LP",
    role: "company",
    online: true,
  },
  "u-3": {
    id: "u-3",
    name: "James Rodriguez",
    initials: "JR",
    role: "candidate",
    online: false,
  },
  "u-4": {
    id: "u-4",
    name: "Priya Sharma",
    initials: "PS",
    role: "recruiter",
    online: true,
  },
  "u-5": {
    id: "u-5",
    name: "Alex Kim",
    initials: "AK",
    role: "admin",
    online: false,
  },
  "u-6": {
    id: "u-6",
    name: "Nina Patel",
    initials: "NP",
    role: "candidate",
    online: true,
  },
  "u-7": {
    id: "u-7",
    name: "David Chen",
    initials: "DC",
    role: "company",
    online: false,
  },
  "u-8": {
    id: "u-8",
    name: "Rachel Torres",
    initials: "RT",
    role: "recruiter",
    online: true,
  },
};

/* ─── mock conversations ─── */

const mockConversations: Conversation[] = [
  {
    id: "c-1",
    participants: [users["u-self"], users["u-1"]],
    pinned: true,
    muted: false,
    subject: "Senior React Developer - Split Agreement",
    messages: [
      {
        id: "m-1a",
        senderId: "u-1",
        text: "Hey Sarah, I have a strong candidate for the Senior React Developer role at TechCorp. Interested in splitting this one 50/50?",
        timestamp: "2026-02-14T09:15:00Z",
        read: true,
      },
      {
        id: "m-1b",
        senderId: "u-self",
        text: "Absolutely, Marcus. What's their background? We need someone with at least 5 years of React and solid TypeScript experience.",
        timestamp: "2026-02-14T09:18:00Z",
        read: true,
      },
      {
        id: "m-1c",
        senderId: "u-1",
        text: "8 years in React, led a team of 6 at a fintech startup. Strong TypeScript, Node.js, and they've done system design for apps serving 2M+ users.",
        timestamp: "2026-02-14T09:22:00Z",
        read: true,
      },
      {
        id: "m-1d",
        senderId: "u-self",
        text: "That sounds perfect. Can you send over their profile? I'll get the split agreement drafted today.",
        timestamp: "2026-02-14T09:25:00Z",
        read: true,
      },
      {
        id: "m-1e",
        senderId: "u-1",
        text: "Profile attached. Also, the client wants to move fast - they're looking to close within 2 weeks. Let me know once the agreement is ready.",
        timestamp: "2026-02-14T09:30:00Z",
        read: false,
        attachment: {
          name: "candidate-profile-react-senior.pdf",
          size: "2.4 MB",
          type: "pdf",
        },
      },
    ],
  },
  {
    id: "c-2",
    participants: [users["u-self"], users["u-2"]],
    pinned: false,
    muted: false,
    subject: "Q1 Hiring Pipeline Review",
    messages: [
      {
        id: "m-2a",
        senderId: "u-2",
        text: "Hi Sarah, wanted to touch base on our Q1 hiring pipeline. We've got 12 open roles and only 3 are in final stages.",
        timestamp: "2026-02-13T14:00:00Z",
        read: true,
      },
      {
        id: "m-2b",
        senderId: "u-self",
        text: "That's concerning. Which departments are lagging behind?",
        timestamp: "2026-02-13T14:05:00Z",
        read: true,
      },
      {
        id: "m-2c",
        senderId: "u-2",
        text: "Engineering and Product are the worst. We need 4 more engineers and 2 PMs by end of March. The recruiter network hasn't been delivering quality candidates.",
        timestamp: "2026-02-13T14:12:00Z",
        read: true,
      },
      {
        id: "m-2d",
        senderId: "u-self",
        text: "I'll escalate this with the recruiting team. We can also open up some of these roles for split-fee arrangements to increase our reach.",
        timestamp: "2026-02-13T14:18:00Z",
        read: true,
      },
      {
        id: "m-2e",
        senderId: "u-2",
        text: "Good idea. Can we schedule a call tomorrow to map out the split strategy?",
        timestamp: "2026-02-13T14:22:00Z",
        read: false,
      },
    ],
  },
  {
    id: "c-3",
    participants: [users["u-self"], users["u-3"]],
    pinned: false,
    muted: false,
    subject: "Interview Preparation - Data Scientist Role",
    messages: [
      {
        id: "m-3a",
        senderId: "u-self",
        text: "Hi James, congratulations on moving to the final round for the Data Scientist position at AnalyticsPro! Here are some details about what to expect.",
        timestamp: "2026-02-12T10:00:00Z",
        read: true,
      },
      {
        id: "m-3b",
        senderId: "u-3",
        text: "Thank you so much! I'm really excited about this opportunity. What should I prepare for?",
        timestamp: "2026-02-12T10:30:00Z",
        read: true,
      },
      {
        id: "m-3c",
        senderId: "u-self",
        text: "The final round is a 3-hour panel: 1hr technical case study (Python/SQL), 1hr system design, and 1hr culture fit with the VP of Data. I'll send over a prep guide.",
        timestamp: "2026-02-12T10:35:00Z",
        read: true,
      },
      {
        id: "m-3d",
        senderId: "u-3",
        text: "Perfect. I've been brushing up on my ML pipeline design. When is the interview scheduled?",
        timestamp: "2026-02-12T11:00:00Z",
        read: true,
      },
      {
        id: "m-3e",
        senderId: "u-self",
        text: "Next Tuesday at 10 AM EST. I'll send a calendar invite with the Zoom link shortly.",
        timestamp: "2026-02-12T11:05:00Z",
        read: true,
      },
    ],
  },
  {
    id: "c-4",
    participants: [users["u-self"], users["u-4"]],
    pinned: true,
    muted: false,
    subject: "Network Expansion - West Coast",
    messages: [
      {
        id: "m-4a",
        senderId: "u-4",
        text: "Sarah, I've been building out connections in the Bay Area market. Got 8 new recruiting firms interested in joining the network.",
        timestamp: "2026-02-14T08:00:00Z",
        read: true,
      },
      {
        id: "m-4b",
        senderId: "u-self",
        text: "That's fantastic, Priya! What specializations do they cover?",
        timestamp: "2026-02-14T08:10:00Z",
        read: true,
      },
      {
        id: "m-4c",
        senderId: "u-4",
        text: "3 in DevOps/Cloud, 2 in AI/ML, 2 in Product/Design, and 1 full-stack generalist. All with strong track records.",
        timestamp: "2026-02-14T08:15:00Z",
        read: true,
      },
      {
        id: "m-4d",
        senderId: "u-self",
        text: "The AI/ML firms are exactly what we need. Can you prioritize onboarding those two? We have 6 open ML roles with no good matches yet.",
        timestamp: "2026-02-14T08:20:00Z",
        read: true,
      },
      {
        id: "m-4e",
        senderId: "u-4",
        text: "On it. I'll have onboarding calls scheduled by end of day. Also, one of the DevOps firms wants to discuss an exclusive partnership - should I explore that?",
        timestamp: "2026-02-14T08:25:00Z",
        read: false,
      },
    ],
  },
  {
    id: "c-5",
    participants: [users["u-self"], users["u-5"]],
    pinned: false,
    muted: false,
    subject: "Platform Metrics - February Report",
    messages: [
      {
        id: "m-5a",
        senderId: "u-5",
        text: "February metrics are in. We're up 23% in placements month-over-month. Split agreements are driving most of the growth.",
        timestamp: "2026-02-13T16:00:00Z",
        read: true,
      },
      {
        id: "m-5b",
        senderId: "u-self",
        text: "23% is incredible. What's the breakdown between direct placements and splits?",
        timestamp: "2026-02-13T16:10:00Z",
        read: true,
      },
      {
        id: "m-5c",
        senderId: "u-5",
        text: "65% splits, 35% direct. The split model is clearly resonating. Average time-to-fill for splits is 18 days vs 31 for direct.",
        timestamp: "2026-02-13T16:15:00Z",
        read: true,
      },
      {
        id: "m-5d",
        senderId: "u-self",
        text: "We should highlight this in the board presentation. Can you put together a summary deck?",
        timestamp: "2026-02-13T16:20:00Z",
        read: true,
      },
      {
        id: "m-5e",
        senderId: "u-5",
        text: "Already started. I'll have it ready by Thursday. Also flagging - churn rate ticked up slightly in the SMB segment. Worth watching.",
        timestamp: "2026-02-13T16:30:00Z",
        read: true,
      },
    ],
  },
  {
    id: "c-6",
    participants: [users["u-self"], users["u-6"]],
    pinned: false,
    muted: false,
    subject: "Application Status - Frontend Engineer",
    messages: [
      {
        id: "m-6a",
        senderId: "u-6",
        text: "Hi, I applied for the Frontend Engineer role at StreamFlow about two weeks ago. Is there any update on my application?",
        timestamp: "2026-02-11T13:00:00Z",
        read: true,
      },
      {
        id: "m-6b",
        senderId: "u-self",
        text: "Hi Nina! Let me check on that for you. I can see your application in the system - it's currently under review by the hiring manager.",
        timestamp: "2026-02-11T13:15:00Z",
        read: true,
      },
      {
        id: "m-6c",
        senderId: "u-6",
        text: "Thank you for checking. I'm really interested in this position. Is there anything else I should provide?",
        timestamp: "2026-02-11T13:20:00Z",
        read: true,
      },
      {
        id: "m-6d",
        senderId: "u-self",
        text: "Your application looks complete. I'll reach out to the hiring manager to expedite the review. Expect to hear back within 48 hours.",
        timestamp: "2026-02-11T13:25:00Z",
        read: true,
      },
    ],
  },
  {
    id: "c-7",
    participants: [users["u-self"], users["u-7"]],
    pinned: false,
    muted: true,
    subject: "Invoice Dispute - November Placement",
    messages: [
      {
        id: "m-7a",
        senderId: "u-7",
        text: "We need to discuss the November placement invoice. The fee structure doesn't match what was agreed upon in the original split agreement.",
        timestamp: "2026-02-10T09:00:00Z",
        read: true,
      },
      {
        id: "m-7b",
        senderId: "u-self",
        text: "I'll pull up the original agreement and compare. Can you specify which line items you're disputing?",
        timestamp: "2026-02-10T09:30:00Z",
        read: true,
      },
      {
        id: "m-7c",
        senderId: "u-7",
        text: "The placement fee shows 25% but our agreement was 20%. That's a $4,500 difference on a $90k salary.",
        timestamp: "2026-02-10T09:45:00Z",
        read: true,
      },
    ],
  },
  {
    id: "c-8",
    participants: [users["u-self"], users["u-8"]],
    pinned: false,
    muted: false,
    subject: "Urgent: Candidate Withdrawal - VP Engineering",
    messages: [
      {
        id: "m-8a",
        senderId: "u-8",
        text: "Bad news - our VP Engineering candidate just withdrew. They accepted a counter-offer from their current employer. We need to reactivate the search immediately.",
        timestamp: "2026-02-14T07:00:00Z",
        read: true,
      },
      {
        id: "m-8b",
        senderId: "u-self",
        text: "That's disappointing but not unexpected at that level. How far along were the backup candidates?",
        timestamp: "2026-02-14T07:10:00Z",
        read: true,
      },
      {
        id: "m-8c",
        senderId: "u-8",
        text: "We had two in the pipeline but deprioritized them. One is still available - strong background, 15 years experience, led engineering at two Series C startups.",
        timestamp: "2026-02-14T07:15:00Z",
        read: true,
      },
      {
        id: "m-8d",
        senderId: "u-self",
        text: "Get that candidate scheduled for a first-round ASAP. Also, should we open this up as a split opportunity to expand the search?",
        timestamp: "2026-02-14T07:20:00Z",
        read: true,
      },
      {
        id: "m-8e",
        senderId: "u-8",
        text: "Yes, let's split it. VP-level searches benefit from wider reach. I'll draft the listing today. The client is expecting an update by EOD.",
        timestamp: "2026-02-14T07:25:00Z",
        read: false,
      },
    ],
  },
];

/* ─── sidebar nav ─── */

const sidebarNav = [
  { icon: "fa-grid-2", label: "Dashboard", href: "#" },
  { icon: "fa-briefcase", label: "Roles", href: "#" },
  { icon: "fa-user-tie", label: "Recruiters", href: "#" },
  { icon: "fa-users", label: "Candidates", href: "#" },
  { icon: "fa-building", label: "Companies", href: "#" },
  { icon: "fa-file-lines", label: "Applications", href: "#" },
  {
    icon: "fa-comments",
    label: "Messages",
    href: "#",
    active: true,
    badge: 4,
  },
  { icon: "fa-handshake", label: "Placements", href: "#" },
];

/* ─── helpers ─── */

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date("2026-02-14T10:00:00Z");
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 1) {
    const mins = Math.floor(diffMs / 60000);
    return `${mins}m ago`;
  }
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return date.toLocaleDateString("en-US", { weekday: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFullTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateSeparator(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date("2026-02-14T10:00:00Z");
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / 86400000
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getOtherParticipant(conversation: Conversation): User {
  return (
    conversation.participants.find((p) => p.id !== currentUser.id) ??
    conversation.participants[0]
  );
}

function getUnreadCount(conversation: Conversation): number {
  return conversation.messages.filter(
    (m) => !m.read && m.senderId !== currentUser.id
  ).length;
}

/* ─── inbox filter tabs ─── */

type InboxFilter = "all" | "unread" | "pinned";

/* ─── main component ─── */

export default function MessagesTen() {
  const mainRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? null;

  /* ─── filtered conversations ─── */
  const filteredConversations = useMemo(() => {
    return conversations
      .filter((c) => {
        const other = getOtherParticipant(c);
        const matchesSearch =
          searchQuery === "" ||
          other.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.subject ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          c.messages.some((m) =>
            m.text.toLowerCase().includes(searchQuery.toLowerCase())
          );
        const matchesFilter =
          inboxFilter === "all" ||
          (inboxFilter === "unread" && getUnreadCount(c) > 0) ||
          (inboxFilter === "pinned" && c.pinned);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const aTime = new Date(
          a.messages[a.messages.length - 1].timestamp
        ).getTime();
        const bTime = new Date(
          b.messages[b.messages.length - 1].timestamp
        ).getTime();
        return bTime - aTime;
      });
  }, [conversations, searchQuery, inboxFilter]);

  const totalUnread = conversations.reduce(
    (sum, c) => sum + getUnreadCount(c),
    0
  );

  /* ─── select conversation ─── */
  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setMobileShowThread(true);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              messages: c.messages.map((m) => ({ ...m, read: true })),
            }
          : c
      )
    );
  }, []);

  /* ─── send message ─── */
  const sendMessage = useCallback(() => {
    if (!messageText.trim() || !activeConversationId) return;
    const newMessage: Message = {
      id: `m-new-${Date.now()}`,
      senderId: currentUser.id,
      text: messageText.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, messages: [...c.messages, newMessage] }
          : c
      )
    );
    setMessageText("");

    setTypingIndicator(true);
    setTimeout(() => setTypingIndicator(false), 2500);
  }, [messageText, activeConversationId]);

  /* ─── keyboard handler ─── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  /* ─── auto-scroll to bottom ─── */
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages.length]);

  /* ─── GSAP animations ─── */
  useGSAP(
    () => {
      if (!mainRef.current) return;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;

      const headerTl = gsap.timeline({ defaults: { ease: "power2.out" } });
      headerTl
        .fromTo(
          ".msg-scanline",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6 }
        )
        .fromTo(
          ".msg-title span",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
          "-=0.2"
        )
        .fromTo(
          ".msg-subtitle",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4 },
          "-=0.1"
        );

      gsap.fromTo(
        ".inbox-item",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.4,
        }
      );

      gsap.fromTo(
        ".sidebar-nav-item",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.06,
          ease: "power2.out",
          delay: 0.3,
        }
      );

      gsap.fromTo(
        ".filter-tab",
        { opacity: 0, y: -10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.08,
          ease: "power2.out",
          delay: 0.5,
        }
      );

      gsap.fromTo(
        ".online-pulse",
        { scale: 0.8, opacity: 0.5 },
        {
          scale: 1.2,
          opacity: 1,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          stagger: 0.2,
          ease: "sine.inOut",
        }
      );
    },
    { scope: mainRef }
  );

  /* ─── message bubble animation on conversation change ─── */
  useEffect(() => {
    if (!activeConversationId) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    requestAnimationFrame(() => {
      const bubbles = document.querySelectorAll(".msg-bubble");
      if (bubbles.length === 0) return;
      gsap.fromTo(
        bubbles,
        { opacity: 0, y: 15, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          stagger: 0.04,
          ease: "power2.out",
        }
      );
    });
  }, [activeConversationId]);

  /* ─── sidebar content ─── */
  const sidebarContent = (
    <aside className="w-64 h-full bg-base-200 border-r border-base-content/5 flex flex-col">
      <div className="p-5 border-b border-base-content/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            <i className="fa-duotone fa-regular fa-terminal text-sm" />
          </div>
          <div>
            <p className="font-mono text-sm font-bold tracking-tight">
              Splits
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30">
              Mission Control
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-base-content/20 px-3 mb-3">
          // navigation
        </p>
        <ul className="space-y-1">
          {sidebarNav.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setSidebarOpen(false);
                }}
                className={`sidebar-nav-item flex items-center gap-3 px-3 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors duration-200 ${
                  item.active
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-base-content/40 hover:text-base-content/70 hover:bg-base-300/50 border-l-2 border-transparent"
                }`}
              >
                <i
                  className={`fa-duotone fa-regular ${item.icon} w-4 text-center`}
                />
                <span className="flex-1">{item.label}</span>
                {item.active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
                {item.badge && (
                  <span className="font-mono text-[10px] font-bold bg-primary text-primary-content px-1.5 py-0.5 leading-none">
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-base-content/5">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 font-mono text-xs font-bold">
            SC
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs font-bold text-base-content/70 truncate">
              Sarah Chen
            </p>
            <p className="font-mono text-[10px] text-base-content/30 truncate">
              Admin
            </p>
          </div>
          <button className="text-base-content/20 hover:text-base-content/50 transition-colors">
            <i className="fa-duotone fa-regular fa-gear text-sm" />
          </button>
        </div>
      </div>
    </aside>
  );

  /* ─── render ─── */
  return (
    <div
      ref={mainRef}
      className="min-h-screen bg-base-300 text-base-content overflow-x-hidden flex"
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-base-300/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 h-full w-64">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen">
        {/* Header */}
        <section className="relative px-6 pt-6 pb-4 flex-shrink-0">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center bg-base-200 border border-base-content/5 text-base-content/50 hover:text-primary hover:border-primary/20 transition-colors"
              >
                <i className="fa-duotone fa-regular fa-bars text-sm" />
              </button>
              <div className="msg-scanline h-[2px] bg-primary w-32 origin-left" />
            </div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
                <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-2 opacity-80">
                  sys.comms &gt; messaging_hub v2.0
                </p>
                <h1 className="msg-title text-3xl md:text-4xl font-black tracking-tight leading-[0.95]">
                  <span className="inline">Comms </span>
                  <span className="text-primary">Hub</span>
                </h1>
                <p className="msg-subtitle text-base-content/40 font-mono text-sm mt-1">
                  Secure messaging across the recruiting network
                </p>
              </div>
              <div className="flex items-center gap-4 text-base-content/20 self-start md:self-auto">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="font-mono text-[10px] uppercase tracking-wider">
                    Encrypted
                  </span>
                </div>
                <span className="hidden md:inline text-base-content/10">
                  |
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  {totalUnread > 0
                    ? `${totalUnread} unread`
                    : "All caught up"}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-6 w-8 h-8 border-r-2 border-t-2 border-primary/20" />
        </section>

        {/* Messaging area - split view */}
        <div className="flex-1 flex min-h-0 px-4 pb-4 gap-0 max-w-7xl mx-auto w-full">
          {/* CONVERSATION LIST */}
          <div
            className={`w-full md:w-96 flex-shrink-0 flex flex-col bg-base-200 border border-base-content/5 ${
              mobileShowThread ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Search */}
            <div className="p-3 border-b border-base-content/5">
              <div className="relative">
                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/20 text-xs" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-base-300 border border-base-content/5 pl-9 pr-16 py-2.5 font-mono text-xs text-base-content placeholder:text-base-content/20 focus:outline-none focus:border-primary/30 transition-colors"
                />
                <button
                  onClick={() => setCommandPaletteOpen(!commandPaletteOpen)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-base-content/5 px-2 py-1 text-base-content/20 hover:text-base-content/40 transition-colors"
                >
                  <span className="font-mono text-[10px]">/</span>
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-base-content/5">
              {(["all", "unread", "pinned"] as InboxFilter[]).map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setInboxFilter(filter)}
                    className={`filter-tab font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 transition-colors ${
                      inboxFilter === filter
                        ? "bg-primary text-primary-content"
                        : "text-base-content/30 hover:text-base-content/50 hover:bg-base-300/50"
                    }`}
                  >
                    {filter}
                    {filter === "unread" && totalUnread > 0 && (
                      <span className="ml-1.5 bg-primary-content/20 px-1 py-0.5 leading-none">
                        {totalUnread}
                      </span>
                    )}
                  </button>
                )
              )}
              <div className="flex-1" />
              <button className="text-base-content/20 hover:text-primary transition-colors p-1">
                <i className="fa-duotone fa-regular fa-pen-to-square text-sm" />
              </button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <i className="fa-duotone fa-regular fa-inbox text-3xl text-base-content/10 mb-3" />
                  <p className="font-mono text-xs text-base-content/20 uppercase tracking-wider">
                    No conversations found
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const lastMsg = conv.messages[conv.messages.length - 1];
                  const unread = getUnreadCount(conv);
                  const rc = roleConfig[other.role];
                  const isActive = conv.id === activeConversationId;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={`inbox-item w-full text-left px-4 py-3.5 border-b border-base-content/5 transition-all duration-200 group ${
                        isActive
                          ? "bg-primary/5 border-l-2 border-l-primary"
                          : "border-l-2 border-l-transparent hover:bg-base-300/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div
                            className={`w-10 h-10 flex items-center justify-center ${rc.bgColor} ${rc.color} border ${rc.borderColor} font-mono text-xs font-bold`}
                          >
                            {other.initials}
                          </div>
                          {other.online && (
                            <span className="online-pulse absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-base-200 rounded-full" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`font-mono text-xs font-bold truncate ${
                                  unread > 0
                                    ? "text-base-content"
                                    : "text-base-content/70"
                                }`}
                              >
                                {other.name}
                              </span>
                              <span
                                className={`font-mono text-[9px] uppercase tracking-wider ${rc.color} flex-shrink-0`}
                              >
                                {rc.label}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-base-content/25 flex-shrink-0">
                              {formatMessageTime(lastMsg.timestamp)}
                            </span>
                          </div>

                          {conv.subject && (
                            <p
                              className={`font-mono text-[11px] truncate mb-0.5 ${
                                unread > 0
                                  ? "text-base-content/70"
                                  : "text-base-content/40"
                              }`}
                            >
                              {conv.subject}
                            </p>
                          )}

                          <div className="flex items-center gap-2">
                            <p className="font-mono text-[10px] text-base-content/30 truncate flex-1">
                              {lastMsg.senderId === currentUser.id
                                ? "You: "
                                : ""}
                              {lastMsg.text}
                            </p>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {conv.pinned && (
                                <i className="fa-duotone fa-regular fa-thumbtack text-[10px] text-primary/40" />
                              )}
                              {conv.muted && (
                                <i className="fa-duotone fa-regular fa-bell-slash text-[10px] text-base-content/15" />
                              )}
                              {unread > 0 && (
                                <span className="w-5 h-5 flex items-center justify-center bg-primary text-primary-content font-mono text-[10px] font-bold rounded-full">
                                  {unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Inbox footer */}
            <div className="px-4 py-2.5 border-t border-base-content/5 flex items-center justify-between">
              <span className="font-mono text-[10px] text-base-content/20 uppercase tracking-wider">
                {filteredConversations.length} conversations
              </span>
              <div className="flex items-center gap-1 text-base-content/15">
                <span className="w-1 h-1 rounded-full bg-success" />
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  {
                    Object.values(users).filter(
                      (u) => u.online && u.id !== currentUser.id
                    ).length
                  }{" "}
                  online
                </span>
              </div>
            </div>
          </div>

          {/* MESSAGE THREAD */}
          <div
            className={`flex-1 flex flex-col bg-base-200/50 border border-base-content/5 border-l-0 min-w-0 ${
              !mobileShowThread ? "hidden md:flex" : "flex"
            }`}
          >
            {!activeConversation ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-base-content/[0.03] border border-base-content/5">
                    <i className="fa-duotone fa-regular fa-satellite-dish text-3xl text-base-content/10" />
                  </div>
                  <p className="font-mono text-sm font-bold text-base-content/20 mb-2">
                    No Signal Selected
                  </p>
                  <p className="font-mono text-xs text-base-content/15 max-w-xs">
                    Select a conversation from the inbox to begin
                    transmitting. All communications are end-to-end
                    encrypted.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-4 text-base-content/10">
                    <span className="w-8 h-[1px] bg-base-content/10" />
                    <i className="fa-duotone fa-regular fa-lock text-xs" />
                    <span className="w-8 h-[1px] bg-base-content/10" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-base-content/5 flex-shrink-0 bg-base-200">
                  <button
                    onClick={() => setMobileShowThread(false)}
                    className="md:hidden w-8 h-8 flex items-center justify-center bg-base-300 border border-base-content/5 text-base-content/40 hover:text-primary transition-colors"
                  >
                    <i className="fa-duotone fa-regular fa-arrow-left text-xs" />
                  </button>

                  {(() => {
                    const other = getOtherParticipant(activeConversation);
                    const rc = roleConfig[other.role];
                    return (
                      <>
                        <div className="relative">
                          <div
                            className={`w-9 h-9 flex items-center justify-center ${rc.bgColor} ${rc.color} border ${rc.borderColor} font-mono text-xs font-bold`}
                          >
                            {other.initials}
                          </div>
                          {other.online && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success border-2 border-base-200 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold truncate">
                              {other.name}
                            </span>
                            <span
                              className={`font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 ${rc.bgColor} ${rc.color} border ${rc.borderColor}`}
                            >
                              {other.role}
                            </span>
                            {other.online ? (
                              <span className="font-mono text-[10px] text-success/60">
                                online
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] text-base-content/20">
                                offline
                              </span>
                            )}
                          </div>
                          {activeConversation.subject && (
                            <p className="font-mono text-[10px] text-base-content/30 truncate">
                              {activeConversation.subject}
                            </p>
                          )}
                        </div>
                      </>
                    );
                  })()}

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button className="w-8 h-8 flex items-center justify-center text-base-content/20 hover:text-primary hover:bg-primary/5 transition-colors">
                      <i className="fa-duotone fa-regular fa-phone text-xs" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-base-content/20 hover:text-primary hover:bg-primary/5 transition-colors">
                      <i className="fa-duotone fa-regular fa-video text-xs" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-base-content/20 hover:text-primary hover:bg-primary/5 transition-colors">
                      <i className="fa-duotone fa-regular fa-thumbtack text-xs" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-base-content/20 hover:text-primary hover:bg-primary/5 transition-colors">
                      <i className="fa-duotone fa-regular fa-ellipsis-vertical text-xs" />
                    </button>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  {/* Encryption banner */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="h-[1px] flex-1 bg-base-content/5" />
                    <div className="flex items-center gap-2 px-3 py-1 bg-base-content/[0.03] border border-base-content/5">
                      <i className="fa-duotone fa-regular fa-lock text-[10px] text-base-content/15" />
                      <span className="font-mono text-[10px] text-base-content/15 uppercase tracking-wider">
                        End-to-end encrypted
                      </span>
                    </div>
                    <span className="h-[1px] flex-1 bg-base-content/5" />
                  </div>

                  {/* Messages */}
                  {activeConversation.messages.map((msg, idx) => {
                    const isSelf = msg.senderId === currentUser.id;
                    const sender = users[msg.senderId];
                    const rc = roleConfig[sender?.role ?? "candidate"];

                    const prevMsg =
                      idx > 0
                        ? activeConversation.messages[idx - 1]
                        : null;
                    const showDateSep =
                      !prevMsg ||
                      formatDateSeparator(msg.timestamp) !==
                        formatDateSeparator(prevMsg.timestamp);

                    return (
                      <div key={msg.id}>
                        {showDateSep && (
                          <div className="flex items-center gap-3 my-5">
                            <span className="h-[1px] flex-1 bg-base-content/5" />
                            <span className="font-mono text-[10px] text-base-content/20 uppercase tracking-wider">
                              {formatDateSeparator(msg.timestamp)}
                            </span>
                            <span className="h-[1px] flex-1 bg-base-content/5" />
                          </div>
                        )}

                        <div
                          className={`msg-bubble flex gap-3 mb-3 ${
                            isSelf ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          {!isSelf && (
                            <div
                              className={`w-8 h-8 flex-shrink-0 flex items-center justify-center ${rc.bgColor} ${rc.color} border ${rc.borderColor} font-mono text-[10px] font-bold self-end`}
                            >
                              {sender?.initials ?? "??"}
                            </div>
                          )}

                          <div
                            className={`max-w-[75%] ${
                              isSelf ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`px-4 py-3 ${
                                isSelf
                                  ? "bg-primary/10 border border-primary/15"
                                  : "bg-base-300 border border-base-content/5"
                              }`}
                            >
                              <p className="font-mono text-xs leading-relaxed text-base-content/80">
                                {msg.text}
                              </p>

                              {msg.attachment && (
                                <div className="mt-2 pt-2 border-t border-base-content/5">
                                  <div className="flex items-center gap-2 bg-base-content/[0.03] px-3 py-2 border border-base-content/5 cursor-pointer hover:border-primary/20 transition-colors">
                                    <i
                                      className={`fa-duotone fa-regular fa-file-${
                                        msg.attachment.type === "pdf"
                                          ? "pdf"
                                          : "lines"
                                      } text-sm text-primary/60`}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-mono text-[11px] text-base-content/60 truncate">
                                        {msg.attachment.name}
                                      </p>
                                      <p className="font-mono text-[9px] text-base-content/25">
                                        {msg.attachment.size}
                                      </p>
                                    </div>
                                    <i className="fa-duotone fa-regular fa-download text-xs text-base-content/20" />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div
                              className={`flex items-center gap-1.5 mt-1 ${
                                isSelf
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <span className="font-mono text-[9px] text-base-content/20">
                                {formatFullTime(msg.timestamp)}
                              </span>
                              {isSelf && (
                                <i
                                  className={`fa-duotone fa-regular fa-check-double text-[9px] ${
                                    msg.read
                                      ? "text-primary/40"
                                      : "text-base-content/15"
                                  }`}
                                />
                              )}
                            </div>
                          </div>

                          {isSelf && (
                            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 font-mono text-[10px] font-bold self-end">
                              {currentUser.initials}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {typingIndicator && (
                    <div className="flex gap-3 mb-3">
                      <div
                        className={`w-8 h-8 flex-shrink-0 flex items-center justify-center ${
                          roleConfig[
                            getOtherParticipant(activeConversation).role
                          ].bgColor
                        } ${
                          roleConfig[
                            getOtherParticipant(activeConversation).role
                          ].color
                        } border ${
                          roleConfig[
                            getOtherParticipant(activeConversation).role
                          ].borderColor
                        } font-mono text-[10px] font-bold self-end`}
                      >
                        {getOtherParticipant(activeConversation).initials}
                      </div>
                      <div className="bg-base-300 border border-base-content/5 px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-base-content/20 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-base-content/20 animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-base-content/20 animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messageEndRef} />
                </div>

                {/* Compose area */}
                <div className="flex-shrink-0 border-t border-base-content/5 bg-base-200 p-3">
                  <div className="flex items-center gap-1 mb-2">
                    <button className="w-8 h-8 flex items-center justify-center text-base-content/20 hover:text-primary hover:bg-primary/5 transition-colors">
                      <i className="fa-duotone fa-regular fa-paperclip text-sm" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-base-content/20 hover:text-primary hover:bg-primary/5 transition-colors">
                      <i className="fa-duotone fa-regular fa-image text-sm" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-base-content/20 hover:text-primary hover:bg-primary/5 transition-colors">
                      <i className="fa-duotone fa-regular fa-code text-sm" />
                    </button>
                    <span className="w-[1px] h-4 bg-base-content/5 mx-1" />
                    <button className="w-8 h-8 flex items-center justify-center text-base-content/20 hover:text-primary hover:bg-primary/5 transition-colors">
                      <i className="fa-duotone fa-regular fa-face-smile text-sm" />
                    </button>
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                        rows={1}
                        className="w-full bg-base-300 border border-base-content/5 px-4 py-3 font-mono text-xs text-base-content placeholder:text-base-content/20 focus:outline-none focus:border-primary/30 transition-colors resize-none min-h-[44px] max-h-32"
                        style={
                          {
                            fieldSizing: "content",
                          } as React.CSSProperties
                        }
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!messageText.trim()}
                      className={`w-11 h-11 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        messageText.trim()
                          ? "bg-primary text-primary-content hover:opacity-80"
                          : "bg-base-content/5 text-base-content/15 cursor-not-allowed"
                      }`}
                    >
                      <i className="fa-duotone fa-regular fa-paper-plane-top text-sm" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 text-base-content/15">
                      <span className="font-mono text-[9px] uppercase tracking-wider">
                        <span className="bg-base-content/5 px-1 py-0.5 mr-1">
                          Enter
                        </span>{" "}
                        send
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider">
                        <span className="bg-base-content/5 px-1 py-0.5 mr-1">
                          Shift+Enter
                        </span>{" "}
                        new line
                      </span>
                    </div>
                    <span className="font-mono text-[9px] text-base-content/10">
                      {messageText.length > 0
                        ? `${messageText.length} chars`
                        : ""}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Command palette overlay */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-32">
          <div
            className="absolute inset-0 bg-base-300/80 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-base-200 border border-base-content/5 shadow-2xl">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-base-content/5">
              <i className="fa-duotone fa-regular fa-terminal text-primary text-sm" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command..."
                className="flex-1 bg-transparent font-mono text-sm text-base-content placeholder:text-base-content/20 focus:outline-none"
                onKeyDown={(e) =>
                  e.key === "Escape" && setCommandPaletteOpen(false)
                }
              />
              <span className="font-mono text-[10px] text-base-content/15 bg-base-content/5 px-1.5 py-0.5">
                ESC
              </span>
            </div>
            <div className="py-2">
              {[
                {
                  icon: "fa-pen-to-square",
                  label: "New Message",
                  shortcut: "N",
                },
                {
                  icon: "fa-user-plus",
                  label: "Add Contact",
                  shortcut: "A",
                },
                {
                  icon: "fa-magnifying-glass",
                  label: "Search All Messages",
                  shortcut: "S",
                },
                {
                  icon: "fa-archive",
                  label: "Archive Conversation",
                  shortcut: "E",
                },
                {
                  icon: "fa-bell-slash",
                  label: "Mute Conversation",
                  shortcut: "M",
                },
                {
                  icon: "fa-flag",
                  label: "Flag for Follow-up",
                  shortcut: "F",
                },
              ].map((cmd) => (
                <button
                  key={cmd.label}
                  onClick={() => setCommandPaletteOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-base-300/50 transition-colors group"
                >
                  <i
                    className={`fa-duotone fa-regular ${cmd.icon} w-4 text-center text-base-content/20 group-hover:text-primary transition-colors`}
                  />
                  <span className="flex-1 font-mono text-xs text-base-content/60 group-hover:text-base-content/80">
                    {cmd.label}
                  </span>
                  <span className="font-mono text-[10px] text-base-content/15 bg-base-content/5 px-1.5 py-0.5">
                    {cmd.shortcut}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
