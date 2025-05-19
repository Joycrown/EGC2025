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
    <nav className="bg-white py-2 sm:py-2.5 md:py-3 px-3 sm:px-8 md:px-12 flex items-center justify-between relative shadow-md">
      {/* Logo and church name - responsive sizing */}
      <div className="flex items-center">
        <Image 
          src="/images/GofamintLogo.png" 
          alt="The Gospel Faith Mission International Logo" 
          width={48}
          height={48}
          className="mr-2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          priority
        />
        <div className="text-gray-900">
          <h2 className="text-xs sm:text-sm md:text-base font-bold leading-tight">THE GOSPEL FAITH MISSION INT&apos;L</h2>
          <p className="text-[8px] sm:text-[10px] md:text-xs">PACE SETTERS ASSEMBLY, OBANLA DISTRICT</p>
        </div>
      </div>
      
      {/* Desktop navigation with responsive spacing */}
      <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
        <Link href="/" className="text-gray-800 hover:text-red-500 font-medium text-sm lg:text-base">Home</Link>
        <Link href="/about" className="text-gray-800 hover:text-red-500 font-medium text-sm lg:text-base">About</Link>
        <Link href="/schedule" className="text-gray-800 hover:text-red-500 font-medium text-sm lg:text-base">Schedule</Link>
        <Link href="/speakers" className="text-gray-800 hover:text-red-500 font-medium text-sm lg:text-base">Speakers</Link>
        <Link href="/contact" className="text-gray-800 hover:text-red-500 font-medium text-sm lg:text-base">Contact</Link>
      </div>
      
      {/* Register button - responsive sizing */}
      <Link 
        href="/register" 
        className="bg-red-600 text-white px-4 py-1.5 lg:px-6 lg:py-2 rounded-md font-bold text-xs lg:text-sm hidden md:block hover:bg-red-700 transition-colors duration-300"
      >
        REGISTER
      </Link>
      
      {/* Mobile menu button with better tap target */}
      <button 
        className="md:hidden text-gray-800 focus:outline-none z-50 p-1"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle mobile menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>
      
      {/* Mobile menu with animation */}
      <div 
        className={`md:hidden fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Mobile header with logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Image 
              src="/images/GofamintLogo.png" 
              alt="The Gospel Faith Mission International Logo" 
              width={32}
              height={32}
              className="mr-2"
            />
            <span className="font-bold text-sm">EGC CONFERENCE</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="text-gray-800 p-2"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Mobile menu items */}
        <div className="flex flex-col items-center space-y-5 mt-10 px-4">
          <Link href="/" className="text-gray-800 hover:text-red-500 font-medium text-lg w-full text-center py-2 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/about" className="text-gray-800 hover:text-red-500 font-medium text-lg w-full text-center py-2 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link href="/schedule" className="text-gray-800 hover:text-red-500 font-medium text-lg w-full text-center py-2 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>Schedule</Link>
          <Link href="/speakers" className="text-gray-800 hover:text-red-500 font-medium text-lg w-full text-center py-2 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>Speakers</Link>
          <Link href="/contact" className="text-gray-800 hover:text-red-500 font-medium text-lg w-full text-center py-2 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
        </div>
        
        {/* Mobile register button */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <Link 
            href="/register" 
            className="bg-red-600 hover:bg-red-700 text-white px-10 py-3 rounded-md font-bold text-lg transition-colors duration-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            REGISTER NOW
          </Link>
        </div>
      </div>
    </nav>
  );
}
