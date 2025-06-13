'use client';

import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserSearchResult {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
}

const MarkAttendance = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
    const conferenceDays = [
    { value: 'day_11_july', label: 'July 11th', date: new Date('2025-07-11T00:00:00') },
    { value: 'day_12_july', label: 'July 12th', date: new Date('2025-07-12T00:00:00') },
    { value: 'day_13_july', label: 'July 13th', date: new Date('2025-07-13T00:00:00') },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date to midnight for accurate comparison

  const availableDays = conferenceDays.filter(day => day.date >= today);

  const [conferenceDay, setConferenceDay] = useState<'day_11_july' | 'day_12_july' | 'day_13_july' | ''>(
    availableDays.length > 0 ? availableDays[0].value as 'day_11_july' | 'day_12_july' | 'day_13_july' : ''
  );

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchEmail) return;

    setIsLoading(true);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/users?email=${encodeURIComponent(searchEmail)}`);
      const users = await response.json();
      if (!response.ok) {
        throw new Error(users.error || 'Failed to search for users.');
      }
      setSearchResults(users);
      if (users.length === 0) {
        setMessage('No users found with that email.');
        setIsError(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleSubmitAttendance = async () => {
    if (selectedUsers.size === 0) {
      setMessage('Please select at least one user to mark present.');
      setIsError(true);
      return;
    }
    // API call to mark attendance will be implemented here
    setIsLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/mark-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds: Array.from(selectedUsers), conferenceDay }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to mark attendance.');
      }

      setMessage(result.message || `Successfully marked ${selectedUsers.size} user(s) as present.`);
      setIsError(false);
      setSelectedUsers(new Set()); // Clear selection on success
      // Optionally, you could refresh the search results or clear them
      // setSearchResults([]); 
      // setSearchEmail('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Mark Attendance</h2>
      <form onSubmit={handleSearch} className="flex items-center gap-4 mb-6">
        <input
          type="email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          placeholder="Search by user email..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors">
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {searchResults.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phoneNumber || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end items-center gap-4">
              <select
                value={conferenceDay}
                onChange={(e) => setConferenceDay(e.target.value as 'day_11_july' | 'day_12_july' | 'day_13_july' | '')}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableDays.length > 0 ? (
                  availableDays.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))
                ) : (
                  <option value="" disabled>No available conference days</option>
                )}
              </select>
              <button 
                onClick={handleSubmitAttendance} 
                disabled={isLoading || selectedUsers.size === 0 || !conferenceDay}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isLoading ? 'Submitting...' : 'Submit Attendance'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {message && (
        <p className={`mt-4 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default MarkAttendance;
