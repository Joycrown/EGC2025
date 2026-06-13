'use client';

import { MicSetupState } from '@/hooks/useMicSetup';

interface Props {
  state: MicSetupState;
  onRequest: () => void;
  onTest: () => void;
  onConfirm: () => void;
  onSkip: () => void;
}

export default function MicSetupModal({ state, onRequest, onTest, onConfirm, onSkip }: Props) {
  if (state === 'confirmed' || state === 'checking' || state === 'unavailable') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">

        {/* Step 1 — Permission prompt */}
        {(state === 'prompt' || state === 'requesting') && (
          <>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-yellow-900/60 text-yellow-400">
              🎙️
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Microphone Access Needed</h2>
            <p className="text-sm text-gray-400 mb-5">
              Your mic is required so your team can hear you.
              Tap <span className="text-white font-semibold">Allow</span> when your browser asks.
            </p>
            <button
              onClick={onRequest}
              disabled={state === 'requesting'}
              className="w-full py-3 rounded-xl bg-green-700 hover:bg-green-600 disabled:opacity-60 disabled:cursor-wait text-white font-semibold text-sm mb-3"
            >
              {state === 'requesting' ? 'Waiting for permission…' : 'Enable Microphone'}
            </button>
            <p className="text-xs text-gray-600">
              Your mic is muted by default &mdash; it only activates when it&apos;s your team&apos;s turn.
            </p>
          </>
        )}

        {/* Step 1 — Permission denied */}
        {state === 'denied' && (
          <>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-red-900/60 text-red-400">
              🎙️
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Microphone Blocked</h2>
            <p className="text-sm text-gray-400 mb-4">
              Your browser is blocking microphone access. Your team won&apos;t be able to hear you during the game.
            </p>
            <div className="text-left bg-gray-800 rounded-xl p-4 mb-5 space-y-2 text-xs text-gray-300">
              <p className="font-semibold text-gray-200 mb-1">How to fix it:</p>
              <p>
                <span className="text-yellow-400 font-semibold">Chrome / Edge:</span>{' '}
                Click the lock icon in the address bar &rarr; Site settings &rarr; Microphone &rarr; Allow
              </p>
              <p>
                <span className="text-yellow-400 font-semibold">Firefox:</span>{' '}
                Click the shield/lock icon &rarr; Permissions &rarr; Microphone &rarr; Allow
              </p>
              <p>
                <span className="text-yellow-400 font-semibold">Safari:</span>{' '}
                Safari menu &rarr; Settings for This Website &rarr; Microphone &rarr; Allow
              </p>
            </div>
            <p className="text-xs text-gray-500 mb-4">After allowing, reload the page to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold text-sm"
            >
              Reload Page
            </button>
          </>
        )}

        {/* Step 2 — Ready to test */}
        {state === 'ready_to_test' && (
          <>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-blue-900/60 text-blue-400">
              🎤
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Test Your Microphone</h2>
            <p className="text-sm text-gray-400 mb-5">
              We&apos;ll record 2 seconds and play it back so you can confirm everything is working
              before the game starts.
            </p>
            <button
              onClick={onTest}
              className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-semibold text-sm mb-3"
            >
              Record &amp; Play Back
            </button>
            <button
              onClick={onSkip}
              className="w-full py-2 rounded-xl text-gray-500 hover:text-gray-400 text-sm"
            >
              Skip test
            </button>
          </>
        )}

        {/* Step 2 — Recording */}
        {state === 'testing' && (
          <>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-red-900/60 text-red-400 animate-pulse">
              🔴
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Recording…</h2>
            <p className="text-sm text-gray-400">Say something now. Stops automatically in 2 seconds.</p>
          </>
        )}

        {/* Step 2 — Playback */}
        {state === 'playback' && (
          <>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-green-900/60 text-green-400">
              🔊
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Did you hear yourself?</h2>
            <p className="text-sm text-gray-400 mb-5">
              Your recording is playing back now. If you heard your voice, your mic is working.
            </p>
            <button
              onClick={onConfirm}
              className="w-full py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white font-semibold text-sm mb-3"
            >
              ✅ Yes, I heard myself &mdash; I&apos;m ready
            </button>
            <button
              onClick={onTest}
              className="w-full py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm mb-2"
            >
              Try again
            </button>
            <button
              onClick={onSkip}
              className="w-full py-2 rounded-xl text-gray-500 hover:text-gray-400 text-sm"
            >
              I can&apos;t hear it &mdash; skip
            </button>
          </>
        )}

      </div>
    </div>
  );
}
