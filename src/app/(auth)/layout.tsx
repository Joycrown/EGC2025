'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Define slides for the image carousel
  const slides = [
    {
      image: '/images/church image 4.jpg',
      alt: 'Church gathering at EGC Conference'
    },
    {
      image: '/images/Churchimage.jpg',
      alt: 'Worship session at EGC Conference'
    },
    {
      image: '/images/Churchimage3.jpg',
      alt: 'Prayer time at EGC Conference'
    },
    {
      image: '/images/church image2.jpg',
      alt: 'Fellowship at EGC Conference'
    },
  ];

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    fade: true,
    arrows: false
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 overflow-hidden">
      {/* Form Side - Takes full width on mobile, 45% on desktop, scrollable */}
      <div className="w-full lg:w-[45%] h-screen overflow-y-auto flex flex-col relative z-10">
        <div className="flex-grow flex flex-col justify-center items-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex flex-col items-center">
              <Link href="/" className="mb-4">
                <Image 
                  src="/images/GofamintLogo.png"
                  alt="GOFAMINT Logo"
                  width={80}
                  height={80}
                  className="hover:opacity-80 transition-opacity"
                />
              </Link>
              {children}
            </div>
          </div>
        </div>
        
        <div className="p-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} The Gospel Faith Mission International</p>
          <p>EGC Conference</p>
        </div>
      </div>
      
      {/* Image Side with Slider - Hidden on mobile, 55% on desktop */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        {/* Slider background */}
        <div className="absolute inset-0 z-0">
          <Slider {...sliderSettings} className="h-full">
            {slides.map((slide, index) => (
              <div key={index} className="h-screen w-full relative">
                <Image 
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority={index === 0}
                />
                {/* Very light gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-800/30 to-black/30 z-10"></div>
              </div>
            ))}
          </Slider>
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-center items-center z-20 p-12 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg text-center"
          >
            <h2 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">Emerging Generals&apos; Conference 2025</h2>
            <p className="text-xl mb-8 text-white drop-shadow-md">Join us for a transformative experience at EGC Conference 2025. Connect with like-minded individuals and grow spiritually.</p>
            
            <div className="flex flex-col space-y-4 w-full max-w-md mx-auto">
              {/* Date card with calendar icon */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-red-600/40 to-red-700/40 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/10 flex items-center"
              >
                <div className="mr-4 bg-red-500 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">July 4-10, 2025</h3>
                  <p className="text-white/90">Mark your calendar for this life-changing event!</p>
                </div>
              </motion.div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Connect card with people icon */}
                {/* <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-amber-500/40 to-yellow-600/40 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/10"
                >
                  <div className="bg-amber-500 p-2 rounded-full inline-block mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="font-bold mb-1">Connect</h4>
                  <p className="text-sm text-white/90">Network with others from around the world</p>
                </motion.div> */}
                
                {/* Learn card with book icon */}
                {/* <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-500/40 to-indigo-600/40 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/10"
                >
                  <div className="bg-blue-500 p-2 rounded-full inline-block mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h4 className="font-bold mb-1">Learn</h4>
                  <p className="text-sm text-white/90">Gain insights from experienced speakers</p>
                </motion.div> */}
                
                {/* Additional card with pray icon */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-green-500/40 to-emerald-600/40 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/10"
                >
                  <div className="bg-green-500 p-2 rounded-full inline-block mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                    </svg>
                  </div>
                  <h4 className="font-bold mb-1">Pray</h4>
                  <p className="text-sm text-white/90">Experience powerful times of prayer</p>
                </motion.div>
                
                {/* Additional card with grow icon */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-500/40 to-violet-600/40 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/10"
                >
                  <div className="bg-purple-500 p-2 rounded-full inline-block mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h4 className="font-bold mb-1">Grow</h4>
                  <p className="text-sm text-white/90">Develop spiritually through workshops</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
