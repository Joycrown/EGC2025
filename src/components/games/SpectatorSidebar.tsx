'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMsg {
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

interface Props {
  chat: ChatMsg[];
  spectatorCount: number;
  onSend: (msg: string) => void;
  userId: string;
}

export default function SpectatorSidebar({ chat, spectatorCount, onSend, userId }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  }

  return (
    // mobile: full-width h-64 strip at bottom | md+: w-72 sidebar | lg: w-80
    <aside className="flex flex-col shrink-0 bg-gray-900/60 h-64 w-full border-t border-gray-800 md:h-auto md:w-72 md:border-t-0 md:border-l lg:w-80">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-gray-800 flex items-center justify-between shrink-0">
        <span className="text-sm font-semibold text-gray-200">Live Chat</span>
        <span className="text-xs text-gray-500">👁 {spectatorCount}</span>
      </div>

      {/* Messages — scrolls within itself */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {chat.length === 0 && (
          <p className="text-gray-600 text-xs italic text-center mt-4">No messages yet. Say something!</p>
        )}
        {chat.map((msg, i) => {
          const isMe = msg.userId === userId;
          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-gray-500 mb-0.5">{isMe ? 'You' : msg.userName}</span>
              <div
                className={`text-sm px-3 py-1.5 rounded-xl max-w-[88%] break-words ${
                  isMe
                    ? 'bg-red-800 text-white rounded-tr-sm'
                    : 'bg-gray-700 text-gray-100 rounded-tl-sm'
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input — pinned to bottom */}
      <div className="px-3 py-2.5 border-t border-gray-800 flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Chat…"
          maxLength={500}
          className="flex-1 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-600 placeholder-gray-600 min-w-0"
        />
        <button
          onClick={handleSend}
          className="shrink-0 bg-red-700 hover:bg-red-600 text-white text-sm font-semibold px-3 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </aside>
  );
}
