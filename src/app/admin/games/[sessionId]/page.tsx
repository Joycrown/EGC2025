'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface User { id: string; fullName: string; email: string; teamId?: string | null; }
interface RosterEntry {
  userId: string;
  teamId: string;
  user: { id: string; fullName: string; email: string };
  team: { id: string; name: string; color: string };
}
interface Session {
  id: string;
  gameType: string;
  status: string;
  teamAId: string;
  teamBId: string;
  teamAScore: number;
  teamBScore: number;
  teamA: { id: string; name: string; color: string };
  teamB: { id: string; name: string; color: string };
  roster: RosterEntry[];
}

export default function AdminGameSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [session, setSession] = useState<Session | null>(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [pendingAdd, setPendingAdd] = useState<{ userId: string; teamId: string; teamName: string; userName: string } | null>(null);

  const loadSession = useCallback(async () => {
    const r = await fetch(`/api/games/sessions/${sessionId}`);
    if (r.ok) {
      const d = await r.json();
      setSession(d.session);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const r = await fetch(`/api/admin/users?searchTerm=${encodeURIComponent(search)}&pageSize=10`);
      if (r.ok) {
        const d = await r.json();
        setSearchResults(d.users ?? []);
      }
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  async function addPlayer(userId: string, teamId?: string) {
    setAdding(userId);
    const r = await fetch(`/api/games/sessions/${sessionId}/roster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, teamId }),
    });
    setAdding(null);
    setPendingAdd(null);
    if (r.ok) {
      setMsg('Player added');
      loadSession();
    } else {
      const d = await r.json();
      setMsg(d.error ?? 'Failed to add player');
    }
    setTimeout(() => setMsg(''), 3000);
  }

  async function removePlayer(userId: string) {
    setRemoving(userId);
    const r = await fetch(`/api/games/sessions/${sessionId}/roster`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    setRemoving(null);
    if (r.ok) {
      setMsg('Player removed');
      loadSession();
    } else {
      setMsg('Failed to remove player');
    }
    setTimeout(() => setMsg(''), 3000);
  }

  if (!session) return <div className="p-8 text-gray-400">Loading…</div>;

  const rosterA = session.roster.filter(r => r.teamId === session.teamAId);
  const rosterB = session.roster.filter(r => r.teamId === session.teamBId);

  function isOnRoster(userId: string) {
    return session!.roster.some(r => r.userId === userId);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/games" className="text-gray-400 hover:text-white text-sm">← Game Sessions</Link>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-white">{session.gameType.replace(/_/g, ' ')}</h1>
            <p className="text-gray-400 text-sm mt-1">
              <span style={{ color: session.teamA.color }}>{session.teamA.name}</span>
              <span className="mx-2 text-gray-600">vs</span>
              <span style={{ color: session.teamB.color }}>{session.teamB.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              session.status === 'IN_PROGRESS' ? 'bg-red-700 text-white' : 'bg-gray-700 text-gray-300'
            }`}>{session.status}</span>
            <Link
              href={`/games/${sessionId}`}
              className="bg-red-700 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
              target="_blank"
            >
              Open Game Room ↗
            </Link>
          </div>
        </div>
      </div>

      {msg && (
        <div className="bg-gray-700 text-white text-sm px-4 py-2 rounded-lg">{msg}</div>
      )}

      {/* Roster */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { team: session.teamA, roster: rosterA },
          { team: session.teamB, roster: rosterB },
        ].map(({ team, roster }) => (
          <div key={team.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: team.color }}>
              {team.name}
              <span className="text-gray-500 text-xs font-normal">({roster.length}/5 players)</span>
            </h2>
            {roster.length === 0 && <p className="text-gray-600 text-sm italic">No players added</p>}
            {roster.map(r => (
              <div key={r.userId} className="flex items-center justify-between py-1.5 border-b border-gray-700 last:border-0">
                <div>
                  <p className="text-white text-sm">{r.user.fullName}</p>
                  <p className="text-gray-500 text-xs">{r.user.email}</p>
                </div>
                <button
                  onClick={() => removePlayer(r.userId)}
                  disabled={removing === r.userId}
                  className="text-red-500 hover:text-red-400 text-xs disabled:opacity-40"
                >
                  {removing === r.userId ? '…' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Search & add players */}
      {session.status !== 'COMPLETED' && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Add Players to Roster</h2>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm mb-3"
          />
          {searching && <p className="text-gray-400 text-sm">Searching…</p>}
          <div className="space-y-2">
            {searchResults.map(u => {
              const onRoster = isOnRoster(u.id);
              const matchedTeamId = u.teamId === session.teamAId ? session.teamAId
                : u.teamId === session.teamBId ? session.teamBId
                : null;
              const wrongTeam = u.teamId != null && !matchedTeamId;
              const unassigned = u.teamId == null;
              const isPending = pendingAdd?.userId === u.id;

              return (
                <div key={u.id} className="py-2 border-b border-gray-700 last:border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm">{u.fullName}</p>
                      <p className="text-gray-500 text-xs">{u.email}</p>
                    </div>
                    {onRoster ? (
                      <span className="text-green-400 text-xs font-semibold">On Roster</span>
                    ) : wrongTeam ? (
                      <span className="text-gray-600 text-xs">Wrong team</span>
                    ) : matchedTeamId && !isPending ? (
                      <button
                        onClick={() => setPendingAdd({ userId: u.id, teamId: matchedTeamId, teamName: matchedTeamId === session.teamAId ? session.teamA.name : session.teamB.name, userName: u.fullName })}
                        className="bg-green-900/60 hover:bg-green-800 border border-green-700/50 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        Add → {matchedTeamId === session.teamAId ? session.teamA.name : session.teamB.name}
                      </button>
                    ) : unassigned && !isPending ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setPendingAdd({ userId: u.id, teamId: session.teamAId, teamName: session.teamA.name, userName: u.fullName })}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                          style={{ color: session.teamA.color, border: `1px solid ${session.teamA.color}66` }}
                        >
                          {session.teamA.name}
                        </button>
                        <button
                          onClick={() => setPendingAdd({ userId: u.id, teamId: session.teamBId, teamName: session.teamB.name, userName: u.fullName })}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                          style={{ color: session.teamB.color, border: `1px solid ${session.teamB.color}66` }}
                        >
                          {session.teamB.name}
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {/* Inline confirmation */}
                  {isPending && pendingAdd && (
                    <div className="mt-2 bg-yellow-950/30 border border-yellow-700/40 rounded-lg px-3 py-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
                      <p className="text-yellow-300 text-xs flex-1">
                        Confirm: Add <span className="font-bold text-white">{pendingAdd.userName}</span> to <span className="font-bold" style={{ color: pendingAdd.teamId === session.teamAId ? session.teamA.color : session.teamB.color }}>{pendingAdd.teamName}</span>?
                        {u.teamId && u.teamId !== pendingAdd.teamId && (
                          <span className="text-red-400 ml-1">(⚠ user belongs to a different team)</span>
                        )}
                        {!u.teamId && (
                          <span className="text-gray-400 ml-1">(user has no team assigned)</span>
                        )}
                      </p>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => addPlayer(pendingAdd.userId, pendingAdd.teamId)}
                          disabled={adding === pendingAdd.userId}
                          className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                        >
                          {adding === pendingAdd.userId ? 'Adding…' : 'Yes, add player'}
                        </button>
                        <button
                          onClick={() => setPendingAdd(null)}
                          className="text-gray-400 hover:text-white border border-gray-600 text-xs px-3 py-1.5 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
