'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function NotFound() {
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <Link href="/" className="inline-block">
          <Image
            src="/images/GofamintLogo.png"
            alt="GOFAMINT Logo"
            width={80}
            height={80}
            className="mx-auto mb-6"
          />
        </Link>
        <h1 className="text-6xl font-bold text-red-600 mb-2">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-lg bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-red-600 to-red-900 p-5 text-white text-center">
          <h3 className="text-xl font-bold">Our Website is Under Construction</h3>
          <p className="opacity-90">We&apos;re working hard to bring you a great experience</p>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            The page you&apos;re looking for isn&apos;t available yet. We&apos;re building the EGC Conference 2026
            website and adding new features every day. Please check back soon!
          </p>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Have you registered yet?</strong> Make sure you&apos;re ready for the Emerging Generals&apos; Conference 2026 
                  by registering today!
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="bg-gray-800 hover:bg-gray-900 text-white py-3 px-6 rounded-lg text-center transition duration-150 ease-in-out">
              Back to Home
            </Link>
            <Link href="/register" className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg text-center transition duration-150 ease-in-out">
              Register Now
            </Link>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-10 text-center text-gray-500 text-sm"
      >
        <p>&copy; {new Date().getFullYear()} The Gospel Faith Mission International</p>
        <p>EGC Conference 2026</p>
      </motion.div>
    </div>
  );
}
