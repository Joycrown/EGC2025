import { RtcTokenBuilder, RtcRole } from 'agora-token';

const TOKEN_EXPIRY_SECONDS = 3600;

function userIdToAgoraUid(userId: string): number {
  // Hash userId string to a stable 32-bit unsigned int
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // convert to 32-bit int
  }
  return Math.abs(hash) % 2147483647 || 1;
}

export function generateRtcToken(
  sessionId: string,
  userId: string,
  role: 'publisher' | 'subscriber'
): { token: string; uid: number; channel: string; appId: string } {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    throw new Error('Agora credentials not configured');
  }

  const channel = `egc-session-${sessionId}`;
  const uid = userIdToAgoraUid(userId);
  const expireTime = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS;
  const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channel,
    uid,
    agoraRole,
    expireTime,
    expireTime
  );

  return { token, uid, channel, appId };
}
