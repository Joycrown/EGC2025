'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

// ── Types ─────────────────────────────────────────────────────────
type Screen = 'loading' | 'invalid' | 'landing' | 'returning' | 'new' | 'success';

interface DayInfo { day: string; dayLabel: string; date: string; }
interface UserCard { id: string; fullName: string; role: string; isChild: boolean; phoneHint: string | null; emailHint: string | null; alreadyCheckedIn: boolean; }

// ── Confetti piece (module-level — stable reference) ──────────────
const CONFETTI_COLORS = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#f97316'];

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  return (
    <div
      className="absolute top-0 rounded-sm animate-bounce"
      style={{
        left: `${5 + (index * 17) % 90}%`,
        width: `${8 + (index * 3) % 8}px`,
        height: `${8 + (index * 3) % 8}px`,
        backgroundColor: color,
        animationDelay: `${(index * 0.15) % 1.5}s`,
        animationDuration: `${1.8 + (index * 0.13) % 1}s`,
        opacity: 0.85,
      }}
    />
  );
}

// ── Role labels ───────────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  MEMBER: 'Member', INVITEE: 'Guest', MINISTER: 'Minister',
  CHILD: 'Child', PARTICIPANT: 'Participant', VOLUNTEER: 'Volunteer',
  ADMIN: 'Admin', COORDINATOR: 'Coordinator',
};

// ── Page wrapper — defined at module level so it never remounts ───
// This is the critical fix for mobile keyboard dismissal:
// defining Wrap inside the component caused React to see a new
// component type on every keystroke → unmount/remount → focus lost.
function PageWrap({ dayInfo, children }: { dayInfo: DayInfo | null; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Image src="/images/GofamintLogo.png" alt="GOFAMINT" width={52} height={52} className="rounded-full mb-3 border-2 border-yellow-400/30" />
          <p className="text-xs font-bold tracking-[0.35em] uppercase text-yellow-400/70">EGC Conference 2026</p>
          {dayInfo && <p className="text-[11px] text-white/40 mt-0.5 tracking-wide">{dayInfo.dayLabel}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
export default function CheckinPageInner() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [screen, setScreen] = useState<Screen>('loading');
  const [dayInfo, setDayInfo] = useState<DayInfo | null>(null);
  const [invalidMsg, setInvalidMsg] = useState('');

  // Returning flow
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState<UserCard[]>([]);
  const [confirming, setConfirming] = useState(false);

  // New attendee form
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', gender: '', address: '', attendeeType: 'MEMBER' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Success
  const [successName, setSuccessName] = useState('');
  const [successRole, setSuccessRole] = useState('');

  const isChild = form.attendeeType === 'CHILD';

  // ── Verify token on mount ────────────────────────────────────────
  useEffect(() => {
    if (!token) { setInvalidMsg('No check-in code found. Please scan the QR code at the venue.'); setScreen('invalid'); return; }
    fetch(`/api/checkin/verify?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(d => {
        if (d.valid) { setDayInfo(d); setScreen('landing'); }
        else { setInvalidMsg(d.error ?? 'Invalid QR code'); setScreen('invalid'); }
      })
      .catch(() => { setInvalidMsg('Could not verify QR code. Please try again.'); setScreen('invalid'); });
  }, [token]);

  // ── Lookup ───────────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return;
    setSearchLoading(true); setSearchError(''); setResults([]);
    const res = await fetch('/api/checkin/lookup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search: searchTerm, token }),
    });
    const d = await res.json();
    setSearchLoading(false);
    if (!res.ok) { setSearchError(d.error ?? 'Error'); return; }
    if (d.notFound) { setSearchError('No one found with that detail. Are you new?'); return; }
    setResults(d.users);
  }, [searchTerm, token]);

  // ── Confirm check-in ─────────────────────────────────────────────
  const handleConfirm = useCallback(async (userId: string, name: string, role: string) => {
    setConfirming(true);
    const res = await fetch('/api/checkin/confirm', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token }),
    });
    const d = await res.json();
    setConfirming(false);
    if (!res.ok) { setSearchError(d.error ?? 'Could not mark attendance'); return; }
    setSuccessName(name); setSuccessRole(role); setScreen('success');
  }, [token]);

  // ── Quick register ────────────────────────────────────────────────
  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    const res = await fetch('/api/checkin/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, token }),
    });
    const d = await res.json();
    setFormLoading(false);
    if (!res.ok) {
      if (d.duplicate) setFormError(d.error + ' Use the "Already registered" option.');
      else setFormError(d.error ?? 'Registration failed');
      return;
    }
    setSuccessName(d.fullName); setSuccessRole(d.role); setScreen('success');
  }, [form, token]);

  // ── LOADING ───────────────────────────────────────────────────────
  if (screen === 'loading') return (
    <PageWrap dayInfo={dayInfo}>
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/50 text-sm">Verifying check-in code…</p>
      </div>
    </PageWrap>
  );

  // ── INVALID ───────────────────────────────────────────────────────
  if (screen === 'invalid') return (
    <PageWrap dayInfo={dayInfo}>
      <div className="text-center py-10 px-6 bg-red-950/30 border border-red-800/40 rounded-2xl">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-red-300 mb-2">Invalid QR Code</h2>
        <p className="text-red-400/80 text-sm leading-relaxed">{invalidMsg}</p>
      </div>
    </PageWrap>
  );

  // ── LANDING ───────────────────────────────────────────────────────
  if (screen === 'landing') return (
    <PageWrap dayInfo={dayInfo}>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Welcome!</h1>
        <p className="text-white/50 text-sm">How would you like to check in?</p>
      </div>
      <div className="flex flex-col gap-4">
        <button onClick={() => setScreen('returning')}
          className="w-full p-5 rounded-2xl border-2 border-yellow-500/40 bg-yellow-500/8 hover:bg-yellow-500/15 hover:border-yellow-400/60 transition-all text-left group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">✅</div>
            <div>
              <p className="font-bold text-white">I&apos;ve registered before</p>
              <p className="text-white/40 text-xs mt-0.5">Enter your phone or email to check in</p>
            </div>
          </div>
        </button>
        <button onClick={() => setScreen('new')}
          className="w-full p-5 rounded-2xl border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🆕</div>
            <div>
              <p className="font-bold text-white">I&apos;m new / first time</p>
              <p className="text-white/40 text-xs mt-0.5">Quick registration — takes under a minute</p>
            </div>
          </div>
        </button>
      </div>
    </PageWrap>
  );

  // ── RETURNING ─────────────────────────────────────────────────────
  if (screen === 'returning') return (
    <PageWrap dayInfo={dayInfo}>
      <button onClick={() => { setScreen('landing'); setResults([]); setSearchTerm(''); setSearchError(''); }}
        className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors">
        ← Back
      </button>

      <h2 className="text-xl font-black text-white mb-1">Find your account</h2>
      <p className="text-white/40 text-sm mb-6">Enter your phone number, email or name</p>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Phone, email or name…"
          className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
        />
        <button onClick={handleSearch} disabled={searchLoading || !searchTerm.trim()}
          className="px-5 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black font-bold rounded-xl text-sm transition-all">
          {searchLoading ? '…' : 'Find'}
        </button>
      </div>

      {searchError && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-xl px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{searchError}</p>
          <button onClick={() => setScreen('new')} className="text-yellow-400 text-xs mt-1 underline">Register as new attendee →</button>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-white/40 text-xs uppercase tracking-wider">Is that you?</p>
          {results.map(u => (
            <div key={u.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-4 transition-all hover:border-yellow-400/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-black font-black text-lg shrink-0">
                  {u.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{u.fullName}</p>
                  <p className="text-white/40 text-xs mt-0.5">{ROLE_LABELS[u.role] ?? u.role}</p>
                  {(u.phoneHint || u.emailHint) && (
                    <p className="text-white/30 text-xs mt-0.5">{u.phoneHint ?? u.emailHint}</p>
                  )}
                </div>
                {u.alreadyCheckedIn ? (
                  <span className="text-green-400 text-xs font-bold bg-green-900/30 border border-green-700/40 px-2 py-1 rounded-full shrink-0">
                    ✓ Checked in
                  </span>
                ) : (
                  <button onClick={() => handleConfirm(u.id, u.fullName, u.role)} disabled={confirming}
                    className="shrink-0 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black font-bold px-4 py-2 rounded-xl text-sm transition-all">
                    {confirming ? '…' : 'Yes, check me in'}
                  </button>
                )}
              </div>
            </div>
          ))}
          <p className="text-white/25 text-xs text-center pt-1">Not you? Try a different phone number or email.</p>
        </div>
      )}
    </PageWrap>
  );

  // ── NEW ATTENDEE ──────────────────────────────────────────────────
  if (screen === 'new') return (
    <PageWrap dayInfo={dayInfo}>
      <button onClick={() => { setScreen('landing'); setFormError(''); }}
        className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors">
        ← Back
      </button>

      <h2 className="text-xl font-black text-white mb-1">Quick Registration</h2>
      <p className="text-white/40 text-sm mb-6">Fill in your details to register and check in for today</p>

      <form onSubmit={handleRegister} className="space-y-4">

        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">First name <span className="text-red-400">*</span></label>
            <input type="text" required value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all" />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Last name <span className="text-red-400">*</span></label>
            <input type="text" required value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all" />
          </div>
        </div>

        {/* Attendee type */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5 font-medium">Attendee type <span className="text-red-400">*</span></label>
          <div className="grid grid-cols-2 gap-2">
            {[['MEMBER','Member (Adult)'],['GUEST','Guest'],['MINISTER','Invited Minister'],['CHILD','Member (Children)']].map(([val, label]) => (
              <button key={val} type="button"
                onClick={() => setForm(f => ({ ...f, attendeeType: val }))}
                className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${form.attendeeType === val ? 'border-yellow-400/70 bg-yellow-500/20 text-yellow-300' : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Child notice */}
        {isChild && (
          <div className="bg-blue-950/60 border border-blue-700/40 rounded-xl px-4 py-3 text-sm text-blue-300">
            📌 Phone and email are not required for children.
          </div>
        )}

        {/* Phone */}
        {!isChild && (
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Phone number <span className="text-red-400">*</span></label>
            <input type="tel" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+234 xxx xxx xxxx"
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all placeholder-gray-500" />
          </div>
        )}

        {/* Email */}
        {!isChild && (
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Email <span className="text-white/30 font-normal">(optional)</span></label>
            <input type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all" />
          </div>
        )}

        {/* Gender */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5 font-medium">Gender <span className="text-red-400">*</span></label>
          <div className="flex gap-3">
            {['Male', 'Female'].map(g => (
              <button key={g} type="button"
                onClick={() => setForm(f => ({ ...f, gender: g }))}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${form.gender === g ? 'border-yellow-400/70 bg-yellow-500/20 text-yellow-300' : 'border-white/12 bg-white/5 text-white/60 hover:border-white/25'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5 font-medium">Address <span className="text-white/30 font-normal">(optional)</span></label>
          <input type="text" value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            placeholder="Your church or location"
            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all placeholder-gray-500" />
        </div>

        {formError && (
          <div className="bg-red-950/40 border border-red-800/40 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{formError}</p>
          </div>
        )}

        <button type="submit" disabled={formLoading}
          className="w-full py-4 rounded-2xl font-black text-base transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', boxShadow: '0 8px 24px rgba(245,158,11,0.35)' }}>
          {formLoading ? 'Registering…' : 'Register & Check In →'}
        </button>
      </form>
    </PageWrap>
  );

  // ── SUCCESS ───────────────────────────────────────────────────────
  if (screen === 'success') return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => <ConfettiPiece key={i} index={i} />)}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />

      <div className="relative flex flex-col items-center text-center max-w-sm">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-bounce"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 0 40px rgba(245,158,11,0.5)' }}>
          <span className="text-4xl">✝️</span>
        </div>

        <h1 className="text-3xl font-black text-white mb-1">Welcome!</h1>
        <p className="text-2xl font-bold mb-1" style={{ background: 'linear-gradient(120deg,#fde68a,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {successName}
        </p>
        <p className="text-white/50 text-sm mb-6">{ROLE_LABELS[successRole] ?? successRole}</p>

        <div className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-6 py-5 mb-6">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Checked in for</p>
          <p className="text-white font-bold text-base">{dayInfo?.dayLabel}</p>
        </div>

        <p className="text-yellow-400/70 text-sm font-semibold mb-2">🙏 God bless you!</p>
        <p className="text-white/30 text-xs leading-relaxed">
          Welcome to Emerging Generals&apos; Conference 2026.<br />
          We&apos;re glad you&apos;re here.
        </p>

        <div className="flex gap-3 mt-6">
          {['⭐', '✨', '🌟', '✨', '⭐'].map((s, i) => (
            <span key={i} className="animate-pulse text-lg" style={{ animationDelay: `${i * 0.2}s` }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );

  return null;
}
