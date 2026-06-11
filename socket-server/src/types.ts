export type UserRole = 'ADMIN' | 'SUPER_ADMIN' | 'COORDINATOR' | 'PARTICIPANT' | 'VOLUNTEER' | 'MINISTER' | 'MEMBER' | 'INVITEE';
export type UserType = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  userType: UserType;
}

export type ParticipantRole = 'participant' | 'spectator';

// ─── Hangman types ────────────────────────────────────────────────────────────

export interface HangmanState {
  word: string;           // server-only — never sent to clients
  maskedWord: string;     // e.g. "_ _ _ _ _ _ _"
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

export interface ActiveSession {
  sessionId: string;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  currentTurnTeamId: string;
  timer: ReturnType<typeof setTimeout> | null;
  turnDuration: number;
  timeLeft: number;
  teamAScore: number;
  teamBScore: number;
  hangman: HangmanState;
  participantSockets: Map<string, string>;
  participantTeams: Map<string, string>;
  status: 'waiting' | 'in_progress' | 'completed';
  usedWords: string[];
  wordNumber: number;
}

// ─── Word Scramble types ──────────────────────────────────────────────────────

export interface ScrambleClientState {
  scrambledWord: string;
  category: string;
  hint: string;
  wordNumber: number;
  totalWords: number;
  wordSolved: boolean;
}

export interface ActiveScrambleSession {
  sessionId: string;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  currentTurnTeamId: string;
  timer: ReturnType<typeof setInterval> | null;
  turnDuration: number;
  timeLeft: number;
  teamAScore: number;
  teamBScore: number;
  currentWord: string;       // server-only — never sent to clients
  scrambledWord: string;
  category: string;
  hint: string;
  wordNumber: number;
  totalWords: number;
  wordSolved: boolean;
  participantSockets: Map<string, string>;
  participantTeams: Map<string, string>;
  status: 'waiting' | 'in_progress' | 'completed';
  usedWords: string[];
}

// ─── Word Chain types ─────────────────────────────────────────────────────────

export interface ChainClientState {
  chain: string[];          // all words accepted so far, in order
  requiredLetter: string;   // starting letter the active team must use
  wrongAttempts: string[];  // words tried and rejected this turn (shown to all)
  turnNumber: number;
  totalTurns: number;
}

export interface ActiveChainSession {
  sessionId: string;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  currentTurnTeamId: string;
  timer: ReturnType<typeof setInterval> | null;
  timeLeft: number;
  teamAScore: number;
  teamBScore: number;
  requiredLetter: string;
  chain: string[];
  usedWords: string[];
  turnNumber: number;
  totalTurns: number;
  wrongAttempts: string[];
  participantSockets: Map<string, string>;
  participantTeams: Map<string, string>;
  status: 'waiting' | 'in_progress' | 'completed';
}

// ─── Shared payload types ─────────────────────────────────────────────────────

export interface GameStatePayload {
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

// ─── Bible Trivia types ───────────────────────────────────────────────────────

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

// ─── Bible Categories types ───────────────────────────────────────────────────

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

export interface RosterParticipant {
  userId: string;
  fullName: string;
  teamId: string;
  teamName: string;
  isOnline: boolean;
}
