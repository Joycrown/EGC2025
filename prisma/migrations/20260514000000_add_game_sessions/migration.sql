-- Safe additive migration for EGC Games system
-- Only creates new tables/enums. Does not drop or alter existing user/team/attendance data.

-- CreateEnum
CREATE TYPE "EgcGameType" AS ENUM ('HANGMAN', 'TIC_TAC_TOE', 'SUDOKU_RELAY', 'CROSSWORD', 'WORD_CHAIN', 'BIBLE_VERSE_COMPLETION', 'WORD_BLITZ', 'NAME_THAT_TUNE', 'BIBLE_TRIVIA', 'SCRIPTURE_SCRAMBLE', 'BIBLE_CATEGORIES', 'CONNECT_THE_DOTS');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "GameStatus_new" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "GameSession" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Game" ALTER COLUMN "status" TYPE "GameStatus_new" USING ("status"::text::"GameStatus_new");
ALTER TYPE "GameStatus" RENAME TO "GameStatus_old";
ALTER TYPE "GameStatus_new" RENAME TO "GameStatus";
DROP TYPE "GameStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "GameType_new" AS ENUM ('FOOTBALL', 'VOLLEYBALL', 'BASKETBALL', 'QUIZ', 'RELAY_RACE', 'TUG_OF_WAR', 'OTHER');
ALTER TABLE "Game" ALTER COLUMN "gameType" TYPE "GameType_new" USING ("gameType"::text::"GameType_new");
ALTER TYPE "GameType" RENAME TO "GameType_old";
ALTER TYPE "GameType_new" RENAME TO "GameType";
DROP TYPE "GameType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "GameMove" DROP CONSTRAINT "GameMove_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "GameMove" DROP CONSTRAINT "GameMove_userId_fkey";

-- DropForeignKey
ALTER TABLE "GameParticipant" DROP CONSTRAINT "GameParticipant_gameSessionId_fkey";

-- DropForeignKey
ALTER TABLE "GameParticipant" DROP CONSTRAINT "GameParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_createdById_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

-- DropIndex
DROP INDEX "Game_name_key";

-- DropIndex
DROP INDEX "GameSession_spectatorCode_key";

-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "userEmail" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "authorId",
DROP COLUMN "sessionId",
DROP COLUMN "text",
ADD COLUMN     "gameSessionId" TEXT NOT NULL,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "maxPlayersPerTeam",
DROP COLUMN "rules",
DROP COLUMN "timeLimitSeconds",
DROP COLUMN "type",
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "gameType" "GameType" NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "GameStatus" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "venue" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GameSession" DROP COLUMN "currentTurn",
DROP COLUMN "gameId",
DROP COLUMN "roomName",
DROP COLUMN "spectatorCode",
DROP COLUMN "spectatorCount",
DROP COLUMN "winnerTeamId",
ADD COLUMN     "currentTurnTeamId" TEXT,
ADD COLUMN     "gameType" "EgcGameType" NOT NULL,
ADD COLUMN     "teamAScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "teamBScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "winnerId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
ALTER COLUMN "gameState" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "createdById",
DROP COLUMN "description";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "teamId" TEXT;

-- DropTable
DROP TABLE "GameMove";

-- DropTable
DROP TABLE "GameParticipant";

-- DropTable
DROP TABLE "TeamMember";

-- DropTable
DROP TABLE "UsedHangmanWord";

-- CreateTable
CREATE TABLE "GameParticipation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "position" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameScore" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameRoster" (
    "id" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameRoster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurnLog" (
    "id" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT,
    "moveData" JSONB NOT NULL,
    "isCorrect" BOOLEAN,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TurnLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GameToTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GameParticipation_userId_gameId_key" ON "GameParticipation"("userId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "GameRoster_gameSessionId_userId_key" ON "GameRoster"("gameSessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToTeam_AB_unique" ON "_GameToTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToTeam_B_index" ON "_GameToTeam"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameParticipation" ADD CONSTRAINT "GameParticipation_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameParticipation" ADD CONSTRAINT "GameParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameScore" ADD CONSTRAINT "GameScore_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRoster" ADD CONSTRAINT "GameRoster_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRoster" ADD CONSTRAINT "GameRoster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRoster" ADD CONSTRAINT "GameRoster_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnLog" ADD CONSTRAINT "TurnLog_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToTeam" ADD CONSTRAINT "_GameToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToTeam" ADD CONSTRAINT "_GameToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

