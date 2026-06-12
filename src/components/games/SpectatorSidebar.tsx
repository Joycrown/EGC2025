'use client';

import { useState, useRef, useEffect } from 'react';

interface ReplyTo {
  userName: string;
  message: string;
}

interface ChatMsg {
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
  replyTo?: ReplyTo | null;
}

interface Props {
  chat: ChatMsg[];
  spectatorCount: number;
  onSend: (msg: string, replyTo?: ReplyTo) => void;
  userId: string;
}

export default function SpectatorSidebar({ chat, spectatorCount, onSend, userId }: Props) {
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed, replyTo ?? undefined);
    setInput('');
    setReplyTo(null);
  }

  function handleQuote(msg: ChatMsg) {
    setReplyTo({ userName: msg.userId === userId ? 'You' : msg.userName, message: msg.message });
    inputRef.current?.focus();
  }

  function cancelReply() {
    setReplyTo(null);
    inputRef.current?.focus();
  }

  return (
    <aside className="flex flex-col shrink-0 bg-gray-900/60 h-64 w-full border-t border-gray-800 md:h-auto md:w-72 md:border-t-0 md:border-l lg:w-80">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-gray-800 flex items-center justify-between shrink-0">
        <span className="text-sm font-semibold text-gray-200">Live Chat</span>
        <span className="text-xs text-gray-500">👁 {spectatorCount}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {chat.length === 0 && (
          <p className="text-gray-600 text-xs italic text-center mt-4">No messages yet. Say something!</p>
        )}
        {chat.map((msg, i) => {
          const isMe = msg.userId === userId;
          return (
            <div
              key={i}
              className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs text-gray-500">{isMe ? 'You' : msg.userName}</span>
                {/* Reply button — shows on hover */}
                <button
                  onClick={() => handleQuote(msg)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-gray-300 text-xs"
                  title="Reply"
                >
                  ↩
                </button>
              </div>

              <div
                className={`text-sm px-3 py-1.5 rounded-xl max-w-[88%] break-words ${
                  isMe
                    ? 'bg-red-800 text-white rounded-tr-sm'
                    : 'bg-gray-700 text-gray-100 rounded-tl-sm'
                }`}
              >
                {/* Quoted message */}
                {msg.replyTo && (
                  <div className={`text-xs px-2 py-1 rounded-lg mb-1.5 border-l-2 ${
                    isMe
                      ? 'bg-red-900/60 border-red-400/50 text-red-200'
                      : 'bg-gray-600/60 border-gray-400/50 text-gray-300'
                  }`}>
                    <span className="font-semibold">{msg.replyTo.userName}</span>
                    <p className="truncate opacity-80">{msg.replyTo.message}</p>
                  </div>
                )}
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply preview strip */}
      {replyTo && (
        <div className="mx-3 mb-1 px-3 py-1.5 bg-gray-800 border-l-2 border-red-500 rounded-lg flex items-start justify-between gap-2 shrink-0">
          <div className="min-w-0">
            <p className="text-xs text-red-400 font-semibold">Replying to {replyTo.userName}</p>
            <p className="text-xs text-gray-400 truncate">{replyTo.message}</p>
          </div>
          <button
            onClick={cancelReply}
            className="text-gray-500 hover:text-white text-sm shrink-0 leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-2.5 border-t border-gray-800 flex gap-2 shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); if (e.key === 'Escape') cancelReply(); }}
          placeholder={replyTo ? `Reply to ${replyTo.userName}…` : 'Chat…'}
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
