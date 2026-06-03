'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from 'use-debounce';

interface UserSearchResult {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  isAttended?: boolean;
}

type ConferenceDay = 'day1' | 'day2' | 'day3';

const CONFERENCE_DAYS = [
  { value: 'day1' as ConferenceDay, day: 'Thursday', date: '10 July 2026', fullDate: new Date('2026-07-10T00:00:00') },
  { value: 'day2' as ConferenceDay, day: 'Friday',   date: '11 July 2026', fullDate: new Date('2026-07-11T00:00:00') },
  { value: 'day3' as ConferenceDay, day: 'Saturday', date: '12 July 2026', fullDate: new Date('2026-07-12T00:00:00') },
];

const today = new Date();
today.setHours(0, 0, 0, 0);

const MarkAttendance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const availableDays = CONFERENCE_DAYS.filter(d => d.fullDate >= today);
  const [conferenceDay, setConferenceDay] = useState<ConferenceDay>(
    availableDays[0]?.value ?? 'day1'
  );

  useEffect(() => {
    if (!debouncedSearchTerm) { setSearchResults([]); setMessage(''); return; }
    setIsLoading(true);
    setMessage('');
    fetch(`/api/admin/users?search=${encodeURIComponent(debouncedSearchTerm)}&conferenceDay=${conferenceDay}`)
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.error ?? 'Failed to search.');
        setSearchResults(d);
        if (d.length === 0) { setMessage('No users found with that email.'); setIsError(true); }
      })
      .catch(e => { setMessage(e.message); setIsError(true); })
      .finally(() => setIsLoading(false));
  }, [debouncedSearchTerm, conferenceDay]);

  const toggleUser = (id: string) => {
    const s = new Set(selectedUsers);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedUsers(s);
  };

  const handleSubmit = async () => {
    if (selectedUsers.size === 0) { setMessage('Select at least one person.'); setIsError(true); return; }
    setIsLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/mark-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: Array.from(selectedUsers), conferenceDay }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? 'Failed to mark attendance.');
      setMessage(result.message ?? `Marked ${selectedUsers.size} user(s) present.`);
      setIsError(false);
      setSelectedUsers(new Set());
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unknown error.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Mark Attendance</h2>
        <p className="text-sm text-gray-500 mt-0.5">EGC 2026 · July 10–12</p>
      </div>

      <div className="p-6 space-y-6">

        {/* Day chips */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Select Conference Day</p>
          <div className="flex flex-wrap gap-3">
            {CONFERENCE_DAYS.map(d => {
              const isPast = d.fullDate < today;
              const isActive = conferenceDay === d.value;
              return (
                <button
                  key={d.value}
                  onClick={() => !isPast && setConferenceDay(d.value)}
                  disabled={isPast}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-red-600 bg-red-600 text-white shadow-md shadow-red-100'
                      : isPast
                      ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:text-red-600'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center leading-none ${
                    isActive ? 'bg-white/20' : isPast ? 'bg-gray-100' : 'bg-red-50 text-red-600'
                  }`}>
                    <span className="text-[10px] font-semibold uppercase">{d.day.slice(0, 3)}</span>
                    <span className="text-lg font-bold leading-tight">{d.fullDate.getDate()}</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{d.day}</div>
                    <div className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-400'}`}>{d.date}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Find Participant</p>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="email"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone or email…"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
              {searchResults.map(u => (
                <label
                  key={u.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    u.isAttended
                      ? 'border-green-200 bg-green-50/60 cursor-not-allowed'
                      : selectedUsers.has(u.id)
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-100 bg-white hover:border-red-200 hover:bg-red-50/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(u.id) || !!u.isAttended}
                    onChange={() => toggleUser(u.id)}
                    disabled={!!u.isAttended}
                    className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50"
                  />
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                    {u.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{u.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  {u.isAttended && (
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">
                      Present ✓
                    </span>
                  )}
                </label>
              ))}

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-400">
                  {selectedUsers.size > 0 ? `${selectedUsers.size} selected` : 'Tap to select'}
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || selectedUsers.size === 0}
                  className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isLoading ? 'Marking…' : 'Mark Present'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {message && (
          <p className={`text-sm font-medium px-4 py-3 rounded-xl border ${
            isError ? 'text-red-700 bg-red-50 border-red-200' : 'text-green-700 bg-green-50 border-green-200'
          }`}>
            {isError ? '⚠ ' : '✓ '}{message}
          </p>
        )}
      </div>
    </div>
  );
};

export default MarkAttendance;
