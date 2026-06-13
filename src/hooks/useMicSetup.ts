'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type MicSetupState =
  | 'checking'       // querying Permissions API
  | 'prompt'         // browser will ask — show our modal first
  | 'requesting'     // getUserMedia in flight
  | 'denied'         // user/browser blocked
  | 'unavailable'    // no mic hardware
  | 'ready_to_test'  // permission granted, test not done
  | 'testing'        // MediaRecorder running (2 s)
  | 'playback'       // playing the recording back
  | 'confirmed';     // all done — safe to emit mic-ready

interface UseMicSetupOptions {
  // Skip the test step and confirm immediately after permission is granted.
  // Used for admins who just need the mic on, not a full soundcheck.
  autoConfirm?: boolean;
}

export function useMicSetup(active: boolean, options?: UseMicSetupOptions) {
  const [state, setState] = useState<MicSetupState>('checking');
  const streamRef = useRef<MediaStream | null>(null);
  const autoConfirm = options?.autoConfirm ?? false;

  useEffect(() => {
    if (!active) return;

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setState('unavailable');
      return;
    }

    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then(result => {
          const toState = (s: PermissionState): MicSetupState =>
            s === 'granted' ? (autoConfirm ? 'confirmed' : 'ready_to_test')
            : s === 'denied' ? 'denied'
            : 'prompt';

          setState(toState(result.state));
          result.onchange = () => setState(toState(result.state));
        })
        .catch(() => setState('prompt'));
    } else {
      setState('prompt');
    }
  }, [active, autoConfirm]);

  const requestPermission = useCallback(async () => {
    setState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setState(autoConfirm ? 'confirmed' : 'ready_to_test');
    } catch (err) {
      setState(
        err instanceof DOMException && err.name === 'NotFoundError'
          ? 'unavailable'
          : 'denied'
      );
    }
  }, [autoConfirm]);

  const testMic = useCallback(async () => {
    setState('testing');
    try {
      let stream = streamRef.current;
      if (!stream || stream.getTracks().some(t => t.readyState === 'ended')) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      }

      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        audio.play().catch(() => {});
        setState('playback');
      };

      recorder.start();
      setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 2500);
    } catch {
      setState('ready_to_test');
    }
  }, []);

  const confirmReady = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setState('confirmed');
  }, []);

  const skipTest = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setState('confirmed');
  }, []);

  return { state, requestPermission, testMic, confirmReady, skipTest };
}
