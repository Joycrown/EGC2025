'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function RegistrationSuccess() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [countdown, setCountdown] = useState(5);

  // Countdown timer to auto-redirect to login
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/login';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Success Header */}
        <div className="bg-green-500 px-6 py-4">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-xl font-bold text-white">Registration Successful!</h2>
          </div>
        </div>
        
        {/* Success Content */}
        <div className="px-6 py-8">
          <div className="text-center mb-6">
            <div className="animate-pulse inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Thank you for registering!</h3>
            <p className="text-sm text-gray-600 max-w-xs mx-auto">
              {email ? (
                <>We&apos;ve sent a verification link to <span className="font-semibold">{email}</span>. Please check your email to verify your account and join your team.</>
              ) : (
                <>We&apos;ve sent a verification link to your email. Please check your inbox to verify your account and join your team.</>
              )}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              You will be redirected to the login page in {countdown} seconds...
            </p>
            <Link 
              href="/login"
              className="inline-block w-full sm:w-auto px-6 py-3 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
            >
              Proceed to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
