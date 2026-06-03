import { getServerSession } from '@/lib/auth/utils';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prismaClient';
import { cookies } from 'next/headers';
import GameRoomClient from '@/components/games/GameRoomClient';

interface Props {
  params: { sessionId: string };
}

export default async function GameRoomPage({ params }: Props) {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const dbSession = await prisma.gameSession.findUnique({
    where: { id: params.sessionId },
    include: {
      teamA: { select: { id: true, name: true, color: true } },
      teamB: { select: { id: true, name: true, color: true } },
      roster: {
        include: {
          user: { select: { id: true, fullName: true } },
          team: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!dbSession) notFound();

  const rosterEntry = dbSession.roster.find(r => r.userId === session.user.id);
  const role = rosterEntry ? 'participant' : 'spectator';
  const myTeamId = rosterEntry?.teamId ?? null;

  const token = cookies().get('auth-token')?.value ?? '';

  return (
    <GameRoomClient
      sessionId={params.sessionId}
      token={token}
      initialRole={role}
      myTeamId={myTeamId}
      userId={session.user.id}
      userType={session.user.userType}
      teamAId={dbSession.teamAId}
      teamBId={dbSession.teamBId}
      teamAName={dbSession.teamA.name}
      teamBName={dbSession.teamB.name}
      teamAColor={dbSession.teamA.color}
      teamBColor={dbSession.teamB.color}
      gameType={dbSession.gameType}
      status={dbSession.status}
    />
  );
}
