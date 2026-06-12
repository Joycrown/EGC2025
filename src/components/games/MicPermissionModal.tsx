'use client';

import { MicPermissionState } from '@/hooks/useMicPermission';

interface Props {
  state: MicPermissionState;
  onRequest: () => void;
}

export default function MicPermissionModal({ state, onRequest }: Props) {
  if (state === 'granted' || state === 'checking' || state === 'unavailable') return null;

  const isDenied = state === 'denied';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">

        {/* Icon */}
        <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
          isDenied ? 'bg-red-900/60 text-red-400' : 'bg-yellow-900/60 text-yellow-400'
        }`}>
          {isDenied ? '🎙️' : '🎙️'}
        </div>

        {isDenied ? (
          <>
            <h2 className="text-lg font-bold text-white mb-2">Microphone Blocked</h2>
            <p className="text-sm text-gray-400 mb-4">
              Your browser is blocking microphone access. Your team won&apos;t be able to hear you during the game.
            </p>

            {/* Browser-specific fix instructions */}
            <div className="text-left bg-gray-800 rounded-xl p-4 mb-5 space-y-2 text-xs text-gray-300">
              <p className="font-semibold text-gray-200 mb-1">How to fix it:</p>
              <p><span className="text-yellow-400 font-semibold">Chrome / Edge:</span> Click the lock icon in the address bar &rarr; Site settings &rarr; Microphone &rarr; Allow</p>
              <p><span className="text-yellow-400 font-semibold">Firefox:</span> Click the shield/lock icon &rarr; Permissions &rarr; Microphone &rarr; Allow</p>
              <p><span className="text-yellow-400 font-semibold">Safari:</span> Safari menu &rarr; Settings for This Website &rarr; Microphone &rarr; Allow</p>
            </div>

            <p className="text-xs text-gray-500 mb-4">After allowing, reload the page to try again.</p>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold text-sm"
            >
              Reload Page
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-white mb-2">Microphone Access Needed</h2>
            <p className="text-sm text-gray-400 mb-5">
              Your mic is required so your team can hear you during the game. Tap <span className="text-white font-semibold">Allow</span> when your browser asks.
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
      </div>
    </div>
  );
}
