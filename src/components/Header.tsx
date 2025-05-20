import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Prevent scrolling when mobile menu is open
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

  return (
    <nav className="bg-white py-2 sm:py-2.5 lg:py-1 px-3 sm:px-8 lg:px-5 relative shadow-md">
      <div className="w-full flex items-center justify-between">
        {/* COLUMN 1: Logo and church name - left side */}
        <div className="flex items-center flex-shrink-0">
          <Image 
            src="/images/GofamintLogo.png" 
            alt="The Gospel Faith Mission International Logo" 
            width={48}
            height={48}
            className="mr-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16"
            priority
          />
          <div className="text-gray-900">
            <h2 className="text-xs sm:text-sm md:text-base lg:text-md xl:text-md font-bold leading-tight">THE GOSPEL FAITH MISSION INT&apos;L</h2>
            <p className="text-[8px] sm:text-[10px] md:text-xs lg:text-xs">PACE SETTERS ASSEMBLY, AKURE</p>
          </div>
        </div>
        
        {/* COLUMN 2: Desktop navigation links - center */}
        <div className="hidden lg:flex items-center justify-center flex-1 px-4">
          <div className="flex items-center space-x-4 xl:space-x-5">
            <Link href="/" className="text-gray-800 hover:text-red-500 font-medium text-base xl:text-md">Home</Link>
            <Link href="/schedule" className="text-gray-800 hover:text-red-500 font-medium text-base xl:text-md">Schedule</Link>
            <Link href="/egc-games" className="text-gray-800 hover:text-red-500 font-medium text-base xl:text-md">EGC Games</Link>
            <Link href="/contact" className="text-gray-800 hover:text-red-500 font-medium text-base xl:text-md">Contact</Link>
          </div>
        </div>
        
        {/* COLUMN 3: Action buttons - right side */}
        <div className="hidden lg:flex items-center space-x-3 xl:space-x-2 flex-shrink-0">
          <Link 
            href="/register" 
            className="bg-red-600 text-white px-6 py-2 xl:px-8 xl:py-2 rounded-md font-bold text-sm xl:text-md hover:bg-red-700 transition-colors duration-300"
          >
            REGISTER
          </Link>
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-2 xl:px-8 xl:py-2 rounded-md font-bold text-sm xl:text-md hover:bg-blue-700 transition-colors duration-300"
          >
            LOGIN
          </Link>
        </div>
        
        {/* Mobile/Tablet menu button */}
        <button 
          className="lg:hidden text-gray-800 focus:outline-none z-50 p-1"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
      
      {/* Mobile/Tablet menu with animation - compact design */}
      <div 
        className={`lg:hidden fixed top-16 right-0 w-64 h-auto bg-white z-40 rounded-bl-lg shadow-lg transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Mobile menu close button (X) */}
        <div className="flex justify-end p-2 border-b border-gray-200">
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-100"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile menu items - compact version */}
        <div className="flex flex-col py-2 px-4">
          <Link href="/" className="text-gray-800 hover:text-red-500 font-medium text-base py-2.5 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/schedule" className="text-gray-800 hover:text-red-500 font-medium text-base py-2.5 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>Schedule</Link>
          <Link href="/egc-games" className="text-gray-800 hover:text-red-500 font-medium text-base py-2.5 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>EGC Games</Link>
          <Link href="/contact" className="text-gray-800 hover:text-red-500 font-medium text-base py-2.5 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          
          {/* Mobile action buttons */}
          <div className="flex space-x-2 mt-3">
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
          </div>
        </div>
      </div>
    </nav>
  );
}
