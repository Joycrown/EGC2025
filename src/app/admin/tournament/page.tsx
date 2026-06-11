'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GAME_LABELS, GAME_ICONS } from '@/lib/games/constants';

interface Team { id: string; name: string; color: string; }
interface SessionItem {
  id: string;
  gameType: string;
  scheduledAt: string;
  status: string;
  roundNumber: number | null;
  teamA: { id: string; name: string; color: string };
  teamB: { id: string; name: string; color: string };
  tournamentRound: { weekNumber: number; gameType: string } | null;
  roster: { userId: string; teamId: string }[];
}
interface Tournament {
  id: string; name: string; status: string; startDate: string;
  _count: { sessions: number };
}

const GAME_SEQUENCE = ['HANGMAN', 'WORD_SCRAMBLE', 'WORD_CHAIN', 'BIBLE_CATEGORIES', 'BIBLE_TRIVIA'];

const ROUND_ROBIN_SCHEDULE = [
  [[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]],
  [[0, 1], [2, 3]], [[0, 2], [1, 3]],
];

function toLocalDatetimeValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminTournamentPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Expanded tournament sessions
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sessionsMap, setSessionsMap] = useState<Record<string, SessionItem[]>>({});
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Per-session edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saveStatus, setSaveStatus] = useState<Record<string, 'saving' | 'saved' | 'error'>>({});

  const [form, setForm] = useState({
    name: 'EGC 2026 Games Tournament',
    teamIds: ['', '', '', ''],
    // 5 weeks × 2 matches each — [week][matchIdx]
    roundDates: [['', ''], ['', ''], ['', ''], ['', ''], ['', '']] as string[][],
    testMode: false,
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/teams').then(r => r.json()),
      fetch('/api/tournaments').then(r => r.json()),
    ]).then(([teamsData, tourData]) => {
      setTeams(teamsData.teams ?? []);
      setTournaments(tourData.tournaments ?? []);
      setLoading(false);
    });
  }, []);

  function setRoundDate(week: number, matchIdx: number, value: string) {
    setForm(f => {
      const dates = f.roundDates.map(row => [...row]);
      dates[week][matchIdx] = value;
      return { ...f, roundDates: dates };
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.teamIds.some(id => !id)) { setError('Select all 4 teams.'); return; }
    if (new Set(form.teamIds).size !== 4) { setError('All 4 teams must be different.'); return; }
    if (form.roundDates.some(matchDates => matchDates.some(d => !d))) { setError('Set a date and time for every match in every round.'); return; }
    setCreating(true);
    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, teamIds: form.teamIds, roundDates: form.roundDates, testMode: form.testMode }),
    });
    const d = await res.json();
    setCreating(false);
    if (!res.ok) { setError(d.error ?? 'Failed to create tournament'); return; }
    setSuccess('Tournament created! 10 sessions scheduled (2 per week).');
    setShowForm(false);
    setTournaments(prev => [d.tournament, ...prev]);
  }

  const loadSessions = useCallback(async (tournamentId: string) => {
    if (sessionsMap[tournamentId]) return; // already loaded
    setSessionsLoading(true);
    const res = await fetch(`/api/games/sessions?tournamentId=${tournamentId}`);
    const d = await res.json();
    setSessionsMap(prev => ({ ...prev, [tournamentId]: d.sessions ?? [] }));
    setSessionsLoading(false);
  }, [sessionsMap]);

  function toggleExpand(tournamentId: string) {
    if (expandedId === tournamentId) {
      setExpandedId(null);
    } else {
      setExpandedId(tournamentId);
      loadSessions(tournamentId);
    }
  }

  function startEdit(session: SessionItem) {
    setEditingId(session.id);
    setEditValue(toLocalDatetimeValue(session.scheduledAt));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue('');
  }

  async function saveEdit(tournamentId: string, sessionId: string) {
    if (!editValue) return;
    setSaveStatus(s => ({ ...s, [sessionId]: 'saving' }));
    setEditingId(null);

    const res = await fetch(`/api/games/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledAt: new Date(editValue).toISOString() }),
    });

    if (res.ok) {
      const d = await res.json();
      // Update cached sessions
      setSessionsMap(prev => ({
        ...prev,
        [tournamentId]: (prev[tournamentId] ?? []).map(s =>
          s.id === sessionId ? { ...s, scheduledAt: d.session.scheduledAt } : s
        ),
      }));
      setSaveStatus(s => ({ ...s, [sessionId]: 'saved' }));
      setTimeout(() => setSaveStatus(s => { const c = { ...s }; delete c[sessionId]; return c; }), 3000);
    } else {
      setSaveStatus(s => ({ ...s, [sessionId]: 'error' }));
      setTimeout(() => setSaveStatus(s => { const c = { ...s }; delete c[sessionId]; return c; }), 4000);
    }
  }

  const teamsReady = form.teamIds.every(id => id) && new Set(form.teamIds).size === 4;

  // Group sessions by week
  function groupByWeek(sessions: SessionItem[]) {
    const groups: Record<number, SessionItem[]> = {};
    for (const s of sessions) {
      const w = s.tournamentRound?.weekNumber ?? 0;
      if (!groups[w]) groups[w] = [];
      groups[w].push(s);
    }
    return Object.entries(groups).sort((a, b) => Number(a[0]) - Number(b[0]));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tournament</h1>
          <p className="text-gray-500 text-sm mt-0.5">5-week competition · 4 teams · 5 game types · 10 sessions</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg text-sm transition-all">
          {showForm ? 'Cancel' : '+ New Tournament'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8 space-y-6">
          <h2 className="text-lg font-bold text-white">Create Tournament</h2>
          {error && <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-green-400 text-sm bg-green-950/40 border border-green-800/40 rounded-lg px-3 py-2">{success}</p>}

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Tournament Name</label>
            <input type="text" required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-600 focus:border-yellow-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">Select 4 Teams</label>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map(i => (
                <div key={i}>
                  <label className="block text-xs text-gray-500 mb-1">Team {i + 1}</label>
                  <select value={form.teamIds[i]}
                    onChange={e => {
                      const ids = [...form.teamIds];
                      ids[i] = e.target.value;
                      setForm(f => ({ ...f, teamIds: ids }));
                    }}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-600 focus:border-yellow-500 focus:outline-none">
                    <option value="">Select team…</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">
              Round Schedule — Set Date &amp; Time for Each Game Week
            </label>
            <div className="space-y-4">
              {GAME_SEQUENCE.map((game, w) => {
                const pairs = ROUND_ROBIN_SCHEDULE[w];
                return (
                  <div key={game} className="bg-gray-900 rounded-xl px-4 py-3 space-y-3">
                    {/* Week header */}
                    <div className="flex items-center gap-2">
                      <span className="text-xl shrink-0">{GAME_ICONS[game] ?? '🎮'}</span>
                      <p className="text-white text-sm font-semibold">Week {w + 1} — {GAME_LABELS[game]}</p>
                    </div>
                    {/* One row per match */}
                    {pairs.map(([a, b], mi) => {
                      const tA = teams.find(t => t.id === form.teamIds[a]);
                      const tB = teams.find(t => t.id === form.teamIds[b]);
                      const matchLabel = teamsReady
                        ? `${tA?.name ?? '?'} vs ${tB?.name ?? '?'}`
                        : `Team ${a + 1} vs Team ${b + 1}`;
                      return (
                        <div key={mi} className="flex flex-col sm:flex-row sm:items-center gap-2 pl-8">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 font-medium">
                              Match {mi + 1} &nbsp;·&nbsp; <span className="text-gray-300">{matchLabel}</span>
                            </p>
                            <p className="text-[10px] text-gray-600 mt-0.5">
                              1 session — starts exactly at this time
                            </p>
                          </div>
                          <input
                            type="datetime-local"
                            required
                            value={form.roundDates[w][mi]}
                            onChange={e => setRoundDate(w, mi, e.target.value)}
                            className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-yellow-500 focus:outline-none shrink-0 w-full sm:w-52"
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <p className="text-gray-600 text-xs mt-2">
              10 match times total (2 per week × 5 weeks) = 10 sessions. Each session is one complete game.
            </p>
          </div>

          {/* Test mode toggle */}
          <label className={`flex items-start gap-3 cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
            form.testMode ? 'border-orange-600/60 bg-orange-900/20' : 'border-gray-700 bg-gray-900/40'
          }`}>
            <input
              type="checkbox"
              checked={form.testMode}
              onChange={e => setForm(f => ({ ...f, testMode: e.target.checked }))}
              className="mt-0.5 accent-orange-500 w-4 h-4 shrink-0"
            />
            <div>
              <p className={`text-sm font-semibold ${form.testMode ? 'text-orange-400' : 'text-gray-300'}`}>
                Test Tournament (Practice Mode)
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                All sessions use a simplified word bank (10 short words) and easy categories — ideal for a dry run before the real competition. Does not affect real game data.
              </p>
            </div>
          </label>

          <button type="submit" disabled={creating}
            className={`w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50 text-black transition-all ${
              form.testMode
                ? 'bg-orange-500 hover:bg-orange-400'
                : 'bg-yellow-600 hover:bg-yellow-500'
            }`}>
            {creating
              ? 'Creating tournament…'
              : form.testMode
                ? 'Create Test Tournament & Schedule Sessions'
                : 'Create Tournament & Schedule Sessions'
            }
          </button>
        </form>
      )}

      {/* Tournament list */}
      {loading ? <p className="text-gray-500 text-sm">Loading…</p> : (
        <div className="space-y-4">
          {tournaments.length === 0 ? (
            <p className="text-gray-600 text-center py-12">No tournaments yet.</p>
          ) : tournaments.map(t => (
            <div key={t.id} className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
              {/* Tournament header row */}
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold">{t.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Starts {new Date(t.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {' · '}{t._count?.sessions ?? 0} sessions
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                    t.status === 'IN_PROGRESS' ? 'text-green-400 border-green-800/40 bg-green-900/20' :
                    t.status === 'COMPLETED' ? 'text-gray-500 border-gray-700' :
                    'text-blue-400 border-blue-800/40 bg-blue-900/20'
                  }`}>{t.status}</span>
                  <Link href="/leaderboard"
                    className="text-sm text-yellow-400 hover:text-yellow-300 border border-yellow-800/40 px-3 py-1.5 rounded-lg transition-colors">
                    Leaderboard →
                  </Link>
                  <button
                    onClick={() => toggleExpand(t.id)}
                    className="text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors">
                    {expandedId === t.id ? 'Hide' : 'Schedule'}
                  </button>
                </div>
              </div>

              {/* Expanded session schedule */}
              {expandedId === t.id && (
                <div className="border-t border-gray-700 bg-gray-900/60 px-5 py-4">
                  {sessionsLoading && !sessionsMap[t.id] ? (
                    <p className="text-gray-500 text-sm">Loading sessions…</p>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Session Schedule</p>
                        <p className="text-xs text-gray-600">Click ✏️ to reschedule any session · Emails sent on change</p>
                      </div>

                      {groupByWeek(sessionsMap[t.id] ?? []).map(([week, weekSessions]) => {
                        const gameType = weekSessions[0]?.tournamentRound?.gameType ?? weekSessions[0]?.gameType ?? '';
                        return (
                          <div key={week}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-base">{GAME_ICONS[gameType] ?? '🎮'}</span>
                              <p className="text-white text-sm font-semibold">
                                Week {week} — {GAME_LABELS[gameType] ?? gameType}
                              </p>
                            </div>
                            <div className="space-y-1.5 pl-7">
                              {weekSessions.map(s => {
                                const isEditing = editingId === s.id;
                                const status = saveStatus[s.id];
                                return (
                                  <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-gray-300">
                                        Round {s.roundNumber ?? '?'} &nbsp;·&nbsp;
                                        <span style={{ color: s.teamA.color }}>{s.teamA.name}</span>
                                        {' vs '}
                                        <span style={{ color: s.teamB.color }}>{s.teamB.name}</span>
                                      </p>
                                      {!isEditing && (
                                        <p className="text-xs text-yellow-400 mt-0.5">
                                          {new Date(s.scheduledAt).toLocaleString('en-GB', {
                                            weekday: 'short', day: 'numeric', month: 'short',
                                            hour: '2-digit', minute: '2-digit',
                                          })}
                                        </p>
                                      )}
                                    </div>

                                    {isEditing ? (
                                      <div className="flex items-center gap-2 shrink-0">
                                        <input
                                          type="datetime-local"
                                          value={editValue}
                                          onChange={e => setEditValue(e.target.value)}
                                          className="bg-gray-700 text-white rounded px-2 py-1 text-xs border border-yellow-600 focus:outline-none"
                                        />
                                        <button
                                          onClick={() => saveEdit(t.id, s.id)}
                                          className="text-xs font-bold bg-yellow-600 hover:bg-yellow-500 text-black px-3 py-1.5 rounded transition-colors">
                                          Save
                                        </button>
                                        <button
                                          onClick={cancelEdit}
                                          className="text-xs text-gray-400 hover:text-white px-2 py-1.5 rounded transition-colors">
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 shrink-0">
                                        {status === 'saving' && (
                                          <span className="text-xs text-yellow-400">Saving…</span>
                                        )}
                                        {status === 'saved' && (
                                          <span className="text-xs text-green-400">✓ Saved · emails sent</span>
                                        )}
                                        {status === 'error' && (
                                          <span className="text-xs text-red-400">Failed to save</span>
                                        )}
                                        {s.status !== 'IN_PROGRESS' && s.status !== 'COMPLETED' && (
                                          <button
                                            onClick={() => startEdit(s)}
                                            className="text-gray-500 hover:text-yellow-400 transition-colors text-sm"
                                            title="Reschedule session">
                                            ✏️
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
