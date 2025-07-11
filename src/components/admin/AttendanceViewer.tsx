'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Role } from '@prisma/client'; // Import Role enum

interface Attendee {
  id: string;
  user: {
    fullName: string;
    email: string;
    role: Role; // Add role to the user object
    address: string | null; // Add address to the user object
  };
}

type ConferenceDay = 'day_11_july' | 'day_12_july' | 'day_13_july';

const AttendanceViewer = () => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<ConferenceDay>('day_11_july');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' for no filter

  const fetchAttendees = useCallback(async (day: ConferenceDay, page: number, term: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        day,
        page: page.toString(),
        pageSize: '10',
        searchTerm: term,
        roleFilter: role,
      });
      const response = await fetch(`/api/admin/attendance?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data.');
      }
      const data = await response.json();
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

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDay(e.target.value as ConferenceDay);
    setCurrentPage(1); // Reset to first page when day changes
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getRoleClass = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'bg-red-100 text-red-800';
      case Role.SUPER_ADMIN:
        return 'bg-purple-100 text-purple-800';
      case Role.MINISTER:
        return 'bg-blue-100 text-blue-800';
      case Role.VOLUNTEER:
        return 'bg-yellow-100 text-yellow-800';
      case Role.PARTICIPANT:
        return 'bg-green-100 text-green-800';
      case Role.MEMBER:
        return 'bg-indigo-100 text-indigo-800';
      case Role.INVITEE:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-700">Attendees List</h2>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearchTermChange}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={handleRoleFilterChange}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="ALL">All Roles</option>
            {Object.values(Role).map(role => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <select
            value={selectedDay}
            onChange={handleDayChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="day_11_july">July 11th</option>
            <option value="day_12_july">July 12th</option>
            <option value="day_13_july">July 13th</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-center py-4">Loading attendees...</div>}
      {error && <div className="text-red-500 text-center py-4">Error: {error}</div>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name and Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendees.length > 0 ? (
                  attendees.map((attendee) => (
                    <tr key={attendee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{attendee.user.fullName}</div>
                        <div className="text-sm text-gray-500">{attendee.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleClass(attendee.user.role)}`}>
                          {attendee.user.role.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendee.user.address || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-500">
                      No attendees found for this day.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="py-3 px-6 flex justify-between items-center">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages} (Total: {totalAttendees})
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceViewer;
