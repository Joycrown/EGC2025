/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Type for countdown values
interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<CountdownValues>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Conference date - July 4, 2025 (memoized to prevent re-renders)
  const conferenceDate = useMemo(() => new Date('2025-07-04T00:00:00'), []);

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
  }, [router]); // Only depend on router

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
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/images/GofamintLogo.png"
              alt="GOFAMINT Logo"
              width={40}
              height={40}
              className="mr-3"
            />
            <h1 className="text-xl font-bold text-gray-900">EGC Conference</h1>
          </div>
          <div>
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome message with personalized greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.fullName || 'Participant'}!
          </h2>
          <p className="text-gray-600">
            Your journey to the EGC Conference 2025 begins now.
          </p>
        </motion.div>

        {/* Countdown timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden mb-8"
        >
          <div className={`bg-gradient-to-r ${teamColor} p-6 text-white`}>
            <h3 className="text-xl font-bold mb-2">Conference Countdown</h3>
            <p className="opacity-90">Mark your calendar for July 4-10, 2025!</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-4xl font-bold text-gray-900">{countdown.days}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Days</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-4xl font-bold text-gray-900">{countdown.hours}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Hours</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-4xl font-bold text-gray-900">{countdown.minutes}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Minutes</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-4xl font-bold text-gray-900">{countdown.seconds}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Seconds</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team information card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden mb-8"
        >
          <div className={`bg-gradient-to-r ${teamColor} p-6 text-white`}>
            <h3 className="text-xl font-bold mb-2">Your Team</h3>
            <p className="opacity-90">Get ready for exciting team activities!</p>
          </div>
          
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${teamColor} flex items-center justify-center text-white font-bold text-xl mr-4`}>
                {user?.teamName?.charAt(5) || 'T'}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">{user?.teamName || 'Your Team'}</h4>
                <p className="text-gray-600">Role: {user?.role || 'Participant'}</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">
              Your team is preparing for the conference challenges. Team captains will contact you 
              soon with more information about team activities and pre-conference meetings.
            </p>
            
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    Stay tuned! The EGC games will be starting soon. Get ready to represent your team!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Coming soon features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
            <p className="opacity-90">Your complete dashboard is under construction</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Schedule</h4>
                <p className="text-sm text-gray-600">View conference agenda and sessions</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Live Sessions</h4>
                <p className="text-sm text-gray-600">Join virtual sessions and workshops</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Team Chat</h4>
                <p className="text-sm text-gray-600">Communicate with your team members</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    We&apos;re working hard to build your complete conference dashboard. Check back often as we add new features 
                    and functionalities to enhance your EGC Conference experience!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
