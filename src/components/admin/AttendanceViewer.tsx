'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Attendee {
  id: string;
  user: {
    fullName: string;
    email: string;
    role: string; // Add role to the user object
  };
}

type ConferenceDay = 'day_11_july' | 'day_12_july' | 'day_13_july';

const AttendanceViewer = () => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<ConferenceDay>('day_11_july');
  const [currentPage, setCurrentPage] = useState(1);
  const [attendeesPerPage] = useState(10);

  const fetchAttendees = useCallback(async (day: ConferenceDay) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/attendance?day=${day}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data.');
      }
      const data = await response.json();
      setAttendees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendees(selectedDay);
  }, [selectedDay, fetchAttendees]);

  // Pagination logic
  const indexOfLastAttendee = currentPage * attendeesPerPage;
  const indexOfFirstAttendee = indexOfLastAttendee - attendeesPerPage;
  const currentAttendees = attendees.slice(indexOfFirstAttendee, indexOfLastAttendee);
  const totalPages = Math.ceil(attendees.length / attendeesPerPage);

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDay(e.target.value as ConferenceDay);
    setCurrentPage(1); // Reset to first page when day changes
  };

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Attendees List</h2>
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

      {loading && <div className="text-center py-4">Loading attendees...</div>}
      {error && <div className="text-red-500 text-center py-4">Error: {error}</div>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th> {/* New Role Header */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentAttendees.length > 0 ? (
                  currentAttendees.map((attendee) => (
                    <tr key={attendee.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attendee.user.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendee.user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendee.user.role}</td> {/* New Role Data */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-500"> {/* Changed colSpan from 2 to 3 */}
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
                Page {currentPage} of {totalPages}
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
