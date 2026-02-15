'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/* ------------------------------------------------------------------ */
/*  Memphis Notification UI Components Showcase                        */
/* ------------------------------------------------------------------ */

const COLORS = {
  coral: '#FF6B6B',
  teal: '#4ECDC4',
  yellow: '#FFE66D',
  purple: '#A78BFA',
  dark: '#1A1A2E',
  cream: '#F5F0EB',
};

/* ---------- Toast ---------- */
interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

const TOAST_META: Record<Toast['type'], { bg: string; icon: string; border: string }> = {
  success: { bg: COLORS.teal, icon: 'fa-circle-check', border: COLORS.dark },
  error: { bg: COLORS.coral, icon: 'fa-circle-xmark', border: COLORS.dark },
  warning: { bg: COLORS.yellow, icon: 'fa-triangle-exclamation', border: COLORS.dark },
  info: { bg: COLORS.purple, icon: 'fa-circle-info', border: COLORS.dark },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const meta = TOAST_META[toast.type];

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.4)' });
    }
  }, []);

  const dismiss = () => {
    if (ref.current) {
      gsap.to(ref.current, {
        x: 80,
        opacity: 0,
        duration: 0.3,
        onComplete: () => onDismiss(toast.id),
      });
    }
  };

  return (
    <div
      ref={ref}
      style={{ background: meta.bg, border: `4px solid ${meta.border}`, borderRadius: 0, color: COLORS.dark }}
      className="p-4 min-w-[320px] flex items-start gap-3"
    >
      <i className={`fa-duotone fa-solid ${meta.icon} text-xl mt-0.5`} />
      <div className="flex-1">
        <p className="font-black text-sm uppercase tracking-wide">{toast.title}</p>
        <p className="text-sm mt-1 font-medium">{toast.message}</p>
      </div>
      <button onClick={dismiss} className="font-black text-lg leading-none hover:opacity-60 transition-opacity">
        &times;
      </button>
    </div>
  );
}

/* ---------- Alert Banner ---------- */
function AlertBanner({
  type,
  children,
}: {
  type: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
}) {
  const meta = TOAST_META[type];
  return (
    <div
      style={{ background: meta.bg, border: `4px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
      className="p-4 flex items-center gap-3"
    >
      <i className={`fa-duotone fa-solid ${meta.icon} text-lg`} />
      <span className="font-bold text-sm flex-1">{children}</span>
      <button className="font-black hover:opacity-60">&times;</button>
    </div>
  );
}

/* ---------- Badge ---------- */
function Badge({
  label,
  count,
  color,
}: {
  label: string;
  count?: number;
  color: string;
}) {
  return (
    <span
      style={{ background: color, border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
      className="inline-flex items-center gap-2 px-3 py-1 font-black text-xs uppercase tracking-wider"
    >
      {label}
      {count !== undefined && (
        <span
          style={{ background: COLORS.dark, color: '#fff', borderRadius: 0 }}
          className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-black"
        >
          {count}
        </span>
      )}
    </span>
  );
}

/* ---------- Snackbar ---------- */
function Snackbar({ message, action, visible }: { message: string; action?: string; visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.to(ref.current, { y: visible ? 0 : 80, opacity: visible ? 1 : 0, duration: 0.35, ease: 'power2.out' });
    }
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: COLORS.dark,
        border: `4px solid ${COLORS.teal}`,
        borderRadius: 0,
        color: '#fff',
        opacity: 0,
        transform: 'translateY(80px)',
      }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 flex items-center gap-4"
    >
      <span className="font-bold text-sm">{message}</span>
      {action && (
        <button style={{ color: COLORS.yellow }} className="font-black text-sm uppercase tracking-wider hover:underline">
          {action}
        </button>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

let nextToastId = 0;

export default function NotificationsUISixPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  /* hero animation */
  useEffect(() => {
    if (!heroRef.current) return;
    const els = heroRef.current.querySelectorAll('[data-anim]');
    gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.7, ease: 'power3.out' });
  }, []);

  /* section scroll-in */
  useEffect(() => {
    sectionRefs.current.forEach((el) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        },
      );
    });
  }, []);

  const pushToast = (type: Toast['type']) => {
    const titles: Record<string, string> = { success: 'Success!', error: 'Error!', warning: 'Warning!', info: 'Info' };
    const messages: Record<string, string> = {
      success: 'Candidate was placed successfully.',
      error: 'Failed to update the job listing.',
      warning: 'API rate limit approaching 90%.',
      info: 'New recruiter joined your network.',
    };
    const id = ++nextToastId;
    setToasts((prev) => [...prev, { id, type, title: titles[type], message: messages[type] }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const showSnackbar = () => {
    setSnackbarVisible(true);
    setTimeout(() => setSnackbarVisible(false), 3500);
  };

  const setRef = (i: number) => (el: HTMLDivElement | null) => {
    sectionRefs.current[i] = el;
  };

  return (
    <div style={{ background: COLORS.cream }} className="min-h-screen">
      {/* ---- floating toasts (top-right) ---- */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>

      {/* ---- snackbar ---- */}
      <Snackbar message="Profile changes saved" action="Undo" visible={snackbarVisible} />

      {/* ===================== HERO ===================== */}
      <section
        ref={heroRef}
        style={{ background: COLORS.dark }}
        className="relative overflow-hidden py-28 px-6 text-center"
      >
        {/* decorative shapes */}
        <div
          style={{ background: COLORS.coral, width: 120, height: 120, border: `4px solid ${COLORS.cream}`, borderRadius: 0 }}
          className="absolute top-10 left-10 rotate-12 opacity-30"
        />
        <div
          style={{ background: COLORS.teal, width: 80, height: 80, border: `4px solid ${COLORS.cream}`, borderRadius: '50%' }}
          className="absolute bottom-16 right-20 opacity-25"
        />
        <div
          style={{ background: COLORS.yellow, width: 60, height: 60, border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}
          className="absolute top-1/2 right-[10%] -rotate-6 opacity-20"
        />

        <h1 data-anim className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white">
          Notification <span style={{ color: COLORS.coral }}>UI</span>
        </h1>
        <p data-anim className="mt-4 text-lg md:text-xl font-bold uppercase tracking-widest" style={{ color: COLORS.teal }}>
          Toasts &bull; Alerts &bull; Badges &bull; Snackbars
        </p>
        <p data-anim className="mt-6 max-w-xl mx-auto text-base" style={{ color: '#ccc' }}>
          A full showcase of notification UI primitives styled in the Memphis aesthetic &mdash; sharp corners, thick borders, bold colour.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-20 space-y-24">
        {/* ===================== TOAST DEMOS ===================== */}
        <section ref={setRef(0)}>
          <SectionHeading icon="fa-message-dots" title="Toast Notifications" subtitle="Trigger ephemeral alerts that auto-dismiss after 5 s" />
          <div className="flex flex-wrap gap-4 mt-8">
            {(['success', 'error', 'warning', 'info'] as const).map((type) => {
              const meta = TOAST_META[type];
              return (
                <button
                  key={type}
                  onClick={() => pushToast(type)}
                  style={{ background: meta.bg, border: `4px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
                  className="px-6 py-3 font-black text-sm uppercase tracking-wider transition-all hover:opacity-80"
                >
                  <i className={`fa-duotone fa-solid ${meta.icon} mr-2`} />
                  {type}
                </button>
              );
            })}
          </div>
        </section>

        {/* ===================== ALERT BANNERS ===================== */}
        <section ref={setRef(1)}>
          <SectionHeading icon="fa-flag" title="Alert Banners" subtitle="Persistent inline alerts for contextual messaging" />
          <div className="space-y-4 mt-8">
            <AlertBanner type="success">Placement #4821 has been confirmed and the invoice is ready.</AlertBanner>
            <AlertBanner type="error">Unable to reach the billing service &mdash; retrying in 30 s.</AlertBanner>
            <AlertBanner type="warning">Your subscription renews in 3 days. Update payment method.</AlertBanner>
            <AlertBanner type="info">Maintenance window scheduled for Saturday 02:00 &ndash; 04:00 UTC.</AlertBanner>
          </div>
        </section>

        {/* ===================== BADGES ===================== */}
        <section ref={setRef(2)}>
          <SectionHeading icon="fa-certificate" title="Badges" subtitle="Status indicators and notification counts" />
          <div className="flex flex-wrap gap-4 mt-8">
            <Badge label="Active" color={COLORS.teal} />
            <Badge label="Pending" color={COLORS.yellow} />
            <Badge label="Rejected" color={COLORS.coral} />
            <Badge label="Messages" count={12} color={COLORS.purple} />
            <Badge label="Tasks" count={3} color={COLORS.teal} />
            <Badge label="Alerts" count={7} color={COLORS.coral} />
            <Badge label="Pro" color={COLORS.yellow} />
            <Badge label="New" color={COLORS.teal} />
          </div>

          {/* status dot badges */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { label: 'Online', dot: COLORS.teal },
              { label: 'Away', dot: COLORS.yellow },
              { label: 'Busy', dot: COLORS.coral },
              { label: 'Offline', dot: '#888' },
            ].map((s) => (
              <span key={s.label} className="flex items-center gap-2 font-bold text-sm" style={{ color: COLORS.dark }}>
                <span style={{ background: s.dot, width: 12, height: 12, border: `2px solid ${COLORS.dark}`, borderRadius: '50%' }} className="inline-block" />
                {s.label}
              </span>
            ))}
          </div>
        </section>

        {/* ===================== SNACKBAR ===================== */}
        <section ref={setRef(3)}>
          <SectionHeading icon="fa-rectangle-wide" title="Snackbar" subtitle="Brief bottom-of-screen feedback with optional action" />
          <button
            onClick={showSnackbar}
            style={{ background: COLORS.dark, border: `4px solid ${COLORS.teal}`, borderRadius: 0, color: '#fff' }}
            className="mt-8 px-8 py-3 font-black text-sm uppercase tracking-wider transition-all hover:opacity-80"
          >
            <i className="fa-duotone fa-solid fa-up-from-bracket mr-2" />
            Show Snackbar
          </button>
        </section>

        {/* ===================== POSITIONS DEMO ===================== */}
        <section ref={setRef(4)}>
          <SectionHeading icon="fa-arrows-up-down-left-right" title="Position Examples" subtitle="Notifications can appear in any screen corner" />
          <div
            style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0, background: '#fff', height: 320 }}
            className="relative mt-8 overflow-hidden"
          >
            {/* top-right */}
            <MiniToast position="top-4 right-4" color={COLORS.teal} label="Top-Right" icon="fa-arrow-up-right" />
            {/* top-left */}
            <MiniToast position="top-4 left-4" color={COLORS.purple} label="Top-Left" icon="fa-arrow-up-left" />
            {/* bottom-right */}
            <MiniToast position="bottom-4 right-4" color={COLORS.coral} label="Bottom-Right" icon="fa-arrow-down-right" />
            {/* bottom-left */}
            <MiniToast position="bottom-4 left-4" color={COLORS.yellow} label="Bottom-Left" icon="fa-arrow-down-left" />
            {/* center label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-black text-lg uppercase tracking-widest" style={{ color: '#ccc' }}>
                Viewport
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ===================== FOOTER ===================== */}
      <footer style={{ background: COLORS.dark }} className="py-12 text-center">
        <p className="font-black text-xs uppercase tracking-[0.3em]" style={{ color: COLORS.teal }}>
          Splits Network &mdash; Memphis Design System &mdash; Notification UI
        </p>
      </footer>
    </div>
  );
}

/* ---------- helpers ---------- */

function SectionHeading({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3" style={{ color: COLORS.dark }}>
        <i className={`fa-duotone fa-solid ${icon}`} style={{ color: COLORS.coral }} />
        {title}
      </h2>
      <p className="mt-1 font-bold text-sm uppercase tracking-widest" style={{ color: COLORS.purple }}>
        {subtitle}
      </p>
    </div>
  );
}

function MiniToast({ position, color, label, icon }: { position: string; color: string; label: string; icon: string }) {
  return (
    <div
      className={`absolute ${position} px-4 py-2 flex items-center gap-2`}
      style={{ background: color, border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
    >
      <i className={`fa-duotone fa-solid ${icon} text-sm`} />
      <span className="font-black text-xs uppercase tracking-wider">{label}</span>
    </div>
  );
}
