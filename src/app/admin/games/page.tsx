'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GAME_LABELS, GAME_ICONS } from '@/lib/games/constants';

interface Team { id: string; name: string; color: string; }

interface SessionSummary {
  id: string;
  gameType: string;
  status: string;
  scheduledAt: string;
  teamAScore: number;
  teamBScore: number;
  teamA: Team;
  teamB: Team;
  roster: { userId: string; teamId: string }[];
}

export default function AdminGamesPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    gameType: 'HANGMAN',
    teamAId: '',
    teamBId: '',
    scheduledAt: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [sessRes, teamsRes] = await Promise.all([
      fetch('/api/games/sessions'),
      fetch('/api/teams'),
    ]);
    if (sessRes.ok) {
      const d = await sessRes.json();
      setSessions(d.sessions ?? []);
    }
    if (teamsRes.ok) {
      const d = await teamsRes.json();
      setTeams(d.teams ?? []);
    }
    setLoading(false);
  }

  async function reloadSessions() {
    const r = await fetch('/api/games/sessions');
    if (r.ok) {
      const d = await r.json();
      setSessions(d.sessions ?? []);
    }
  }

  async function createSession(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.teamAId || !form.teamBId || !form.scheduledAt) {
      setError('All fields are required');
      return;
    }
    if (form.teamAId === form.teamBId) {
      setError('Teams must be different');
      return;
    }
    setCreating(true);
    const res = await fetch('/api/games/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setCreating(false);
    if (res.ok) {
      setShowForm(false);
      setForm({ gameType: 'HANGMAN', teamAId: '', teamBId: '', scheduledAt: '' });

      reloadSessions();
    } else {
      const d = await res.json();
      setError(d.error ?? 'Failed to create session');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Game Sessions</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="bg-red-700 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg text-sm"
        >
          {showForm ? 'Cancel' : '+ New Session'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={createSession} className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Create Game Session</h2>
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Game Type</label>
              <select
                value={form.gameType}
                onChange={e => setForm(f => ({ ...f, gameType: e.target.value }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
              >
                {Object.entries(GAME_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Scheduled Date & Time</label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Team A</label>
              <select
                value={form.teamAId}
                onChange={e => setForm(f => ({ ...f, teamAId: e.target.value }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select team…</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Team B</label>
              <select
                value={form.teamBId}
                onChange={e => setForm(f => ({ ...f, teamBId: e.target.value }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select team…</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm"
          >
            {creating ? 'Creating…' : 'Create Session'}
          </button>
        </form>
      )}

      {/* Sessions list */}
      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500">No game sessions yet. Create one above.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-semibold text-sm">
                  {GAME_ICONS[s.gameType] ?? '🎮'} {GAME_LABELS[s.gameType] ?? s.gameType}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  <span style={{ color: s.teamA.color }}>{s.teamA.name}</span>
                  <span className="mx-1 text-gray-600">vs</span>
                  <span style={{ color: s.teamB.color }}>{s.teamB.name}</span>
                  <span className="ml-2 text-gray-600">·</span>
                  <span className="ml-2">{new Date(s.scheduledAt).toLocaleString()}</span>
                </p>
                <p className="text-xs mt-1">
                  <span className="text-gray-500">{s.roster.length} players registered</span>
                  <span className="ml-2 text-gray-600">·</span>
                  <span className={`ml-2 font-semibold ${
                    s.status === 'IN_PROGRESS' ? 'text-red-400' :
                    s.status === 'COMPLETED' ? 'text-gray-500' : 'text-blue-400'
                  }`}>{s.status}</span>
                </p>
              </div>
              <Link
                href={`/admin/games/${s.id}`}
                className="shrink-0 text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 px-4 py-2 rounded-lg"
              >
                Manage →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
