import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/utils';
import { prisma } from '@/lib/db/prismaClient';
import { sendEmailAsync, generateScheduleChangeEmail, generateGameInviteEmail } from '@/lib/email/emailService';

const GAME_LABELS: Record<string, string> = {
  HANGMAN: 'Hangman — Biblical Terms',
  WORD_SCRAMBLE: 'Word Scramble',
  WORD_CHAIN: 'Word Chain',
  BIBLE_CATEGORIES: 'Bible Categories',
  BIBLE_TRIVIA: 'Bible Trivia Blitz',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAuth(request);

    const session = await prisma.gameSession.findUnique({
      where: { id: params.id },
      include: {
        teamA: { select: { id: true, name: true, color: true } },
        teamB: { select: { id: true, name: true, color: true } },
        winner: { select: { id: true, name: true } },
        roster: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            team: { select: { id: true, name: true, color: true } },
          },
        },
        chat: {
          orderBy: { createdAt: 'asc' },
          take: 50,
          include: { User: { select: { id: true, fullName: true } } },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    if (msg.includes('Unauthorized')) return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH — reschedule a session (admin only), then email all registrants + participants
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAuth(request, ['ADMIN', 'SUPER_ADMIN']);

    const body = await request.json();
    const { scheduledAt } = body;
    if (!scheduledAt) {
      return NextResponse.json({ error: 'scheduledAt is required' }, { status: 400 });
    }

    const newDate = new Date(scheduledAt);
    if (isNaN(newDate.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduledAt date' }, { status: 400 });
    }

    const updated = await prisma.gameSession.update({
      where: { id: params.id },
      data: { scheduledAt: newDate },
      include: {
        teamA: { select: { id: true, name: true, color: true } },
        teamB: { select: { id: true, name: true, color: true } },
        roster: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            team: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Fire & forget emails — do not await, respond immediately
    sendSessionEmails(updated).catch(err =>
      console.error('[email] session reschedule emails failed:', err)
    );

    return NextResponse.json({ session: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    if (msg.includes('Unauthorized') || msg.includes('Forbidden')) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    if (msg.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function sendSessionEmails(session: {
  id: string;
  gameType: string;
  scheduledAt: Date;
  roundNumber: number | null;
  teamA: { id: string; name: string };
  teamB: { id: string; name: string };
  roster: Array<{
    team: { id: string; name: string };
    user: { fullName: string; email: string | null };
  }>;
}) {
  const appUrl =
    process.env.APP_ENV === 'production'
      ? (process.env.NEXT_PUBLIC_PRODUCTION_URL ?? 'https://egc-conference.vercel.app')
      : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');

  const gameLabel = GAME_LABELS[session.gameType] ?? session.gameType;
  const dt = session.scheduledAt;
  const dateStr = dt.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const gameRoomUrl = `${appUrl}/games/${session.id}`;
  const scheduleUrl = `${appUrl}/games`;

  // 1. Broadcast to all EGC 2026 registered users
  const edition = await prisma.conferenceEdition.findFirst({ where: { year: 2026 } });
  if (edition) {
    const registrations = await prisma.conferenceRegistration.findMany({
      where: { editionId: edition.id },
      include: { user: { select: { email: true } } },
    });

    for (const reg of registrations) {
      const email = reg.user.email;
      if (!email) continue;
      const opts = generateScheduleChangeEmail(email, {
        gameTypeLabel: gameLabel,
        teamAName: session.teamA.name,
        teamBName: session.teamB.name,
        newDate: dateStr,
        newTime: timeStr,
        gameUrl: scheduleUrl,
      });
      await sendEmailAsync(opts);
    }
  }

  // 2. Personalised game invite to each roster participant
  for (const entry of session.roster) {
    const email = entry.user.email;
    if (!email) continue;
    const opponent = entry.team.id === session.teamA.id ? session.teamB.name : session.teamA.name;
    const opts = generateGameInviteEmail(email, {
      participantName: entry.user.fullName,
      gameTypeLabel: gameLabel,
      yourTeamName: entry.team.name,
      opponentTeamName: opponent,
      scheduledDate: dateStr,
      scheduledTime: timeStr,
      roundNumber: session.roundNumber ?? 1,
      gameRoomUrl,
    });
    await sendEmailAsync(opts);
  }
}
