'use client';

import { useState, useEffect } from 'react';
import { useGameSocket } from '@/hooks/useGameSocket';
import { useAgora } from '@/hooks/useAgora';
import GameRoomHeader from './GameRoomHeader';
import TurnIndicator from './TurnIndicator';
import ScoreBoard from './ScoreBoard';
import ParticipantList from './ParticipantList';
import SpectatorSidebar from './SpectatorSidebar';
import MicStatusBar from './MicStatusBar';
import HangmanBoard from './hangman/HangmanBoard';
import ScrambleBoard from './wordscramble/ScrambleBoard';
import ChainBoard from './wordchain/ChainBoard';

interface Props {
  sessionId: string;
  token: string;
  initialRole: 'participant' | 'spectator';
  myTeamId: string | null;
  userId: string;
  userType: string;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
  gameType: string;
  status: string;
}

interface AgoraTokenResponse {
  appId: string;
  channel: string;
  token: string;
  uid: number;
  role: 'publisher' | 'subscriber';
}

export default function GameRoomClient({
  sessionId, token, initialRole, myTeamId, userId, userType,
  teamAId, teamBId, teamAName, teamBName, teamAColor, teamBColor,
  gameType, status,
}: Props) {
  const isAdmin = userType === 'ADMIN' || userType === 'SUPER_ADMIN';
  const { state, guessLetter, submitScrambleAnswer, submitChainWord, sendChat, adminStart, adminEnd } = useGameSocket(sessionId, token);
  const [agoraConfig, setAgoraConfig] = useState<AgoraTokenResponse | null>(null);

  // Fetch Agora token on mount
  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch('/api/agora/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        if (res.ok) {
          const data = await res.json();
          setAgoraConfig(data);
        }
      } catch {
        // Agora not configured yet — audio disabled
      }
    }
    fetchToken();
  }, [sessionId]);

  const { joined: agoraJoined, failed: agoraFailed } = useAgora(agoraConfig, state.micEnabled);

  const role = state.role ?? initialRole;
  const gs = state.gameState;
  const isParticipant = role === 'participant';
  const isMyTurn = isParticipant && myTeamId === state.turnTeamId;
  const isScramble = gameType === 'WORD_SCRAMBLE';
  const isChain = gameType === 'WORD_CHAIN';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <GameRoomHeader
        gameType={gameType}
        teamAName={teamAName}
        teamBName={teamBName}
        teamAColor={teamAColor}
        teamBColor={teamBColor}
        teamAScore={gs?.teamAScore ?? 0}
        teamBScore={gs?.teamBScore ?? 0}
        status={gs?.status ?? status}
        sessionId={sessionId}
      />

      {/* Mic bar for participants */}
      {isParticipant && (
        <MicStatusBar
          micEnabled={state.micEnabled}
          isMyTurn={isScramble ? true : isMyTurn}  // scramble: always active; hangman/chain: turn-based
          agoraJoined={agoraJoined}
          agoraFailed={agoraFailed}
        />
      )}

      {/* Hangman: per-team turn indicator */}
      {gs && gameType === 'HANGMAN' && (
        <TurnIndicator
          currentTurnTeamId={state.turnTeamId ?? gs.currentTurnTeamId}
          teamAId={teamAId}
          teamBId={teamBId}
          teamAName={teamAName}
          teamBName={teamBName}
          teamAColor={teamAColor}
          teamBColor={teamBColor}
          timeLeft={state.timeLeft}
          isMyTurn={isMyTurn}
          wordNumber={gs.hangman?.roundNumber ?? 0}
          totalWords={gs.hangman?.totalRounds ?? 20}
        />
      )}

      {/* Chain: turn indicator (reuses TurnIndicator layout) */}
      {gs && isChain && (
        <TurnIndicator
          currentTurnTeamId={state.turnTeamId ?? gs.currentTurnTeamId}
          teamAId={teamAId}
          teamBId={teamBId}
          teamAName={teamAName}
          teamBName={teamBName}
          teamAColor={teamAColor}
          teamBColor={teamBColor}
          timeLeft={state.timeLeft}
          isMyTurn={isMyTurn}
          wordNumber={gs.chain?.turnNumber ?? 0}
          totalWords={gs.chain?.totalTurns ?? 20}
        />
      )}

      {/* Scramble: race status bar */}
      {gs && isScramble && (
        <div className="flex items-center justify-between px-5 py-2 text-sm font-semibold shrink-0 bg-yellow-950/40 border-b-2 border-yellow-600/30">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-yellow-400">
              {isParticipant ? '⚡ Race — both teams competing!' : 'Race in progress'}
            </span>
            <span className="text-gray-500 font-normal text-xs">
              ({gs.scramble?.wordNumber ?? 0}/{gs.scramble?.totalWords ?? 20})
            </span>
          </div>
          <span className={`font-mono font-bold text-lg ${state.timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-gray-300'}`}>
            {state.timeLeft}s
          </span>
        </div>
      )}

      {/* Toast overlays */}
      {state.solvedWord && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-2xl animate-bounce">
          ✅ SOLVED: {state.solvedWord} — +5 Bonus!
        </div>
      )}
      {state.failedWord && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-2xl">
          ❌ Word was: {state.failedWord}
        </div>
      )}
      {state.gameEnded && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10 text-center max-w-md w-full mx-4">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold mb-2">
              {state.gameEnded.winnerName ? `${state.gameEnded.winnerName} Wins!` : "It's a Draw!"}
            </h2>
            <p className="text-gray-400 mb-6">
              {teamAName}: {state.gameEnded.teamAScore}pts &nbsp;|&nbsp; {teamBName}: {state.gameEnded.teamBScore}pts
            </p>
            <a href="/games" className="bg-red-700 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg">
              Back to Lobby
            </a>
          </div>
        </div>
      )}
      {state.error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-800 text-white text-sm px-5 py-3 rounded-lg shadow-lg">
          {state.error}
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — participants */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-gray-800 p-4 gap-4">
          <ScoreBoard
            teamAName={teamAName}
            teamBName={teamBName}
            teamAColor={teamAColor}
            teamBColor={teamBColor}
            teamAScore={gs?.teamAScore ?? 0}
            teamBScore={gs?.teamBScore ?? 0}
          />
          <ParticipantList
            participants={state.participants}
            teamAId={teamAId}
            teamBId={teamBId}
            teamAColor={teamAColor}
            teamBColor={teamBColor}
            currentTurnTeamId={state.turnTeamId ?? ''}
            spectatorCount={state.spectatorCount}
          />
        </aside>

        {/* Center — game board */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
          {!gs && status !== 'IN_PROGRESS' && (
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-2">Waiting for the game to start…</p>
              {!state.isConnected && <p className="text-yellow-400 text-sm">Connecting to game server…</p>}
              {isAdmin && (
                <button
                  onClick={adminStart}
                  className="mt-6 bg-green-700 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-xl text-lg"
                >
                  Start Game
                </button>
              )}
            </div>
          )}

          {gs && gameType === 'HANGMAN' && (
            <HangmanBoard
              hangman={gs.hangman!}
              isInteractive={isMyTurn}
              onGuess={guessLetter}
            />
          )}

          {gs && isScramble && gs.scramble && (
            <ScrambleBoard
              scramble={gs.scramble}
              isParticipant={isParticipant}
              onSubmit={submitScrambleAnswer}
              cooldownSeconds={state.scrambleCooldownSeconds}
              scrambleResult={state.scrambleResult}
              teamAName={teamAName}
              teamBName={teamBName}
              teamAColor={teamAColor}
              teamBColor={teamBColor}
              teamAId={teamAId}
            />
          )}

          {gs && isChain && gs.chain && (
            <ChainBoard
              chain={gs.chain}
              isMyTurn={isMyTurn}
              isParticipant={isParticipant}
              onSubmit={submitChainWord}
              chainResult={state.chainResult}
              chainInvalidReason={state.chainInvalidReason}
              currentTurnTeamId={state.turnTeamId ?? gs.currentTurnTeamId}
              teamAId={teamAId}
              teamBId={teamBId}
              teamAName={teamAName}
              teamBName={teamBName}
              teamAColor={teamAColor}
              teamBColor={teamBColor}
            />
          )}

          {isAdmin && gs && (
            <button
              onClick={adminEnd}
              className="mt-6 text-red-500 hover:text-red-400 text-sm underline"
            >
              End Game (Admin)
            </button>
          )}
        </main>

        {/* Right panel — chat for spectators only */}
        {role === 'spectator' && (
          <SpectatorSidebar
            chat={state.chat}
            spectatorCount={state.spectatorCount}
            onSend={sendChat}
            userId={userId}
          />
        )}
      </div>
    </div>
  );
}
