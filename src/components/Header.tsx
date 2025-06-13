'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  isLoggedIn: boolean;
  isLoading: boolean;
}

export default function Header({ isLoggedIn, isLoading }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const AuthButtons = () => (
    <div className="hidden lg:flex items-center space-x-3">
      {isLoading ? (
        <>
          <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
        </>
      ) : isLoggedIn ? (
        <Link 
          href="/dashboard" 
          className="bg-red-600 text-white px-6 py-2 rounded-md font-bold text-sm hover:bg-red-700 transition-colors duration-300"
        >
          Go to Dashboard
        </Link>
      ) : (
        <>
          <Link 
            href="/register" 
            className="bg-red-600 text-white px-6 py-2 rounded-md font-bold text-sm hover:bg-red-700 transition-colors duration-300"
          >
            REGISTER
          </Link>
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold text-sm hover:bg-blue-700 transition-colors duration-300"
          >
            LOGIN
          </Link>
        </>
      )}
    </div>
  );

  const MobileAuthButtons = () => (
    <div className="flex flex-col space-y-2 mt-3">
       {isLoading ? (
        <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
      ) : isLoggedIn ? (
        <Link 
          href="/dashboard" 
          className="bg-red-600 text-white text-sm flex-1 py-2 rounded-md font-bold text-center hover:bg-red-700 transition-colors duration-300"
          onClick={() => setMobileMenuOpen(false)}
        >
          Go to Dashboard
        </Link>
      ) : (
        <>
            <Link 
              href="/register" 
              className="bg-red-600 text-white text-sm flex-1 py-2 rounded-md font-bold text-center hover:bg-red-700 transition-colors duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              REGISTER
            </Link>
            <Link 
              href="/login" 
              className="bg-blue-600 text-white text-sm flex-1 py-2 rounded-md font-bold text-center hover:bg-blue-700 transition-colors duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              LOGIN
            </Link>
        </>
      )}
    </div>
  );

  return (
    <nav className="bg-white py-2 sm:py-2.5 lg:py-1 px-3 sm:px-8 lg:px-5 relative shadow-md">
      <div className="w-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Image 
            src="/images/GofamintLogo.png" 
            alt="The Gospel Faith Mission International Logo" 
            width={48}
            height={48}
            className="mr-2 w-10 h-10 sm:w-12 sm:h-12"
            priority
          />
          <div className="text-gray-900">
            <h2 className="text-sm md:text-base font-bold leading-tight">THE GOSPEL FAITH MISSION INT&apos;L</h2>
            <p className="text-xs">PACE SETTERS ASSEMBLY, AKURE</p>
          </div>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center justify-center flex-1 px-4">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-800 hover:text-red-500 font-medium">Home</Link>
            <Link href="/schedule" className="text-gray-800 hover:text-red-500 font-medium">Schedule</Link>
            <Link href="/egc-games" className="text-gray-800 hover:text-red-500 font-medium">EGC Games</Link>
            <Link href="/contact" className="text-gray-800 hover:text-red-500 font-medium">Contact</Link>
          </div>
        </div>
        
        {/* Desktop Auth Buttons & Mobile Menu Toggle */}
        <div className="flex items-center">
            <AuthButtons />
            <button 
              className="lg:hidden text-gray-800 focus:outline-none z-50 p-2 ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`lg:hidden fixed top-0 right-0 w-72 h-full bg-white z-40 shadow-lg transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-end p-4 border-b">
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col py-4 px-6 space-y-4">
          <Link href="/" className="text-gray-800 hover:text-red-500 font-medium text-lg" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/schedule" className="text-gray-800 hover:text-red-500 font-medium text-lg" onClick={() => setMobileMenuOpen(false)}>Schedule</Link>
          <Link href="/egc-games" className="text-gray-800 hover:text-red-500 font-medium text-lg" onClick={() => setMobileMenuOpen(false)}>EGC Games</Link>
          <Link href="/contact" className="text-gray-800 hover:text-red-500 font-medium text-lg" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          <div className="border-t pt-4">
            <MobileAuthButtons />
          </div>
        </div>
      </div>
    </nav>
  );
}
