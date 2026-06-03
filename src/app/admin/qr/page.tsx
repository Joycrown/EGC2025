'use client';

import { useState } from 'react';

const DAYS = [
  { value: 'day1', label: 'Day 1', date: 'Thursday, 10 July 2026' },
  { value: 'day2', label: 'Day 2', date: 'Friday, 11 July 2026' },
  { value: 'day3', label: 'Day 3', date: 'Saturday, 12 July 2026' },
];

export default function AdminQRPage() {
  const [selectedDay, setSelectedDay] = useState('day1');
  const [qrData, setQrData] = useState<{ qrDataUrl: string; dayLabel: string; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fullscreen, setFullscreen] = useState(false);

  async function generate() {
    setLoading(true); setError(''); setQrData(null);
    const res = await fetch('/api/qr/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day: selectedDay }),
    });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) { setError(d.error ?? 'Failed to generate QR'); return; }
    setQrData(d);
  }

  function download() {
    if (!qrData) return;
    const a = document.createElement('a');
    a.href = qrData.qrDataUrl;
    a.download = `egc-2026-checkin-${selectedDay}.png`;
    a.click();
  }

  function print() {
    if (!qrData) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>EGC 2026 Check-in QR — ${qrData.dayLabel}</title></head>
      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#fff;margin:0;padding:40px;box-sizing:border-box;">
        <h2 style="margin-bottom:8px;font-size:22px;">EGC Conference 2026</h2>
        <p style="color:#666;margin-bottom:24px;font-size:14px;">${qrData.dayLabel} — Check-in QR Code</p>
        <img src="${qrData.qrDataUrl}" width="360" height="360" style="display:block;border:2px solid #eee;border-radius:12px;padding:12px;" />
        <p style="margin-top:20px;color:#999;font-size:12px;">Scan this code to check in</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  }

  return (
    <>
      {/* Fullscreen QR overlay */}
      {fullscreen && qrData && (
        <div
          className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center cursor-pointer"
          onClick={() => setFullscreen(false)}
        >
          <p className="text-gray-500 text-sm mb-4 font-medium">{qrData.dayLabel}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrData.qrDataUrl} alt="Check-in QR" className="w-80 h-80 sm:w-[440px] sm:h-[440px]" style={{ imageRendering: 'pixelated' }} />
          <p className="text-gray-400 text-xs mt-6">EGC Conference 2026 · Tap anywhere to close</p>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Check-in QR Code</h1>
          <p className="text-gray-400 mt-1 text-sm">Generate a QR code for each conference day. Display it at the venue entrance on a screen or print it.</p>
        </div>

        {/* Day selector */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 mb-5">
          <p className="text-sm font-semibold text-gray-300 mb-3">Select conference day</p>
          <div className="grid grid-cols-3 gap-3">
            {DAYS.map(d => (
              <button key={d.value} onClick={() => { setSelectedDay(d.value); setQrData(null); }}
                className={`py-3 rounded-xl border text-sm font-semibold transition-all ${selectedDay === d.value ? 'border-yellow-500/70 bg-yellow-500/15 text-yellow-300' : 'border-gray-700 bg-gray-700/40 text-gray-400 hover:border-gray-600 hover:text-gray-300'}`}>
                <span className="block font-bold">{d.label}</span>
                <span className="block text-xs opacity-70 mt-0.5">{d.date.split(',')[0]}</span>
              </button>
            ))}
          </div>

          <button onClick={generate} disabled={loading}
            className="mt-4 w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            style={{ background: loading ? undefined : 'linear-gradient(135deg,#f59e0b,#d97706)', backgroundColor: loading ? '#374151' : undefined, color: loading ? '#9ca3af' : '#000' }}>
            {loading ? 'Generating…' : qrData ? '↻ Refresh QR Code' : 'Generate QR Code'}
          </button>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-800/40 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* QR display */}
        {qrData && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-semibold">{qrData.dayLabel}</p>
                <p className="text-gray-500 text-xs mt-0.5">Valid until midnight · Refresh each morning</p>
              </div>
              <span className="text-xs font-bold text-green-400 bg-green-900/30 border border-green-800/40 px-2 py-1 rounded-full">Active</span>
            </div>

            {/* QR image */}
            <div className="flex justify-center mb-5">
              <button onClick={() => setFullscreen(true)} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrData.qrDataUrl}
                  alt="Check-in QR code"
                  className="w-64 h-64 rounded-xl border-2 border-gray-700 group-hover:border-yellow-500/50 transition-all"
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <span className="text-white/0 group-hover:text-white/90 text-sm font-semibold transition-all">⛶ Fullscreen</span>
                </div>
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-gray-900/60 rounded-xl p-4 mb-5 text-sm text-gray-400 space-y-1">
              <p>📲 <strong className="text-gray-200">Display:</strong> Show on a tablet or TV screen at the entrance</p>
              <p>🖨️ <strong className="text-gray-200">Print:</strong> Print A4 size and place on the registration desk</p>
              <p>🔄 <strong className="text-gray-200">Refresh daily:</strong> Generate a new code each morning</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={download}
                className="flex-1 py-2.5 rounded-xl border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white text-sm font-semibold transition-all">
                ↓ Download PNG
              </button>
              <button onClick={print}
                className="flex-1 py-2.5 rounded-xl border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white text-sm font-semibold transition-all">
                🖨 Print
              </button>
              <button onClick={() => setFullscreen(true)}
                className="flex-1 py-2.5 rounded-xl border border-yellow-600/40 hover:border-yellow-500/60 text-yellow-400 hover:text-yellow-300 text-sm font-semibold transition-all">
                ⛶ Fullscreen
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
