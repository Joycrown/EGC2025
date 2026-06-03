'use client';

interface Props {
  micEnabled: boolean;
  isMyTurn: boolean;
  agoraJoined: boolean;
  agoraFailed: boolean;
}

export default function MicStatusBar({ micEnabled, isMyTurn, agoraJoined, agoraFailed }: Props) {
  if (!agoraJoined) {
    if (agoraFailed) {
      return (
        <div className="flex items-center justify-center gap-2 bg-gray-800/60 border-b border-gray-700 py-1.5 text-xs text-gray-500 shrink-0">
          <span>🔇</span>
          <span>Voice unavailable — game continues without audio</span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center gap-2 bg-yellow-900/30 border-b border-yellow-800/40 py-1.5 text-xs text-yellow-400 shrink-0">
        <span className="animate-spin inline-block">⟳</span>
        <span>Connecting to voice channel…</span>
      </div>
    );
  }

  if (micEnabled) {
    return (
      <div className="flex items-center justify-center gap-2 bg-green-900/30 border-b border-green-700/40 py-1.5 text-xs text-green-300 shrink-0 animate-pulse">
        <span>🎙️</span>
        <span>Your mic is LIVE — discuss with your team</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 bg-gray-900/60 border-b border-gray-800 py-1.5 text-xs text-gray-500 shrink-0">
      <span>🔇</span>
      <span>{isMyTurn ? 'Your mic will activate on your next turn' : 'Mic muted — waiting for your turn'}</span>
    </div>
  );
}
