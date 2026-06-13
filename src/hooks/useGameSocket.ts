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
  wrongAttempts: string[];
  turnNumber: number;
  totalTurns: number;
}

export interface ChainResult {
  correct: boolean;
  word: string;
  teamId: string;
  teamName: string;
  pointsAwarded?: number;
  nextLetter?: string;
  isBibleWord?: boolean;
  reason?: 'timeout' | 'wrong';
}

export interface CategoriesFoundAnswer {
  text: string;
  points: number;
}

export interface CategoriesClientState {
  roundNumber: number;
  totalRounds: number;
  category: {
    id: string;
    title: string;
    subtitle: string;
    totalAnswers: number;
  };
  foundAnswers: CategoriesFoundAnswer[];
  strikes: number;
  maxStrikes: number;
  teamAScore: number;
  teamBScore: number;
  currentTurnTeamId: string;
  timeLeft: number;
}

export interface CategoriesResult {
  correct: boolean;
  teamId: string;
  teamName: string;
  answer?: string;
  points?: number;
  remaining?: number;
  strikes?: number;
  reason?: 'timeout' | 'wrong';
}

export interface TriviaClientState {
  questionNumber: number;
  totalQuestions: number;
  question: {
    id: string;
    question: string;
    options: [string, string, string, string];
    category: string;
    points: number;
  };
  phase: 'buzzing' | 'answering' | 'passing' | 'reveal';
  buzzedTeamId: string | null;
  passingToTeamId: string | null;
  pointsOnOffer: number;
  teamAScore: number;
  teamBScore: number;
  currentTurnTeamId: string;
  timeLeft: number;
}

export interface TriviaReveal {
  correctAnswer: string;
  correctOption: string;
  correctTeamId: string | null;
  teamAScore: number;
  teamBScore: number;
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
  categories?: CategoriesClientState;
  trivia?: TriviaClientState;
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
  replyTo?: { userName: string; message: string } | null;
  createdAt: string;
}

export interface ScrambleResult {
  correct: boolean;
  word: string;
  teamId: string;
  teamName: string;
  pointsAwarded?: number;
}

export interface HalfTimePayload {
  teamAScore: number;
  teamBScore: number;
  teamAName: string;
  teamBName: string;
  resumeIn: number;
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
  currentHalf: number;
  halfTime: HalfTimePayload | null;
  // Hangman
  solvedWord: string | null;
  failedWord: string | null;
  // Scramble
  scrambleResult: ScrambleResult | null;
  // Chain
  chainResult: ChainResult | null;
  chainInvalidReason: string | null;
  // Categories
  categoriesResult: CategoriesResult | null;
  categoriesRoundEnd: { remaining: CategoriesFoundAnswer[]; foundAnswers: CategoriesFoundAnswer[]; teamAScore: number; teamBScore: number } | null;
  // Trivia
  triviaReveal: TriviaReveal | null;
  triviaWrong: { teamId: string; answer: string } | null;
  // Shared
  gameEnded: { winnerId: string | null; winnerName: string | null; teamAScore: number; teamBScore: number } | null;
  error: string | null;
  // Mic readiness tracking (pre-game lobby)
  micReadyUserIds: string[];
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
  currentHalf: 1,
  halfTime: null,
  solvedWord: null,
  failedWord: null,
  scrambleResult: null,
  chainResult: null,
  chainInvalidReason: null,
  categoriesResult: null,
  categoriesRoundEnd: null,
  triviaReveal: null,
  triviaWrong: null,
  gameEnded: null,
  error: null,
  micReadyUserIds: [],
};

export function useGameSocket(sessionId: string, token: string) {
  const [state, setState] = useState<GameRoomState>(defaultState);
  const socketRef = useRef<Socket | null>(null);

  const update = useCallback((patch: Partial<GameRoomState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

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
      const turnTeamId = gs.currentTurnTeamId ?? gs.categories?.currentTurnTeamId ?? gs.trivia?.currentTurnTeamId;
      const timeLeft = gs.timeLeft ?? gs.categories?.timeLeft ?? gs.trivia?.timeLeft;
      update({ gameState: gs, turnTeamId, timeLeft, categoriesRoundEnd: null });
    });

    socket.on('game:started', (gs: GameState) => {
      update({
        gameState: gs,
        turnTeamId: gs.currentTurnTeamId,
        timeLeft: gs.timeLeft,
        solvedWord: null,
        failedWord: null,
        scrambleResult: null,
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
    socket.on('scramble:turn', ({ teamId, timeLeft }: { teamId: string; timeLeft: number }) => {
      update({ turnTeamId: teamId, timeLeft });
      setState(prev => ({
        ...prev,
        gameState: prev.gameState ? { ...prev.gameState, currentTurnTeamId: teamId } : null,
      }));
    });

    socket.on('scramble:correct', (payload: { word: string; teamId: string; teamName: string; pointsAwarded: number }) => {
      const result: ScrambleResult = { correct: true, ...payload };
      update({ scrambleResult: result });
      setTimeout(() => update({ scrambleResult: null }), 3000);
    });

    socket.on('scramble:wrong', ({ teamId, teamName }: { teamId: string; teamName: string }) => {
      const result: ScrambleResult = { correct: false, word: '', teamId, teamName };
      update({ scrambleResult: result });
      setTimeout(() => update({ scrambleResult: null }), 2000);
    });

    socket.on('scramble:timeout', ({ word, teamId, teamName }: { word: string; teamId: string; teamName: string }) => {
      update({ failedWord: word });
      // Brief toast then clear
      setTimeout(() => update({ failedWord: null }), 3000);
      // Show as wrong result too so ScrambleBoard can display the team
      const result: ScrambleResult = { correct: false, word, teamId, teamName };
      update({ scrambleResult: result });
      setTimeout(() => update({ scrambleResult: null }), 3000);
    });

    // ── Chain events ──
    socket.on('chain:correct', (payload: { word: string; isBibleWord: boolean; teamId: string; teamName: string; pointsAwarded: number; nextLetter: string; chain: string[] }) => {
      setState(prev => ({
        ...prev,
        gameState: prev.gameState?.chain
          ? { ...prev.gameState, chain: { ...prev.gameState.chain, chain: payload.chain, requiredLetter: payload.nextLetter, wrongAttempts: [] } }
          : prev.gameState,
        chainResult: { correct: true, word: payload.word, isBibleWord: payload.isBibleWord, teamId: payload.teamId, teamName: payload.teamName, pointsAwarded: payload.pointsAwarded, nextLetter: payload.nextLetter },
      }));
      setTimeout(() => update({ chainResult: null }), 3000);
    });

    socket.on('chain:attempt', ({ word, teamId, teamName }: { word: string; teamId: string; teamName: string }) => {
      setState(prev => ({
        ...prev,
        gameState: prev.gameState?.chain
          ? { ...prev.gameState, chain: { ...prev.gameState.chain, wrongAttempts: [...(prev.gameState.chain.wrongAttempts ?? []), word] } }
          : prev.gameState,
        chainResult: { correct: false, word, teamId, teamName, reason: 'wrong' },
      }));
      setTimeout(() => update({ chainResult: null }), 1500);
    });

    socket.on('chain:timeout', ({ teamId, teamName, requiredLetter }: { teamId: string; teamName: string; requiredLetter: string }) => {
      update({ chainResult: { correct: false, word: '', teamId, teamName, reason: 'timeout' } });
      // Keep the required letter — it carries over per game rules
      setState(prev => ({
        ...prev,
        gameState: prev.gameState?.chain
          ? { ...prev.gameState, chain: { ...prev.gameState.chain, wrongAttempts: [], requiredLetter } }
          : prev.gameState,
      }));
      setTimeout(() => update({ chainResult: null }), 3000);
    });

    socket.on('chain:invalid', ({ reason, word }: { reason: string; word: string }) => {
      const messages: Record<string, string> = {
        wrong_letter:  `Word must start with "${word[0] ?? '?'}"`,
        already_tried: `"${word}" was already tried this turn`,
        already_used:  `"${word}" already appears in the chain`,
        too_short:     `Words must be at least 4 letters`,
        not_a_word:    `"${word}" is not a valid word`,
      };
      update({ chainInvalidReason: messages[reason] ?? 'Invalid word' });
      setTimeout(() => update({ chainInvalidReason: null }), 2500);
    });

    socket.on('chain:turn', ({ teamId, timeLeft }: { teamId: string; timeLeft: number }) => {
      update({ turnTeamId: teamId, timeLeft });
      setState(prev => ({
        ...prev,
        gameState: prev.gameState ? { ...prev.gameState, currentTurnTeamId: teamId } : null,
      }));
    });

    // ── Bible Categories events ──
    socket.on('categories:state', (catState: CategoriesClientState) => {
      setState(prev => ({
        ...prev,
        gameState: prev.gameState ? { ...prev.gameState, categories: catState, currentTurnTeamId: catState.currentTurnTeamId } : null,
        turnTeamId: catState.currentTurnTeamId,
        timeLeft: catState.timeLeft,
      }));
    });

    socket.on('categories:new-round', (catState: CategoriesClientState) => {
      setState(prev => ({
        ...prev,
        gameState: prev.gameState ? { ...prev.gameState, categories: catState, currentTurnTeamId: catState.currentTurnTeamId } : null,
        turnTeamId: catState.currentTurnTeamId,
        timeLeft: catState.timeLeft,
        categoriesRoundEnd: null,
        categoriesResult: null,
      }));
    });

    socket.on('categories:correct', (payload: { teamId: string; teamName?: string; answer: string; points: number; foundAnswers: CategoriesFoundAnswer[]; teamAScore: number; teamBScore: number; remaining: number }) => {
      setState(prev => ({
        ...prev,
        gameState: prev.gameState?.categories ? {
          ...prev.gameState,
          teamAScore: payload.teamAScore,
          teamBScore: payload.teamBScore,
          categories: { ...prev.gameState.categories, foundAnswers: payload.foundAnswers, teamAScore: payload.teamAScore, teamBScore: payload.teamBScore },
        } : prev.gameState,
        categoriesResult: { correct: true, teamId: payload.teamId, teamName: payload.teamName ?? '', answer: payload.answer, points: payload.points, remaining: payload.remaining },
      }));
      setTimeout(() => update({ categoriesResult: null }), 2500);
    });

    socket.on('categories:wrong', (payload: { teamId: string; answer: string; strikes: number; maxStrikes: number }) => {
      setState(prev => ({
        ...prev,
        gameState: prev.gameState?.categories ? { ...prev.gameState, categories: { ...prev.gameState.categories, strikes: payload.strikes } } : prev.gameState,
        categoriesResult: { correct: false, teamId: payload.teamId, teamName: '', answer: payload.answer, strikes: payload.strikes, reason: 'wrong' },
      }));
      setTimeout(() => update({ categoriesResult: null }), 2000);
    });

    socket.on('categories:strike', (payload: { teamId: string; reason: string; strikes: number; maxStrikes: number }) => {
      setState(prev => ({
        ...prev,
        gameState: prev.gameState?.categories ? { ...prev.gameState, categories: { ...prev.gameState.categories, strikes: payload.strikes } } : prev.gameState,
        categoriesResult: { correct: false, teamId: payload.teamId, teamName: '', strikes: payload.strikes, reason: 'timeout' },
      }));
      setTimeout(() => update({ categoriesResult: null }), 2000);
    });

    socket.on('categories:round-end', (payload: { remaining: CategoriesFoundAnswer[]; foundAnswers: CategoriesFoundAnswer[]; teamAScore: number; teamBScore: number }) => {
      setState(prev => ({
        ...prev,
        gameState: prev.gameState ? { ...prev.gameState, teamAScore: payload.teamAScore, teamBScore: payload.teamBScore } : null,
        categoriesRoundEnd: payload,
      }));
    });

    socket.on('categories:invalid', () => {
      // not your turn feedback — handled by UI
    });

    // ── Bible Trivia events ──
    socket.on('trivia:question', (trivState: TriviaClientState) => {
      setState(prev => ({
        ...prev,
        gameState: prev.gameState ? { ...prev.gameState, trivia: trivState, currentTurnTeamId: trivState.currentTurnTeamId } : null,
        turnTeamId: trivState.currentTurnTeamId,
        timeLeft: trivState.timeLeft,
        triviaReveal: null,
        triviaWrong: null,
      }));
    });

    socket.on('trivia:buzz-locked', (payload: TriviaClientState & { teamId: string }) => {
      setState(prev => ({
        ...prev,
        gameState: prev.gameState ? { ...prev.gameState, trivia: payload } : null,
        timeLeft: payload.timeLeft,
      }));
    });

    socket.on('trivia:pass', (payload: { fromTeamId: string; toTeamId: string; pointsOnOffer: number; timeLeft: number }) => {
      setState(prev => ({
        ...prev,
        gameState: prev.gameState?.trivia ? {
          ...prev.gameState,
          trivia: { ...prev.gameState.trivia, phase: 'passing' as const, passingToTeamId: payload.toTeamId, pointsOnOffer: payload.pointsOnOffer, timeLeft: payload.timeLeft },
        } : prev.gameState,
        timeLeft: payload.timeLeft,
      }));
    });

    socket.on('trivia:correct', (payload: { teamId: string; answer: string; points: number; teamAScore: number; teamBScore: number }) => {
      setState(prev => ({
        ...prev,
        gameState: prev.gameState ? { ...prev.gameState, teamAScore: payload.teamAScore, teamBScore: payload.teamBScore } : null,
      }));
    });

    socket.on('trivia:wrong', (payload: { teamId: string; answer: string }) => {
      update({ triviaWrong: payload });
      setTimeout(() => update({ triviaWrong: null }), 1500);
    });

    socket.on('trivia:reveal', (payload: TriviaReveal) => {
      update({ triviaReveal: payload });
      setTimeout(() => update({ triviaReveal: null }), 3800);
    });

    // ── Shared ──
    socket.on('mic:control', ({ enabled }: { enabled: boolean }) => {
      update({ micEnabled: enabled });
    });

    socket.on('room:mic-status', ({ readyUserIds }: { readyUserIds: string[] }) => {
      update({ micReadyUserIds: readyUserIds });
    });

    socket.on('chat:message', (msg: ChatMsg) => {
      setState(prev => ({ ...prev, chat: [...prev.chat.slice(-99), msg] }));
    });

    socket.on('game:half-time', (payload: HalfTimePayload) => {
      update({ halfTime: payload, currentHalf: 1 });
    });

    socket.on('game:second-half', () => {
      update({ halfTime: null, currentHalf: 2 });
    });

    socket.on('game:ended', (payload) => {
      update({ gameEnded: payload, halfTime: null });
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
        'scramble:turn', 'scramble:correct', 'scramble:wrong', 'scramble:timeout',
        'chain:correct', 'chain:attempt', 'chain:timeout', 'chain:invalid', 'chain:turn',
        'categories:state', 'categories:new-round', 'categories:correct', 'categories:wrong',
        'categories:strike', 'categories:round-end', 'categories:invalid',
        'trivia:question', 'trivia:buzz-locked', 'trivia:pass', 'trivia:correct', 'trivia:wrong', 'trivia:reveal',
        'mic:control', 'room:mic-status', 'chat:message', 'error',
        'game:half-time', 'game:second-half',
      ].forEach(ev => socket.off(ev));
    };
  }, [sessionId, token, update]);

  const guessLetter = useCallback((letter: string) => {
    socketRef.current?.emit('hangman:guess', { sessionId, letter });
  }, [sessionId]);

  const submitScrambleAnswer = useCallback((answer: string) => {
    if (!answer.trim()) return;
    socketRef.current?.emit('scramble:guess', { sessionId, answer });
  }, [sessionId]);

  const sendChat = useCallback((message: string, replyTo?: { userName: string; message: string }) => {
    socketRef.current?.emit('chat:send', { sessionId, message, replyTo });
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

  const submitCategoriesAnswer = useCallback((answer: string) => {
    if (!answer.trim()) return;
    socketRef.current?.emit('categories:guess', { sessionId, answer });
  }, [sessionId]);

  const buzzIn = useCallback(() => {
    socketRef.current?.emit('trivia:buzz', { sessionId });
  }, [sessionId]);

  const submitTriviaAnswer = useCallback((answer: string) => {
    socketRef.current?.emit('trivia:answer', { sessionId, answer });
  }, [sessionId]);

  const emitMicReady = useCallback(() => {
    socketRef.current?.emit('player:mic-ready', { sessionId });
  }, [sessionId]);

  const adminSecondHalf = useCallback(() => {
    socketRef.current?.emit('admin:second-half', { sessionId });
  }, [sessionId]);

  return { state, guessLetter, submitScrambleAnswer, submitChainWord, submitCategoriesAnswer, buzzIn, submitTriviaAnswer, sendChat, adminStart, adminEnd, adminSecondHalf, emitMicReady };
}
