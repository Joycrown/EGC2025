'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Role } from '@prisma/client';

interface Attendee {
  id: string;
  User: {
    fullName: string;
    email: string;
    role: Role;
    address: string | null;
  };
}

type ConferenceDay = 'day1' | 'day2' | 'day3';

const DAYS: { value: ConferenceDay; label: string; date: string }[] = [
  { value: 'day1', label: 'Thu', date: 'Jul 10' },
  { value: 'day2', label: 'Fri', date: 'Jul 11' },
  { value: 'day3', label: 'Sat', date: 'Jul 12' },
];

const ROLE_STYLES: Record<string, string> = {
  ADMIN:       'bg-red-100 text-red-700 border-red-200',
  SUPER_ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
  MINISTER:    'bg-blue-100 text-blue-700 border-blue-200',
  VOLUNTEER:   'bg-amber-100 text-amber-700 border-amber-200',
  PARTICIPANT: 'bg-green-100 text-green-700 border-green-200',
  MEMBER:      'bg-indigo-100 text-indigo-700 border-indigo-200',
  INVITEE:     'bg-gray-100 text-gray-600 border-gray-200',
  COORDINATOR: 'bg-teal-100 text-teal-700 border-teal-200',
};

const AttendanceViewer = () => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<ConferenceDay>('day1');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchAttendees = useCallback(async (day: ConferenceDay, page: number, term: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ day, page: page.toString(), pageSize: '10', searchTerm: term, roleFilter: role });
      const res = await fetch(`/api/admin/attendance?${params}`);
      if (!res.ok) throw new Error('Failed to fetch attendance data.');
      const data = await res.json();
      setAttendees(data.attendees);
      setTotalPages(data.totalPages);
      setTotalAttendees(data.totalAttendees);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendees(selectedDay, currentPage, searchTerm, roleFilter);
  }, [selectedDay, currentPage, searchTerm, roleFilter, fetchAttendees]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Attendance Register</h2>
            <p className="text-sm text-gray-500 mt-0.5">EGC 2026 · July 10–12</p>
          </div>
          <span className="inline-flex px-3 py-1 bg-red-50 text-red-700 font-semibold text-sm rounded-full border border-red-100">
            {totalAttendees} present
          </span>
        </div>

        {/* Day tabs */}
        <div className="flex gap-2 mt-5">
          {DAYS.map(d => (
            <button
              key={d.value}
              onClick={() => { setSelectedDay(d.value); setCurrentPage(1); }}
              className={`flex flex-col items-center px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                selectedDay === d.value
                  ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-100'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600'
              }`}
            >
              <span className="text-xs font-medium opacity-80">{d.label}</span>
              <span className="text-base">{d.date}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 bg-gray-50/60 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
        >
          <option value="ALL">All Roles</option>
          {Object.values(Role).map(r => (
            <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading attendance…</span>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 text-sm">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Attendee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Address</th>
                </tr>
              </thead>
              <tbody>
                {attendees.length > 0 ? attendees.map((a, i) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-red-50/20 transition-colors">
                    <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                      {((currentPage - 1) * 10) + i + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                          {a.User.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{a.User.fullName}</p>
                          <p className="text-xs text-gray-400">{a.User.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_STYLES[a.User.role] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {a.User.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{a.User.address || '—'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-gray-400 text-sm">
                      No attendees recorded for this day yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 flex justify-between items-center border-t border-gray-100 bg-gray-50/40">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >← Previous</button>
              <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceViewer;
