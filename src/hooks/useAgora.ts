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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agoraRTCRef = useRef<any>(null);
  const [joined, setJoined] = useState(false);
  const [failed, setFailed] = useState(false);
  const [remoteCount, setRemoteCount] = useState(0);

  useEffect(() => {
    if (!config) return;

    const { appId, channel, token, uid } = config;
    let mounted = true;
    setFailed(false);

    const timeout = setTimeout(() => {
      if (mounted && !joined) setFailed(true);
    }, 10000);

    async function init() {
      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        AgoraRTC.setLogLevel(4);
        agoraRTCRef.current = AgoraRTC;

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video' | 'datachannel') => {
          if (mediaType === 'audio') {
            await client.subscribe(user, 'audio');
            user.audioTrack?.play();
            if (mounted) setRemoteCount(c => c + 1);
          }
        });

        client.on('user-unpublished', (_user: IAgoraRTCRemoteUser, mediaType: string) => {
          if (mediaType === 'audio' && mounted) setRemoteCount(c => Math.max(0, c - 1));
        });

        await client.join(appId, channel, token, uid);
        // Track creation is intentionally deferred to the micEnabled effect below.
        // We close() + recreate the track on each turn rather than using setEnabled
        // or unpublish alone. This is required on iOS: as long as a live
        // MediaStreamTrack exists (even unpublished / muted), iOS routes ALL audio
        // output to the earpiece. close() fully ends the stream so iOS switches
        // back to the speaker when it is not the participant's turn.

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
    if (!joined || config?.role !== 'publisher') return;

    const client = clientRef.current;
    const AgoraRTC = agoraRTCRef.current;
    if (!client || !AgoraRTC) return;

    let cancelled = false;

    if (micEnabled) {
      AgoraRTC.createMicrophoneAudioTrack()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((newTrack: any) => {
          if (cancelled) {
            newTrack.close();
            return;
          }
          localTrackRef.current = newTrack;
          return client.publish(newTrack);
        })
        .catch(() => {});
    } else {
      const track = localTrackRef.current;
      if (track) {
        client
          .unpublish(track)
          .catch(() => {})
          .finally(() => {
            track.close();
            localTrackRef.current = null;
          });
      }
    }

    return () => {
      cancelled = true;
    };
  }, [micEnabled, joined, config?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMic = useCallback((enabled: boolean) => {
    const client = clientRef.current;
    const AgoraRTC = agoraRTCRef.current;
    if (!client || !AgoraRTC) return;

    if (enabled) {
      AgoraRTC.createMicrophoneAudioTrack()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((newTrack: any) => {
          localTrackRef.current = newTrack;
          return client.publish(newTrack);
        })
        .catch(() => {});
    } else {
      const track = localTrackRef.current;
      if (track) {
        client
          .unpublish(track)
          .catch(() => {})
          .finally(() => {
            track.close();
            localTrackRef.current = null;
          });
      }
    }
  }, []);

  return { joined, failed, remoteCount, toggleMic };
}
