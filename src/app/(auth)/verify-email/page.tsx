'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');
  
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }
    
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Email verification failed');
        }

        setStatus('success');
        setMessage(data.message || 'Your email has been verified successfully!');
      } catch (err: unknown) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Failed to verify email');
      }
    };
    
    verifyEmail();
  }, [token]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center justify-center text-center"
    >
      <div className="w-24 h-24 mb-6 relative">
        {status === 'loading' && (
          <div className="w-full h-full rounded-full border-4 border-gray-200">
            <div className="w-full h-full rounded-full border-4 border-t-red-600 animate-spin"></div>
          </div>
        )}
        {status === 'success' && (
          <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === 'error' && (
          <div className="w-full h-full bg-red-100 rounded-full flex items-center justify-center text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Verification</h1>
      
      <div className={`p-6 rounded-lg mb-8 max-w-lg ${
        status === 'loading' ? 'bg-blue-50 text-blue-700' :
        status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}>
        <p className="text-lg">{message}</p>
        
        {status === 'success' && (
          <p className="mt-4 text-sm">
            You will receive a welcome email shortly with your team assignment and important information for the EGC Conference 2025.
          </p>
        )}
      </div>
      
      {status !== 'loading' && (
        <div className="space-y-4">
          {status === 'success' ? (
            <Link href="/login" className="inline-block px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-150">
              Proceed to Login
            </Link>
          ) : (
            <>
              <Link href="/register" className="inline-block px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-150">
                Back to Registration
              </Link>
              <p className="text-sm text-gray-600 mt-4">
                If you&apos;re having trouble, please contact our support team at support@egcconference.org
              </p>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
