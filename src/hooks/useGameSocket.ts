'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '@/lib/socket/client';

export interface HangmanClientState {
  maskedWord: string;
  category: string;
  hint?: string;
  guessedLetters: string[];
  wrongLetters: string[];
  wrongCount: number;
  maxWrong: number;
  wordSolved: boolean;
  roundNumber: number;
  totalRounds: number;
}

export interface ScrambleClientState {
  scrambledWord: string;
  category: string;
  hint: string;
  wordNumber: number;
  totalWords: number;
  wordSolved: boolean;
}

export interface ChainClientState {
  chain: string[];
  requiredLetter: string;
  turnNumber: number;
  totalTurns: number;
  lastCategory?: string;
}

export interface ChainResult {
  correct: boolean;
  word: string;
  teamId: string;
  teamName: string;
  pointsAwarded?: number;
  nextLetter?: string;
  category?: string;
  reason?: 'timeout' | 'wrong';
}

export interface GameState {
  sessionId: string;
  gameType: string;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  teamAScore: number;
  teamBScore: number;
  currentTurnTeamId: string;
  timeLeft: number;
  status: string;
  hangman?: HangmanClientState;
  scramble?: ScrambleClientState;
  chain?: ChainClientState;
}

export interface RosterParticipant {
  userId: string;
  fullName: string;
  teamId: string;
  teamName: string;
  isOnline: boolean;
}

export interface ChatMsg {
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export interface ScrambleResult {
  correct: boolean;
  word: string;
  teamId: string;
  teamName: string;
  pointsAwarded?: number;
}

export interface GameRoomState {
  role: 'participant' | 'spectator' | null;
  myTeamId: string | null;
  gameState: GameState | null;
  participants: RosterParticipant[];
  spectatorCount: number;
  chat: ChatMsg[];
  micEnabled: boolean;
  isConnected: boolean;
  turnTeamId: string | null;
  timeLeft: number;
  // Hangman
  solvedWord: string | null;
  failedWord: string | null;
  // Scramble
  scrambleResult: ScrambleResult | null;
  scrambleCooldownSeconds: number;
  // Chain
  chainResult: ChainResult | null;
  chainInvalidReason: string | null;
  // Shared
  gameEnded: { winnerId: string | null; winnerName: string | null; teamAScore: number; teamBScore: number } | null;
  error: string | null;
}

const defaultState: GameRoomState = {
  role: null,
  myTeamId: null,
  gameState: null,
  participants: [],
  spectatorCount: 0,
  chat: [],
  micEnabled: false,
  isConnected: false,
  turnTeamId: null,
  timeLeft: 40,
  solvedWord: null,
  failedWord: null,
  scrambleResult: null,
  scrambleCooldownSeconds: 0,
  chainResult: null,
  chainInvalidReason: null,
  gameEnded: null,
  error: null,
};

export function useGameSocket(sessionId: string, token: string) {
  const [state, setState] = useState<GameRoomState>(defaultState);
  const socketRef = useRef<Socket | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const update = useCallback((patch: Partial<GameRoomState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  const startCooldown = useCallback((seconds: number) => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    update({ scrambleCooldownSeconds: seconds });
    cooldownRef.current = setInterval(() => {
      setState(prev => {
        const next = prev.scrambleCooldownSeconds - 1;
        if (next <= 0) {
          clearInterval(cooldownRef.current!);
          cooldownRef.current = null;
          return { ...prev, scrambleCooldownSeconds: 0 };
        }
        return { ...prev, scrambleCooldownSeconds: next };
      });
    }, 1000);
  }, [update]);

  useEffect(() => {
    if (!token || !sessionId) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => {
      update({ isConnected: true, error: null });
      socket.emit('join-room', sessionId);
    });

    if (socket.connected) {
      update({ isConnected: true });
      socket.emit('join-room', sessionId);
    } else {
      socket.connect();
    }

    socket.on('disconnect', () => update({ isConnected: false }));
    socket.on('connect_error', (err) => update({ error: err.message, isConnected: false }));

    socket.on('room:joined', ({ role, teamId }: { role: 'participant' | 'spectator'; teamId: string | null }) => {
      update({ role, myTeamId: teamId });
    });

    socket.on('room:roster', ({ participants, spectatorCount }: { participants: RosterParticipant[]; spectatorCount: number }) => {
      update({ participants, spectatorCount });
    });

    socket.on('game:state', (gs: GameState) => {
      update({ gameState: gs, turnTeamId: gs.currentTurnTeamId, timeLeft: gs.timeLeft });
    });

    socket.on('game:started', (gs: GameState) => {
      update({
        gameState: gs,
        turnTeamId: gs.currentTurnTeamId,
        timeLeft: gs.timeLeft,
        solvedWord: null,
        failedWord: null,
        scrambleResult: null,
        scrambleCooldownSeconds: 0,
        gameEnded: null,
      });
    });

    socket.on('game:turn', ({ teamId, timeLeft }: { teamId: string; timeLeft: number }) => {
      update({ turnTeamId: teamId, timeLeft });
      setState(prev => ({
        ...prev,
        gameState: prev.gameState ? { ...prev.gameState, currentTurnTeamId: teamId } : null,
      }));
    });

    socket.on('game:tick', ({ timeLeft }: { timeLeft: number }) => {
      update({ timeLeft });
    });

    socket.on('game:score', ({ teamAScore, teamBScore }: { teamAScore: number; teamBScore: number }) => {
      setState(prev => ({
        ...prev,
        gameState: prev.gameState ? { ...prev.gameState, teamAScore, teamBScore } : null,
      }));
    });

    // ── Hangman events ──
    socket.on('hangman:update', (hangman: HangmanClientState) => {
      setState(prev => ({
        ...prev,
        gameState: prev.gameState ? { ...prev.gameState, hangman } : null,
      }));
    });

    socket.on('hangman:solved', ({ word }: { word: string }) => {
      update({ solvedWord: word });
      setTimeout(() => update({ solvedWord: null }), 3000);
    });

    socket.on('hangman:failed', ({ word }: { word: string }) => {
      update({ failedWord: word });
      setTimeout(() => update({ failedWord: null }), 3000);
    });

    // ── Scramble events ──
    socket.on('scramble:correct', (payload: { word: string; teamId: string; teamName: string; pointsAwarded: number }) => {
      const result: ScrambleResult = { correct: true, ...payload };
      update({ scrambleResult: result });
      setTimeout(() => update({ scrambleResult: null }), 3000);
    });

    socket.on('scramble:wrong', ({ teamId, teamName }: { teamId: string; teamName: string }) => {
      // Show briefly for all viewers
      const result: ScrambleResult = { correct: false, word: '', teamId, teamName };
      update({ scrambleResult: result });
      setTimeout(() => update({ scrambleResult: null }), 2000);
    });

    socket.on('scramble:timeout', ({ word }: { word: string }) => {
      update({ failedWord: word });
      setTimeout(() => update({ failedWord: null }), 3000);
    });

    socket.on('scramble:cooldown', ({ seconds }: { seconds: number }) => {
      startCooldown(seconds);
    });

    // ── Chain events ──
    socket.on('chain:correct', (payload: { word: string; category: string; teamId: string; teamName: string; pointsAwarded: number; nextLetter: string; chain: string[] }) => {
      setState(prev => ({
        ...prev,
        gameState: prev.gameState?.chain
          ? { ...prev.gameState, chain: { ...prev.gameState.chain, chain: payload.chain, requiredLetter: payload.nextLetter, wrongAttempts: [] } }
          : prev.gameState,
        chainResult: { correct: true, word: payload.word, teamId: payload.teamId, teamName: payload.teamName, pointsAwarded: payload.pointsAwarded, nextLetter: payload.nextLetter, category: payload.category },
      }));
      setTimeout(() => update({ chainResult: null }), 3000);
    });

    socket.on('chain:attempt', ({ word, teamId, teamName }: { word: string; teamId: string; teamName: string }) => {
      // Append the wrong attempt to the visible list in game state
      setState(prev => ({
        ...prev,
        gameState: prev.gameState?.chain
          ? { ...prev.gameState, chain: { ...prev.gameState.chain, wrongAttempts: [...(prev.gameState.chain.wrongAttempts ?? []), word] } }
          : prev.gameState,
        chainResult: { correct: false, word, teamId, teamName, reason: 'wrong' },
      }));
      setTimeout(() => update({ chainResult: null }), 1500);
    });

    socket.on('chain:timeout', ({ correctWord, teamId, teamName }: { correctWord: string; teamId: string; teamName: string }) => {
      update({ chainResult: { correct: false, word: correctWord, teamId, teamName, reason: 'timeout' }, failedWord: correctWord });
      setTimeout(() => update({ chainResult: null, failedWord: null }), 3000);
    });

    socket.on('chain:invalid', ({ reason, word }: { reason: string; word: string }) => {
      const messages: Record<string, string> = {
        wrong_letter: `Word must start with the required letter`,
        already_tried: `"${word}" was already tried this turn`,
      };
      update({ chainInvalidReason: messages[reason] ?? 'Invalid input' });
      setTimeout(() => update({ chainInvalidReason: null }), 2500);
    });

    socket.on('chain:turn', ({ teamId, timeLeft }: { teamId: string; timeLeft: number }) => {
      update({ turnTeamId: teamId, timeLeft });
      setState(prev => ({
        ...prev,
        gameState: prev.gameState ? { ...prev.gameState, currentTurnTeamId: teamId } : null,
      }));
    });

    // ── Shared ──
    socket.on('mic:control', ({ enabled }: { enabled: boolean }) => {
      update({ micEnabled: enabled });
    });

    socket.on('chat:message', (msg: ChatMsg) => {
      setState(prev => ({ ...prev, chat: [...prev.chat.slice(-99), msg] }));
    });

    socket.on('game:ended', (payload) => {
      update({ gameEnded: payload });
    });

    socket.on('error', ({ message }: { message: string }) => {
      update({ error: message });
      setTimeout(() => update({ error: null }), 4000);
    });

    return () => {
      socket.emit('leave-room', sessionId);
      [
        'connect', 'disconnect', 'connect_error',
        'room:joined', 'room:roster',
        'game:state', 'game:started', 'game:turn', 'game:tick', 'game:score', 'game:ended',
        'hangman:update', 'hangman:solved', 'hangman:failed',
        'scramble:correct', 'scramble:wrong', 'scramble:timeout', 'scramble:cooldown',
        'chain:correct', 'chain:attempt', 'chain:timeout', 'chain:invalid', 'chain:turn',
        'mic:control', 'chat:message', 'error',
      ].forEach(ev => socket.off(ev));
    };
  }, [sessionId, token, update, startCooldown]);

  const guessLetter = useCallback((letter: string) => {
    socketRef.current?.emit('hangman:guess', { sessionId, letter });
  }, [sessionId]);

  const submitScrambleAnswer = useCallback((answer: string) => {
    if (!answer.trim()) return;
    socketRef.current?.emit('scramble:guess', { sessionId, answer });
  }, [sessionId]);

  const sendChat = useCallback((message: string) => {
    socketRef.current?.emit('chat:send', { sessionId, message });
  }, [sessionId]);

  const adminStart = useCallback(() => {
    socketRef.current?.emit('admin:start', { sessionId });
  }, [sessionId]);

  const adminEnd = useCallback(() => {
    socketRef.current?.emit('admin:end', { sessionId });
  }, [sessionId]);

  const submitChainWord = useCallback((word: string) => {
    if (!word.trim()) return;
    socketRef.current?.emit('chain:guess', { sessionId, word });
  }, [sessionId]);

  return { state, guessLetter, submitScrambleAnswer, submitChainWord, sendChat, adminStart, adminEnd };
}
