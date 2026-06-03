import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/utils';
import { generateCheckinToken, checkinUrl, DAY_LABELS, CheckinDay } from '@/lib/qr/token';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    await verifyAuth(request, ['ADMIN', 'SUPER_ADMIN']);

    const { day } = await request.json();
    if (!['day1', 'day2', 'day3'].includes(day)) {
      return NextResponse.json({ error: 'Invalid day' }, { status: 400 });
    }

    const url = checkinUrl(day as CheckinDay);
    const token = generateCheckinToken(day as CheckinDay);

    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    });

    return NextResponse.json({
      qrDataUrl,
      token,
      url,
      day,
      dayLabel: DAY_LABELS[day as CheckinDay],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    if (msg.includes('Unauthorized') || msg.includes('Forbidden')) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
