'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameSocket } from '@/hooks/useGameSocket';
import { useAgora } from '@/hooks/useAgora';
import { useMicPermission } from '@/hooks/useMicPermission';
import MicPermissionModal from './MicPermissionModal';
import GameRoomHeader from './GameRoomHeader';
import TurnIndicator from './TurnIndicator';
import ScoreBoard from './ScoreBoard';
import ParticipantList from './ParticipantList';
import SpectatorSidebar from './SpectatorSidebar';
import MicStatusBar from './MicStatusBar';
import HangmanBoard from './hangman/HangmanBoard';
import ScrambleBoard from './wordscramble/ScrambleBoard';
import ChainBoard from './wordchain/ChainBoard';
import CategoriesBoard from './categories/CategoriesBoard';
import TriviaBoard from './trivia/TriviaBoard';

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
  const { state, guessLetter, submitScrambleAnswer, submitChainWord, submitCategoriesAnswer, buzzIn, submitTriviaAnswer, sendChat, adminStart, adminEnd } = useGameSocket(sessionId, token);
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

  const role = state.role ?? initialRole;
  const gs = state.gameState;
  const isParticipant = role === 'participant';
  const isMyTurn = isParticipant && myTeamId === state.turnTeamId;
  const isScramble = gameType === 'WORD_SCRAMBLE';
  const isChain = gameType === 'WORD_CHAIN';
  const isCategories = gameType === 'BIBLE_CATEGORIES';
  const isTrivia = gameType === 'BIBLE_TRIVIA';

  // Derive mic state from turn ownership — more reliable than waiting for server mic:control events,
  // which can be missed on reconnect or are never sent for some game types (categories).
  const effectiveMicEnabled = (() => {
    if (!isParticipant || !myTeamId || !gs) return false;
    // Trivia: buzz-in format — both teams are always in contention, keep both mics live
    if (isTrivia) return true;
    // All other games (Hangman, Scramble, Chain, Categories): turn-based — only the active team's mic is live
    return myTeamId === (state.turnTeamId ?? gs.currentTurnTeamId);
  })();

  // Prompt participants for mic permission before Agora tries to access the device.
  // Agora config is only passed through once permission is confirmed — this prevents
  // the browser's default (easily-dismissed) dialog from being the only prompt.
  // Only participants need to grant mic permission before Agora publishes.
  // Spectators/admins always get micReady=true — they join the channel to listen
  // but never publish (their agoraConfig role is 'subscriber').
  const { state: micPermState, requestPermission } = useMicPermission(isParticipant);
  const micReady = !isParticipant || micPermState === 'granted' || micPermState === 'unavailable';
  const { joined: agoraJoined, failed: agoraFailed } = useAgora(micReady ? agoraConfig : null, effectiveMicEnabled);

  // ── Sound effects (Web Audio API — no external files needed) ────────────
  const audioCtx = useRef<AudioContext | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtx.current;
  }, []);

  const playCorrect = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      // Ascending two-tone ding
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.35, now + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.3);
      });
    } catch { /* audio not available */ }
  }, [getAudioCtx]);

  const playWrong = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      // Low descending buzzer
      [220, 180].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.3, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.2);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.25);
      });
    } catch { /* audio not available */ }
  }, [getAudioCtx]);

  // Trigger sounds on relevant state changes
  const prevSolvedWord = useRef<string | null>(null);
  const prevFailedWord = useRef<string | null>(null);
  const prevScrambleResult = useRef(state.scrambleResult);
  const prevCategoriesResult = useRef(state.categoriesResult);
  const prevTriviaWrong = useRef(state.triviaWrong);

  useEffect(() => {
    // Hangman / Chain correct
    if (state.solvedWord && state.solvedWord !== prevSolvedWord.current) playCorrect();
    prevSolvedWord.current = state.solvedWord;
  }, [state.solvedWord, playCorrect]);

  useEffect(() => {
    if (state.failedWord && state.failedWord !== prevFailedWord.current) playWrong();
    prevFailedWord.current = state.failedWord;
  }, [state.failedWord, playWrong]);

  useEffect(() => {
    if (state.scrambleResult !== prevScrambleResult.current) {
      if (state.scrambleResult?.correct) playCorrect();
      else if (state.scrambleResult && !state.scrambleResult.correct) playWrong();
    }
    prevScrambleResult.current = state.scrambleResult;
  }, [state.scrambleResult, playCorrect, playWrong]);

  useEffect(() => {
    if (state.categoriesResult !== prevCategoriesResult.current) {
      if (state.categoriesResult?.correct) playCorrect();
      else if (state.categoriesResult && !state.categoriesResult.correct) playWrong();
    }
    prevCategoriesResult.current = state.categoriesResult;
  }, [state.categoriesResult, playCorrect, playWrong]);

  useEffect(() => {
    if (state.triviaWrong !== prevTriviaWrong.current && state.triviaWrong) playWrong();
    prevTriviaWrong.current = state.triviaWrong;
  }, [state.triviaWrong, playWrong]);

  // ── Winner calculation (engines emit winnerId but winnerName may be null) ─
  const gameEndedWinner = (() => {
    if (!state.gameEnded) return null;
    const { winnerId, winnerName, teamAScore, teamBScore } = state.gameEnded;
    // Use winnerId first, fall back to score comparison
    if (winnerId === teamAId) return teamAName;
    if (winnerId === teamBId) return teamBName;
    if (winnerName) return winnerName;
    if (teamAScore > teamBScore) return teamAName;
    if (teamBScore > teamAScore) return teamBName;
    return null; // genuine draw
  })();

  return (
    <div className="h-screen overflow-hidden bg-gray-950 text-white flex flex-col">
      {/* Mic permission modal — blocks participants until mic is resolved */}
      {isParticipant && (
        <MicPermissionModal state={micPermState} onRequest={requestPermission} />
      )}

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
          micEnabled={effectiveMicEnabled}
          isMyTurn={isMyTurn}
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10 text-center max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-6xl mb-3 animate-bounce">
              {gameEndedWinner ? '🏆' : '🤝'}
            </div>
            <h2 className="text-3xl font-black mb-1 text-white">
              {gameEndedWinner ? `${gameEndedWinner} Wins!` : "It's a Draw!"}
            </h2>
            {gameEndedWinner && (
              <p className="text-yellow-400 text-sm font-semibold mb-3">🎉 Congratulations!</p>
            )}
            <div className="flex justify-center gap-6 my-5 py-4 border-y border-gray-800">
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: teamAColor }}>{state.gameEnded.teamAScore}</p>
                <p className="text-gray-500 text-xs mt-0.5">{teamAName}</p>
              </div>
              <div className="text-gray-700 text-xl self-center">—</div>
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: teamBColor }}>{state.gameEnded.teamBScore}</p>
                <p className="text-gray-500 text-xs mt-0.5">{teamBName}</p>
              </div>
            </div>
            <a href="/games" className="block bg-red-700 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
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
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left panel — participants (desktop only) */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-gray-800 p-4 gap-4 overflow-y-auto">
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
        <main className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-4 overflow-y-auto">
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
              isMyTurn={isMyTurn}
              currentTurnTeamId={gs.currentTurnTeamId}
              onSubmit={submitScrambleAnswer}
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

          {gs && isCategories && gs.categories && (
            <CategoriesBoard
              categories={gs.categories}
              isMyTurn={isMyTurn}
              isParticipant={isParticipant}
              onSubmit={submitCategoriesAnswer}
              categoriesResult={state.categoriesResult}
              categoriesRoundEnd={state.categoriesRoundEnd}
              currentTurnTeamId={state.turnTeamId ?? gs.currentTurnTeamId}
              teamAId={teamAId}
              teamBId={teamBId}
              teamAName={teamAName}
              teamBName={teamBName}
              teamAColor={teamAColor}
              teamBColor={teamBColor}
            />
          )}

          {gs && isTrivia && gs.trivia && (
            <TriviaBoard
              trivia={gs.trivia}
              isParticipant={isParticipant}
              myTeamId={state.myTeamId}
              onBuzz={buzzIn}
              onAnswer={submitTriviaAnswer}
              triviaReveal={state.triviaReveal}
              triviaWrong={state.triviaWrong}
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
            onSend={(msg, replyTo) => sendChat(msg, replyTo)}
            userId={userId}
          />
        )}
      </div>
    </div>
  );
}
