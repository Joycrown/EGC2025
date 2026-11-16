'use client';

import { useState } from 'react';

interface Props {
  email: string;
  className?: string;
}

// Asks the server to send the email-verification link again.
export default function ResendVerificationButton({ email, className = '' }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleClick() {
    if (!email) return;
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not resend the email.');
      setStatus('sent');
      setMessage('Verification link sent. Check your inbox and spam folder.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Could not resend the email.');
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={!email || status === 'sending' || status === 'sent'}
        className="text-sm font-semibold text-red-600 hover:text-red-500 underline underline-offset-2 disabled:opacity-60 disabled:no-underline disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Email sent' : 'Resend verification email'}
      </button>
      {message && (
        <p className={`text-xs mt-1 ${status === 'error' ? 'text-red-600' : 'text-green-700'}`}>{message}</p>
      )}
    </div>
  );
}
