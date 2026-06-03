'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';

export interface AgoraConfig {
  appId: string;
  channel: string;
  token: string;
  uid: number;
  role: 'publisher' | 'subscriber';
}

export function useAgora(config: AgoraConfig | null, micEnabled: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const localTrackRef = useRef<any>(null);
  const [joined, setJoined] = useState(false);
  const [failed, setFailed] = useState(false);
  const [remoteCount, setRemoteCount] = useState(0);

  useEffect(() => {
    if (!config) return;

    const { appId, channel, token, uid, role } = config;
    let mounted = true;
    setFailed(false);

    // 10-second timeout — if Agora hasn't joined by then, mark as failed
    const timeout = setTimeout(() => {
      if (mounted && !joined) setFailed(true);
    }, 10000);

    async function init() {
      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        AgoraRTC.setLogLevel(4);

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video' | 'datachannel') => {
          if (mediaType === 'audio') {
            await client.subscribe(user, 'audio');
            user.audioTrack?.play();
            if (mounted) setRemoteCount(c => c + 1);
          }
        });

        client.on('user-unpublished', () => {
          if (mounted) setRemoteCount(c => Math.max(0, c - 1));
        });

        await client.join(appId, channel, token, uid);

        if (role === 'publisher') {
          const localTrack = await AgoraRTC.createMicrophoneAudioTrack();
          localTrackRef.current = localTrack;
          await client.publish(localTrack);
          localTrack.setEnabled(false);
        }

        if (mounted) {
          setJoined(true);
          setFailed(false);
          clearTimeout(timeout);
        }
      } catch {
        if (mounted) setFailed(true);
      }
    }

    init();

    return () => {
      mounted = false;
      clearTimeout(timeout);
      localTrackRef.current?.close?.();
      localTrackRef.current = null;
      clientRef.current?.leave?.().catch(() => {});
      clientRef.current = null;
      setJoined(false);
      setFailed(false);
    };
  }, [config?.appId, config?.channel, config?.token, config?.uid, config?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localTrackRef.current?.setEnabled?.(micEnabled);
  }, [micEnabled]);

  const toggleMic = useCallback((enabled: boolean) => {
    localTrackRef.current?.setEnabled?.(enabled);
  }, []);

  return { joined, failed, remoteCount, toggleMic };
}
