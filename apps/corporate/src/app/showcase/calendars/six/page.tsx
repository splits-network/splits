'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import gsap from 'gsap';

/* ------------------------------------------------------------------ */
/*  Memphis Calendar Interface                                         */
/* ------------------------------------------------------------------ */

const COLORS = {
  coral: '#FF6B6B',
  teal: '#4ECDC4',
  yellow: '#FFE66D',
  purple: '#A78BFA',
  dark: '#1A1A2E',
  cream: '#F5F0EB',
};

type ViewMode = 'month' | 'week' | 'day';

interface CalendarEvent {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // multi-day
  time?: string;
  color: string;
  icon: string;
}

const SAMPLE_EVENTS: CalendarEvent[] = [
  { id: 1, title: 'Team Standup', date: '2026-02-02', time: '9:00 AM', color: COLORS.teal, icon: 'fa-users' },
  { id: 2, title: 'Client Interview', date: '2026-02-05', time: '2:00 PM', color: COLORS.coral, icon: 'fa-video' },
  { id: 3, title: 'Sprint Review', date: '2026-02-05', time: '4:00 PM', color: COLORS.purple, icon: 'fa-presentation-screen' },
  { id: 4, title: 'Job Fair', date: '2026-02-10', endDate: '2026-02-12', color: COLORS.yellow, icon: 'fa-calendar-star' },
  { id: 5, title: 'Placement Call', date: '2026-02-14', time: '11:00 AM', color: COLORS.coral, icon: 'fa-phone' },
  { id: 6, title: 'Recruiter Meetup', date: '2026-02-14', time: '6:00 PM', color: COLORS.teal, icon: 'fa-champagne-glasses' },
  { id: 7, title: 'Billing Review', date: '2026-02-18', time: '10:00 AM', color: COLORS.purple, icon: 'fa-receipt' },
  { id: 8, title: 'Onboarding', date: '2026-02-20', endDate: '2026-02-21', color: COLORS.teal, icon: 'fa-user-plus' },
  { id: 9, title: 'Platform Demo', date: '2026-02-24', time: '3:00 PM', color: COLORS.yellow, icon: 'fa-desktop' },
  { id: 10, title: 'Month-End Close', date: '2026-02-28', time: '5:00 PM', color: COLORS.coral, icon: 'fa-calendar-check' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/* ---------- Event Tooltip ---------- */
function EventTooltip({ event }: { event: CalendarEvent }) {
  return (
    <div
      className="absolute z-50 -top-2 left-full ml-2 p-3 min-w-[200px]"
      style={{ background: '#fff', border: `3px solid ${COLORS.dark}`, borderRadius: 0 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3" style={{ background: event.color, border: `2px solid ${COLORS.dark}`, borderRadius: 0 }} />
        <span className="font-black text-xs uppercase tracking-wider" style={{ color: COLORS.dark }}>{event.title}</span>
      </div>
      {event.time && <p className="text-xs font-bold" style={{ color: '#999' }}>{event.time}</p>}
      {event.endDate && <p className="text-xs font-bold" style={{ color: '#999' }}>Multi-day: {event.date} to {event.endDate}</p>}
    </div>
  );
}

/* ---------- Month View ---------- */
function MonthView({ year, month, events, selectedDate, onSelectDate }: {
  year: number; month: number; events: CalendarEvent[]; selectedDate: string | null; onSelectDate: (d: string) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = formatDate(2026, 1, 14); // Feb 14, 2026

  useEffect(() => {
    if (!gridRef.current) return;
    const cells = gridRef.current.querySelectorAll('[data-cell]');
    gsap.fromTo(cells, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.01, duration: 0.3, ease: 'back.out(1.2)' });
  }, [year, month]);

  const eventsForDate = useCallback((dateStr: string) => events.filter((e) => {
    if (e.date === dateStr) return true;
    if (e.endDate) {
      return dateStr >= e.date && dateStr <= e.endDate;
    }
    return false;
  }), [events]);

  const cells = [];
  // empty leading cells
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="p-2" style={{ background: '#f0ece7' }} />);
  }
  // day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(year, month, d);
    const dayEvents = eventsForDate(dateStr);
    const isToday = dateStr === today;
    const isSelected = dateStr === selectedDate;

    cells.push(
      <div
        key={d}
        data-cell
        onClick={() => onSelectDate(dateStr)}
        className="p-2 min-h-[80px] cursor-pointer transition-colors relative group"
        style={{
          background: isSelected ? COLORS.dark : isToday ? COLORS.yellow + '40' : '#fff',
          border: isToday ? `3px solid ${COLORS.coral}` : '1px solid #e5e5e5',
          borderRadius: 0,
        }}
      >
        <span
          className="font-black text-sm"
          style={{ color: isSelected ? '#fff' : isToday ? COLORS.coral : COLORS.dark }}
        >
          {d}
        </span>
        <div className="mt-1 space-y-0.5">
          {dayEvents.slice(0, 2).map((ev) => (
            <div
              key={ev.id}
              className="px-1.5 py-0.5 text-[10px] font-bold truncate relative"
              style={{ background: ev.color, color: COLORS.dark, borderRadius: 0 }}
            >
              <i className={`fa-duotone fa-solid ${ev.icon} mr-1`} />
              {ev.title}
            </div>
          ))}
          {dayEvents.length > 2 && (
            <span className="text-[10px] font-black" style={{ color: COLORS.purple }}>
              +{dayEvents.length - 2} more
            </span>
          )}
        </div>
      </div>,
    );
  }

  return (
    <div>
      {/* day headers */}
      <div className="grid grid-cols-7" style={{ background: COLORS.dark }}>
        {DAYS.map((d) => (
          <div key={d} className="p-3 text-center font-black text-xs uppercase tracking-wider" style={{ color: COLORS.yellow }}>
            {d}
          </div>
        ))}
      </div>
      {/* grid */}
      <div ref={gridRef} className="grid grid-cols-7">
        {cells}
      </div>
    </div>
  );
}

/* ---------- Week View ---------- */
function WeekView({ events }: { events: CalendarEvent[] }) {
  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* header */}
        <div className="grid grid-cols-8 gap-0" style={{ background: COLORS.dark }}>
          <div className="p-3 font-black text-xs uppercase text-center" style={{ color: COLORS.teal }}>Time</div>
          {['Mon 10', 'Tue 11', 'Wed 12', 'Thu 13', 'Fri 14', 'Sat 15', 'Sun 16'].map((d) => (
            <div key={d} className="p-3 font-black text-xs uppercase text-center" style={{ color: d.includes('14') ? COLORS.coral : COLORS.yellow }}>
              {d}
            </div>
          ))}
        </div>
        {/* rows */}
        {hours.map((h) => (
          <div key={h} className="grid grid-cols-8 gap-0" style={{ borderBottom: `1px solid ${COLORS.dark}20` }}>
            <div className="p-2 text-xs font-bold text-center" style={{ color: '#999', background: COLORS.cream, borderRight: `2px solid ${COLORS.dark}20` }}>
              {h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}
            </div>
            {Array.from({ length: 7 }, (_, di) => {
              const dayEvents = events.filter((e) => {
                const ed = new Date(e.date);
                return ed.getDate() === 10 + di && e.time && parseInt(e.time) === (h > 12 ? h - 12 : h);
              });
              return (
                <div key={di} className="p-1 min-h-[48px]" style={{ background: di === 4 ? COLORS.yellow + '15' : '#fff', borderRight: `1px solid ${COLORS.dark}10` }}>
                  {dayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="px-2 py-1 text-[10px] font-bold"
                      style={{ background: ev.color, color: COLORS.dark, borderRadius: 0, border: `2px solid ${COLORS.dark}` }}
                    >
                      <i className={`fa-duotone fa-solid ${ev.icon} mr-1`} />
                      {ev.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Day View ---------- */
function DayView({ events, selectedDate }: { events: CalendarEvent[]; selectedDate: string | null }) {
  const dateStr = selectedDate || '2026-02-14';
  const dayEvents = events.filter((e) => e.date === dateStr || (e.endDate && dateStr >= e.date && dateStr <= e.endDate));
  const hours = Array.from({ length: 12 }, (_, i) => i + 7);

  return (
    <div>
      <h3 className="font-black text-lg uppercase mb-4" style={{ color: COLORS.dark }}>
        <i className="fa-duotone fa-solid fa-calendar-day mr-2" style={{ color: COLORS.coral }} />
        {dateStr}
      </h3>
      <div className="space-y-0">
        {hours.map((h) => {
          const hourEvents = dayEvents.filter((e) => e.time && parseInt(e.time) === (h > 12 ? h - 12 : h));
          return (
            <div
              key={h}
              className="flex gap-4 p-3"
              style={{ borderBottom: `1px solid ${COLORS.dark}15`, background: hourEvents.length > 0 ? COLORS.yellow + '10' : 'transparent' }}
            >
              <span className="w-20 shrink-0 font-bold text-xs text-right" style={{ color: '#999' }}>
                {h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}
              </span>
              <div className="flex-1 flex gap-2 flex-wrap">
                {hourEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="px-3 py-2 font-bold text-sm"
                    style={{ background: ev.color, color: COLORS.dark, border: `3px solid ${COLORS.dark}`, borderRadius: 0 }}
                  >
                    <i className={`fa-duotone fa-solid ${ev.icon} mr-2`} />
                    {ev.title}
                    {ev.time && <span className="ml-2 text-xs font-black">({ev.time})</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {dayEvents.length === 0 && (
        <div className="text-center py-12">
          <i className="fa-duotone fa-solid fa-calendar-xmark text-4xl mb-3" style={{ color: '#ccc' }} />
          <p className="font-bold text-sm" style={{ color: '#999' }}>No events scheduled for this day.</p>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function CalendarsSixPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<ViewMode>('month');
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1); // February (0-indexed)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const els = heroRef.current.querySelectorAll('[data-anim]');
    gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.7, ease: 'power3.out' });
  }, []);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  return (
    <div style={{ background: COLORS.cream }} className="min-h-screen">
      {/* ===================== HERO ===================== */}
      <section ref={heroRef} style={{ background: COLORS.dark }} className="relative overflow-hidden py-28 px-6 text-center">
        <div style={{ background: COLORS.coral, width: 110, height: 110, border: `4px solid ${COLORS.cream}`, borderRadius: 0 }} className="absolute top-8 right-12 rotate-12 opacity-25" />
        <div style={{ background: COLORS.teal, width: 70, height: 70, borderRadius: '50%' }} className="absolute bottom-12 left-16 opacity-20" />

        <h1 data-anim className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white">
          Calen<span style={{ color: COLORS.coral }}>dars</span>
        </h1>
        <p data-anim className="mt-4 text-lg font-bold uppercase tracking-widest" style={{ color: COLORS.yellow }}>
          Month &bull; Week &bull; Day &bull; Events &bull; Scheduling
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* ---- Controls ---- */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="w-10 h-10 flex items-center justify-center font-black transition-all hover:opacity-80"
              style={{ background: '#fff', border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
            >
              <i className="fa-duotone fa-solid fa-chevron-left" />
            </button>
            <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: COLORS.dark }}>
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="w-10 h-10 flex items-center justify-center font-black transition-all hover:opacity-80"
              style={{ background: '#fff', border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
            >
              <i className="fa-duotone fa-solid fa-chevron-right" />
            </button>
          </div>

          {/* view toggles */}
          <div className="flex gap-0" style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}>
            {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-5 py-2 font-black text-xs uppercase tracking-wider transition-colors"
                style={{
                  background: view === v ? COLORS.dark : '#fff',
                  color: view === v ? COLORS.yellow : COLORS.dark,
                  borderRight: v !== 'day' ? `2px solid ${COLORS.dark}` : 'none',
                  borderRadius: 0,
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* ---- Calendar View ---- */}
        <div
          style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0, background: '#fff' }}
          className="overflow-hidden"
        >
          {view === 'month' && (
            <MonthView year={year} month={month} events={SAMPLE_EVENTS} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          )}
          {view === 'week' && <WeekView events={SAMPLE_EVENTS} />}
          {view === 'day' && <DayView events={SAMPLE_EVENTS} selectedDate={selectedDate} />}
        </div>

        {/* ---- Selected Date Details ---- */}
        {selectedDate && view === 'month' && (
          <div className="mt-8">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-4" style={{ color: COLORS.dark }}>
              <i className="fa-duotone fa-solid fa-calendar-lines-pen" style={{ color: COLORS.teal }} />
              Events for {selectedDate}
            </h3>
            <div className="space-y-3">
              {SAMPLE_EVENTS.filter((e) => e.date === selectedDate || (e.endDate && selectedDate >= e.date && selectedDate <= e.endDate)).map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center gap-4 p-4"
                  style={{ background: '#fff', border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center shrink-0"
                    style={{ background: ev.color, border: `3px solid ${COLORS.dark}`, borderRadius: 0 }}
                  >
                    <i className={`fa-duotone fa-solid ${ev.icon}`} style={{ color: COLORS.dark }} />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase" style={{ color: COLORS.dark }}>{ev.title}</p>
                    {ev.time && <p className="text-xs font-bold" style={{ color: '#999' }}>{ev.time}</p>}
                    {ev.endDate && <p className="text-xs font-bold" style={{ color: COLORS.purple }}>Multi-day: {ev.date} &mdash; {ev.endDate}</p>}
                  </div>
                </div>
              ))}
              {SAMPLE_EVENTS.filter((e) => e.date === selectedDate).length === 0 && (
                <p className="font-bold text-sm" style={{ color: '#999' }}>No events for this date.</p>
              )}
            </div>
          </div>
        )}

        {/* ---- Today indicator ---- */}
        <div className="mt-8 flex items-center gap-3">
          <div className="w-4 h-4" style={{ background: COLORS.coral, border: `2px solid ${COLORS.dark}`, borderRadius: 0 }} />
          <span className="font-bold text-xs uppercase tracking-wider" style={{ color: COLORS.dark }}>Today (Feb 14, 2026)</span>
          <div className="w-4 h-4 ml-4" style={{ background: COLORS.yellow + '40', border: `2px solid ${COLORS.dark}`, borderRadius: 0 }} />
          <span className="font-bold text-xs uppercase tracking-wider" style={{ color: COLORS.dark }}>Event Day</span>
        </div>
      </div>

      <footer style={{ background: COLORS.dark }} className="py-12 text-center">
        <p className="font-black text-xs uppercase tracking-[0.3em]" style={{ color: COLORS.coral }}>
          Splits Network &mdash; Memphis Design System &mdash; Calendars
        </p>
      </footer>
    </div>
  );
}
