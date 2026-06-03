/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Type for countdown values
interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<CountdownValues>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Conference date — EGC 2026, July 10
  const conferenceDate = useMemo(() => new Date('2026-07-10T00:00:00'), []);

  // Effect for user data fetching - only run once
  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    // Get user info from API
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          // Add cache control headers to prevent excessive requests
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!isMounted) return; // Don't proceed if component unmounted
        
        if (response.ok) {
          const data = await response.json();
          // Access the user property from the response
          if (data.user) {
            // Format the team name if it's not already formatted
            const teamName = data.user.teamName && !data.user.teamName.startsWith('Team ') 
              ? `Team ${data.user.teamName}` 
              : data.user.teamName;
            
            setUser({
              ...data.user,
              teamName: teamName
            });
          } else {
            console.error('User data not found in response');
            router.push('/login');
          }
        } else {
          // If not authenticated, redirect to login
          router.push('/login');
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching user data:', error);
        router.push('/login');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once

  // Separate effect for countdown timer
  useEffect(() => {
    // Set up countdown timer
    const interval = setInterval(() => {
      const now = new Date();
      const difference = conferenceDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        clearInterval(interval);
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [conferenceDate]); // Only depend on conferenceDate

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Get color based on team name
  const getTeamColor = (teamName: string) => {
    const colorMap: {[key: string]: string} = {
      'Team Bethel': 'from-yellow-500 to-amber-600',
      'Team Judah': 'from-red-500 to-rose-600',
      'Team Salem': 'from-blue-500 to-indigo-600',
      'Team Shiloh': 'from-purple-500 to-violet-600'
    };
    
    return colorMap[teamName] || 'from-gray-500 to-gray-600';
  };

  // Team color gradient
  const teamColor = getTeamColor(user?.teamName || '');

  return (
    <>
      {/* Combined Welcome message and Countdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 rounded-2xl shadow-xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
      >
        <div className="px-6 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">EGC Conference 2026</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Welcome, {user?.fullName?.split(' ')[0] || 'Participant'}!
            </h2>
            <p className="text-blue-200/70 text-sm mt-1">July 10–12 · Akure, Nigeria</p>
          </div>

          <div className="text-center sm:text-right">
            <p className="text-blue-300/60 text-xs font-semibold uppercase tracking-wider mb-3">
              {countdown.days === 0 && countdown.hours === 0 ? 'Conference is live!' : 'Starts in'}
            </p>
            <div className="flex items-end gap-2">
              {[
                { v: countdown.days,    l: 'Days' },
                { v: countdown.hours,   l: 'Hrs' },
                { v: countdown.minutes, l: 'Min' },
                { v: countdown.seconds, l: 'Sec' },
              ].map(({ v, l }, i) => (
                <React.Fragment key={l}>
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 min-w-[52px]">
                      <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                        {String(v).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-[10px] text-blue-300/50 font-semibold mt-1 uppercase">{l}</span>
                  </div>
                  {i < 3 && <span className="text-white/30 text-xl font-bold mb-5">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Team Information Card - Full Width Horizontal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden p-5 flex flex-col md:flex-row items-center justify-between"
        >
          <div className="mb-4 md:mb-0 md:mr-6 text-center md:text-left">
            <h3 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${teamColor}`}>
              Your Team: {user?.teamName || 'N/A'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Connect with your fellow {user?.teamName || 'team members'} and stay updated!
            </p>
          </div>
          <div className="flex-shrink-0 mt-4 md:mt-0">
            {user?.whatsappLink ? (
              <a
                href={user.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r ${teamColor} hover:opacity-90 transition-opacity`}
              >
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.383 1.803 6.166l-1.225 4.485 4.574-1.196z"/></svg>
                Join Team Chat
              </a>
            ) : (
              <p className="text-sm text-gray-500">WhatsApp link not available.</p>
            )}
          </div>
        </motion.div>

        {/* Grid for the other two cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Standings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden text-slate-100"
          >
            <div className="p-5 border-b border-slate-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.846 5.671a1 1 0 00.95.69h5.969c.969 0 1.371 1.24.588 1.81l-4.826 3.502a1 1 0 00-.364 1.118l1.846 5.671c.3.921-.755 1.688-1.54 1.118l-4.826-3.502a1 1 0 00-1.175 0l-4.826 3.502c-.784.57-1.838-.197-1.539-1.118l1.846-5.671a1 1 0 00-.364-1.118L2.28 11.098c-.783-.57-.38-1.81.588-1.81h5.969a1 1 0 00.95-.69L11.049 2.927z" />
              </svg>
              <h3 className="text-lg font-semibold">Team Standings</h3>
            </div>
            <div className="p-5 space-y-3">
              {
                [
                  { rank: 1, name: 'Team Bethel', points: 1500, colorClass: 'bg-yellow-500' }, // Example color
                  { rank: 2, name: 'Team Judah', points: 1250, colorClass: 'bg-red-500' },
                  { rank: 3, name: 'Team Salem', points: 1100, colorClass: 'bg-blue-500' },
                  { rank: 4, name: 'Team Shiloh', points: 950, colorClass: 'bg-purple-500' },
                ].map((team, index) => (
                  <div key={index} className={`flex items-center p-3 rounded-lg ${index === 0 ? 'bg-slate-700/50' : ''}`}>
                    <div className={`w-3 h-8 rounded-full mr-3 ${team.colorClass}`}></div>
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold mr-3 ${index === 0 ? 'bg-yellow-500 text-slate-800' : 'bg-slate-700 text-slate-200'}`}>{team.rank}</span>
                    <span className="flex-grow font-medium text-slate-200">{team.name}</span>
                    <span className="font-bold text-lg text-slate-100">{team.points} <span className="text-xs text-slate-400">pts</span></span>
                  </div>
                ))
              }
              <a href="#" className={`block text-center mt-3 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors`}>View Detailed Stats &rarr;</a>
            </div>
          </motion.div>

          {/* Upcoming Games Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden text-slate-100"
          >
            <div className="p-5 border-b border-slate-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h3 className="text-lg font-semibold">Upcoming Games</h3>
            </div>
            <div className="p-5 space-y-1">
              {
                [
                  { name: 'Tic-Tac-Toe', teams: 'Team Bethel vs Team Judah', time: 'Today, 2:00 PM' },
                  { name: 'Sudoku Relay', teams: 'Team Salem vs Team Shiloh', time: 'Today, 3:30 PM' },
                  { name: 'Bible Trivia Challenge', teams: 'All Teams Event', time: 'Tomorrow, 10:00 AM' },
                ].map((game, index) => (
                  <div key={index} className="flex items-center p-3 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/30 rounded-md transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-4 text-sky-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-grow">
                      <p className="font-medium text-slate-200">{game.name}</p>
                      <p className="text-xs text-slate-400">{game.teams}</p>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <p className="text-xs font-semibold text-slate-300 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {game.time}
                      </p>
                    </div>
                  </div>
                ))
              }
              <a href="#" className={`block text-center mt-4 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors`}>See All Games &rarr;</a>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
