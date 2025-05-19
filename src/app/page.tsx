"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';

export default function Home() {
  // Date countdown functionality
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Conference start date: July 4, 2025
  useEffect(() => {
    const targetDate = new Date('July 4, 2025 00:00:00').getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  return (
    <main className="min-h-screen overflow-hidden bg-gray-900 text-white">
      {/* Navigation */}
      <Header />
      
      {/* Hero Section - fixed height to prevent scrolling */}
      <section className="relative h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] w-full overflow-hidden flex items-center">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        
        {/* Background image/video */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url('/images/GofamintLogo.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mixBlendMode: 'overlay',
            }}
          />
        </div>
        
        {/* Decorative elements - repositioned for better tablet view */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-yellow-400 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-10 hidden md:block"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-600 rounded-full translate-x-1/3 translate-y-1/3 hidden md:block"></div>
        
        {/* Main content container */}
        <div className="relative z-20 w-full h-[calc(100vh-64px)] flex items-center">
          {/* Flexbox layout for all screen sizes */}
          <div className="container mx-auto px-2 sm:px-4 flex flex-row items-center">
            {/* Text Content Section - even smaller width to give more space for images */}
            <div className="w-[60%] md:w-3/5 pr-1 xs:pr-2">
              {/* Welcome text with arrow - ultra compact */}
              <div className="flex items-center mb-1">
                <div className="mr-1 text-yellow-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-yellow-400 font-medium text-[12px] md:text-md lg:text-2xl">Welcome to The EGC Conference</p>
              </div>
              
              {/* Large impactful heading - extremely tight spacing */}
              <h1 className="text-[22px] md:text-4xl lg:text-6xl font-bold leading-none mb-1 xs:mb-2">
                <span className="block">Emerging</span>
                <span className="block text-red-500">Generals&apos;</span>
                <span className="block text-white">CONFERENCE 2025</span>
              </h1>
              
              {/* Description text - very compact */}
              <p className="text-[10px] md:text-[15px] lg:text-[16px] font-light mb-1 xs:mb-2 text-gray-300 max-w-[90%]">
                Join us for an amazing conference experience with 
                engaging activities, and spiritual growth opportunities.
              </p>
              
              {/* Date display - ultra compact */}
              <div className="mb-2">
                <h3 className="text-[10px] md:text-[12px] lg:text-[20px] font-medium text-yellow-400">
                  4th - 6th July, 2025
                </h3>
              </div>
              
              {/* Main CTA button - tiny size */}
              <div className="mt-1 xs:mt-2">
                <Link 
                  href="/register" 
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] md:text-[13px] lg:text-[16px] p-2 md:p-3 rounded-full shadow-lg flex items-center justify-center max-w-[120px] md:max-w-[150px]"
                >
                  Register Now
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 xs:h-3 xs:w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Image Section - With fixed positioning to prevent distortions */}
            <div className="w-[40%] md:w-3/5 h-full flex items-center justify-center relative">
                {/* Fixed size container with relative positioning */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Large background circle - using % based positioning */}
                  <div className="absolute right-[5%] w-[45%] xs:w-[50%] sm:w-[60%] md:w-[65%] aspect-square rounded-full bg-yellow-500/20 z-10"></div>
                  
                  {/* Main image - top right */}
                  <div className="absolute top-[15%] right-[-2%] w-[55%] md:top-[5%] md:right-[8%] md:w-[45%] lg:top-[15%] lg:right-[15%] lg:w-[35%] aspect-square rounded-full overflow-hidden border-2 sm:border-4 border-white shadow-xl z-30">
                    <Image 
                      src="/images/church image2.jpg" 
                      alt="Pastor" 
                      width={400} 
                      height={400} 
                      className="object-cover w-full h-full"
                      priority
                    />
                  </div>
                  
                  {/* Second image - bottom center */}
                  <div className="absolute bottom-[-10px] right-[20%] w-[68%] md:bottom-[-30px] md:right-[30%] md:w-[50%] lg:w-[40%] aspect-square rounded-full overflow-hidden border-2 sm:border-4 border-white shadow-xl z-20">
                    <Image 
                      src="/images/Churchimage.jpg" 
                      alt="Church" 
                      width={300} 
                      height={300} 
                      className="object-cover w-full h-full"
                      priority
                    />
                  </div>
                  
                  {/* Third image - middle right */}
                  <div className="absolute top-[-200%] left-[-10%] w-[58%] md:bottom-[-220px] md:left-[-2%] md:w-[45%] lg:left-[15%] lg:w-[35%] aspect-square rounded-full overflow-hidden border-2 sm:border-4 border-white shadow-xl z-25">
                    <Image 
                      src="/images/churchimage3.jpg" 
                      alt="Worship" 
                      width={300} 
                      height={300} 
                      className="object-cover w-full h-full"
                      priority
                    />
                  </div>
                  
                  {/* Decorative element - yellow dot */}
                  <div className="absolute bottom-[35%] right-[18%] w-[6%] aspect-square rounded-full bg-yellow-400 z-15"></div>
                </div>
            </div>
          </div>
        </div>
        
        {/* Countdown display - styled exactly like image shown */}
        <div className="fixed xs:absolute bottom-0 xs:bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 p-2 rounded-t-xl xs:rounded-xl shadow-2xl w-auto max-w-[95%] xs:max-w-none">
          <h4 className="text-center mb-1.5 text-white text-[11px] font-bold">COUNTDOWN TO EGC&apos;25</h4>
          
          <div className="flex space-x-2">
            {/* Days - matching exact red from reference */}
            <div className="w-[46px] h-[46px] rounded-md bg-red-600 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-white">{timeLeft.days}</span>
              <span className="text-[7px] text-white font-bold uppercase">DAYS</span>
            </div>
            
            {/* Hours - matching exact gold from reference */}
            <div className="w-[46px] h-[46px] rounded-md bg-yellow-500 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-white">{timeLeft.hours}</span>
              <span className="text-[7px] text-white font-bold uppercase">HRS</span>
            </div>
            
            {/* Minutes - matching exact blue from reference */}
            <div className="w-[46px] h-[46px] rounded-md bg-blue-500 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-white">{timeLeft.minutes}</span>
              <span className="text-[7px] text-white font-bold uppercase">MINS</span>
            </div>
            
            {/* Seconds - matching exact purple from reference */}
            <div className="w-[46px] h-[46px] rounded-md bg-purple-600 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-white">{timeLeft.seconds}</span>
              <span className="text-[7px] text-white font-bold uppercase">SECS</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
