import { NextRequest, NextResponse } from 'next/server';
import { verifyCheckinToken, DAY_LABELS } from '@/lib/qr/token';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ valid: false, error: 'No token provided' }, { status: 400 });

  const result = verifyCheckinToken(token);
  if (!result.valid) return NextResponse.json({ valid: false, error: result.error }, { status: 400 });

  return NextResponse.json({
    valid: true,
    day: result.token!.day,
    dayLabel: DAY_LABELS[result.token!.day],
    date: result.token!.date,
  });
}
