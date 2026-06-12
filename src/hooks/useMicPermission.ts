'use client';

import { useState, useEffect, useCallback } from 'react';

export type MicPermissionState =
  | 'checking'   // querying Permissions API
  | 'prompt'     // browser will ask — show our modal first
  | 'requesting' // getUserMedia in flight
  | 'granted'    // good to go
  | 'denied'     // user or browser blocked it
  | 'unavailable'; // no mic hardware found

export function useMicPermission(active: boolean) {
  const [state, setState] = useState<MicPermissionState>('checking');

  useEffect(() => {
    if (!active) return;

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setState('unavailable');
      return;
    }

    // Use the Permissions API if available to avoid an unnecessary prompt
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then(result => {
          if (result.state === 'granted') setState('granted');
          else if (result.state === 'denied') setState('denied');
          else setState('prompt');

          // Listen for the user changing permission in browser settings
          result.onchange = () => {
            if (result.state === 'granted') setState('granted');
            else if (result.state === 'denied') setState('denied');
            else setState('prompt');
          };
        })
        .catch(() => setState('prompt')); // Permissions API unavailable — try directly
    } else {
      setState('prompt');
    }
  }, [active]);

  const requestPermission = useCallback(async () => {
    setState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop immediately — we only needed the permission grant
      stream.getTracks().forEach(t => t.stop());
      setState('granted');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        setState('unavailable');
      } else {
        setState('denied');
      }
    }
  }, []);

  return { state, requestPermission };
}
