import { createHmac } from 'crypto';

export type CheckinDay = 'day1' | 'day2' | 'day3';

export const DAY_LABELS: Record<CheckinDay, string> = {
  day1: 'Day 1 — Thursday, 10 July 2026',
  day2: 'Day 2 — Friday, 11 July 2026',
  day3: 'Day 3 — Saturday, 12 July 2026',
};

export const DAY_DATES: Record<CheckinDay, string> = {
  day1: '2026-07-10',
  day2: '2026-07-11',
  day3: '2026-07-12',
};

export interface CheckinToken {
  day: CheckinDay;
  date: string;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

/** Generates a signed check-in token valid until midnight of the given day */
export function generateCheckinToken(day: CheckinDay): string {
  const date = DAY_DATES[day];
  // Expires at midnight (23:59:59) of the conference day
  const exp = new Date(`${date}T23:59:59`).getTime();
  const payload: CheckinToken = { day, date, exp };
  const data = JSON.stringify(payload);
  const sig = sign(data);
  const combined = Buffer.from(JSON.stringify({ ...payload, sig })).toString('base64url');
  return combined;
}

export interface VerifyResult {
  valid: boolean;
  token?: CheckinToken;
  error?: string;
}

/** Verifies a check-in token from the QR code */
export function verifyCheckinToken(raw: string): VerifyResult {
  try {
    const decoded = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    const { sig, ...payload } = decoded;
    const data = JSON.stringify(payload);
    const expectedSig = sign(data);
    if (sig !== expectedSig) return { valid: false, error: 'Invalid QR code' };
    if (Date.now() > payload.exp) return { valid: false, error: 'This QR code has expired. Ask the admin to refresh it.' };
    return { valid: true, token: payload as CheckinToken };
  } catch {
    return { valid: false, error: 'Unrecognised QR code' };
  }
}

/** Returns the QR URL to encode — points to the check-in page */
export function checkinUrl(day: CheckinDay): string {
  const token = generateCheckinToken(day);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return `${base}/checkin?token=${token}`;
}
