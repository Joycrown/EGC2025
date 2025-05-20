"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';

// JSON-LD structured data for event
const EventSchema = () => {
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Event",
      "name": "EGC Conference 2025",
      "description": "Annual gathering of The Gospel Faith Mission International youth for spiritual enrichment, fellowship, and transformation.",
      "startDate": "2025-07-04T09:00:00",
      "endDate": "2025-07-07T18:00:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "The Gospel Faith Mission International Headquarters",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Nigeria"
        }
      },
      "image": [
        `${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`
      ],
      "performer": {
        "@type": "Organization",
        "name": "The Gospel Faith Mission International"
      },
      "organizer": {
        "@type": "Organization",
        "name": "The Gospel Faith Mission International",
        "url": "https://gofamint.org"
      },
      "offers": {
        "@type": "Offer",
        "url": `${process.env.NEXT_PUBLIC_APP_URL}/register`,
        "availability": "https://schema.org/InStock"
      }
    })
  };
};

export default function Home() {
  // Date countdown functionality
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // State to track current image positions
  const [imageRotation, setImageRotation] = useState(0);

  // Conference start date: July 4, 2025
  useEffect(() => {
    // Set conference date (July 4th, 2025)
    const conferenceDate = new Date('2025-07-04T00:00:00')
    
    const calculateTimeLeft = () => {
      const difference = +conferenceDate - +new Date();
      
      let newTimeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };

      if (difference > 0) {
        newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return newTimeLeft;
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());
    
    // Update time every second
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Image rotation effect every 10 seconds
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setImageRotation(prev => (prev + 1) % 3); // Cycle through 3 positions
    }, 10000); // 10 seconds
    
    return () => clearInterval(rotationInterval);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-gray-900 text-white">
      {/* Add structured data for SEO */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={EventSchema()}
      />
      {/* Navigation */}
      <Header />
      
      {/* Hero Section - with separate mobile/tablet and desktop layouts */}
      <section 
        aria-labelledby="hero-heading" 
        className="relative h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] w-full overflow-hidden"
      >
        <h1 id="hero-heading" className="sr-only">EGC Conference 2025 - The Gospel Faith Mission International</h1>
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        
        {/* Background watermark */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 opacity-10" 
            style={{
              backgroundImage: `url('/images/GofamintLogo.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mixBlendMode: 'overlay',
            }}
          />
        </div>
        
        {/* Mobile & tablet background circles */}
        <div className="absolute top-[10%] left-[10%] w-[180px] h-[180px] bg-yellow-400/20 rounded-full lg:hidden"></div>
        <div className="absolute bottom-[25%] right-[-10%] w-[150px] h-[150px] bg-red-600/20 rounded-full lg:hidden"></div>
        
        {/* Desktop decorative elements - only shown on large screens */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-yellow-400 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-10 hidden lg:block"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-600 rounded-full translate-x-1/3 translate-y-1/3 hidden lg:block"></div>
        
        {/* Special layouts: mobile & tablet vs desktop */}
        <div className="relative z-20 w-full h-[calc(100vh-64px)]">
          {/* Mobile & Tablet Layout - Stacked & Centered (with responsive enhancements for tablet) */}
          <div className="lg:hidden flex flex-col h-full pt-2 sm:pt-4 pb-[110px] sm:pb-[100px]">
            {/* Welcome message - optimized for tablet */}
            <div className="text-center md:mt-10">
              <div className="inline-flex items-center bg-black/30 px-3 sm:px-5 py-1 sm:py-1.5 rounded-full shadow-lg">
                <span className="text-yellow-400 mr-1 sm:mr-2">★</span>
                <p className="text-yellow-400 font-medium text-sm sm:text-3xl">Welcome to EGC Conference</p>
                <span className="text-yellow-400 ml-1 sm:ml-2">★</span>
              </div>
            </div>
            
            {/* Main content area - with responsive enhancements for tablet */}
            <div className="flex-1 flex flex-col items-center justify-start pt-1 sm:pt-4 px-6 sm:px-10 sm:max-w-2xl sm:mx-auto">
              {/* Conference title - with better layout and visual hierarchy - enhanced for tablet */}
              <h1 className="text-center mb-2 sm:mb-3">
                <div className="relative inline-block">
                  <span className="block text-2xl xs:text-3xl sm:text-7xl font-black tracking-wide relative z-10">Emerging</span>
                  <span className="block text-2xl xs:text-3xl sm:text-6xl bg-gradient-to-r text-red-500 bg-clip-text font-black tracking-wider relative z-20 transform -translate-y-1 scale-110">Generals&apos;</span>
                  <span className="block text-xl xs:text-2xl sm:text-5xl font-extrabold tracking-widest mt-0.5 relative z-10 border-b-2 border-t-2 border-white/40 py-0.5 px-3 sm:px-6">CONFERENCE 2025</span>
                </div>
              </h1>
              
              {/* Creative modern staggered image layout with auto-rotating images - enhanced for tablet */}
              <div className="w-full h-[230px] xs:h-[240px] sm:h-[280px] my-1 sm:my-2 relative">
                {/* Decorative elements - modern circles */}
                <div className="absolute left-[15%] bottom-[20%] w-[25%] aspect-square rounded-full border border-white/20 backdrop-blur-sm z-10 mix-blend-overlay opacity-60"></div>
                <div className="absolute right-[20%] top-[15%] w-[18%] aspect-square rounded-full border border-white/30 backdrop-blur-sm z-10 mix-blend-overlay opacity-40"></div>
                
                {/* Position 1 - Main central position */}
                <div 
                  className={`absolute transition-all duration-1000 ease-in-out ${imageRotation === 0 
                    ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] xs:w-[50%] z-30' 
                    : imageRotation === 1 
                    ? 'left-[2%] bottom-[10%] w-[45%] xs:w-[42%] z-20 translate-y-2' 
                    : 'right-[2%] top-[5%] w-[45%] xs:w-[42%] z-20 -translate-y-2'} 
                    aspect-square rounded-full overflow-hidden border-[5px] border-white shadow-2xl `}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent z-10"></div>
                  <Image 
                    src="/images/church image2.jpg" 
                    alt="Pastor" 
                    width={500} 
                    height={500} 
                    className="object-cover w-full h-full transform hover:scale-110 transition-all duration-700"
                    priority
                  />
                </div>
                
                {/* Position 2 - Bottom left */}
                <div 
                  className={`absolute transition-all duration-1000 ease-in-out ${imageRotation === 1 
                    ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] xs:w-[50%] z-30' 
                    : imageRotation === 2 
                    ? 'left-[2%] bottom-[10%] w-[45%] xs:w-[42%] z-20 translate-y-2' 
                    : 'right-[2%] top-[5%] w-[45%] xs:w-[42%] z-20 -translate-y-2'} 
                    aspect-square rounded-full overflow-hidden border-[4px] border-white shadow-2xl`}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 to-transparent z-10"></div>
                  <Image 
                    src="/images/churchimage3.jpg" 
                    alt="Worship" 
                    width={400} 
                    height={400} 
                    className="object-cover w-full h-full transform hover:scale-110 transition-all duration-700"
                    priority
                  />
                </div>
                
                {/* Position 3 - Top right */}
                <div 
                  className={`absolute transition-all duration-1000 ease-in-out ${imageRotation === 2 
                    ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] xs:w-[50%] z-30' 
                    : imageRotation === 0 
                    ? 'left-[2%] bottom-[10%] w-[45%] xs:w-[42%] z-20 translate-y-2' 
                    : 'right-[2%] top-[5%] w-[45%] xs:w-[42%] z-20 -translate-y-2'} 
                    aspect-square rounded-full overflow-hidden border-[4px] border-white shadow-2xl`}
                >
                  <div className="absolute inset-0 bg-gradient-to-bl from-yellow-500/20 to-transparent z-10"></div>
                  <Image 
                    src="/images/Churchimage.jpg" 
                    alt="Church" 
                    width={400} 
                    height={400} 
                    className="object-cover w-full h-full transform hover:scale-110 transition-all duration-700"
                    priority
                  />
                </div>
                
                {/* Modern glowing accent dots */}
                <div className="absolute bottom-[15%] right-[25%] w-[8%] aspect-square rounded-full bg-yellow-400 z-25 animate-pulse shadow-lg shadow-yellow-400/50"></div>
                <div className="absolute top-[20%] left-[25%] w-[6%] aspect-square rounded-full bg-red-500 z-25 animate-pulse shadow-lg shadow-red-500/50"></div>
              </div>
              
              {/* Description text - responsive sizing - optimized for tablet */}
              <p className="text-xs xs:text-sm sm:text-lg md:text-[22px] text-center text-gray-300 mt-1 sm:mt-2 md:mt-5 mb-0 max-w-[85%] sm:max-w-[80%] md:max-w-[90%] leading-tight sm:leading-tight">
              Join us for an amazing conference experience with engaging activities, and spiritual growth opportunities.
              </p>
              
              {/* Conference date - yellow accent, responsive sizing */}
              <div className="text-yellow-400 font-medium text-center text-sm xs:text-base sm:text-2xl my-2 sm:mb-3 ">
                4th-6th July, 2025
              </div>

              {/* Responsive CTA button */}
              <Link 
                href="/register" 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-sm xs:text-base sm:text-xl md:text-3xl py-2 sm:py-2.5 md:mt-5 px-5 xs:px-6 sm:px-10 md:px-10 md:py-3 rounded-full shadow-lg sm:shadow-xl ring-2 sm:ring-4 ring-red-500/30 flex items-center justify-center transform transition-all duration-300 hover:scale-105"
              >
                REGISTER NOW
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6 ml-1 sm:ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>  
            </div>
          </div>

          {/* Tablet-specific styling is now handled with responsive classes in the mobile layout */}
          
          {/* Desktop Layout - Unchanged Side-by-Side, but only on large screens */}
          <div className="hidden lg:flex w-full h-full items-center">
            <div className="container mx-auto px-4 flex flex-row items-center">
              {/* Text Content Section */}
              <div className="w-3/5 pr-2">
                {/* Welcome text with arrow */}
                <div className="flex items-center mb-1">
                  <div className="mr-1 text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-yellow-400 font-medium md:text-md lg:text-2xl">Welcome to EGC Conference</p>
                </div>
                
                {/* Large impactful heading */}
                <h1 className="md:text-4xl lg:text-6xl font-bold leading-none mb-2">
                  <span className="block">Emerging</span>
                  <span className="block text-red-500">Generals&apos;</span>
                  <span className="block text-white">CONFERENCE 2025</span>
                </h1>
                
                {/* Description text */}
                <p className="md:text-[13px] lg:text-[16px] font-light mb-2 text-gray-300 max-w-[90%]">
                  Join us for an amazing conference experience with 
                  engaging activities, and spiritual growth opportunities.
                </p>
                
                {/* Date display */}
                <div className="mb-2">
                  <h3 className="md:text-sm lg:text-lg font-medium text-yellow-400">
                    4th-6th July, 2025
                  </h3>
                </div>
                
                {/* Main CTA button */}
                <div className="mt-2 md:mt-0">
                  <Link 
                    href="/register" 
                    className="bg-red-600 hover:bg-red-700 text-white font-bold md:text-[13px] lg:text-[16px] p-2 md:p-3 rounded-full shadow-lg flex items-center justify-center max-w-[150px]"
                  >
                    Register Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              {/* Image Section */}
              <div className="w-2/5 h-full flex items-center justify-center relative">
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Large background circle */}
                  <div className="absolute right-[5%] w-[65%] aspect-square rounded-full bg-yellow-500/20 z-10"></div>
                  
                  {/* Main image */}
                  <div className="absolute top-[5%] right-[8%] w-[45%] lg:top-[15%] lg:right-[15%] lg:w-[35%] aspect-square rounded-full overflow-hidden border-4 border-white shadow-xl z-30">
                    <Image 
                      src="/images/church image2.jpg" 
                      alt="Pastor" 
                      width={400} 
                      height={400} 
                      className="object-cover w-full h-full"
                      priority
                    />
                  </div>
                  
                  {/* Second image */}
                  <div className="absolute bottom-[-30px] right-[30%] w-[50%] lg:w-[40%] aspect-square rounded-full overflow-hidden border-4 border-white shadow-xl z-20">
                    <Image 
                      src="/images/Churchimage.jpg" 
                      alt="Church" 
                      width={300} 
                      height={300} 
                      className="object-cover w-full h-full"
                      priority
                    />
                  </div>
                  
                  {/* Third image */}
                  <div className="absolute bottom-[-220px] left-[-2%] w-[45%] lg:left-[15%] lg:w-[35%] aspect-square rounded-full overflow-hidden border-4 border-white shadow-xl z-25">
                    <Image 
                      src="/images/churchimage3.jpg" 
                      alt="Worship" 
                      width={300} 
                      height={300} 
                      className="object-cover w-full h-full"
                      priority
                    />
                  </div>
                  
                  {/* Decorative element */}
                  <div className="absolute bottom-[35%] right-[18%] w-[6%] aspect-square rounded-full bg-yellow-400 z-15"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Countdown display - completely repositioned to avoid Register button */}
        <div className="fixed xs:absolute bottom-0 md:bottom-[6%] lg:bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 p-2 lg:p-3 rounded-t-xl shadow-2xl w-auto max-w-[95%] xs:max-w-none">
          <h4 className="text-center mb-1.5 text-white text-[11px] sm:text-sm md:text-lg font-bold tracking-wide">COUNTDOWN TO EGC&apos;25</h4>
          
          <div className="flex space-x-2">
            {/* Days - matching exact red from reference */}
            <div className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] md:w-[52px] md:h-[52px] lg:w-[50px] lg:h-[50px] rounded-md bg-red-600 flex flex-col items-center justify-center">
              <span className="text-base sm:text-lg md:text-2xl  font-bold text-white">{timeLeft.days}</span>
              <span className="text-[7px] sm:text-[8px] md:text-[12px] lg:text-[12px] text-white font-bold uppercase">DAYS</span>
            </div>
            
            {/* Hours - matching exact gold from reference */}
            <div className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] md:w-[52px] md:h-[52px] lg:w-[50px] lg:h-[50px] rounded-md bg-yellow-500 flex flex-col items-center justify-center">
              <span className="text-base sm:text-lg md:text-2xl font-bold text-white">{timeLeft.hours}</span>
              <span className="text-[7px] sm:text-[8px] md:text-[12px] lg:text-[12px] text-white font-bold uppercase">HRS</span>
            </div>
            
            {/* Minutes - matching exact blue from reference */}
            <div className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] md:w-[52px] md:h-[52px] lg:w-[50px] lg:h-[50px] rounded-md bg-blue-500 flex flex-col items-center justify-center">
              <span className="text-base sm:text-lg md:text-2xl  font-bold text-white">{timeLeft.minutes}</span>
              <span className="text-[7px] sm:text-[8px] md:text-[12px] lg:text-[12px] text-white font-bold uppercase">MINS</span>
            </div>
            
            {/* Seconds - matching exact purple from reference */}
            <div className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] md:w-[52px] md:h-[52px] lg:w-[50px] lg:h-[50px] rounded-md bg-purple-600 flex flex-col items-center justify-center">
              <span className="text-base sm:text-lg md:text-2xl  font-bold text-white">{timeLeft.seconds}</span>
              <span className="text-[7px] sm:text-[8px] md:text-[12px] lg:text-[12px] text-white font-bold uppercase">SECS</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
