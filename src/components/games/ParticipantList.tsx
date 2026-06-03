'use client';

interface Participant {
  userId: string;
  fullName: string;
  teamId: string;
  teamName: string;
  isOnline: boolean;
}

interface Props {
  participants: Participant[];
  teamAId: string;
  teamBId: string;
  teamAColor: string;
  teamBColor: string;
  currentTurnTeamId: string;
  spectatorCount: number;
}

export default function ParticipantList({
  participants, teamAId, teamBId, teamAColor, teamBColor, currentTurnTeamId, spectatorCount,
}: Props) {
  const teamA = participants.filter(p => p.teamId === teamAId);
  const teamB = participants.filter(p => p.teamId === teamBId);

  function renderTeam(players: Participant[], color: string, active: boolean) {
    return (
      <div className={`rounded-lg p-2 ${active ? 'ring-1 ring-inset' : ''}`} style={active ? { outlineColor: color } : {}}>
        {players.length === 0 && (
          <p className="text-gray-600 text-xs italic">No players yet</p>
        )}
        {players.map(p => (
          <div key={p.userId} className="flex items-center gap-2 py-1">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${p.isOnline ? 'bg-green-400' : 'bg-gray-600'}`}
            />
            <span className="text-xs text-gray-300 truncate">{p.fullName}</span>
            {active && p.isOnline && (
              <span className="text-xs ml-auto shrink-0">🎙️</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Players</p>

      {[
        { id: teamAId, color: teamAColor, players: teamA },
        { id: teamBId, color: teamBColor, players: teamB },
      ].map(t => (
        <div key={t.id}>
          <p className="text-xs font-semibold mb-1" style={{ color: t.color }}>
            {t.players[0]?.teamName ?? (t.id === teamAId ? 'Team A' : 'Team B')}
            {currentTurnTeamId === t.id && (
              <span className="ml-1 animate-pulse">●</span>
            )}
          </p>
          {renderTeam(t.players, t.color, currentTurnTeamId === t.id)}
        </div>
      ))}

      <div className="pt-2 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          👁 {spectatorCount} watching
        </p>
      </div>
    </div>
  );
}
