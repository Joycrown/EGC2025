import { Suspense } from 'react';
import CheckinPageInner from './CheckinPageInner';

function CheckinLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-white/40 text-sm">Loading check-in…</p>
    </div>
  );
}

export default function CheckinPage() {
  return (
    <Suspense fallback={<CheckinLoading />}>
      <CheckinPageInner />
    </Suspense>
  );
}
